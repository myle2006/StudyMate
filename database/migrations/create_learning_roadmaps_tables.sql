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
    CONSTRAINT fk_learning_roadmaps_goal FOREIGN KEY (learning_goal_id) REFERENCES learning_goals(id)
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
    CONSTRAINT fk_learning_roadmap_items_roadmap FOREIGN KEY (roadmap_id) REFERENCES learning_roadmaps(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_learning_roadmaps_user_status ON learning_roadmaps (user_id, status);
CREATE INDEX idx_learning_roadmaps_subject ON learning_roadmaps (subject_id);
CREATE INDEX idx_learning_roadmaps_goal ON learning_roadmaps (learning_goal_id);
CREATE INDEX idx_learning_roadmaps_deleted_at ON learning_roadmaps (deleted_at);
CREATE INDEX idx_learning_roadmap_items_roadmap_order ON learning_roadmap_items (roadmap_id, week_number, order_number);
CREATE INDEX idx_learning_roadmap_items_status ON learning_roadmap_items (status);
