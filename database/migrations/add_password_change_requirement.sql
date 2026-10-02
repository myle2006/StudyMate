-- Require imported or reset student accounts to change their initial password.
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS must_change_password TINYINT(1) NOT NULL DEFAULT 0 AFTER password;

CREATE INDEX IF NOT EXISTS idx_users_must_change_password
    ON users (must_change_password);
