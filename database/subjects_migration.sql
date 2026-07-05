CREATE TABLE IF NOT EXISTS subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_code VARCHAR(50) NOT NULL UNIQUE,
    subject_name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    credits TINYINT UNSIGNED NOT NULL DEFAULT 3,
    status ENUM('studying', 'paused', 'completed') DEFAULT 'studying',
    color VARCHAR(20) DEFAULT '#2563EB',
    image VARCHAR(255) NULL,
    created_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    CONSTRAINT fk_subject_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Migration for old StudyMate subject schema:
-- user_id -> created_by, code -> subject_code, name -> subject_name,
-- icon -> image, active -> studying, archived -> paused.
-- Run the statements below only when your current table still has old columns.

ALTER TABLE subjects DROP FOREIGN KEY fk_subjects_user;

UPDATE subjects
SET code = CONCAT('SUB', id)
WHERE code IS NULL OR TRIM(code) = '';

UPDATE subjects s
JOIN (
    SELECT id, code
    FROM subjects
    WHERE code IN (
        SELECT duplicate_codes.code
        FROM (
            SELECT code
            FROM subjects
            GROUP BY code
            HAVING COUNT(*) > 1
        ) duplicate_codes
    )
    AND id NOT IN (
        SELECT keep_ids.id
        FROM (
            SELECT MIN(id) AS id
            FROM subjects
            GROUP BY code
            HAVING COUNT(*) > 1
        ) keep_ids
    )
) duplicates ON duplicates.id = s.id
SET s.code = CONCAT(s.code, '-', s.id);

ALTER TABLE subjects CHANGE user_id created_by INT NULL;
ALTER TABLE subjects CHANGE code subject_code VARCHAR(50) NOT NULL;
ALTER TABLE subjects CHANGE name subject_name VARCHAR(255) NOT NULL;
ALTER TABLE subjects CHANGE icon image VARCHAR(255) NULL;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS credits TINYINT UNSIGNED NOT NULL DEFAULT 3 AFTER description;
ALTER TABLE subjects MODIFY color VARCHAR(20) DEFAULT '#2563EB';
ALTER TABLE subjects MODIFY status VARCHAR(20) DEFAULT 'studying';
UPDATE subjects SET status = 'studying' WHERE status = 'active';
UPDATE subjects SET status = 'paused' WHERE status = 'archived';
ALTER TABLE subjects MODIFY status ENUM('studying', 'paused', 'completed') DEFAULT 'studying';
ALTER TABLE subjects ADD deleted_at DATETIME NULL AFTER updated_at;
ALTER TABLE subjects ADD UNIQUE KEY subject_code (subject_code);
ALTER TABLE subjects ADD CONSTRAINT fk_subject_created_by FOREIGN KEY (created_by) REFERENCES users(id);
ALTER TABLE subjects
  MODIFY subject_code VARCHAR(50) NOT NULL AFTER id,
  MODIFY subject_name VARCHAR(255) NOT NULL AFTER subject_code,
  MODIFY description TEXT NULL AFTER subject_name,
  MODIFY credits TINYINT UNSIGNED NOT NULL DEFAULT 3 AFTER description,
  MODIFY status ENUM('studying', 'paused', 'completed') DEFAULT 'studying' AFTER credits,
  MODIFY color VARCHAR(20) DEFAULT '#2563EB' AFTER status,
  MODIFY image VARCHAR(255) NULL AFTER color,
  MODIFY created_by INT NULL AFTER image;
