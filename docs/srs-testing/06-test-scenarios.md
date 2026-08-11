# Test Scenarios - StudyMate AI

## 1. Authentication

| Scenario ID | Scenario | Requirement | Priority |
|---|---|---|---|
| TS-AUTH-01 | Đăng ký thành công với dữ liệu hợp lệ | FR-AUTH-01 | High |
| TS-AUTH-02 | Đăng ký thất bại khi email đã tồn tại | FR-AUTH-01 | High |
| TS-AUTH-03 | Đăng ký thất bại khi password dưới 6 ký tự | FR-AUTH-01 | Medium |
| TS-AUTH-04 | Đăng nhập thành công với tài khoản admin | FR-AUTH-02 | High |
| TS-AUTH-05 | Đăng nhập thành công với tài khoản student | FR-AUTH-02 | High |
| TS-AUTH-06 | Đăng nhập thất bại khi sai email/password | FR-AUTH-02 | High |
| TS-AUTH-07 | Tài khoản locked/inactive không được đăng nhập | FR-AUTH-03 | High |
| TS-AUTH-08 | API cần token từ chối request không có token | NFR-01 | High |
| TS-AUTH-09 | Người dùng đã đăng nhập lấy thông tin `/api/me` thành công | FR-AUTH-04 | High |
| TS-AUTH-10 | Người dùng đăng xuất thành công | FR-AUTH-05 | Medium |
| TS-AUTH-11 | Token sai hoặc hết hạn bị từ chối | NFR-01 | High |

## 2. Admin - Student Management

| Scenario ID | Scenario | Requirement | Priority |
|---|---|---|---|
| TS-STU-01 | Admin xem danh sách sinh viên | FR-STU-01 | High |
| TS-STU-02 | Admin tạo sinh viên với dữ liệu hợp lệ | FR-STU-02 | High |
| TS-STU-03 | Admin tạo sinh viên thất bại khi thiếu email | FR-STU-02 | High |
| TS-STU-04 | Admin cập nhật thông tin sinh viên | FR-STU-02 | Medium |
| TS-STU-05 | Admin xóa sinh viên | FR-STU-02 | Medium |
| TS-STU-06 | Admin import file sinh viên hợp lệ | FR-STU-03 | High |
| TS-STU-07 | Admin import file sai định dạng | FR-STU-03 | High |
| TS-STU-08 | Admin khóa/mở khóa tài khoản sinh viên | FR-STU-04 | High |
| TS-STU-09 | Admin reset password sinh viên thành công | FR-STU-05 | High |
| TS-STU-10 | Admin reset password dưới 6 ký tự bị từ chối | FR-STU-05 | Medium |
| TS-STU-11 | Student truy cập API admin students bị từ chối | NFR-02 | High |

## 3. Subject Management

| Scenario ID | Scenario | Requirement | Priority |
|---|---|---|---|
| TS-SUB-01 | Admin tạo môn học thành công | FR-SUB-02 | High |
| TS-SUB-02 | Admin cập nhật môn học | FR-SUB-02 | Medium |
| TS-SUB-03 | Admin xóa môn học | FR-SUB-02 | Medium |
| TS-SUB-04 | Student xem danh sách môn học của mình | FR-SUB-05 | High |
| TS-SUB-05 | Admin gán student vào môn học | FR-SUB-03 | High |
| TS-SUB-06 | Admin gán trùng student vào môn học bị từ chối | FR-SUB-03 | Medium |
| TS-SUB-07 | Student không thấy môn chưa được gán | FR-SUB-05 | High |
| TS-SUB-08 | Admin gỡ student khỏi môn học thành công | FR-SUB-04 | High |
| TS-SUB-09 | Admin gỡ student không thuộc môn học bị trả 404 | FR-SUB-04 | Medium |
| TS-SUB-10 | Student truy cập API tạo/cập nhật/xóa môn học bị từ chối | NFR-02 | High |

## 4. Assignment, Submission, Grade

| Scenario ID | Scenario | Requirement | Priority |
|---|---|---|---|
| TS-ASG-01 | Admin tạo bài tập thành công | FR-ASG-01 | High |
| TS-ASG-02 | Admin tạo bài tập thất bại khi thiếu trường bắt buộc | FR-ASG-01 | High |
| TS-ASG-03 | Admin tạo assignment `open` với deadline quá khứ bị từ chối | FR-ASG-01 | High |
| TS-ASG-04 | Admin upload file đính kèm assignment sai định dạng hoặc quá 10MB | FR-ASG-01 | Medium |
| TS-ASG-05 | Student xem bài tập được giao | FR-ASG-02 | High |
| TS-SUBM-01 | Student nộp bài thành công bằng nội dung text | FR-SUBM-01 | High |
| TS-SUBM-02 | Student nộp bài thành công bằng file hợp lệ | FR-SUBM-01 | High |
| TS-SUBM-03 | Student nộp bài thất bại khi không có content và file | FR-SUBM-01 | High |
| TS-SUBM-04 | Student cập nhật bài nộp | FR-SUBM-02 | Medium |
| TS-SUBM-05 | Student không xem/nộp bài không thuộc môn của mình | NFR-02 | High |
| TS-GRD-01 | Admin xem danh sách bài nộp theo assignment | FR-GRD-01 | High |
| TS-GRD-02 | Admin chấm điểm và nhập feedback | FR-GRD-02 | High |
| TS-GRD-03 | Admin nhập điểm ngoài khoảng 0-10 bị từ chối | FR-GRD-02 | High |
| TS-GRD-04 | Admin nhập feedback quá 5000 ký tự bị từ chối | FR-GRD-02 | Medium |
| TS-GRD-05 | Student xem điểm và feedback của mình | FR-GRD-03 | High |

## 5. Learning Goal, Schedule, Roadmap

| Scenario ID | Scenario | Requirement | Priority |
|---|---|---|---|
| TS-GOAL-01 | Student tạo mục tiêu học tập | FR-GOAL-01 | High |
| TS-GOAL-02 | Student cập nhật/xóa mục tiêu học tập | FR-GOAL-01 | Medium |
| TS-SCH-01 | Student tạo lịch học | FR-SCH-01 | High |
| TS-SCH-02 | Student cập nhật/xóa lịch học | FR-SCH-01 | Medium |
| TS-SCH-03 | Student tạo lịch học có end_time <= start_time bị từ chối | FR-SCH-01 | High |
| TS-SCH-04 | Student tạo lịch `upcoming` ở quá khứ bị từ chối | FR-SCH-01 | Medium |
| TS-RM-01 | Student tạo roadmap thủ công | FR-RM-01 | High |
| TS-RM-02 | Student tạo roadmap bằng AI thành công | FR-RM-02 | High |
| TS-RM-03 | Tạo roadmap AI thất bại khi thiếu API key | FR-RM-02 | High |
| TS-RM-04 | Tạo roadmap AI thất bại khi response không phải JSON hợp lệ | FR-RM-02 | High |
| TS-RM-05 | Tạo roadmap thất bại khi không chọn ngày học trong tuần | FR-RM-01 | Medium |
| TS-RM-06 | Tạo roadmap thất bại khi end_date nhỏ hơn start_date | FR-RM-01 | Medium |
| TS-RM-07 | Student cập nhật trạng thái roadmap item | FR-RM-03 | Medium |
