-- StudyMate full import database
-- Import this file in phpMyAdmin or MySQL/MariaDB CLI.
-- Default accounts after import:
--   Admin:   admin@example.com / admin123
--   Student: student@example.com / password

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;

DROP DATABASE IF EXISTS `studymate`;
CREATE DATABASE `studymate` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `studymate`;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `assignment_quiz_questions`;
DROP TABLE IF EXISTS `quiz_security_events`;
DROP TABLE IF EXISTS `assignment_submissions`;
DROP TABLE IF EXISTS `lesson_dependencies`;
DROP TABLE IF EXISTS `lesson_progress`;
DROP TABLE IF EXISTS `learning_roadmap_items`;
DROP TABLE IF EXISTS `roadmap_template_tasks`;
DROP TABLE IF EXISTS `roadmap_template_phases`;
DROP TABLE IF EXISTS `roadmap_templates`;
DROP TABLE IF EXISTS `study_schedules`;
DROP TABLE IF EXISTS `learning_roadmaps`;
DROP TABLE IF EXISTS `learning_goals`;
DROP TABLE IF EXISTS `lessons`;
DROP TABLE IF EXISTS `notification_reads`;
DROP TABLE IF EXISTS `assignments`;
DROP TABLE IF EXISTS `student_subjects`;
DROP TABLE IF EXISTS `subject_classes`;
DROP TABLE IF EXISTS `subjects`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `role_id` INT NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `avatar` VARCHAR(255) NULL,
  `phone` VARCHAR(20) NULL,
  `student_code` VARCHAR(50) NULL,
  `status` ENUM('active','inactive','locked') DEFAULT 'active',
  `last_login_at` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_users_role` (`role_id`),
  KEY `idx_users_status` (`status`),
  CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `subject_code` VARCHAR(50) NOT NULL UNIQUE,
  `subject_name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `credits` TINYINT UNSIGNED NOT NULL DEFAULT 3,
  `status` ENUM('studying','paused','completed') DEFAULT 'studying',
  `color` VARCHAR(20) DEFAULT '#2563EB',
  `image` VARCHAR(255) NULL,
  `created_by` INT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  KEY `idx_subjects_status` (`status`),
  KEY `idx_subjects_deleted_at` (`deleted_at`),
  KEY `idx_subjects_created_by` (`created_by`),
  CONSTRAINT `fk_subject_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `subject_classes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `subject_id` INT NOT NULL,
  `class_code` VARCHAR(50) NOT NULL,
  `class_name` VARCHAR(255) NULL,
  `status` ENUM('active','archived') NOT NULL DEFAULT 'active',
  `created_by` INT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  UNIQUE KEY `uq_subject_class_code` (`subject_id`, `class_code`),
  KEY `idx_subject_classes_subject_status` (`subject_id`, `status`),
  KEY `idx_subject_classes_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_subject_classes_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `fk_subject_classes_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `student_subjects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `class_id` INT NULL,
  `status` ENUM('active','removed') NOT NULL DEFAULT 'active',
  `assigned_by` INT NOT NULL,
  `assigned_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `removed_at` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_student_subject_class` (`student_id`, `subject_id`, `class_id`),
  KEY `idx_student_subjects_subject_status` (`subject_id`, `status`),
  KEY `idx_student_subjects_student_status` (`student_id`, `status`),
  KEY `idx_student_subjects_class_status` (`class_id`, `status`),
  CONSTRAINT `fk_student_subjects_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_student_subjects_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `fk_student_subjects_class` FOREIGN KEY (`class_id`) REFERENCES `subject_classes` (`id`),
  CONSTRAINT `fk_student_subjects_assigned_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `assignments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `subject_id` INT NOT NULL,
  `class_id` INT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `deadline` DATETIME NOT NULL,
  `attachment_path` VARCHAR(255) NULL,
  `status` ENUM('open','closed','draft') NOT NULL DEFAULT 'draft',
  `created_by` INT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  KEY `idx_assignments_subject_status` (`subject_id`, `status`),
  KEY `idx_assignments_class_status` (`class_id`, `status`),
  KEY `idx_assignments_deadline` (`deadline`),
  KEY `idx_assignments_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_assignments_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `fk_assignments_class` FOREIGN KEY (`class_id`) REFERENCES `subject_classes` (`id`),
  CONSTRAINT `fk_assignments_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `assignment_submissions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `assignment_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `content` TEXT NULL,
  `file_path` VARCHAR(255) NULL,
  `submitted_at` DATETIME NOT NULL,
  `status` ENUM('submitted','late','graded') NOT NULL DEFAULT 'submitted',
  `score` DECIMAL(5,2) NULL,
  `feedback` TEXT NULL,
  `graded_by` INT NULL,
  `graded_at` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_assignment_submission_student` (`assignment_id`, `student_id`),
  KEY `idx_assignment_submissions_student_status` (`student_id`, `status`),
  KEY `idx_assignment_submissions_assignment_status` (`assignment_id`, `status`),
  KEY `idx_assignment_submissions_submitted_at` (`submitted_at`),
  CONSTRAINT `fk_assignment_submissions_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`),
  CONSTRAINT `fk_assignment_submissions_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_assignment_submissions_graded_by` FOREIGN KEY (`graded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `assignment_quiz_questions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `assignment_id` INT NOT NULL,
  `question_type` ENUM('single_choice','short_answer') NOT NULL DEFAULT 'single_choice',
  `question_text` TEXT NOT NULL,
  `option_a` TEXT NULL,
  `option_b` TEXT NULL,
  `option_c` TEXT NULL,
  `option_d` TEXT NULL,
  `correct_answer` CHAR(1) NULL,
  `points` DECIMAL(6,2) NOT NULL DEFAULT 1,
  `explanation` TEXT NULL,
  `order_number` INT NOT NULL DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_assignment_quiz_questions_assignment` (`assignment_id`, `order_number`),
  CONSTRAINT `fk_assignment_quiz_questions_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `quiz_security_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `assignment_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `event_type` VARCHAR(80) NOT NULL,
  `message` VARCHAR(500) NOT NULL,
  `metadata` JSON NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY `idx_quiz_security_assignment_student` (`assignment_id`, `student_id`, `created_at`),
  KEY `idx_quiz_security_event_type` (`event_type`),
  CONSTRAINT `fk_quiz_security_assignment` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_quiz_security_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `learning_goals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `goal_description` TEXT NOT NULL,
  `current_level` ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
  `study_time_per_day` DECIMAL(5,2) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `status` ENUM('active','completed','paused','cancelled') NOT NULL DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  KEY `idx_learning_goals_user_status` (`user_id`, `status`),
  KEY `idx_learning_goals_subject` (`subject_id`),
  KEY `idx_learning_goals_dates` (`start_date`, `end_date`),
  KEY `idx_learning_goals_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_learning_goals_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_learning_goals_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `study_schedules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `study_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `location` VARCHAR(255) NULL,
  `schedule_type` ENUM('class','self_study','review','assignment','exam') DEFAULT 'self_study',
  `status` ENUM('upcoming','completed','cancelled') DEFAULT 'upcoming',
  `roadmap_id` INT NULL,
  `roadmap_item_id` INT NULL,
  `reminder_minutes_before` INT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  KEY `idx_study_schedules_user_date` (`user_id`, `study_date`),
  KEY `idx_study_schedules_subject` (`subject_id`),
  KEY `idx_study_schedules_status` (`status`),
  KEY `idx_study_schedules_type` (`schedule_type`),
  KEY `idx_study_schedules_roadmap` (`roadmap_id`, `roadmap_item_id`),
  CONSTRAINT `fk_schedule_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_schedule_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lessons` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `subject_id` INT NOT NULL,
  `chapter` VARCHAR(120) NOT NULL DEFAULT 'Chuong 1',
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NULL,
  `video_url` VARCHAR(500) NULL,
  `external_url` VARCHAR(500) NULL,
  `material_path` VARCHAR(255) NULL,
  `duration_minutes` INT NULL,
  `status` ENUM('draft','published') NOT NULL DEFAULT 'draft',
  `created_by` INT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  KEY `idx_lessons_subject_status` (`subject_id`, `status`),
  KEY `idx_lessons_subject_chapter` (`subject_id`, `chapter`),
  KEY `idx_lessons_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_lessons_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `fk_lessons_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lesson_progress` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `lesson_id` INT NOT NULL,
  `student_id` INT NOT NULL,
  `status` ENUM('not_started','completed') NOT NULL DEFAULT 'not_started',
  `completed_at` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_lesson_progress_student` (`lesson_id`, `student_id`),
  KEY `idx_lesson_progress_student_status` (`student_id`, `status`),
  CONSTRAINT `fk_lesson_progress_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`),
  CONSTRAINT `fk_lesson_progress_student` FOREIGN KEY (`student_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `lesson_dependencies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `subject_id` INT NOT NULL,
  `lesson_id` INT NOT NULL,
  `prerequisite_lesson_id` INT NOT NULL,
  `relation_type` ENUM('required','recommended','optional') NOT NULL DEFAULT 'required',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_lesson_dependency_pair` (`lesson_id`, `prerequisite_lesson_id`),
  KEY `idx_lesson_dependencies_subject` (`subject_id`),
  KEY `idx_lesson_dependencies_prerequisite` (`prerequisite_lesson_id`),
  CONSTRAINT `fk_lesson_dependencies_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lesson_dependencies_lesson` FOREIGN KEY (`lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lesson_dependencies_prerequisite` FOREIGN KEY (`prerequisite_lesson_id`) REFERENCES `lessons` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `learning_roadmaps` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `subject_id` INT NOT NULL,
  `learning_goal_id` INT NULL,
  `title` VARCHAR(255) NOT NULL,
  `overview` TEXT NULL,
  `goal` TEXT NOT NULL,
  `current_level` ENUM('beginner','intermediate','advanced') NOT NULL,
  `study_time_per_day` DECIMAL(5,2) NOT NULL,
  `available_weekdays` VARCHAR(32) NULL,
  `preferred_start_time` TIME NULL,
  `session_duration_minutes` INT NOT NULL DEFAULT 60,
  `max_daily_minutes` INT NULL,
  `max_weekly_minutes` INT NULL,
  `reminder_minutes_before` INT NOT NULL DEFAULT 15,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `generated_by_ai` TINYINT(1) NOT NULL DEFAULT 0,
  `ai_prompt` LONGTEXT NULL,
  `ai_raw_response` LONGTEXT NULL,
  `status` ENUM('draft','active','completed','paused') NOT NULL DEFAULT 'draft',
  `progress_percent` DECIMAL(5,2) NOT NULL DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` DATETIME NULL,
  KEY `idx_learning_roadmaps_user_status` (`user_id`, `status`),
  KEY `idx_learning_roadmaps_subject` (`subject_id`),
  KEY `idx_learning_roadmaps_goal` (`learning_goal_id`),
  KEY `idx_learning_roadmaps_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_learning_roadmaps_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_learning_roadmaps_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `fk_learning_roadmaps_goal` FOREIGN KEY (`learning_goal_id`) REFERENCES `learning_goals` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `learning_roadmap_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `roadmap_id` INT NOT NULL,
  `lesson_id` INT NULL,
  `assignment_id` INT NULL,
  `content_type` ENUM('lesson','quiz','practice','project','reading') NOT NULL DEFAULT 'lesson',
  `branch_label` VARCHAR(80) NULL,
  `is_required` TINYINT(1) NOT NULL DEFAULT 1,
  `allow_skip` TINYINT(1) NOT NULL DEFAULT 0,
  `week_number` INT NOT NULL,
  `order_number` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `expected_result` TEXT NULL,
  `suggested_task` TEXT NULL,
  `planned_date` DATE NULL,
  `start_time` TIME NULL,
  `duration_minutes` INT NOT NULL DEFAULT 60,
  `priority` ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  `status` ENUM('not_started','in_progress','completed','not_completed','rescheduled') NOT NULL DEFAULT 'not_started',
  `completion_percent` DECIMAL(5,2) NOT NULL DEFAULT 0,
  `learned_content` TEXT NULL,
  `unfinished_content` TEXT NULL,
  `note` TEXT NULL,
  `self_assessment` TINYINT NULL,
  `actual_study_minutes` INT NULL,
  `schedule_id` INT NULL,
  `rescheduled_from_date` DATE NULL,
  `rescheduled_from_time` TIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY `idx_learning_roadmap_items_roadmap_order` (`roadmap_id`, `week_number`, `order_number`),
  KEY `idx_learning_roadmap_items_status` (`status`),
  KEY `idx_learning_roadmap_items_lesson` (`lesson_id`),
  KEY `idx_learning_roadmap_items_assignment` (`assignment_id`),
  CONSTRAINT `fk_learning_roadmap_items_roadmap` FOREIGN KEY (`roadmap_id`) REFERENCES `learning_roadmaps` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `roadmap_templates` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `subject_id` INT NOT NULL,
  `template_code` VARCHAR(80) NOT NULL UNIQUE,
  `duration_months` TINYINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `overview` TEXT NULL,
  `goal` TEXT NOT NULL,
  `current_level` ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
  `total_weeks` TINYINT UNSIGNED NOT NULL,
  `study_hours_per_week` DECIMAL(5,2) NOT NULL DEFAULT 6.00,
  `completion_criteria` TEXT NULL,
  `final_assessment` TEXT NULL,
  `reference_materials` TEXT NULL,
  `status` ENUM('active','archived') NOT NULL DEFAULT 'active',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_roadmap_template_subject_duration` (`subject_id`, `duration_months`),
  KEY `idx_roadmap_templates_subject_status` (`subject_id`, `status`),
  CONSTRAINT `fk_roadmap_templates_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `roadmap_template_phases` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `template_id` INT NOT NULL,
  `phase_number` TINYINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `overview` TEXT NULL,
  `start_week` TINYINT UNSIGNED NOT NULL,
  `end_week` TINYINT UNSIGNED NOT NULL,
  `duration_weeks` TINYINT UNSIGNED NOT NULL,
  `outcome` TEXT NULL,
  `completion_criteria` TEXT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_roadmap_template_phase_number` (`template_id`, `phase_number`),
  KEY `idx_roadmap_template_phases_template` (`template_id`, `phase_number`),
  CONSTRAINT `fk_roadmap_template_phases_template` FOREIGN KEY (`template_id`) REFERENCES `roadmap_templates` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `roadmap_template_tasks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `phase_id` INT NOT NULL,
  `lesson_id` INT NULL,
  `assignment_id` INT NULL,
  `content_type` ENUM('lesson','quiz','practice','project','reading') NOT NULL DEFAULT 'lesson',
  `branch_label` VARCHAR(80) NULL,
  `is_required` TINYINT(1) NOT NULL DEFAULT 1,
  `allow_skip` TINYINT(1) NOT NULL DEFAULT 0,
  `task_number` TINYINT UNSIGNED NOT NULL,
  `week_number` TINYINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `expected_result` TEXT NULL,
  `suggested_task` TEXT NULL,
  `reference_materials` TEXT NULL,
  `completion_criteria` TEXT NULL,
  `priority` ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_roadmap_template_task_number` (`phase_id`, `task_number`),
  KEY `idx_roadmap_template_tasks_phase_order` (`phase_id`, `week_number`, `task_number`),
  KEY `idx_roadmap_template_tasks_lesson` (`lesson_id`),
  KEY `idx_roadmap_template_tasks_assignment` (`assignment_id`),
  CONSTRAINT `fk_roadmap_template_tasks_phase` FOREIGN KEY (`phase_id`) REFERENCES `roadmap_template_phases` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `notification_reads` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `notification_key` VARCHAR(191) NOT NULL,
  `read_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_notification_reads_user_key` (`user_id`, `notification_key`),
  KEY `idx_notification_reads_user` (`user_id`),
  CONSTRAINT `fk_notification_reads_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`id`, `name`, `description`) VALUES
(1, 'admin', 'Quản trị viên hệ thống'),
(2, 'student', 'Sinh viên sử dụng hệ thống học tập cá nhân');

INSERT INTO `users` (`id`, `role_id`, `full_name`, `email`, `password`, `phone`, `student_code`, `status`) VALUES
(1, 1, 'Nguyễn Văn Admin', 'admin@example.com', '$2y$10$5t.rvvQhB36p/EMt2cAW6.Y18rnxVx906zUsOisOZUMj/5aZH6UFS', '0901234567', NULL, 'active'),
(2, 2, 'Trần Thị Mỹ Lệ', 'student@example.com', '$2y$10$kAZGja5/OtMEYrgq9KzDX.ZINEYOS0f9emoY4lurM5nhPivqZXohq', '0912345678', '24211TT3192', 'active'),
(3, 2, 'Nguyễn Minh Anh', 'minhanh@student.com', '$2y$10$kAZGja5/OtMEYrgq9KzDX.ZINEYOS0f9emoY4lurM5nhPivqZXohq', '0923456789', '24211TT1001', 'active'),
(4, 2, 'Lê Hoàng Phúc', 'hoangphuc@student.com', '$2y$10$kAZGja5/OtMEYrgq9KzDX.ZINEYOS0f9emoY4lurM5nhPivqZXohq', '0934567890', '24211TT1002', 'active');

INSERT INTO `subjects` (`id`, `subject_code`, `subject_name`, `description`, `credits`, `status`, `color`, `created_by`) VALUES
(1, 'SWT301', 'Kiểm thử phần mềm', 'Môn học về quy trình kiểm thử, test case, bug report và test design.', 3, 'studying', '#2563EB', 1),
(2, 'WEB201', 'Lập trình Web', 'Xây dựng website với HTML, CSS, JavaScript, PHP và MySQL.', 3, 'studying', '#16A34A', 1),
(3, 'DB101', 'Cơ sở dữ liệu', 'Mô hình ERD, SQL, quan hệ bảng và truy vấn dữ liệu.', 3, 'studying', '#F97316', 1),
(4, 'SAD201', 'Phân tích thiết kế hệ thống', 'Phân tích yêu cầu, thiết kế mô hình hệ thống và luồng nghiệp vụ.', 3, 'studying', '#9333EA', 1);

INSERT INTO `subject_classes` (`id`, `subject_id`, `class_code`, `class_name`, `status`, `created_by`) VALUES
(1, 1, '25101', 'Kiểm thử phần mềm 25101', 'active', 1),
(2, 1, '25102', 'Kiểm thử phần mềm 25102', 'active', 1),
(3, 1, '25103', 'Kiểm thử phần mềm 25103', 'active', 1),
(4, 2, '25101', 'Lập trình Web 25101', 'active', 1),
(5, 3, '25101', 'Cơ sở dữ liệu 25101', 'active', 1),
(6, 4, '25101', 'Phân tích thiết kế hệ thống 25101', 'active', 1);

INSERT INTO `student_subjects` (`student_id`, `subject_id`, `class_id`, `status`, `assigned_by`) VALUES
(2, 1, 1, 'active', 1),
(2, 2, 4, 'active', 1),
(2, 4, 6, 'active', 1),
(3, 1, 2, 'active', 1),
(4, 3, 5, 'active', 1);

INSERT INTO `assignments` (`id`, `subject_id`, `class_id`, `title`, `description`, `deadline`, `status`, `created_by`) VALUES
(1, 1, 1, 'Viết test case cho màn hình đăng nhập', 'Tạo bộ test case gồm dữ liệu hợp lệ, không hợp lệ và biên.', DATE_ADD(NOW(), INTERVAL 5 DAY), 'open', 1),
(2, 2, 4, 'Bài tập React component', 'Xây dựng một component form có validate cơ bản.', DATE_ADD(NOW(), INTERVAL 7 DAY), 'open', 1);

INSERT INTO `assignment_quiz_questions` (`assignment_id`, `question_type`, `question_text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_answer`, `points`, `order_number`) VALUES
(1, 'single_choice', 'Test case nên có thông tin nào?', 'Input, bước thực hiện, expected result', 'Chỉ tên người test', 'Chỉ screenshot', 'Chỉ thời gian chạy', 'A', 1, 1);

INSERT INTO `lessons` (`id`, `subject_id`, `chapter`, `title`, `content`, `duration_minutes`, `status`, `created_by`) VALUES
(1, 1, 'Chương 1', 'Tổng quan kiểm thử phần mềm', 'Khái niệm kiểm thử, lỗi phần mềm, quy trình kiểm thử và vai trò QA.', 45, 'published', 1),
(2, 1, 'Chương 2', 'Thiết kế test case', 'Cách phân tích yêu cầu, xác định test data và expected result.', 60, 'published', 1),
(3, 2, 'Chương 1', 'React component cơ bản', 'Component, props, state và event handling trong React.', 60, 'published', 1);

INSERT INTO `learning_goals` (`id`, `user_id`, `subject_id`, `title`, `goal_description`, `current_level`, `study_time_per_day`, `start_date`, `end_date`, `status`) VALUES
(1, 2, 1, 'Nắm vững test case trong 2 tuần', 'Biết phân tích yêu cầu và viết test case rõ ràng.', 'beginner', 1.00, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'active');

INSERT INTO `learning_roadmaps` (`id`, `user_id`, `subject_id`, `learning_goal_id`, `title`, `overview`, `goal`, `current_level`, `study_time_per_day`, `available_weekdays`, `preferred_start_time`, `session_duration_minutes`, `start_date`, `end_date`, `status`, `progress_percent`) VALUES
(1, 2, 1, 1, 'Lộ trình kiểm thử phần mềm cơ bản', 'Lộ trình mẫu để học quy trình kiểm thử và viết test case.', 'Hoàn thành các bài học nền tảng về kiểm thử.', 'beginner', 1.00, '1,2,3,4,5', '19:00:00', 60, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 14 DAY), 'active', 0);

INSERT INTO `learning_roadmap_items` (`id`, `roadmap_id`, `lesson_id`, `content_type`, `branch_label`, `week_number`, `order_number`, `title`, `description`, `planned_date`, `start_time`, `duration_minutes`, `status`) VALUES
(1, 1, 1, 'lesson', 'Nền tảng', 1, 1, 'Tổng quan kiểm thử phần mềm', 'Đọc bài học và ghi lại các khái niệm chính.', CURDATE(), '19:00:00', 60, 'not_started'),
(2, 1, 2, 'lesson', 'Thực hành', 1, 2, 'Thiết kế test case', 'Thực hành viết test case cho màn hình đăng nhập.', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '19:00:00', 60, 'not_started');

INSERT INTO `study_schedules` (`id`, `user_id`, `subject_id`, `title`, `description`, `study_date`, `start_time`, `end_time`, `location`, `schedule_type`, `status`, `roadmap_id`, `roadmap_item_id`, `reminder_minutes_before`) VALUES
(1, 2, 1, 'Học tổng quan kiểm thử', 'Ôn các khái niệm kiểm thử phần mềm.', CURDATE(), '19:00:00', '20:00:00', 'Tự học', 'self_study', 'upcoming', 1, 1, 15),
(2, 2, 2, 'Thực hành React component', 'Làm bài tập component form.', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '20:00:00', '21:00:00', 'Online', 'assignment', 'upcoming', NULL, NULL, 15);

UPDATE `learning_roadmap_items` SET `schedule_id` = 1 WHERE `id` = 1;

INSERT INTO `roadmap_templates` (`id`, `subject_id`, `template_code`, `duration_months`, `title`, `overview`, `goal`, `current_level`, `total_weeks`, `study_hours_per_week`, `status`) VALUES
(1, 1, 'SWT301-1M-BASIC', 1, 'Kiểm thử phần mềm cơ bản', 'Mẫu lộ trình 1 tháng cho môn kiểm thử phần mềm.', 'Nắm được quy trình kiểm thử và viết test case cơ bản.', 'beginner', 4, 6.00, 'active');

INSERT INTO `roadmap_template_phases` (`id`, `template_id`, `phase_number`, `title`, `overview`, `start_week`, `end_week`, `duration_weeks`, `outcome`) VALUES
(1, 1, 1, 'Nền tảng kiểm thử', 'Học khái niệm, quy trình và test case.', 1, 2, 2, 'Viết được test case rõ expected result.');

INSERT INTO `roadmap_template_tasks` (`phase_id`, `lesson_id`, `content_type`, `branch_label`, `task_number`, `week_number`, `title`, `description`, `expected_result`, `priority`) VALUES
(1, 1, 'lesson', 'Nền tảng', 1, 1, 'Tổng quan kiểm thử phần mềm', 'Đọc bài học và ghi chú khái niệm chính.', 'Hiểu mục tiêu và vai trò của kiểm thử.', 'medium'),
(1, 2, 'lesson', 'Thực hành', 2, 2, 'Thiết kế test case', 'Thực hành viết test case.', 'Có bộ test case mẫu.', 'high');

INSERT INTO `lesson_dependencies` (`subject_id`, `lesson_id`, `prerequisite_lesson_id`, `relation_type`) VALUES
(1, 2, 1, 'required');

ALTER TABLE `roles` AUTO_INCREMENT = 3;
ALTER TABLE `users` AUTO_INCREMENT = 5;
ALTER TABLE `subjects` AUTO_INCREMENT = 5;
ALTER TABLE `subject_classes` AUTO_INCREMENT = 7;
ALTER TABLE `assignments` AUTO_INCREMENT = 3;
ALTER TABLE `lessons` AUTO_INCREMENT = 4;
ALTER TABLE `learning_goals` AUTO_INCREMENT = 2;
ALTER TABLE `learning_roadmaps` AUTO_INCREMENT = 2;
ALTER TABLE `learning_roadmap_items` AUTO_INCREMENT = 3;
ALTER TABLE `study_schedules` AUTO_INCREMENT = 3;
ALTER TABLE `roadmap_templates` AUTO_INCREMENT = 2;
ALTER TABLE `roadmap_template_phases` AUTO_INCREMENT = 2;

COMMIT;
