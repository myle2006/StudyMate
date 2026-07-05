-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th7 03, 2026 lúc 02:33 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `studymate`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'Quản trị viên hệ thống', '2026-07-01 12:00:39', '2026-07-01 12:00:39'),
(2, 'student', 'Sinh viên sử dụng hệ thống học tập cá nhân', '2026-07-01 12:00:39', '2026-07-01 12:00:39');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `subjects`
--

CREATE TABLE `subjects` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `status` enum('active','archived') DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `subjects`
--

INSERT INTO `subjects` (`id`, `user_id`, `name`, `code`, `description`, `color`, `icon`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 'Kiểm thử phần mềm', 'SWT101', 'Môn học về quy trình kiểm thử, test case, bug report và test design.', '#4F46E5', 'bug.svg', 'active', '2026-07-01 12:05:21', '2026-07-01 12:05:21'),
(2, 2, 'Lập trình Web', 'WEB201', 'Học xây dựng website với HTML, CSS, JavaScript, PHP và MySQL.', '#16A34A', 'web.svg', 'active', '2026-07-01 12:05:21', '2026-07-01 12:05:21'),
(3, 2, 'Cơ sở dữ liệu', 'DB101', 'Tìm hiểu mô hình ERD, SQL, quan hệ bảng và truy vấn dữ liệu.', '#F97316', 'database.svg', 'active', '2026-07-01 12:05:21', '2026-07-01 12:05:21'),
(4, 2, 'Phân tích thiết kế hệ thống', 'SAD201', 'Phân tích yêu cầu, thiết kế mô hình hệ thống và luồng nghiệp vụ.', '#9333EA', 'diagram.svg', 'archived', '2026-07-01 12:05:21', '2026-07-01 12:05:21'),
(5, 3, 'Trí tuệ nhân tạo', 'AI101', 'Tìm hiểu các khái niệm cơ bản về AI, machine learning và ứng dụng AI trong học tập.', '#2563EB', 'ai.svg', 'active', '2026-07-01 12:05:21', '2026-07-01 12:05:21'),
(6, 3, 'Thiết kế giao diện người dùng', 'UIUX101', 'Học nguyên tắc thiết kế giao diện, trải nghiệm người dùng và wireframe.', '#DB2777', 'design.svg', 'active', '2026-07-01 12:05:21', '2026-07-01 12:05:21'),
(7, 3, 'Toán rời rạc', 'MATH101', 'Các kiến thức nền tảng về logic, tập hợp, quan hệ và đồ thị.', '#0D9488', 'math.svg', 'active', '2026-07-01 12:05:21', '2026-07-01 12:05:21'),
(8, 4, 'Lập trình Java', 'JAVA101', 'Học lập trình hướng đối tượng với Java, class, object, inheritance và interface.', '#DC2626', 'java.svg', 'active', '2026-07-01 12:05:21', '2026-07-01 12:05:21'),
(9, 4, 'Cấu trúc dữ liệu và giải thuật', 'DSA101', 'Học array, linked list, stack, queue, tree, graph và thuật toán tìm kiếm.', '#7C3AED', 'code.svg', 'active', '2026-07-01 12:05:21', '2026-07-01 12:05:21'),
(10, 4, 'Mạng máy tính', 'NET101', 'Tìm hiểu mô hình OSI, TCP/IP, địa chỉ IP và giao thức mạng.', '#0891B2', 'network.svg', 'archived', '2026-07-01 12:05:21', '2026-07-01 12:05:21'),
(11, 5, 'Tin học văn phòng', 'OFFICE101', 'Thực hành Word, Excel, PowerPoint và các kỹ năng văn phòng cơ bản.', '#65A30D', 'office.svg', 'active', '2026-07-01 12:05:21', '2026-07-01 12:05:21'),
(12, 5, 'Kỹ năng mềm', 'SKILL101', 'Rèn luyện kỹ năng giao tiếp, làm việc nhóm và thuyết trình.', '#EA580C', 'skill.svg', 'active', '2026-07-01 12:05:21', '2026-07-01 12:05:21'),
(13, 6, 'An toàn thông tin', 'SEC101', 'Tìm hiểu bảo mật hệ thống, mã hóa, xác thực và các lỗ hổng phổ biến.', '#1E293B', 'security.svg', 'active', '2026-07-01 12:05:21', '2026-07-01 12:05:21'),
(14, 6, 'DevOps cơ bản', 'DEVOPS101', 'Làm quen với GitHub Actions, CI/CD, hosting và quy trình triển khai.', '#0284C7', 'devops.svg', 'active', '2026-07-01 12:05:21', '2026-07-01 12:05:21'),
(15, 6, 'ReactJS', 'REACT101', 'Xây dựng frontend với component, props, state, hook và React Router.', '#06B6D4', 'react.svg', 'active', '2026-07-01 12:05:21', '2026-07-01 12:05:21'),
(16, 7, 'PHP MVC', 'PHPMVC101', 'Xây dựng backend PHP theo mô hình MVC, router, controller, model và view.', '#6D28D9', 'php.svg', 'active', '2026-07-01 12:05:21', '2026-07-01 12:05:21'),
(17, 7, 'Quản lý dự án phần mềm', 'PM101', 'Tìm hiểu sprint, backlog, planning, phân công công việc và báo cáo tiến độ.', '#CA8A04', 'project.svg', 'archived', '2026-07-01 12:05:21', '2026-07-01 12:05:21'),
(18, 2, 'Kiểm thử phần mềm', 'SWT101', 'Môn học về quy trình kiểm thử, test case, bug report và test design.', '#4F46E5', 'bug.svg', 'active', '2026-07-01 12:05:56', '2026-07-01 12:05:56'),
(19, 2, 'Lập trình Web', 'WEB201', 'Học xây dựng website với HTML, CSS, JavaScript, PHP và MySQL.', '#16A34A', 'web.svg', 'active', '2026-07-01 12:05:56', '2026-07-01 12:05:56'),
(20, 3, 'Trí tuệ nhân tạo', 'AI101', 'Tìm hiểu các khái niệm cơ bản về AI, machine learning và ứng dụng AI trong học tập.', '#2563EB', 'ai.svg', 'active', '2026-07-01 12:05:56', '2026-07-01 12:05:56'),
(21, 8, 'Kiểm Thử Phần mềm', 'KTPM', NULL, '#2563EB', '/StudyMate/public/uploads/subjects/subject_20260701223418_2e708f8c306e01ef.jpg', 'active', '2026-07-01 22:24:56', '2026-07-01 22:34:18');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `student_code` varchar(50) DEFAULT NULL,
  `status` enum('active','inactive','locked') DEFAULT 'active',
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `role_id`, `full_name`, `email`, `password`, `avatar`, `phone`, `student_code`, `status`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 1, 'Nguyễn Văn Admin', 'admin@example.com', '$2y$10$p/ktk/iJxsKiQxls4.8yNemp6dKCgpHLAodgPHcTZlA74ifnBHJLG', 'admin-avatar.png', '0901234567', NULL, 'active', '2026-07-03 09:54:55', '2026-07-01 12:04:18', '2026-07-03 09:54:55'),
(2, 2, 'Trần Thị Mỹ Lệ', 'myle@student.com', '24211TT3192', 'myle-avatar.png', '0912345678', '24211TT3192', 'active', '2026-07-01 12:04:18', '2026-07-01 12:04:18', '2026-07-01 12:04:18'),
(3, 2, 'Nguyễn Minh Anh', 'minhanh@student.com', '24211TT1001', 'minhanh-avatar.png', '0923456789', '24211TT1001', 'active', '2026-07-01 12:04:18', '2026-07-01 12:04:18', '2026-07-01 12:04:18'),
(4, 2, 'Lê Hoàng Phúc', 'hoangphuc@student.com', '24211TT1002', 'hoangphuc-avatar.png', '0934567890', '24211TT1002', 'active', NULL, '2026-07-01 12:04:18', '2026-07-01 12:04:18'),
(5, 2, 'Phạm Gia Hân', 'giahan@student.com', '$2y$10$146myF9IKzu4iWFpoUtE5eeOUFP1O4d/5TeBTM.HF/DuNZLdLYHS6', 'giahan-avatar.png', '0945678901', '24211TT1003', 'inactive', NULL, '2026-07-01 12:04:18', '2026-07-03 10:51:08'),
(6, 2, 'Võ Quốc Bảo', 'quocbao@student.com', '24211TT1004', 'quocbao-avatar.png', '0956789012', '24211TT1004', 'active', '2026-07-01 12:04:18', '2026-07-01 12:04:18', '2026-07-01 12:04:18'),
(7, 2, 'Đặng Thanh Trúc', 'thanhtruc@student.com', '24211TT1005', 'thanhtruc-avatar.png', '0967890123', '24211TT1005', 'locked', NULL, '2026-07-01 12:04:18', '2026-07-01 12:04:18'),
(8, 2, 'Trần Thị Mỹ Châu', 'chau123@gmail.com', '$2y$10$FDMMwXistvxIlUvIjlPYC.kW6lHyHHUpbqAMvpo8zFUvXEzntzpM.', NULL, '0352261328', '24211TT3198', 'active', '2026-07-03 09:54:12', '2026-07-01 22:23:12', '2026-07-03 09:54:12'),
(9, 2, 'Nguyen Van An', 'an.nguyen@example.com', '$2y$10$TGExME3ExJSSjEvV7zE5au5tDm12H8Lc8sKZc3QZKsSQ9ZL/jXgVm', NULL, '0901234561', '24211TT3001', 'active', NULL, '2026-07-03 10:35:18', '2026-07-03 10:35:18'),
(10, 2, 'Tran Thi Bich Ngoc', 'ngoc.tran@example.com', '$2y$10$AA6Yyga66mpksY/aXwbCg.Cd2ct31OH81r6vGxaGKnYkvk8RWappK', NULL, '0901234562', '24211TT3002', 'active', NULL, '2026-07-03 10:35:18', '2026-07-03 10:35:18'),
(11, 2, 'Le Hoang Minh', 'minh.le@example.com', '$2y$10$VfHAeP2bjFIwyXu9XoVZluNAOY.PXuWeeAX98BjI77ZBPy6dySsU2', NULL, '0901234563', '24211TT3003', 'active', NULL, '2026-07-03 10:35:18', '2026-07-03 10:35:18'),
(12, 2, 'Pham Gia Huy', 'huy.pham@example.com', '$2y$10$d/EUxtlsCMVSUyaBrl3fVuezFJHLi5TNhklo9ydVtwZ4ydk.9evRK', NULL, '0901234564', '24211TT3004', 'active', NULL, '2026-07-03 10:35:18', '2026-07-03 10:35:18'),
(13, 2, 'Vo Thanh Dat', 'dat.vo@example.com', '$2y$10$DZIN2s.tnitCH3164SsOGuYOI2lgEWQkcpVcZaJOeLux7pLwKdhpy', NULL, '0901234565', '24211TT3005', 'active', NULL, '2026-07-03 10:35:18', '2026-07-03 10:35:18'),
(14, 2, 'Dang Ngoc Han', 'han.dang@example.com', '$2y$10$m2abu.S4evdc9hMnvP4r0eYqVCStTDwGhjZ.hKqM4DUPQSz9o5MK.', NULL, '0901234566', '24211TT3006', 'active', NULL, '2026-07-03 10:35:18', '2026-07-03 10:35:18'),
(15, 2, 'Hoang Minh Chau', 'chau.hoang@example.com', '$2y$10$./QBwQW01YP5xo.DcTad1Ov5bdcR0sgyaRHGwlADqyqm2YCZBwkHC', NULL, '0901234567', '24211TT3007', 'active', NULL, '2026-07-03 10:35:18', '2026-07-03 10:35:18'),
(16, 2, 'Bui Quoc Bao', 'bao.bui@example.com', '$2y$10$227n6snVhPP/lcQq21ECL.q.LgZtvszabYRGeTVyvyBr2qibVJChq', NULL, '0901234568', '24211TT3008', 'active', NULL, '2026-07-03 10:35:18', '2026-07-03 10:35:18'),
(17, 2, 'Do Phuong Linh', 'linh.do@example.com', '$2y$10$C/QlHEtMG9TthKhzTgb5RujYF0oBvHaH/8RuGPAbg6grLkMrBeQVu', NULL, '0901234569', '24211TT3009', 'active', NULL, '2026-07-03 10:35:18', '2026-07-03 10:35:18'),
(18, 2, 'Huynh Anh Thu', 'thu.huynh@example.com', '$2y$10$T8f2nJxcU8Ku/YTJPpFoMO2vwOkF/97tCTs4A2QFH1KvQsSEXK/li', NULL, '0901234570', '24211TT3010', 'active', NULL, '2026-07-03 10:35:18', '2026-07-03 10:35:18'),
(19, 2, 'Ngo Tuan Kiet', 'kiet.ngo@example.com', '$2y$10$Isnju6XgURCrGNfUTQRpIejN23uOXAGmW44X41SZ4WaheJLkBGEUG', NULL, '0901234571', '24211TT3011', 'active', NULL, '2026-07-03 10:35:19', '2026-07-03 10:35:19'),
(20, 2, 'Duong Minh Quan', 'quan.duong@example.com', '$2y$10$eoHdPQi/MD33A4ayWLkNQuq2DvYW06Z57c3PlwA1wDb6iiTISPx0O', NULL, '0901234572', '24211TT3012', 'active', NULL, '2026-07-03 10:35:19', '2026-07-03 10:35:19'),
(21, 2, 'Ly Nhat Nam', 'nam.ly@example.com', '$2y$10$HCngEwXio6NpGFZMYP4/dOzWg.gyRNKq9y2IB9Q/NgznHH/.t6sxi', NULL, '0901234573', '24211TT3013', 'active', NULL, '2026-07-03 10:35:19', '2026-07-03 10:35:19'),
(22, 2, 'Mai Bao Tram', 'tram.mai@example.com', '$2y$10$4lC1xJv/6sXa5wPgj34FaeSowPG/JmjtegnINXMMqYVJIQuCXcDPy', NULL, '0901234574', '24211TT3014', 'active', NULL, '2026-07-03 10:35:19', '2026-07-03 10:35:19'),
(23, 2, 'Truong Hai Yen', 'yen.truong@example.com', '$2y$10$GszKkYZYP4MUsG8Jj07RtuYBsGxMs9bHZZ/hSaZhRmZ19SuyGDB92', NULL, '0901234575', '24211TT3015', 'active', NULL, '2026-07-03 10:35:19', '2026-07-03 10:35:19'),
(24, 2, 'Cao Duc Phat', 'phat.cao@example.com', '$2y$10$Tra9kHTJCrnjOC0rlvGL9etRFfB1BilmCctHtlT9CefhNNNRiyXtq', NULL, '0901234576', '24211TT3016', 'active', NULL, '2026-07-03 10:35:19', '2026-07-03 10:35:19'),
(25, 2, 'Lam Khanh Vy', 'vy.lam@example.com', '$2y$10$8HdJAiHLZ0zLbbyJV5n.w.JE.3I7XYiAgosGKDpX4ouFV3Wdcd5sW', NULL, '0901234577', '24211TT3017', 'active', NULL, '2026-07-03 10:35:19', '2026-07-03 10:35:19'),
(26, 2, 'Phan Ngoc Mai', 'mai.phan@example.com', '$2y$10$0hzvlL31s9KYM/2iy0blxOPbjnPd9GG5A.p3K/TO.knk9fPfyA.Aa', NULL, '0901234578', '24211TT3018', 'active', NULL, '2026-07-03 10:35:19', '2026-07-03 10:35:19'),
(27, 2, 'Ta Hoang Long', 'long.ta@example.com', '$2y$10$V5P9Kb.iE9DaqHRMNV1nf.fZ3onsO8vSPMXzYtmRRQ5jXJwJVnadO', NULL, '0901234579', '24211TT3019', 'active', NULL, '2026-07-03 10:35:19', '2026-07-03 10:35:19'),
(28, 2, 'Nguyen Thanh Truc', 'truc.nguyen@example.com', '$2y$10$sSKzqgL9Vum7e5G1dHOAuen11/VUBpmjZ6wuoWTDF5DKLXcCVb9LC', NULL, '0901234580', '24211TT3020', 'active', NULL, '2026-07-03 10:35:19', '2026-07-03 10:35:19'),
(29, 2, 'Tran Quang Vinh', 'vinh.tran@example.com', '$2y$10$DJGZatxlBpCWnxMtBpss2eTa4LFy09M2KIq9rgUGfkCfZKpvfNiHS', NULL, '0901234581', '24211TT3021', 'active', NULL, '2026-07-03 10:35:19', '2026-07-03 10:50:46'),
(30, 2, 'Le Kim Ngan', 'ngan.le@example.com', '$2y$10$KvOwzg2haGURVUsIwnm6RuKvgJvUzedhHT4v2zyHe.a85J0U6k2Ay', NULL, '0901234582', '24211TT3022', 'active', NULL, '2026-07-03 10:35:19', '2026-07-03 10:35:19'),
(31, 2, 'Pham Bao Ngoc', 'baongoc.pham@example.com', '$2y$10$DY7wcoRA16GJAiEGidMqT.sKLggJMb13v/4dPkC6uHoalXeaS0IzO', NULL, '0901234583', '24211TT3023', 'active', NULL, '2026-07-03 10:35:19', '2026-07-03 10:35:19'),
(32, 2, 'Vo Anh Khoa', 'khoa.vo@example.com', '$2y$10$SMsaEH96W8AMABZX5jc8z.x4Oj8x3G5hjzaIWnUgBMIYsXUzWf8gy', NULL, '0901234584', '24211TT3024', 'locked', NULL, '2026-07-03 10:35:19', '2026-07-03 10:35:19'),
(33, 2, 'Dang Minh Thu', 'minhthu.dang@example.com', '$2y$10$XszsUFmne9d/pE68rRAZU.w1cnCtjHzXVmrLqSxIAUbD5MvFZGRZC', NULL, '0901234585', '24211TT3025', 'active', NULL, '2026-07-03 10:35:20', '2026-07-03 10:35:20'),
(34, 2, 'Hoang Tuan Anh', 'tuananh.hoang@example.com', '$2y$10$21NYFHe.QxI/tlV7KGUGsOS9U1UY6FOipnbG1g1aDo.ltBath9pqC', NULL, '0901234586', '24211TT3026', 'active', NULL, '2026-07-03 10:35:20', '2026-07-03 10:35:20'),
(35, 2, 'Bui Thao Vy', 'thaovy.bui@example.com', '$2y$10$zalrVjAzYBGzaDVdLU3Dr.UUA7t7Sn7tMkl3uyXRoJIQPNxrIJdze', NULL, '0901234587', '24211TT3027', 'active', NULL, '2026-07-03 10:35:20', '2026-07-03 10:35:20'),
(36, 2, 'Do Gia Bao', 'giabao.do@example.com', '$2y$10$ZOXo5rdd14.BP3mHB0JM/.XK6N85aBFqFmlAtJDcDaWcHuh0u3twC', NULL, '0901234588', '24211TT3028', 'inactive', NULL, '2026-07-03 10:35:20', '2026-07-03 10:35:20'),
(37, 2, 'Huynh My Duyen', 'duyen.huynh@example.com', '$2y$10$GrstOaJ05HwiLHTHt2UQeenulUWfhlvlL6Bw723/DBh12bBQWO2sy', NULL, '0901234589', '24211TT3029', 'active', NULL, '2026-07-03 10:35:20', '2026-07-03 10:35:20'),
(38, 2, 'Ngo Bao Khanh', 'khanh.ngo@example.com', '$2y$10$60kco7CORb8g3SscpK2OluTNt5Q5pjyOzeso/cD5ej2KwLRaGqore', NULL, '0901234590', '24211TT3030', 'active', NULL, '2026-07-03 10:35:20', '2026-07-03 10:35:20');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Chỉ mục cho bảng `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_subjects_user` (`user_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_users_role` (`role_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `subjects`
--
ALTER TABLE `subjects`
  ADD CONSTRAINT `fk_subjects_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
