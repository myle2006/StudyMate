CREATE TABLE IF NOT EXISTS assignment_quiz_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assignment_id INT NOT NULL,
    question_type ENUM('single_choice', 'short_answer') NOT NULL DEFAULT 'single_choice',
    question_text TEXT NOT NULL,
    option_a TEXT NULL,
    option_b TEXT NULL,
    option_c TEXT NULL,
    option_d TEXT NULL,
    correct_answer CHAR(1) NULL,
    points DECIMAL(6,2) NOT NULL DEFAULT 1,
    explanation TEXT NULL,
    order_number INT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignment_quiz_questions_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX IF NOT EXISTS idx_assignment_quiz_questions_assignment ON assignment_quiz_questions (assignment_id, order_number);
