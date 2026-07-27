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
    CONSTRAINT uq_assignment_submission_student UNIQUE (assignment_id, student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_assignment_submissions_student_status ON assignment_submissions (student_id, status);
CREATE INDEX idx_assignment_submissions_assignment_status ON assignment_submissions (assignment_id, status);
CREATE INDEX idx_assignment_submissions_submitted_at ON assignment_submissions (submitted_at);
