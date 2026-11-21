import { pool } from '../../config/database.js';
import { ROLES } from '../../config/permissions.js';

/*
 * Users and roles. Roles are managed IN THE SYSTEM (user_roles table), not in Microsoft Entra:
 *   - a new @student.mcu.edu.ph account gets the Student role automatically on first sign-in;
 *   - staff (@mcu.edu.ph) get no role until an IT Administrator assigns one (PUT /api/users/:id/roles);
 *   - the first IT Administrator is assigned with:  npm run user:role -- <email> ITAdmin
 */

const toRoles = (csv) => (csv ? csv.split(',').sort() : []);

async function audit(conn, { actorId, action, userId, justification = null, details = null, ipAddress = null }) {
  await conn.query(
    `INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, justification, details, ip_address)
     VALUES (?, ?, 'user', ?, ?, ?, ?)`,
    [actorId ?? null, action, String(userId), justification, details ? JSON.stringify(details) : null, ipAddress],
  );
}

/**
 * Creates or updates the user when they sign in with Microsoft 365, in one transaction:
 *   1. insert the user (Student role if student account), or update email / name / last sign-in
 *   2. link an imported student record with the same email (first sign-in)
 *   3. write an audit log entry
 * Roles are NOT changed for existing users: they are managed in the system.
 *
 * Returns { id, isNew, roles } or { disabled: true } if the account has been deactivated.
 */
export async function upsertOnSignIn({ oid, tenantId, email, name, accountType, ipAddress }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [[existing]] = await conn.query('SELECT id, is_active FROM users WHERE entra_oid = ? FOR UPDATE', [oid]);

    if (existing && !existing.is_active) {
      await audit(conn, { actorId: existing.id, action: 'auth.sign_in_blocked', userId: existing.id, ipAddress });
      await conn.commit();
      return { disabled: true };
    }

    let userId;
    if (existing) {
      userId = existing.id;
      await conn.query(
        `UPDATE users SET tenant_id = ?, email = ?, display_name = ?, account_type = ?, last_login_at = UTC_TIMESTAMP()
         WHERE id = ?`,
        [tenantId, email, name, accountType, userId],
      );
    } else {
      const [result] = await conn.query(
        `INSERT INTO users (entra_oid, tenant_id, email, display_name, account_type, last_login_at)
         VALUES (?, ?, ?, ?, ?, UTC_TIMESTAMP())`,
        [oid, tenantId, email, name, accountType],
      );
      userId = result.insertId;
      if (accountType === 'student') {
        await conn.query('INSERT INTO user_roles (user_id, role) VALUES (?, ?)', [userId, ROLES.STUDENT]);
      }
    }

    // First sign-in of an imported student: link the record by email
    await conn.query('UPDATE students SET user_id = ? WHERE email = ? AND user_id IS NULL', [userId, email]);

    const [[{ roles }]] = await conn.query('SELECT GROUP_CONCAT(role) AS roles FROM user_roles WHERE user_id = ?', [userId]);
    await audit(conn, { actorId: userId, action: 'auth.sign_in', userId, details: { isNew: !existing }, ipAddress });

    await conn.commit();
    return { id: userId, isNew: !existing, roles: toRoles(roles) };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** Current roles and active status, checked on EVERY request (so role changes and deactivation apply at once). */
export async function findAuthState(userId) {
  const [[row]] = await pool.query(
    `SELECT u.is_active, GROUP_CONCAT(r.role) AS roles
     FROM users u LEFT JOIN user_roles r ON r.user_id = u.id
     WHERE u.id = ? GROUP BY u.id`,
    [userId],
  );
  return row ? { isActive: Boolean(row.is_active), roles: toRoles(row.roles) } : null;
}

/** The signed-in user's profile for GET /api/auth/me, including their student record if linked. */
export async function findProfile(userId) {
  const [[user]] = await pool.query(
    `SELECT u.id, u.email, u.display_name AS name, u.account_type AS accountType, u.is_active AS isActive,
            u.last_login_at AS lastLoginAt,
            s.student_number AS studentNumber, s.first_name AS firstName, s.last_name AS lastName,
            s.year_level AS yearLevel, s.enrollment_status AS enrollmentStatus,
            p.code AS programCode, p.name AS programName, c.code AS collegeCode, c.name AS collegeName
     FROM users u
     LEFT JOIN students s ON s.user_id = u.id
     LEFT JOIN programs p ON p.id = s.program_id
     LEFT JOIN colleges c ON c.id = p.college_id
     WHERE u.id = ?`,
    [userId],
  );
  if (!user) return null;

  const { studentNumber, firstName, lastName, yearLevel, enrollmentStatus, programCode, programName, collegeCode, collegeName, isActive, ...rest } = user;
  return {
    ...rest,
    isActive: Boolean(isActive),
    student: studentNumber
      ? {
          studentNumber,
          firstName,
          lastName,
          yearLevel,
          enrollmentStatus,
          program: programCode ? { code: programCode, name: programName } : null,
          college: collegeCode ? { code: collegeCode, name: collegeName } : null,
        }
      : null,
  };
}

const USER_COLUMNS = `u.id, u.email, u.display_name AS name, u.account_type AS accountType, u.is_active AS isActive,
  u.last_login_at AS lastLoginAt, u.created_at AS createdAt, GROUP_CONCAT(r.role) AS roles`;

const mapUser = ({ roles, isActive, ...u }) => ({ ...u, isActive: Boolean(isActive), roles: toRoles(roles) });

/** Users list for IT/SASD: search by name or email, filter by role or account type. */
export async function listUsers({ page = 1, pageSize = 20, search, role, accountType } = {}) {
  const where = [];
  const params = [];
  if (search) {
    where.push('(u.email LIKE ? OR u.display_name LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (accountType) {
    where.push('u.account_type = ?');
    params.push(accountType);
  }
  if (role === 'none') where.push('NOT EXISTS (SELECT 1 FROM user_roles x WHERE x.user_id = u.id)');
  else if (role) {
    where.push('EXISTS (SELECT 1 FROM user_roles x WHERE x.user_id = u.id AND x.role = ?)');
    params.push(role);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM users u ${whereSql}`, params);
  const [rows] = await pool.query(
    `SELECT ${USER_COLUMNS} FROM users u LEFT JOIN user_roles r ON r.user_id = u.id
     ${whereSql} GROUP BY u.id ORDER BY u.display_name LIMIT ? OFFSET ?`,
    [...params, pageSize, (page - 1) * pageSize],
  );
  return { items: rows.map(mapUser), page, pageSize, total };
}

export async function findById(userId) {
  const [[row]] = await pool.query(
    `SELECT ${USER_COLUMNS} FROM users u LEFT JOIN user_roles r ON r.user_id = u.id WHERE u.id = ? GROUP BY u.id`,
    [userId],
  );
  return row ? mapUser(row) : null;
}

export async function findByEmail(email) {
  const [[row]] = await pool.query('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
  return row ? findById(row.id) : null;
}

/** Thrown for rule violations the caller should show to the user (e.g. removing the last IT Administrator). */
export class UserRuleError extends Error {}

/**
 * Replaces a user's roles (audited). Refuses to remove the last active IT Administrator, so the system
 * can never be locked out. Returns the updated user, or null if not found.
 */
export async function setRoles({ userId, roles, actorId = null, justification = null, ipAddress = null }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[user]] = await conn.query('SELECT id FROM users WHERE id = ? FOR UPDATE', [userId]);
    if (!user) {
      await conn.rollback();
      return null;
    }

    const [current] = await conn.query('SELECT role FROM user_roles WHERE user_id = ?', [userId]);
    const before = current.map((r) => r.role).sort();
    const after = [...new Set(roles)].sort();

    if (before.includes(ROLES.IT_ADMIN) && !after.includes(ROLES.IT_ADMIN)) {
      const [[{ others }]] = await conn.query(
        `SELECT COUNT(*) AS others FROM user_roles r JOIN users u ON u.id = r.user_id
         WHERE r.role = ? AND u.is_active = 1 AND u.id <> ? FOR UPDATE`,
        [ROLES.IT_ADMIN, userId],
      );
      if (!others) throw new UserRuleError('At least one active IT Administrator must remain.');
    }

    await conn.query('DELETE FROM user_roles WHERE user_id = ?', [userId]);
    if (after.length) {
      await conn.query('INSERT INTO user_roles (user_id, role) VALUES ?', [after.map((role) => [userId, role])]);
    }
    await audit(conn, { actorId, action: 'user.roles_changed', userId, justification, details: { before, after }, ipAddress });

    await conn.commit();
    return findById(userId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/** Activates or deactivates a user (audited). Deactivated users are signed out on their next request. */
export async function setActive({ userId, isActive, actorId = null, justification = null, ipAddress = null }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [[user]] = await conn.query('SELECT id FROM users WHERE id = ? FOR UPDATE', [userId]);
    if (!user) {
      await conn.rollback();
      return null;
    }
    if (!isActive) {
      const [[{ itAdmin }]] = await conn.query(
        'SELECT COUNT(*) AS itAdmin FROM user_roles WHERE user_id = ? AND role = ?',
        [userId, ROLES.IT_ADMIN],
      );
      if (itAdmin) {
        const [[{ others }]] = await conn.query(
          `SELECT COUNT(*) AS others FROM user_roles r JOIN users u ON u.id = r.user_id
           WHERE r.role = ? AND u.is_active = 1 AND u.id <> ?`,
          [ROLES.IT_ADMIN, userId],
        );
        if (!others) throw new UserRuleError('The last active IT Administrator cannot be deactivated.');
      }
    }
    await conn.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, userId]);
    await audit(conn, { actorId, action: isActive ? 'user.activated' : 'user.deactivated', userId, justification, ipAddress });
    await conn.commit();
    return findById(userId);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
