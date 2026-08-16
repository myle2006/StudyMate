ALTER TABLE lessons
    ADD COLUMN IF NOT EXISTS chapter VARCHAR(120) NOT NULL DEFAULT 'Chuong 1' AFTER subject_id;

CREATE INDEX IF NOT EXISTS idx_lessons_subject_chapter ON lessons (subject_id, chapter);
