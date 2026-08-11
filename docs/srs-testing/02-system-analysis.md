# Phân Tích Hệ Thống StudyMate AI

## 1. Tổng quan

StudyMate AI là website hỗ trợ học tập với hai nhóm người dùng chính: quản trị viên và sinh viên. Hệ thống kết hợp backend PHP MVC, frontend React/Vite và database MySQL. Các chức năng hiện có tập trung vào xác thực, quản lý sinh viên, môn học, bài tập, nộp bài, điểm/feedback, mục tiêu học tập, lịch học và lộ trình học tập có hỗ trợ AI.

Nguồn phân tích chính:

- `routes/api.php`
- `routes/web.php`
- `routes/student_subjects.php`
- `routes/assignments.php`
- `routes/assignment_submissions.php`
- `routes/learning_goals.php`
- `routes/learning_roadmaps.php`
- `routes/study_schedules.php`
- `src/App.jsx`
- `controllers/*.php`
- `models/*.php`
- `validations/*.php`
- `services/AIService.php`

## 2. Kiến trúc tổng quan

| Thành phần | Công nghệ/Thư mục | Vai trò |
|---|---|---|
| Backend | PHP MVC | Xử lý API, middleware, controller, model |
| Frontend | React + Vite | Giao diện admin/student, route client |
| Database | MySQL | Lưu người dùng, môn học, bài tập, bài nộp, mục tiêu, lịch học, lộ trình |
| Authentication | JWT | Xác thực API qua token |
| Authorization | Middleware | Phân quyền admin/student |
| AI roadmap | `services/AIService.php` | Gọi OpenAI/Gemini để tạo lộ trình học |

## 3. Actor

| Actor | Mô tả | Quyền chính |
|---|---|---|
| Guest | Người dùng chưa đăng nhập | Đăng ký, đăng nhập |
| Admin | Quản trị viên | Quản lý sinh viên, môn học, bài tập, bài nộp, dashboard |
| Student | Sinh viên | Xem môn học, nộp bài, xem điểm, quản lý mục tiêu/lịch học/lộ trình |
| AI Provider | Hệ thống ngoài | Sinh lộ trình học tập qua API |

## 4. Module chức năng

| Module | Route/API tiêu biểu | Actor |
|---|---|---|
| Authentication | `/api/register`, `/api/login`, `/api/me`, `/api/logout` | Guest, Admin, Student |
| Dashboard | `/api/admin/dashboard`, `/api/student/dashboard` | Admin, Student |
| Student Management | `/api/admin/students` | Admin |
| Subject Management | `/api/subjects`, `/api/admin/subjects/*/students` | Admin, Student |
| Assignment Management | `/api/admin/assignments`, `/api/student/assignments` | Admin, Student |
| Submission/Grade | `/api/student/assignments/*/submit`, `/api/admin/submissions/*/grade` | Admin, Student |
| Learning Goal | `/api/student/learning-goals` | Student |
| Study Schedule | `/api/study-schedules` | Student |
| Learning Roadmap | `/api/student/roadmaps`, `/api/student/roadmaps/generate-ai` | Student, AI Provider |

## 5. Nhận xét phục vụ kiểm thử

- Hệ thống có phân quyền rõ qua middleware: `$auth`, `$admin`, `$student`.
- Các route admin và student cần kiểm thử truy cập trái quyền.
- Nhiều API có cả `PUT` và `POST` cho cập nhật, cần kiểm thử tương thích form upload hoặc fallback method.
- Chức năng AI roadmap phụ thuộc cấu hình `.env` và quota API, cần test cả trường hợp provider chưa cấu hình, hết quota, rate limit.
- Một số menu như bài học, quiz, nhiệm vụ, ghi chú, AI Assistant, tiến độ đang là placeholder ở frontend; khi viết test cần phân biệt chức năng hoàn thiện và chưa hoàn thiện.

## 6. Rủi ro chất lượng chính

| Rủi ro | Tác động | Gợi ý kiểm thử |
|---|---|---|
| Sai phân quyền | Lộ dữ liệu sinh viên hoặc admin | Test 401/403 cho từng API |
| Validation chưa đủ | Dữ liệu bẩn vào database | Test required, format, length, date, score |
| Upload/import lỗi | Không nhập được sinh viên hoặc bài nộp | Test file hợp lệ, sai định dạng, thiếu cột |
| AI provider lỗi | Không tạo được lộ trình học | Test khi thiếu key, quota lỗi, response JSON sai |
| Route frontend/backend lệch nhau | UI gọi sai API hoặc chuyển trang sai | Test end-to-end theo màn hình |
