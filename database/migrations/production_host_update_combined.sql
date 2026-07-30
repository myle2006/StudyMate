-- StudyMate production host update - combined
-- Includes:
-- 1. Student subjects, assignments, submissions, learning goals, roadmaps
-- 2. Notification reads, lessons, lesson progress
--
-- Safe for an existing database: uses CREATE TABLE IF NOT EXISTS,
-- ADD COLUMN IF NOT EXISTS, and CREATE INDEX IF NOT EXISTS.
-- Backup your production database before importing.

START TRANSACTION;

CREATE TABLE IF NOT EXISTS student_subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    subject_id INT NOT NULL,
    status ENUM('active', 'removed') NOT NULL DEFAULT 'active',
    assigned_by INT NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    removed_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_subjects_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_student_subjects_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_student_subjects_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id),
    CONSTRAINT uq_student_subject UNIQUE (student_id, subject_id),
    INDEX idx_student_subjects_subject_status (subject_id, status),
    INDEX idx_student_subjects_student_status (student_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    deadline DATETIME NOT NULL,
    attachment_path VARCHAR(255) NULL,
    status ENUM('open', 'closed', 'draft') NOT NULL DEFAULT 'draft',
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    CONSTRAINT fk_assignments_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_assignments_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_assignments_subject_status (subject_id, status),
    INDEX idx_assignments_deadline (deadline),
    INDEX idx_assignments_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    content TEXT NULL,
    file_path VARCHAR(255) NULL,
    submitted_at DATETIME NOT NULL,
    status ENUM('submitted', 'late', 'graded') NOT NULL DEFAULT 'submitted',
    score DECIMAL(5,2) NULL,
    feedback TEXT NULL,
    graded_by INT NULL,
    graded_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignment_submissions_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id),
    CONSTRAINT fk_assignment_submissions_student FOREIGN KEY (student_id) REFERENCES users(id),
    CONSTRAINT fk_assignment_submissions_graded_by FOREIGN KEY (graded_by) REFERENCES users(id),
    CONSTRAINT uq_assignment_submission_student UNIQUE (assignment_id, student_id),
    INDEX idx_assignment_submissions_student_status (student_id, status),
    INDEX idx_assignment_submissions_assignment_status (assignment_id, status),
    INDEX idx_assignment_submissions_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS learning_goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    goal_description TEXT NOT NULL,
    current_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
    study_time_per_day DECIMAL(5,2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'completed', 'paused', 'cancelled') NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    CONSTRAINT fk_learning_goals_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_learning_goals_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    INDEX idx_learning_goals_user_status (user_id, status),
    INDEX idx_learning_goals_subject (subject_id),
    INDEX idx_learning_goals_dates (start_date, end_date),
    INDEX idx_learning_goals_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS learning_roadmaps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_id INT NOT NULL,
    learning_goal_id INT NULL,
    title VARCHAR(255) NOT NULL,
    overview TEXT NULL,
    goal TEXT NOT NULL,
    current_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    study_time_per_day DECIMAL(5,2) NOT NULL,
    available_weekdays VARCHAR(32) NULL,
    preferred_start_time TIME NULL,
    session_duration_minutes INT NOT NULL DEFAULT 60,
    max_daily_minutes INT NULL,
    max_weekly_minutes INT NULL,
    reminder_minutes_before INT NOT NULL DEFAULT 15,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    generated_by_ai TINYINT(1) NOT NULL DEFAULT 0,
    ai_prompt LONGTEXT NULL,
    ai_raw_response LONGTEXT NULL,
    status ENUM('draft', 'active', 'completed', 'paused') NOT NULL DEFAULT 'draft',
    progress_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    CONSTRAINT fk_learning_roadmaps_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_learning_roadmaps_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    CONSTRAINT fk_learning_roadmaps_goal FOREIGN KEY (learning_goal_id) REFERENCES learning_goals(id),
    INDEX idx_learning_roadmaps_user_status (user_id, status),
    INDEX idx_learning_roadmaps_subject (subject_id),
    INDEX idx_learning_roadmaps_goal (learning_goal_id),
    INDEX idx_learning_roadmaps_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS learning_roadmap_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    roadmap_id INT NOT NULL,
    week_number INT NOT NULL,
    order_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    expected_result TEXT NULL,
    suggested_task TEXT NULL,
    planned_date DATE NULL,
    start_time TIME NULL,
    duration_minutes INT NOT NULL DEFAULT 60,
    priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    status ENUM('not_started', 'in_progress', 'completed', 'not_completed', 'rescheduled') NOT NULL DEFAULT 'not_started',
    completion_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
    learned_content TEXT NULL,
    unfinished_content TEXT NULL,
    note TEXT NULL,
    self_assessment TINYINT NULL,
    actual_study_minutes INT NULL,
    schedule_id INT NULL,
    rescheduled_from_date DATE NULL,
    rescheduled_from_time TIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_learning_roadmap_items_roadmap FOREIGN KEY (roadmap_id) REFERENCES learning_roadmaps(id),
    INDEX idx_learning_roadmap_items_roadmap_order (roadmap_id, week_number, order_number),
    INDEX idx_learning_roadmap_items_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;

ALTER TABLE study_schedules
    ADD COLUMN IF NOT EXISTS roadmap_id INT NULL AFTER status,
    ADD COLUMN IF NOT EXISTS roadmap_item_id INT NULL AFTER roadmap_id,
    ADD COLUMN IF NOT EXISTS reminder_minutes_before INT NULL AFTER roadmap_item_id;

CREATE INDEX IF NOT EXISTS idx_study_schedules_roadmap
    ON study_schedules (roadmap_id, roadmap_item_id);

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
