ALTER TABLE learning_roadmaps
    ADD COLUMN available_weekdays VARCHAR(32) NULL AFTER study_time_per_day,
    ADD COLUMN preferred_start_time TIME NULL AFTER available_weekdays,
    ADD COLUMN session_duration_minutes INT NOT NULL DEFAULT 60 AFTER preferred_start_time,
    ADD COLUMN max_daily_minutes INT NULL AFTER session_duration_minutes,
    ADD COLUMN max_weekly_minutes INT NULL AFTER max_daily_minutes,
    ADD COLUMN reminder_minutes_before INT NOT NULL DEFAULT 15 AFTER max_weekly_minutes;

ALTER TABLE learning_roadmap_items
    MODIFY COLUMN status ENUM('not_started', 'in_progress', 'completed', 'not_completed', 'rescheduled') NOT NULL DEFAULT 'not_started',
    ADD COLUMN start_time TIME NULL AFTER planned_date,
    ADD COLUMN duration_minutes INT NOT NULL DEFAULT 60 AFTER start_time,
    ADD COLUMN priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium' AFTER duration_minutes,
    ADD COLUMN completion_percent DECIMAL(5,2) NOT NULL DEFAULT 0 AFTER status,
    ADD COLUMN learned_content TEXT NULL AFTER completion_percent,
    ADD COLUMN unfinished_content TEXT NULL AFTER learned_content,
    ADD COLUMN note TEXT NULL AFTER unfinished_content,
    ADD COLUMN self_assessment TINYINT NULL AFTER note,
    ADD COLUMN actual_study_minutes INT NULL AFTER self_assessment,
    ADD COLUMN schedule_id INT NULL AFTER actual_study_minutes,
    ADD COLUMN rescheduled_from_date DATE NULL AFTER schedule_id,
    ADD COLUMN rescheduled_from_time TIME NULL AFTER rescheduled_from_date;

ALTER TABLE study_schedules
    ADD COLUMN roadmap_id INT NULL AFTER status,
    ADD COLUMN roadmap_item_id INT NULL AFTER roadmap_id,
    ADD COLUMN reminder_minutes_before INT NULL AFTER roadmap_item_id;

CREATE INDEX IF NOT EXISTS idx_study_schedules_roadmap ON study_schedules (roadmap_id, roadmap_item_id);
