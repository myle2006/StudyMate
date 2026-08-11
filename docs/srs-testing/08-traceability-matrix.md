# Traceability Matrix - StudyMate AI

## 1. Requirement -> Use Case -> Test Scenario -> Test Case

| Requirement ID | Requirement Summary | Use Case ID | Test Scenario ID | Test Case ID |
|---|---|---|---|---|
| FR-AUTH-01 | Đăng ký tài khoản student | UC-01 | TS-AUTH-01, TS-AUTH-02, TS-AUTH-03 | TC-AUTH-001, TC-AUTH-002 |
| FR-AUTH-02 | Đăng nhập | UC-02 | TS-AUTH-04, TS-AUTH-05, TS-AUTH-06 | TC-AUTH-003, TC-AUTH-004, TC-AUTH-005 |
| FR-AUTH-03 | Chặn locked/inactive login | UC-02 | TS-AUTH-07 | TC-AUTH-006 |
| FR-AUTH-04 | Xem thông tin tài khoản | UC-19 | TS-AUTH-09 | TC-AUTH-007 |
| FR-AUTH-05 | Đăng xuất | UC-03 | TS-AUTH-10 | TC-AUTH-008 |
| FR-STU-01 | Xem danh sách sinh viên | UC-04 | TS-STU-01 | TC-STU-001 |
| FR-STU-02 | CRUD sinh viên | UC-04 | TS-STU-02, TS-STU-03, TS-STU-04, TS-STU-05 | TC-STU-002, TC-STU-003 |
| FR-STU-03 | Import sinh viên | UC-05 | TS-STU-06, TS-STU-07 | TC-STU-004 |
| FR-STU-04 | Quản lý trạng thái sinh viên | UC-06 | TS-STU-08 | TC-STU-005 |
| FR-STU-05 | Reset password sinh viên | UC-06 | TS-STU-09, TS-STU-10 | TC-STU-006, TC-STU-007 |
| FR-SUB-01 | Xem môn học | UC-07, UC-09 | TS-SUB-04 | TC-SUB-003 |
| FR-SUB-02 | CRUD môn học | UC-07 | TS-SUB-01, TS-SUB-02, TS-SUB-03 | TC-SUB-001 |
| FR-SUB-03 | Gán sinh viên vào môn học | UC-08 | TS-SUB-05, TS-SUB-06 | TC-SUB-002 |
| FR-SUB-04 | Gỡ sinh viên khỏi môn học | UC-08 | TS-SUB-08, TS-SUB-09 | TC-SUB-005, TC-SUB-006 |
| FR-SUB-05 | Student xem môn của mình | UC-09 | TS-SUB-04, TS-SUB-07 | TC-SUB-003 |
| FR-ASG-01 | CRUD bài tập | UC-10 | TS-ASG-01, TS-ASG-02, TS-ASG-03, TS-ASG-04 | TC-ASG-001, TC-ASG-002, TC-ASG-003 |
| FR-ASG-02 | Student xem bài tập | UC-11 | TS-ASG-05 | TC-ASG-004 |
| FR-SUBM-01 | Student nộp bài | UC-12 | TS-SUBM-01, TS-SUBM-02, TS-SUBM-03 | TC-SUBM-001, TC-SUBM-002 |
| FR-SUBM-02 | Student cập nhật bài nộp | UC-12 | TS-SUBM-04 | TC-SUBM-003 |
| FR-GRD-01 | Admin xem bài nộp | UC-13 | TS-GRD-01 | TC-GRD-004 |
| FR-GRD-02 | Admin chấm điểm | UC-13 | TS-GRD-02, TS-GRD-03, TS-GRD-04 | TC-GRD-001, TC-GRD-002 |
| FR-GRD-03 | Student xem điểm/feedback | UC-14 | TS-GRD-05 | TC-GRD-003 |
| FR-GOAL-01 | CRUD mục tiêu học tập | UC-15 | TS-GOAL-01, TS-GOAL-02 | TC-GOAL-001 |
| FR-SCH-01 | CRUD lịch học | UC-16 | TS-SCH-01, TS-SCH-02, TS-SCH-03, TS-SCH-04 | TC-SCH-001 |
| FR-RM-01 | Tạo roadmap thủ công | UC-17 | TS-RM-01, TS-RM-05, TS-RM-06 | TC-RM-001, TC-RM-004 |
| FR-RM-02 | Tạo roadmap bằng AI | UC-18 | TS-RM-02, TS-RM-03, TS-RM-04 | TC-RM-002, TC-RM-003 |
| FR-RM-03 | Cập nhật roadmap item | UC-17 | TS-RM-07 | TC-RM-005 |
| NFR-01 | API cần token phải bảo vệ bằng auth | UC-02, UC-03, UC-19 | TS-AUTH-08, TS-AUTH-11 | TC-AUTH-009, TC-AUTH-010 |
| NFR-02 | Phân quyền admin/student | Nhiều UC | TS-STU-11, TS-SUB-10, TS-SUBM-05 | TC-SUB-004 |
| NFR-03 | Toàn vẹn dữ liệu validation | Nhiều UC | Nhiều scenario negative | TC-AUTH-002, TC-STU-003, TC-ASG-002 |
| NFR-04 | Lỗi AI không làm sập hệ thống | UC-18 | TS-RM-03, TS-RM-04 | TC-RM-003 |

## 2. Coverage Summary

| Nhóm | Số requirement | Mức coverage hiện tại |
|---|---:|---|
| Authentication | 5 | Có test case nền tảng cho đăng ký, đăng nhập, `/api/me`, logout và token lỗi |
| Student Management | 5 | Có CRUD/import/status/reset password ở mức luồng chính và negative cơ bản |
| Subject Management | 5 | Có tạo/gán/gỡ/xem và kiểm tra phân quyền cơ bản |
| Assignment/Submission/Grade | 7 | Có luồng chính và negative cho deadline, file, submission rỗng, score |
| Goal/Schedule/Roadmap | 5 | Có luồng chính, cần bổ sung validation từng form |
| Non-functional | 4 | Có hướng kiểm thử, cần mở rộng thành bộ security/regression test |

## 3. Ghi chú QA

- Các test case hiện tại là baseline để review SRS và chuẩn bị kiểm thử thủ công/API; khi chạy thực tế nên bổ sung cột Actual Result, Status, Defect ID.
- Ma trận này nên được cập nhật mỗi khi thêm requirement hoặc test case mới.
- Khi có defect, nên thêm cột `Defect ID` và `Retest Status`.
