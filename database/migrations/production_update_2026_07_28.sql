-- StudyMate AI production database update
-- Date: 2026-07-28
--
-- Use this file on the existing production database that already has:
-- users, roles, subjects, study_schedules.
--
-- Do NOT import studymate.sql again on production, because it can overwrite
-- or duplicate real data. This file only adds the new tables/columns needed
-- by the latest StudyMate source code.

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

-- Add columns to study_schedules if they do not exist yet.
-- These statements use MariaDB/MySQL IF NOT EXISTS syntax supported by many
-- shared-hosting MariaDB installations.
ALTER TABLE study_schedules
    ADD COLUMN IF NOT EXISTS roadmap_id INT NULL AFTER status,
    ADD COLUMN IF NOT EXISTS roadmap_item_id INT NULL AFTER roadmap_id,
    ADD COLUMN IF NOT EXISTS reminder_minutes_before INT NULL AFTER roadmap_item_id;

CREATE INDEX IF NOT EXISTS idx_study_schedules_roadmap
    ON study_schedules (roadmap_id, roadmap_item_id);

-- Verification can be done manually with:
-- SHOW TABLES LIKE 'student_subjects';
-- SHOW TABLES LIKE 'assignments';
-- SHOW TABLES LIKE 'assignment_submissions';
-- SHOW TABLES LIKE 'learning_goals';
-- SHOW TABLES LIKE 'learning_roadmaps';
-- SHOW TABLES LIKE 'learning_roadmap_items';
-- SHOW COLUMNS FROM study_schedules LIKE 'roadmap_id';
-- SHOW COLUMNS FROM study_schedules LIKE 'roadmap_item_id';
-- SHOW COLUMNS FROM study_schedules LIKE 'reminder_minutes_before';
