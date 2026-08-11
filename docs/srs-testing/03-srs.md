# Software Requirements Specification - StudyMate AI

## 1. Giới thiệu

Tài liệu này mô tả yêu cầu phần mềm của website StudyMate AI dưới góc nhìn kiểm thử. Mục tiêu là xác định phạm vi hệ thống, actor, yêu cầu chức năng, yêu cầu phi chức năng, tiêu chí chấp nhận và cơ sở để sinh test scenario/test case.

## 2. Phạm vi hệ thống

StudyMate AI hỗ trợ:

- Đăng ký, đăng nhập, đăng xuất và lấy thông tin tài khoản.
- Admin quản lý sinh viên, môn học, phân công sinh viên vào môn học.
- Admin quản lý bài tập và chấm điểm bài nộp.
- Student xem môn học, xem bài tập, nộp bài và xem điểm/feedback.
- Student quản lý mục tiêu học tập, lịch học và lộ trình học tập.
- Student tạo lộ trình học cá nhân hóa qua AI Provider.

Ngoài phạm vi hiện tại:

- Bài học, quiz, nhiệm vụ, ghi chú, AI Assistant tổng quát và tiến độ đang xuất hiện ở menu/placeholder nhưng chưa đủ evidence API hoàn chỉnh trong source được phân tích.

## 3. Actor và quyền hạn

| Actor | Quyền |
|---|---|
| Guest | Đăng ký tài khoản sinh viên, đăng nhập |
| Admin | Truy cập dashboard admin, quản lý sinh viên, môn học, bài tập, bài nộp |
| Student | Truy cập dashboard sinh viên, học theo môn, nộp bài, xem điểm, quản lý mục tiêu/lịch/lộ trình |
| AI Provider | Trả về JSON lộ trình học khi được hệ thống gọi |

## 4. Functional Requirements

### Authentication

| ID | Requirement | Actor | Acceptance Criteria |
|---|---|---|---|
| FR-AUTH-01 | Hệ thống cho phép Guest đăng ký tài khoản sinh viên. | Guest | Dữ liệu hợp lệ tạo tài khoản `student`; email trùng trả lỗi 422. |
| FR-AUTH-02 | Hệ thống cho phép người dùng đăng nhập bằng email và password. | Guest/Admin/Student | Đăng nhập đúng trả token, role và redirect URL đúng vai trò. |
| FR-AUTH-03 | Hệ thống từ chối đăng nhập với tài khoản locked hoặc inactive. | Admin/Student | Trả lỗi 403 và thông báo trạng thái tài khoản. |
| FR-AUTH-04 | Hệ thống cho phép người dùng đã xác thực lấy thông tin `/api/me`. | Admin/Student | Token hợp lệ trả thông tin public user. |
| FR-AUTH-05 | Hệ thống cho phép người dùng đăng xuất. | Admin/Student | API trả thành công; frontend xóa session/token. |

### Admin - Student Management

| ID | Requirement | Actor | Acceptance Criteria |
|---|---|---|---|
| FR-STU-01 | Admin xem danh sách sinh viên. | Admin | Danh sách hiển thị dữ liệu và hỗ trợ lọc/tìm kiếm nếu UI cung cấp. |
| FR-STU-02 | Admin tạo, xem, cập nhật và xóa sinh viên. | Admin | CRUD thành công với dữ liệu hợp lệ; dữ liệu sai trả lỗi validation. |
| FR-STU-03 | Admin import danh sách sinh viên từ file template. | Admin | File hợp lệ tạo/cập nhật dữ liệu; file sai định dạng trả lỗi rõ ràng. |
| FR-STU-04 | Admin khóa, mở khóa, vô hiệu hóa hoặc kích hoạt sinh viên. | Admin | Trạng thái tài khoản thay đổi đúng và ảnh hưởng tới đăng nhập. |
| FR-STU-05 | Admin reset password sinh viên. | Admin | Password mới được cập nhật và có thể dùng để đăng nhập. |

### Subject Management

| ID | Requirement | Actor | Acceptance Criteria |
|---|---|---|---|
| FR-SUB-01 | Người dùng đã đăng nhập xem danh sách và chi tiết môn học. | Admin/Student | API `/api/subjects` và `/api/subjects/{id}` trả dữ liệu hợp lệ. |
| FR-SUB-02 | Admin tạo, cập nhật và xóa môn học. | Admin | Chỉ admin được thao tác ghi; student bị từ chối. |
| FR-SUB-03 | Admin gán sinh viên vào môn học. | Admin | Sinh viên được thêm vào danh sách môn; không gán trùng. |
| FR-SUB-04 | Admin gỡ sinh viên khỏi môn học. | Admin | Quan hệ môn học-sinh viên bị xóa đúng. |
| FR-SUB-05 | Student xem danh sách môn học của mình. | Student | Chỉ hiển thị môn được gán cho student hiện tại. |

### Assignment, Submission, Grade

| ID | Requirement | Actor | Acceptance Criteria |
|---|---|---|---|
| FR-ASG-01 | Admin tạo, xem, cập nhật và xóa bài tập. | Admin | CRUD bài tập hoạt động đúng, validate dữ liệu bắt buộc. |
| FR-ASG-02 | Student xem danh sách và chi tiết bài tập được giao. | Student | Chỉ thấy bài tập thuộc môn học của mình. |
| FR-SUBM-01 | Student nộp bài cho một assignment. | Student | Bài nộp được lưu, trạng thái hiển thị đúng. |
| FR-SUBM-02 | Student cập nhật bài nộp khi còn được phép. | Student | Nội dung/file cập nhật đúng hoặc bị từ chối khi không hợp lệ. |
| FR-GRD-01 | Admin xem bài nộp theo assignment. | Admin | Danh sách bài nộp hiển thị đầy đủ thông tin cần chấm. |
| FR-GRD-02 | Admin chấm điểm và phản hồi bài nộp. | Admin | Điểm/feedback lưu thành công và student xem được. |
| FR-GRD-03 | Student xem điểm và feedback. | Student | Chỉ xem điểm của chính mình. |

### Learning Goal, Study Schedule, Roadmap

| ID | Requirement | Actor | Acceptance Criteria |
|---|---|---|---|
| FR-GOAL-01 | Student tạo, xem, cập nhật và xóa mục tiêu học tập. | Student | CRUD mục tiêu hoạt động cho chính student hiện tại. |
| FR-SCH-01 | Student tạo, xem, cập nhật và xóa lịch học. | Student | Lịch học hiển thị theo tài khoản hiện tại. |
| FR-RM-01 | Student tạo lộ trình học thủ công. | Student | Lộ trình và các item được lưu đúng. |
| FR-RM-02 | Student tạo lộ trình học bằng AI. | Student/AI Provider | AI trả JSON hợp lệ thì preview/lưu được; lỗi provider được báo rõ. |
| FR-RM-03 | Student cập nhật trạng thái, kết quả và lịch của roadmap item. | Student | Progress thay đổi đúng sau cập nhật item. |

## 5. Non-functional Requirements

| ID | Requirement | Tiêu chí kiểm thử |
|---|---|---|
| NFR-01 | Bảo mật xác thực | API cần token phải trả 401 khi thiếu/sai token. |
| NFR-02 | Phân quyền | Admin không được truy cập API student theo dữ liệu cá nhân; student không được truy cập API admin. |
| NFR-03 | Toàn vẹn dữ liệu | Không lưu bản ghi thiếu trường bắt buộc, sai định dạng email, score/date không hợp lệ. |
| NFR-04 | Khả dụng | Lỗi AI Provider hoặc thiếu key không làm sập toàn bộ hệ thống. |
| NFR-05 | Dễ dùng | Form phải hiển thị lỗi validation rõ ràng gần trường nhập. |
| NFR-06 | Hiệu năng cơ bản | Danh sách sinh viên, môn học, bài tập tải trong thời gian chấp nhận được với dữ liệu mẫu. |

## 6. Business Rules

| ID | Rule |
|---|---|
| BR-01 | Tài khoản đăng ký từ public register mặc định là student. |
| BR-02 | Email người dùng phải là duy nhất. |
| BR-03 | Tài khoản `locked` hoặc `inactive` không được đăng nhập. |
| BR-04 | Chỉ admin được quản lý sinh viên, môn học và bài tập ở route admin. |
| BR-05 | Student chỉ xem và thao tác dữ liệu thuộc tài khoản của mình. |
| BR-06 | Roadmap AI phải trả JSON hợp lệ có `title`, `overview`, `items`. |
| BR-07 | Assignment có trạng thái hợp lệ: `draft`, `open`, `closed`; nếu trạng thái `open` thì deadline phải lớn hơn thời điểm hiện tại. |
| BR-08 | File đính kèm assignment/submission chỉ hỗ trợ `pdf`, `doc`, `docx`, `zip`, `rar`, `png`, `jpg`, `jpeg` và tối đa 10MB. |
| BR-09 | Điểm bài nộp phải là số trong khoảng từ 0 đến 10; feedback tối đa 5000 ký tự. |
| BR-10 | Môn học có số tín chỉ từ 1 đến 30; mã môn học chỉ chứa chữ, số, gạch ngang hoặc gạch dưới. |
| BR-11 | Lịch học phải có giờ kết thúc lớn hơn giờ bắt đầu; không được tạo lịch `upcoming` ở thời điểm quá khứ. |
| BR-12 | Roadmap item phải có ngày học, giờ bắt đầu, thời lượng tối thiểu 15 phút, priority thuộc `low`, `medium`, `high`. |

## 7. Validation Rules Phục Vụ Kiểm Thử

| Module | Field/Rule | Expected validation |
|---|---|---|
| Register | `full_name` | Bắt buộc, 3-150 ký tự |
| Register | `email` | Bắt buộc, đúng định dạng, không trùng |
| Register | `password` | Bắt buộc, tối thiểu 6 ký tự |
| Register | `confirm_password` | Bắt buộc, phải khớp password |
| Register | `phone` | Nếu nhập phải theo `0...` hoặc `+84...` với độ dài hợp lệ |
| Subject | `subject_name` | Bắt buộc, tối đa 255 ký tự |
| Subject | `subject_code` | Bắt buộc khi tạo, tối đa 50 ký tự, không được sửa khi update |
| Subject | `credits` | Số nguyên từ 1 đến 30 |
| Subject | `status` | Chỉ nhận `studying`, `paused`, `completed` |
| Subject | `image` | Ảnh `jpg/jpeg/png/webp/gif`, tối đa 2MB, MIME hợp lệ |
| Assignment | `subject_id` | Bắt buộc, số nguyên dương, subject phải tồn tại |
| Assignment | `title` | Bắt buộc, tối đa 255 ký tự |
| Assignment | `deadline` | Bắt buộc, đúng định dạng datetime; nếu `open` phải ở tương lai |
| Assignment | `status` | Chỉ nhận `open`, `closed`, `draft` |
| Submission | `content/file` | Phải có nội dung hoặc file nếu chưa có file cũ |
| Submission | `file` | File hợp lệ và tối đa 10MB |
| Grade | `score` | Bắt buộc, là số, từ 0 đến 10 |
| Grade | `feedback` | Không bắt buộc, tối đa 5000 ký tự |
| Study Schedule | `study_date` | Bắt buộc, định dạng `YYYY-MM-DD` |
| Study Schedule | `start_time/end_time` | Bắt buộc, định dạng `HH:mm`, end_time > start_time |
| Study Schedule | `schedule_type` | Chỉ nhận `class`, `self_study`, `review`, `assignment`, `exam` |
| Study Schedule | `status` | Chỉ nhận `upcoming`, `completed`, `cancelled` |
| Roadmap | `current_level` | Chỉ nhận `beginner`, `intermediate`, `advanced` |
| Roadmap | `available_weekdays` | Phải chọn ít nhất một ngày từ 1 đến 7 |
| Roadmap | `session_duration_minutes` | Tối thiểu 15 phút |
| Roadmap | `start_date/end_date` | Đúng định dạng ngày; end_date >= start_date |

## 8. UI/API Mapping

| UI route | API liên quan | Actor |
|---|---|---|
| `/login` | `POST /api/login` | Guest |
| `/register` | `POST /api/register` | Guest |
| `/admin/students` | `/api/admin/students` | Admin |
| `/admin/subjects` | `/api/subjects`, `/api/admin/subjects/*/students` | Admin |
| `/admin/assignments` | `/api/admin/assignments` | Admin |
| `/student/my-subjects` | `/api/student/my-subjects` | Student |
| `/student/assignments` | `/api/student/assignments` | Student |
| `/student/grades` | `/api/student/grades` | Student |
| `/student/learning-goals` | `/api/student/learning-goals` | Student |
| `/student/schedules` | `/api/study-schedules` | Student |
| `/student/roadmaps` | `/api/student/roadmaps` | Student |
