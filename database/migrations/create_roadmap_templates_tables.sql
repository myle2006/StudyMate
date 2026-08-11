CREATE TABLE IF NOT EXISTS roadmap_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subject_id INT NOT NULL,
    template_code VARCHAR(80) NOT NULL,
    duration_months TINYINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    overview TEXT NULL,
    goal TEXT NOT NULL,
    current_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner',
    total_weeks TINYINT UNSIGNED NOT NULL,
    study_hours_per_week DECIMAL(5,2) NOT NULL DEFAULT 6.00,
    completion_criteria TEXT NULL,
    final_assessment TEXT NULL,
    reference_materials TEXT NULL,
    status ENUM('active', 'archived') NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_roadmap_templates_subject FOREIGN KEY (subject_id) REFERENCES subjects(id),
    UNIQUE KEY uq_roadmap_template_code (template_code),
    UNIQUE KEY uq_roadmap_template_subject_duration (subject_id, duration_months),
    INDEX idx_roadmap_templates_subject_status (subject_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS roadmap_template_phases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_id INT NOT NULL,
    phase_number TINYINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    overview TEXT NULL,
    start_week TINYINT UNSIGNED NOT NULL,
    end_week TINYINT UNSIGNED NOT NULL,
    duration_weeks TINYINT UNSIGNED NOT NULL,
    outcome TEXT NULL,
    completion_criteria TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_roadmap_template_phases_template FOREIGN KEY (template_id) REFERENCES roadmap_templates(id) ON DELETE CASCADE,
    UNIQUE KEY uq_roadmap_template_phase_number (template_id, phase_number),
    INDEX idx_roadmap_template_phases_template (template_id, phase_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS roadmap_template_tasks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phase_id INT NOT NULL,
    task_number TINYINT UNSIGNED NOT NULL,
    week_number TINYINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    expected_result TEXT NULL,
    suggested_task TEXT NULL,
    reference_materials TEXT NULL,
    completion_criteria TEXT NULL,
    priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_roadmap_template_tasks_phase FOREIGN KEY (phase_id) REFERENCES roadmap_template_phases(id) ON DELETE CASCADE,
    UNIQUE KEY uq_roadmap_template_task_number (phase_id, task_number),
    INDEX idx_roadmap_template_tasks_phase_order (phase_id, week_number, task_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
