ALTER TABLE roadmap_template_tasks
    ADD COLUMN IF NOT EXISTS lesson_id INT NULL AFTER phase_id,
    ADD COLUMN IF NOT EXISTS assignment_id INT NULL AFTER lesson_id,
    ADD COLUMN IF NOT EXISTS content_type ENUM('lesson', 'quiz', 'practice', 'project', 'reading') NOT NULL DEFAULT 'lesson' AFTER assignment_id,
    ADD COLUMN IF NOT EXISTS branch_label VARCHAR(80) NULL AFTER content_type,
    ADD COLUMN IF NOT EXISTS is_required TINYINT(1) NOT NULL DEFAULT 1 AFTER branch_label,
    ADD COLUMN IF NOT EXISTS allow_skip TINYINT(1) NOT NULL DEFAULT 0 AFTER is_required;

ALTER TABLE learning_roadmap_items
    ADD COLUMN IF NOT EXISTS lesson_id INT NULL AFTER roadmap_id,
    ADD COLUMN IF NOT EXISTS assignment_id INT NULL AFTER lesson_id,
    ADD COLUMN IF NOT EXISTS content_type ENUM('lesson', 'quiz', 'practice', 'project', 'reading') NOT NULL DEFAULT 'lesson' AFTER assignment_id,
    ADD COLUMN IF NOT EXISTS branch_label VARCHAR(80) NULL AFTER content_type,
    ADD COLUMN IF NOT EXISTS is_required TINYINT(1) NOT NULL DEFAULT 1 AFTER branch_label,
    ADD COLUMN IF NOT EXISTS allow_skip TINYINT(1) NOT NULL DEFAULT 0 AFTER is_required;

CREATE INDEX IF NOT EXISTS idx_roadmap_template_tasks_lesson ON roadmap_template_tasks (lesson_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_template_tasks_assignment ON roadmap_template_tasks (assignment_id);
CREATE INDEX IF NOT EXISTS idx_learning_roadmap_items_lesson ON learning_roadmap_items (lesson_id);
CREATE INDEX IF NOT EXISTS idx_learning_roadmap_items_assignment ON learning_roadmap_items (assignment_id);
