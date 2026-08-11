# Test Cases - StudyMate AI

## Authentication

| Test Case ID | Requirement | Use Case | Title | Priority |
|---|---|---|---|---|
| TC-AUTH-001 | FR-AUTH-01 | UC-01 | Đăng ký thành công | High |
| TC-AUTH-002 | FR-AUTH-01 | UC-01 | Đăng ký thất bại khi email trùng | High |
| TC-AUTH-003 | FR-AUTH-02 | UC-02 | Admin đăng nhập thành công | High |
| TC-AUTH-004 | FR-AUTH-02 | UC-02 | Student đăng nhập thành công | High |
| TC-AUTH-005 | FR-AUTH-02 | UC-02 | Đăng nhập thất bại khi sai password | High |
| TC-AUTH-006 | FR-AUTH-03 | UC-02 | Tài khoản locked không đăng nhập được | High |
| TC-AUTH-007 | FR-AUTH-04 | UC-19 | Lấy thông tin tài khoản hiện tại thành công | High |
| TC-AUTH-008 | FR-AUTH-05 | UC-03 | Đăng xuất thành công | Medium |
| TC-AUTH-009 | NFR-01 | UC-19 | API cần token trả 401 khi thiếu Authorization header | High |
| TC-AUTH-010 | NFR-01 | UC-19 | API cần token trả 403 khi token sai hoặc hết hạn | High |

### TC-AUTH-001 - Đăng ký thành công

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Email chưa tồn tại trong hệ thống |
| Steps | 1. Mở `/register`; 2. Nhập họ tên hợp lệ; 3. Nhập email hợp lệ; 4. Nhập password từ 6 ký tự; 5. Nhập confirm password khớp; 6. Nhấn đăng ký |
| Expected Result | API `POST /api/register` trả 201; tài khoản role student được tạo; thông báo đăng ký thành công |

### TC-AUTH-003 - Admin đăng nhập thành công

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Có tài khoản admin active |
| Steps | 1. Mở `/login`; 2. Nhập email admin; 3. Nhập password đúng; 4. Nhấn đăng nhập |
| Expected Result | API trả token, role `admin`, redirect URL `/admin/dashboard`; UI chuyển đến dashboard admin |

### TC-AUTH-006 - Tài khoản locked không đăng nhập được

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Có tài khoản status `locked` |
| Steps | 1. Mở `/login`; 2. Nhập email/password đúng; 3. Nhấn đăng nhập |
| Expected Result | API trả 403; UI hiển thị thông báo tài khoản đã bị khóa |

### TC-AUTH-007 - Lấy thông tin tài khoản hiện tại thành công

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Admin hoặc Student đã đăng nhập và có token hợp lệ |
| Steps | 1. Gửi `GET /api/me` với header `Authorization: Bearer <token>` |
| Expected Result | API trả 200; `success=true`; `data` có `id`, `full_name`, `email`, `role`, `status` và không trả password |

### TC-AUTH-009 - API cần token trả 401 khi thiếu Authorization header

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Không gửi token |
| Steps | 1. Gửi `GET /api/me` không có header Authorization |
| Expected Result | API trả 401; thông báo người dùng cần đăng nhập |

### TC-AUTH-010 - API cần token trả 403 khi token sai hoặc hết hạn

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Có token giả, token sai chữ ký hoặc token hết hạn |
| Steps | 1. Gửi `GET /api/me` với header `Authorization: Bearer <invalid-token>` |
| Expected Result | API trả 403; thông báo token không hợp lệ hoặc đã hết hạn |

## Admin - Student Management

| Test Case ID | Requirement | Use Case | Title | Priority |
|---|---|---|---|---|
| TC-STU-001 | FR-STU-01 | UC-04 | Admin xem danh sách sinh viên | High |
| TC-STU-002 | FR-STU-02 | UC-04 | Admin tạo sinh viên thành công | High |
| TC-STU-003 | FR-STU-02 | UC-04 | Admin tạo sinh viên thất bại khi thiếu email | High |
| TC-STU-004 | FR-STU-03 | UC-05 | Admin import sinh viên từ file hợp lệ | High |
| TC-STU-005 | FR-STU-04 | UC-06 | Admin khóa tài khoản sinh viên | High |
| TC-STU-006 | FR-STU-05 | UC-06 | Admin reset password sinh viên thành công | High |
| TC-STU-007 | FR-STU-05 | UC-06 | Admin reset password dưới 6 ký tự bị từ chối | Medium |

### TC-STU-002 - Admin tạo sinh viên thành công

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Admin đã đăng nhập |
| Steps | 1. Mở `/admin/students/create`; 2. Nhập thông tin sinh viên hợp lệ; 3. Nhấn lưu |
| Expected Result | API `POST /api/admin/students` trả thành công; sinh viên xuất hiện trong danh sách |

### TC-STU-004 - Admin import sinh viên từ file hợp lệ

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Admin đã đăng nhập; có file đúng template |
| Steps | 1. Mở `/admin/students/import`; 2. Chọn file template hợp lệ; 3. Nhấn import |
| Expected Result | Hệ thống xử lý file; hiển thị kết quả import; sinh viên mới được tạo/cập nhật đúng |

### TC-STU-006 - Admin reset password sinh viên thành công

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Admin đã đăng nhập; student tồn tại |
| Steps | 1. Gửi `PUT /api/admin/students/{id}/reset-password` với `new_password` hợp lệ từ 6 ký tự; 2. Đăng nhập lại bằng password mới |
| Expected Result | API reset trả thành công; student đăng nhập được bằng password mới |

## Subject Management

| Test Case ID | Requirement | Use Case | Title | Priority |
|---|---|---|---|---|
| TC-SUB-001 | FR-SUB-02 | UC-07 | Admin tạo môn học thành công | High |
| TC-SUB-002 | FR-SUB-03 | UC-08 | Admin gán sinh viên vào môn học | High |
| TC-SUB-003 | FR-SUB-05 | UC-09 | Student xem môn học của mình | High |
| TC-SUB-004 | NFR-02 | UC-07 | Student không được tạo môn học | High |
| TC-SUB-005 | FR-SUB-04 | UC-08 | Admin gỡ sinh viên khỏi môn học thành công | High |
| TC-SUB-006 | FR-SUB-04 | UC-08 | Admin gỡ sinh viên không thuộc môn học bị trả 404 | Medium |

### TC-SUB-002 - Admin gán sinh viên vào môn học

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Admin đã đăng nhập; subject và student tồn tại |
| Steps | 1. Mở `/admin/subjects/{subjectId}/students`; 2. Chọn sinh viên khả dụng; 3. Nhấn gán |
| Expected Result | API `POST /api/admin/subjects/{subjectId}/students` thành công; sinh viên xuất hiện trong danh sách đã gán |

### TC-SUB-005 - Admin gỡ sinh viên khỏi môn học thành công

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Admin đã đăng nhập; student đang được gán active vào subject |
| Steps | 1. Mở `/admin/subjects/{subjectId}/students`; 2. Chọn student đang được gán; 3. Nhấn gỡ khỏi môn học |
| Expected Result | API `DELETE /api/admin/subjects/{subjectId}/students/{studentId}` trả thành công; student không còn trong danh sách đã gán |

## Assignment, Submission, Grade

| Test Case ID | Requirement | Use Case | Title | Priority |
|---|---|---|---|---|
| TC-ASG-001 | FR-ASG-01 | UC-10 | Admin tạo bài tập thành công | High |
| TC-ASG-002 | FR-ASG-01 | UC-10 | Admin tạo bài tập open với deadline quá khứ bị từ chối | High |
| TC-ASG-003 | FR-ASG-01 | UC-10 | Admin upload file assignment quá 10MB bị từ chối | Medium |
| TC-ASG-004 | FR-ASG-02 | UC-11 | Student xem bài tập được giao | High |
| TC-SUBM-001 | FR-SUBM-01 | UC-12 | Student nộp bài thành công bằng nội dung text | High |
| TC-SUBM-002 | FR-SUBM-01 | UC-12 | Student nộp bài thất bại khi không có nội dung và file | High |
| TC-SUBM-003 | FR-SUBM-02 | UC-12 | Student cập nhật bài nộp | Medium |
| TC-GRD-001 | FR-GRD-02 | UC-13 | Admin chấm điểm bài nộp | High |
| TC-GRD-002 | FR-GRD-02 | UC-13 | Admin nhập điểm ngoài khoảng 0-10 bị từ chối | High |
| TC-GRD-003 | FR-GRD-03 | UC-14 | Student xem điểm và feedback | High |
| TC-GRD-004 | FR-GRD-01 | UC-13 | Admin xem danh sách bài nộp theo assignment | High |

### TC-SUBM-001 - Student nộp bài thành công

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Student đã đăng nhập; assignment thuộc môn của student |
| Steps | 1. Mở `/student/assignments`; 2. Chọn assignment; 3. Mở form nộp bài; 4. Nhập nội dung hoặc chọn file; 5. Nhấn nộp |
| Expected Result | API `POST /api/student/assignments/{assignmentId}/submit` trả thành công; submission được lưu và hiển thị chi tiết |

### TC-ASG-002 - Admin tạo bài tập open với deadline quá khứ bị từ chối

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Admin đã đăng nhập; subject hợp lệ tồn tại |
| Steps | 1. Mở `/admin/assignments/create`; 2. Chọn subject hợp lệ; 3. Nhập title hợp lệ; 4. Chọn status `open`; 5. Nhập deadline nhỏ hơn thời điểm hiện tại; 6. Nhấn lưu |
| Expected Result | API trả 422; field `deadline` báo lỗi deadline phải lớn hơn thời gian hiện tại khi trạng thái là `open`; assignment không được tạo |

### TC-SUBM-002 - Student nộp bài thất bại khi không có nội dung và file

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Student đã đăng nhập; assignment thuộc môn của student; chưa có file bài nộp cũ |
| Steps | 1. Mở form nộp bài; 2. Để trống nội dung; 3. Không chọn file; 4. Nhấn nộp |
| Expected Result | API trả 422; hiển thị lỗi yêu cầu nhập nội dung bài làm hoặc upload file; không tạo submission |

### TC-GRD-001 - Admin chấm điểm bài nộp

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Admin đã đăng nhập; submission tồn tại |
| Steps | 1. Mở `/admin/assignments/{assignmentId}/submissions`; 2. Chọn submission; 3. Nhập điểm và feedback; 4. Lưu |
| Expected Result | API `PUT /api/admin/submissions/{id}/grade` thành công; điểm/feedback hiển thị cho student |

### TC-GRD-004 - Admin xem danh sách bài nộp theo assignment

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Admin đã đăng nhập; assignment tồn tại và có hoặc chưa có submission |
| Steps | 1. Mở `/admin/assignments/{assignmentId}/submissions`; 2. Gửi request với hoặc không có filter `status` |
| Expected Result | API `GET /api/admin/assignments/{assignmentId}/submissions` trả 200; danh sách submissions đúng assignment; nếu assignment không tồn tại thì trả 404 |


### TC-GRD-002 - Admin nhập điểm ngoài khoảng 0-10 bị từ chối

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Admin đã đăng nhập; submission tồn tại |
| Steps | 1. Mở form chấm điểm; 2. Nhập score `11` hoặc `-1`; 3. Nhấn lưu |
| Expected Result | API trả 422; field `score` báo lỗi điểm phải nằm trong khoảng từ 0 đến 10; submission không bị cập nhật điểm sai |

## Learning Goal, Schedule, Roadmap

| Test Case ID | Requirement | Use Case | Title | Priority |
|---|---|---|---|---|
| TC-GOAL-001 | FR-GOAL-01 | UC-15 | Student tạo mục tiêu học tập | High |
| TC-SCH-001 | FR-SCH-01 | UC-16 | Student tạo lịch học | High |
| TC-RM-001 | FR-RM-01 | UC-17 | Student tạo roadmap thủ công | High |
| TC-RM-002 | FR-RM-02 | UC-18 | Student tạo roadmap bằng AI thành công | High |
| TC-RM-003 | FR-RM-02 | UC-18 | Tạo roadmap AI thất bại khi thiếu API key | High |
| TC-RM-004 | FR-RM-01 | UC-17 | Tạo roadmap thất bại khi end_date nhỏ hơn start_date | Medium |
| TC-RM-005 | FR-RM-03 | UC-17 | Student cập nhật trạng thái roadmap item | Medium |

### TC-RM-002 - Student tạo roadmap bằng AI thành công

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Student đã đăng nhập; AI Provider được cấu hình; còn quota |
| Steps | 1. Mở `/student/roadmaps/generate`; 2. Nhập môn học, mục tiêu, thời gian học; 3. Nhấn tạo bằng AI |
| Expected Result | API `POST /api/student/roadmaps/generate-ai` trả roadmap JSON hợp lệ; UI hiển thị preview roadmap |

### TC-RM-003 - Tạo roadmap AI thất bại khi thiếu API key

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Student đã đăng nhập; `.env` chưa cấu hình AI API key |
| Steps | 1. Mở `/student/roadmaps/generate`; 2. Nhập dữ liệu hợp lệ; 3. Nhấn tạo bằng AI |
| Expected Result | Hệ thống không bị crash; UI hiển thị lỗi cấu hình AI rõ ràng |

### TC-RM-004 - Tạo roadmap thất bại khi end_date nhỏ hơn start_date

| Thuộc tính | Nội dung |
|---|---|
| Pre-condition | Student đã đăng nhập; subject thuộc student |
| Steps | 1. Mở form tạo roadmap; 2. Nhập goal, current_level, study_time_per_day hợp lệ; 3. Chọn start_date sau end_date; 4. Nhấn lưu |
| Expected Result | API trả 422; field `end_date` báo lỗi ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu |
