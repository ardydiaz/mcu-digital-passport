/**
 * Manage a user's roles from the command line. Mainly to create the FIRST IT Administrator
 * (after that, roles are managed in the app through PUT /api/users/:id/roles).
 *
 *   npm run user:role -- <email> <Role>           add a role     (Student | Organizer | Admin | ITAdmin)
 *   npm run user:role -- <email> <Role> --remove  remove a role
 *   npm run user:role -- <email>                  show the user's roles
 *
 * The user must have signed in at least once (that creates their account).
 */
import { pool } from '../config/database.js';
import { ROLES } from '../config/permissions.js';
import * as users from '../modules/users/users.repository.js';

const [email, role] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const remove = process.argv.includes('--remove');

async function main() {
  if (!email) {
    console.log('Usage: npm run user:role -- <email> [Student|Organizer|Admin|ITAdmin] [--remove]');
    process.exitCode = 1;
    return;
  }

  const user = await users.findByEmail(email);
  if (!user) {
    console.error(`No user with email ${email}. They must sign in to the Digital Passport once first.`);
    process.exitCode = 1;
    return;
  }

  if (!role) {
    console.log(`${user.email} (${user.name}) roles: ${user.roles.join(', ') || '(none)'}${user.isActive ? '' : ' [DEACTIVATED]'}`);
    return;
  }

  if (!Object.values(ROLES).includes(role)) {
    console.error(`Unknown role "${role}". Use one of: ${Object.values(ROLES).join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const roles = remove ? user.roles.filter((r) => r !== role) : [...new Set([...user.roles, role])];
  const updated = await users.setRoles({
    userId: user.id,
    roles,
    justification: `Command line: ${remove ? 'removed' : 'added'} ${role}`,
  });
  console.log(`${updated.email} roles: ${updated.roles.join(', ') || '(none)'}`);
}

main()
  .catch((err) => {
    console.error(err instanceof users.UserRuleError ? err.message : `Failed: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
