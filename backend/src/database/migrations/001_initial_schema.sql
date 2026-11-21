-- MCU Digital Passport: initial schema
-- Based on docs/system-requirements.md. All times are stored in UTC.

-- ---------------------------------------------------------------------------
-- Users and roles (filled automatically when someone signs in with Microsoft 365)
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  entra_oid       CHAR(36)        NOT NULL COMMENT 'Microsoft Entra object id: stable, never changes',
  tenant_id       CHAR(36)        NOT NULL,
  email           VARCHAR(254)    NOT NULL,
  display_name    VARCHAR(150)    NOT NULL,
  account_type    ENUM('student', 'staff') NOT NULL COMMENT 'From the email domain',
  is_active       TINYINT(1)      NOT NULL DEFAULT 1 COMMENT '0 = blocked from signing in',
  last_login_at   DATETIME        NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_entra_oid (entra_oid),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Roles currently held by each user, synced from the Entra app roles at every sign-in
CREATE TABLE user_roles (
  user_id     BIGINT UNSIGNED NOT NULL,
  role        ENUM('Student', 'Organizer', 'Admin', 'ITAdmin') NOT NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role),
  KEY idx_user_roles_role (role),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------------------
-- Academic structure and students
-- ---------------------------------------------------------------------------
CREATE TABLE colleges (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code       VARCHAR(20)  NOT NULL,
  name       VARCHAR(150) NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_colleges_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE programs (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  college_id INT UNSIGNED NOT NULL,
  code       VARCHAR(20)  NOT NULL,
  name       VARCHAR(150) NOT NULL,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_programs_code (code),
  CONSTRAINT fk_programs_college FOREIGN KEY (college_id) REFERENCES colleges (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Student records (imported from the Student Portal). Linked to users on their first sign-in, by email.
CREATE TABLE students (
  id                BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id           BIGINT UNSIGNED NULL COMMENT 'NULL until the student signs in for the first time',
  student_number    VARCHAR(30)  NOT NULL,
  email             VARCHAR(254) NOT NULL,
  first_name        VARCHAR(100) NOT NULL,
  middle_name       VARCHAR(100) NULL,
  last_name         VARCHAR(100) NOT NULL,
  program_id        INT UNSIGNED NULL,
  year_level        TINYINT UNSIGNED NULL,
  enrollment_status ENUM('enrolled', 'not_enrolled', 'graduated') NOT NULL DEFAULT 'enrolled',
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_students_number (student_number),
  UNIQUE KEY uq_students_email (email),
  UNIQUE KEY uq_students_user (user_id),
  KEY idx_students_program (program_id),
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_students_program FOREIGN KEY (program_id) REFERENCES programs (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------------------
-- Bucket list, activities and attendance
-- ---------------------------------------------------------------------------
-- Pre-identified experiences every student should complete
CREATE TABLE bucket_list_items (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title          VARCHAR(150) NOT NULL,
  description    TEXT NULL,
  required_count SMALLINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Verified activities needed to complete it',
  sort_order     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  created_by     BIGINT UNSIGNED NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bucket_items_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE activities (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title               VARCHAR(150) NOT NULL,
  description         TEXT NULL,
  venue               VARCHAR(150) NULL,
  starts_at           DATETIME NOT NULL,
  ends_at             DATETIME NOT NULL,
  capacity            INT UNSIGNED NULL,
  bucket_list_item_id INT UNSIGNED NULL COMMENT 'Experience this activity counts toward',
  status              ENUM('draft', 'published', 'cancelled', 'completed') NOT NULL DEFAULT 'draft',
  created_by          BIGINT UNSIGNED NULL,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_activities_starts_at (starts_at),
  KEY idx_activities_status (status),
  CONSTRAINT chk_activities_time CHECK (ends_at > starts_at),
  CONSTRAINT fk_activities_bucket_item FOREIGN KEY (bucket_list_item_id) REFERENCES bucket_list_items (id) ON DELETE SET NULL,
  CONSTRAINT fk_activities_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Organizers assigned to an activity (they can scan and validate attendance for it)
CREATE TABLE activity_organizers (
  activity_id BIGINT UNSIGNED NOT NULL,
  user_id     BIGINT UNSIGNED NOT NULL,
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (activity_id, user_id),
  KEY idx_activity_organizers_user (user_id),
  CONSTRAINT fk_activity_organizers_activity FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE,
  CONSTRAINT fk_activity_organizers_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- One row per student per activity: the UNIQUE key is the duplicate-entry safeguard
CREATE TABLE attendance (
  id                 BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  activity_id        BIGINT UNSIGNED NOT NULL,
  student_id         BIGINT UNSIGNED NOT NULL,
  status             ENUM('pending', 'validated', 'invalidated') NOT NULL DEFAULT 'pending',
  method             ENUM('qr', 'manual') NOT NULL DEFAULT 'qr',
  recorded_by        BIGINT UNSIGNED NULL COMMENT 'Organizer who scanned, or SASD for manual entries',
  recorded_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  validated_by       BIGINT UNSIGNED NULL,
  validated_at       DATETIME NULL,
  invalidated_reason VARCHAR(1000) NULL,
  updated_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_attendance_activity_student (activity_id, student_id),
  KEY idx_attendance_student (student_id),
  KEY idx_attendance_status (status),
  CONSTRAINT fk_attendance_activity FOREIGN KEY (activity_id) REFERENCES activities (id),
  CONSTRAINT fk_attendance_student FOREIGN KEY (student_id) REFERENCES students (id),
  CONSTRAINT fk_attendance_recorded_by FOREIGN KEY (recorded_by) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_attendance_validated_by FOREIGN KEY (validated_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Digital stamp: issued once per student when a bucket list experience is completed and verified
CREATE TABLE stamps (
  id                  BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id          BIGINT UNSIGNED NOT NULL,
  bucket_list_item_id INT UNSIGNED NOT NULL,
  awarded_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at          DATETIME NULL COMMENT 'Set if the underlying attendance is invalidated',
  UNIQUE KEY uq_stamps_student_item (student_id, bucket_list_item_id),
  CONSTRAINT fk_stamps_student FOREIGN KEY (student_id) REFERENCES students (id),
  CONSTRAINT fk_stamps_bucket_item FOREIGN KEY (bucket_list_item_id) REFERENCES bucket_list_items (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------------------------------------------------------------------------
-- Notifications and audit trail
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT UNSIGNED NOT NULL,
  type       ENUM('credited', 'stamp', 'milestone', 'system') NOT NULL,
  title      VARCHAR(150) NOT NULL,
  message    VARCHAR(1000) NOT NULL,
  read_at    DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_notifications_user_unread (user_id, read_at),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Who did what, when and why (manual validation, role changes, imports, sign-ins)
CREATE TABLE audit_logs (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  actor_user_id BIGINT UNSIGNED NULL,
  action        VARCHAR(50)  NOT NULL COMMENT 'e.g. auth.sign_in, attendance.manual_credit, user.roles_changed',
  entity_type   VARCHAR(50)  NULL,
  entity_id     VARCHAR(64)  NULL,
  justification VARCHAR(1000) NULL,
  details       JSON NULL,
  ip_address    VARCHAR(45)  NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_actor (actor_user_id),
  KEY idx_audit_action_time (action, created_at),
  KEY idx_audit_entity (entity_type, entity_id),
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
