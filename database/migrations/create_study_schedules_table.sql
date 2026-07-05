CREATE TABLE IF NOT EXISTS study_schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    subject_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    study_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255) NULL,
    schedule_type ENUM('class', 'self_study', 'review', 'assignment', 'exam') DEFAULT 'self_study',
    status ENUM('upcoming', 'completed', 'cancelled') DEFAULT 'upcoming',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    CONSTRAINT fk_schedule_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_schedule_subject FOREIGN KEY (subject_id) REFERENCES subjects(id)
);

CREATE INDEX idx_study_schedules_user_date ON study_schedules (user_id, study_date);
CREATE INDEX idx_study_schedules_subject ON study_schedules (subject_id);
CREATE INDEX idx_study_schedules_status ON study_schedules (status);
CREATE INDEX idx_study_schedules_type ON study_schedules (schedule_type);
