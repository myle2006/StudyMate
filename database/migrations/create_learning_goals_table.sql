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
    CONSTRAINT fk_learning_goals_subject FOREIGN KEY (subject_id) REFERENCES subjects(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_learning_goals_user_status ON learning_goals (user_id, status);
CREATE INDEX idx_learning_goals_subject ON learning_goals (subject_id);
CREATE INDEX idx_learning_goals_dates ON learning_goals (start_date, end_date);
CREATE INDEX idx_learning_goals_deleted_at ON learning_goals (deleted_at);
