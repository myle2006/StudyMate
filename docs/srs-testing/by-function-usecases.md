# Use Cases Và Diagram Theo Từng Chức Năng

Tài liệu này tách use case theo từng nhóm chức năng của StudyMate AI. Mỗi nhóm có:

- Danh sách use case chính.
- Actor tham gia.
- Requirement liên quan.
- Link source diagram và ảnh/XML đã render trong `docs/srs-testing/diagrams/by-function/`.

## 1. Authentication

| Use Case ID | Use Case | Actor | Requirement |
|---|---|---|---|
| UC-AUTH-01 | Đăng ký tài khoản sinh viên | Guest | FR-AUTH-01 |
| UC-AUTH-02 | Đăng nhập | Guest/Admin/Student | FR-AUTH-02, FR-AUTH-03 |
| UC-AUTH-03 | Xem thông tin tài khoản | Admin/Student | FR-AUTH-04 |
| UC-AUTH-04 | Đăng xuất | Admin/Student | FR-AUTH-05 |

Diagram:

- [auth-usecase.png](diagrams/by-function/auth-usecase.png)
- [auth-activity.png](diagrams/by-function/auth-activity.png)

## 2. Quản Lý Sinh Viên

| Use Case ID | Use Case | Actor | Requirement |
|---|---|---|---|
| UC-STU-01 | Xem danh sách sinh viên | Admin | FR-STU-01 |
| UC-STU-02 | Tạo sinh viên | Admin | FR-STU-02 |
| UC-STU-03 | Cập nhật sinh viên | Admin | FR-STU-02 |
| UC-STU-04 | Xóa/vô hiệu hóa sinh viên | Admin | FR-STU-02, FR-STU-04 |
| UC-STU-05 | Import danh sách sinh viên | Admin | FR-STU-03 |
| UC-STU-06 | Khóa/mở khóa/kích hoạt tài khoản | Admin | FR-STU-04 |
| UC-STU-07 | Reset mật khẩu sinh viên | Admin | FR-STU-05 |

Diagram:

- [student-management-usecase.png](diagrams/by-function/student-management-usecase.png)
- [student-management-activity.png](diagrams/by-function/student-management-activity.png)

## 3. Quản Lý Môn Học Và Phân Công Sinh Viên

| Use Case ID | Use Case | Actor | Requirement |
|---|---|---|---|
| UC-SUB-01 | Xem danh sách/chi tiết môn học | Admin/Student | FR-SUB-01 |
| UC-SUB-02 | Tạo môn học | Admin | FR-SUB-02 |
| UC-SUB-03 | Cập nhật môn học | Admin | FR-SUB-02 |
| UC-SUB-04 | Xóa môn học | Admin | FR-SUB-02 |
| UC-SUB-05 | Gán sinh viên vào môn học | Admin | FR-SUB-03 |
| UC-SUB-06 | Gỡ sinh viên khỏi môn học | Admin | FR-SUB-04 |
| UC-SUB-07 | Student xem môn học của tôi | Student | FR-SUB-05 |

Diagram:

- [subject-management-usecase.png](diagrams/by-function/subject-management-usecase.png)
- [subject-management-activity.png](diagrams/by-function/subject-management-activity.png)

## 4. Bài Tập, Bài Nộp Và Chấm Điểm

| Use Case ID | Use Case | Actor | Requirement |
|---|---|---|---|
| UC-ASG-01 | Admin quản lý bài tập | Admin | FR-ASG-01 |
| UC-ASG-02 | Student xem bài tập được giao | Student | FR-ASG-02 |
| UC-ASG-03 | Student nộp/cập nhật bài nộp | Student | FR-SUBM-01, FR-SUBM-02 |
| UC-ASG-04 | Admin xem danh sách bài nộp | Admin | FR-GRD-01 |
| UC-ASG-05 | Admin chấm điểm và feedback | Admin | FR-GRD-02 |
| UC-ASG-06 | Student xem điểm và feedback | Student | FR-GRD-03 |

Diagram:

- [assignment-grading-usecase.png](diagrams/by-function/assignment-grading-usecase.png)
- [assignment-grading-activity.png](diagrams/by-function/assignment-grading-activity.png)

## 5. Mục Tiêu Học Tập

| Use Case ID | Use Case | Actor | Requirement |
|---|---|---|---|
| UC-GOAL-01 | Xem danh sách mục tiêu | Student | FR-GOAL-01 |
| UC-GOAL-02 | Tạo mục tiêu học tập | Student | FR-GOAL-01 |
| UC-GOAL-03 | Cập nhật mục tiêu học tập | Student | FR-GOAL-01 |
| UC-GOAL-04 | Xóa mục tiêu học tập | Student | FR-GOAL-01 |

Diagram:

- [learning-goal-usecase.png](diagrams/by-function/learning-goal-usecase.png)
- [learning-goal-activity.png](diagrams/by-function/learning-goal-activity.png)

## 6. Lịch Học

| Use Case ID | Use Case | Actor | Requirement |
|---|---|---|---|
| UC-SCH-01 | Xem lịch học | Student | FR-SCH-01 |
| UC-SCH-02 | Tạo lịch học | Student | FR-SCH-01 |
| UC-SCH-03 | Cập nhật lịch học | Student | FR-SCH-01 |
| UC-SCH-04 | Xóa lịch học | Student | FR-SCH-01 |

Diagram:

- [study-schedule-usecase.png](diagrams/by-function/study-schedule-usecase.png)
- [study-schedule-activity.png](diagrams/by-function/study-schedule-activity.png)

## 7. Lộ Trình Học Và AI Roadmap

| Use Case ID | Use Case | Actor | Requirement |
|---|---|---|---|
| UC-RM-01 | Xem danh sách/chi tiết roadmap | Student | FR-RM-01 |
| UC-RM-02 | Tạo roadmap thủ công | Student | FR-RM-01 |
| UC-RM-03 | Sinh roadmap bằng AI | Student, AI Provider | FR-RM-02 |
| UC-RM-04 | Cập nhật/xóa roadmap | Student | FR-RM-01 |
| UC-RM-05 | Cập nhật trạng thái/kết quả roadmap item | Student | FR-RM-03 |
| UC-RM-06 | Dời lịch roadmap item | Student | FR-RM-03 |

Diagram:

- [learning-roadmap-usecase.png](diagrams/by-function/learning-roadmap-usecase.png)
- [learning-roadmap-activity.png](diagrams/by-function/learning-roadmap-activity.png)
