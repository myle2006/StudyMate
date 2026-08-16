CREATE TABLE IF NOT EXISTS lesson_dependencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    lesson_id INT NOT NULL,
    prerequisite_lesson_id INT NOT NULL,
    relation_type ENUM('required', 'recommended', 'optional') NOT NULL DEFAULT 'required',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_lesson_dependencies_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
    CONSTRAINT fk_lesson_dependencies_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    CONSTRAINT fk_lesson_dependencies_prerequisite FOREIGN KEY (prerequisite_lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
    UNIQUE KEY uq_lesson_dependency_pair (lesson_id, prerequisite_lesson_id),
    INDEX idx_lesson_dependencies_subject (subject_id),
    INDEX idx_lesson_dependencies_prerequisite (prerequisite_lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
