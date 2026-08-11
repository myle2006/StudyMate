# Use Cases - StudyMate AI

## Danh sách use case tổng quan

| ID | Use Case | Actor chính | Mục tiêu |
|---|---|---|---|
| UC-01 | Đăng ký tài khoản | Guest | Tạo tài khoản student mới |
| UC-02 | Đăng nhập | Guest/Admin/Student | Xác thực và vào dashboard đúng vai trò |
| UC-03 | Đăng xuất | Admin/Student | Kết thúc phiên đăng nhập |
| UC-04 | Quản lý sinh viên | Admin | Tạo, xem, sửa, xóa sinh viên |
| UC-05 | Import sinh viên | Admin | Nhập danh sách sinh viên từ file |
| UC-06 | Quản lý trạng thái sinh viên | Admin | Khóa, mở khóa, enable, disable, reset password |
| UC-07 | Quản lý môn học | Admin | Tạo, xem, sửa, xóa môn học |
| UC-08 | Gán sinh viên vào môn học | Admin | Quản lý quan hệ sinh viên-môn học |
| UC-09 | Xem môn học của tôi | Student | Xem danh sách và chi tiết môn đã được gán |
| UC-10 | Quản lý bài tập | Admin | Tạo, xem, sửa, xóa bài tập |
| UC-11 | Xem bài tập | Student | Xem bài tập được giao |
| UC-12 | Nộp/cập nhật bài nộp | Student | Gửi bài làm cho assignment |
| UC-13 | Chấm điểm bài nộp | Admin | Nhập điểm và feedback |
| UC-14 | Xem điểm và feedback | Student | Xem kết quả bài nộp |
| UC-15 | Quản lý mục tiêu học tập | Student | CRUD learning goals |
| UC-16 | Quản lý lịch học | Student | CRUD study schedules |
| UC-17 | Quản lý lộ trình học | Student | Tạo, xem, sửa, xóa roadmap |
| UC-18 | Sinh lộ trình học bằng AI | Student, AI Provider | Tạo roadmap cá nhân hóa từ thông tin đầu vào |
| UC-19 | Xem thông tin tài khoản | Admin/Student | Lấy thông tin người dùng hiện tại từ token |

## UC-01 - Đăng ký tài khoản

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | Guest |
| Trigger | Người dùng mở trang đăng ký |
| Pre-condition | Email chưa tồn tại |
| Main flow | Nhập họ tên, email, password, confirm password, phone/student code nếu có; gửi form; hệ thống validate; tạo user role student |
| Alternative flow | Email trùng, password dưới 6 ký tự, confirm password không khớp, phone sai định dạng |
| Post-condition | Tài khoản student active được tạo |
| Requirement | FR-AUTH-01 |

## UC-02 - Đăng nhập

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | Guest/Admin/Student |
| Trigger | Người dùng gửi email/password |
| Pre-condition | Tài khoản tồn tại và active |
| Main flow | Nhập thông tin; hệ thống xác thực; tạo JWT; trả role và redirect URL |
| Alternative flow | Sai thông tin trả 401; locked/inactive trả 403 |
| Post-condition | Người dùng vào dashboard đúng vai trò |
| Requirement | FR-AUTH-02, FR-AUTH-03 |

## UC-03 - Đăng xuất

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | Admin/Student |
| Trigger | Người dùng nhấn đăng xuất |
| Pre-condition | Người dùng đã đăng nhập |
| Main flow | Frontend gọi `POST /api/logout`; hệ thống trả thành công; frontend xóa token/session và chuyển về màn hình đăng nhập |
| Alternative flow | Token thiếu hoặc hết hạn thì middleware từ chối request |
| Post-condition | Người dùng không còn phiên đăng nhập ở frontend |
| Requirement | FR-AUTH-05 |

## UC-19 - Xem thông tin tài khoản

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | Admin/Student |
| Trigger | Frontend cần kiểm tra phiên đăng nhập hoặc hiển thị hồ sơ người dùng |
| Pre-condition | Token hợp lệ và tài khoản active |
| Main flow | Frontend gọi `GET /api/me`; middleware xác thực token; hệ thống trả thông tin public user |
| Alternative flow | Thiếu token trả 401; token sai hoặc tài khoản không active trả 403 |
| Post-condition | UI có thông tin user hiện tại để phân quyền/hiển thị menu |
| Requirement | FR-AUTH-04 |

## UC-04 - Quản lý sinh viên

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | Admin |
| Trigger | Admin mở `/admin/students` |
| Pre-condition | Admin đã đăng nhập |
| Main flow | Xem danh sách; tạo/sửa/xem/xóa sinh viên; hệ thống validate và lưu dữ liệu |
| Alternative flow | Dữ liệu thiếu/sai định dạng; truy cập không phải admin bị từ chối |
| Post-condition | Dữ liệu sinh viên được cập nhật |
| Requirement | FR-STU-01, FR-STU-02 |

## UC-08 - Gán sinh viên vào môn học

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | Admin |
| Trigger | Admin mở danh sách sinh viên của một môn học |
| Pre-condition | Môn học và sinh viên tồn tại |
| Main flow | Xem sinh viên khả dụng; chọn sinh viên; gán vào môn học |
| Alternative flow | Gán trùng, môn học không tồn tại, sinh viên không tồn tại |
| Post-condition | Student nhìn thấy môn trong "Môn học của tôi" |
| Requirement | FR-SUB-03, FR-SUB-05 |

## UC-12 - Nộp/cập nhật bài nộp

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | Student |
| Trigger | Student mở chi tiết assignment và chọn nộp bài |
| Pre-condition | Student đã đăng nhập và assignment thuộc môn của student |
| Main flow | Nhập nội dung hoặc file; gửi bài; hệ thống lưu submission; student xem lại bài đã nộp |
| Alternative flow | Thiếu nội dung/file, assignment không hợp lệ, student truy cập assignment không thuộc mình |
| Post-condition | Submission được tạo hoặc cập nhật |
| Requirement | FR-SUBM-01, FR-SUBM-02 |

## UC-13 - Chấm điểm bài nộp

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | Admin |
| Trigger | Admin mở danh sách submissions của assignment |
| Pre-condition | Submission tồn tại |
| Main flow | Xem bài nộp; nhập điểm và feedback; lưu kết quả |
| Alternative flow | Điểm sai định dạng hoặc vượt giới hạn; thiếu quyền admin |
| Post-condition | Student xem được điểm và feedback |
| Requirement | FR-GRD-01, FR-GRD-02, FR-GRD-03 |

## UC-18 - Sinh lộ trình học bằng AI

| Thuộc tính | Nội dung |
|---|---|
| Actor chính | Student |
| Actor phụ | AI Provider |
| Trigger | Student gửi form tạo roadmap AI |
| Pre-condition | Provider AI được cấu hình hoặc hệ thống xử lý được lỗi cấu hình |
| Main flow | Nhập mục tiêu, môn học, thời gian học; hệ thống gọi AI Provider; nhận JSON; hiển thị preview/lưu roadmap |
| Alternative flow | Thiếu API key, quota/rate limit, response không phải JSON hợp lệ |
| Post-condition | Roadmap cá nhân hóa được tạo hoặc lỗi được báo rõ |
| Requirement | FR-RM-02 |
