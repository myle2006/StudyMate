CREATE TABLE IF NOT EXISTS quiz_security_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    student_id INT NOT NULL,
    event_type VARCHAR(80) NOT NULL,
    message VARCHAR(500) NOT NULL,
    metadata JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(255) NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_quiz_security_assignment_student (assignment_id, student_id, created_at),
    INDEX idx_quiz_security_event_type (event_type),
    CONSTRAINT fk_quiz_security_assignment
        FOREIGN KEY (assignment_id) REFERENCES assignments(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_quiz_security_student
        FOREIGN KEY (student_id) REFERENCES users(id)
        ON DELETE CASCADE
);
