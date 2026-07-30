CREATE TABLE IF NOT EXISTS notification_reads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_key VARCHAR(191) NOT NULL,
    read_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_reads_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT uq_notification_reads_user_key UNIQUE (user_id, notification_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lessons (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NULL,
    video_url VARCHAR(500) NULL,
    external_url VARCHAR(500) NULL,
    material_path VARCHAR(255) NULL,
    duration_minutes INT NULL,
    status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    CONSTRAINT fk_lessons_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_lessons_created_by FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lesson_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lesson_id INT NOT NULL,
    student_id INT NOT NULL,
    status ENUM('not_started', 'completed') NOT NULL DEFAULT 'not_started',
    completed_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lesson_progress_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id),
    CONSTRAINT fk_lesson_progress_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT uq_lesson_progress_student UNIQUE (lesson_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_notification_reads_user ON notification_reads (user_id);
CREATE INDEX IF NOT EXISTS idx_lessons_subject_status ON lessons (subject_id, status);
CREATE INDEX IF NOT EXISTS idx_lessons_deleted_at ON lessons (deleted_at);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_student_status ON lesson_progress (student_id, status);
