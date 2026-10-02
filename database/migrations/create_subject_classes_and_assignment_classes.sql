CREATE TABLE IF NOT EXISTS subject_classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    class_code VARCHAR(50) NOT NULL,
    class_name VARCHAR(255) NULL,
    status ENUM('active', 'archived') NOT NULL DEFAULT 'active',
    created_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    CONSTRAINT fk_subject_classes_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_subject_classes_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    UNIQUE KEY uq_subject_class_code (subject_id, class_code),
    INDEX idx_subject_classes_subject_status (subject_id, status),
    INDEX idx_subject_classes_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO subject_classes (subject_id, class_code, class_name, status, created_by)
SELECT s.id, 'DEFAULT', CONCAT(s.subject_code, ' - Lớp mặc định'), 'active', s.created_by
FROM subjects s
WHERE s.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM subject_classes sc
      WHERE sc.subject_id = s.id AND sc.class_code = 'DEFAULT' AND sc.deleted_at IS NULL
  );

ALTER TABLE student_subjects
    ADD COLUMN IF NOT EXISTS class_id INT NULL AFTER subject_id;

UPDATE student_subjects ss
INNER JOIN subject_classes sc ON sc.subject_id = ss.subject_id AND sc.class_code = 'DEFAULT' AND sc.deleted_at IS NULL
SET ss.class_id = sc.id
WHERE ss.class_id IS NULL;

ALTER TABLE student_subjects
    DROP INDEX uq_student_subject,
    ADD UNIQUE KEY uq_student_subject_class (student_id, subject_id, class_id),
    ADD INDEX idx_student_subjects_class_status (class_id, status);

ALTER TABLE student_subjects
    ADD CONSTRAINT fk_student_subjects_class FOREIGN KEY (class_id) REFERENCES subject_classes(id);

ALTER TABLE assignments
    ADD COLUMN IF NOT EXISTS class_id INT NULL AFTER subject_id;

UPDATE assignments a
INNER JOIN subject_classes sc ON sc.subject_id = a.subject_id AND sc.class_code = 'DEFAULT' AND sc.deleted_at IS NULL
SET a.class_id = sc.id
WHERE a.class_id IS NULL;

ALTER TABLE assignments
    ADD INDEX idx_assignments_class_status (class_id, status),
    ADD CONSTRAINT fk_assignments_class FOREIGN KEY (class_id) REFERENCES subject_classes(id);
