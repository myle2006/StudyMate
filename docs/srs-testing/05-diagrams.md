# Diagrams - StudyMate AI

## Rendered Images

Các diagram dưới đây đã được render thành SVG, PNG và XML trong `docs/srs-testing/diagrams/`. File `.xml` là bản XML của SVG diagram, dùng được khi cần nộp hoặc lưu diagram ở dạng XML.

Xem thêm bộ diagram theo từng chức năng tại [by-function-usecases.md](by-function-usecases.md) và [diagrams/by-function/index.md](diagrams/by-function/index.md).

| Diagram | Source | SVG | PNG | XML |
|---|---|---|---|---|
| Use Case Diagram | [use-case-diagram.puml](diagrams/use-case-diagram.puml) | [SVG](diagrams/use-case-diagram.svg) | [PNG](diagrams/use-case-diagram.png) | [XML](diagrams/use-case-diagram.xml) |
| Activity - Đăng nhập | [activity-login.mmd](diagrams/activity-login.mmd) | [SVG](diagrams/activity-login.svg) | [PNG](diagrams/activity-login.png) | [XML](diagrams/activity-login.xml) |
| Activity - Student nộp bài | [activity-submit-assignment.mmd](diagrams/activity-submit-assignment.mmd) | [SVG](diagrams/activity-submit-assignment.svg) | [PNG](diagrams/activity-submit-assignment.png) | [XML](diagrams/activity-submit-assignment.xml) |
| Activity - Tạo roadmap bằng AI | [activity-generate-roadmap-ai.mmd](diagrams/activity-generate-roadmap-ai.mmd) | [SVG](diagrams/activity-generate-roadmap-ai.svg) | [PNG](diagrams/activity-generate-roadmap-ai.png) | [XML](diagrams/activity-generate-roadmap-ai.xml) |
| Sequence - Chấm điểm bài nộp | [sequence-grade-submission.mmd](diagrams/sequence-grade-submission.mmd) | [SVG](diagrams/sequence-grade-submission.svg) | [PNG](diagrams/sequence-grade-submission.png) | [XML](diagrams/sequence-grade-submission.xml) |

## 1. Use Case Diagram - PlantUML

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor Guest
actor Admin
actor Student
actor "AI Provider" as AI

rectangle "System: StudyMate AI" {
  package "Authentication" {
    usecase "Đăng ký tài khoản" as UC01
    usecase "Đăng nhập" as UC02
    usecase "Đăng xuất" as UC03
    usecase "Xem thông tin tài khoản" as UC04
  }

  package "Admin Management" {
    usecase "Quản lý sinh viên" as UC05
    usecase "Import sinh viên" as UC06
    usecase "Quản lý trạng thái sinh viên" as UC07
    usecase "Quản lý môn học" as UC08
    usecase "Gán sinh viên vào môn học" as UC09
    usecase "Quản lý bài tập" as UC10
    usecase "Chấm điểm bài nộp" as UC11
  }

  package "Student Learning" {
    usecase "Xem môn học của tôi" as UC12
    usecase "Xem bài tập" as UC13
    usecase "Nộp/cập nhật bài nộp" as UC14
    usecase "Xem điểm và feedback" as UC15
    usecase "Quản lý mục tiêu học tập" as UC16
    usecase "Quản lý lịch học" as UC17
    usecase "Quản lý lộ trình học" as UC18
    usecase "Sinh lộ trình học bằng AI" as UC19
  }
}

Guest -- UC01
Guest -- UC02

Admin -- UC02
Admin -- UC03
Admin -- UC04
Admin -- UC05
Admin -- UC06
Admin -- UC07
Admin -- UC08
Admin -- UC09
Admin -- UC10
Admin -- UC11

Student -- UC02
Student -- UC03
Student -- UC04
Student -- UC12
Student -- UC13
Student -- UC14
Student -- UC15
Student -- UC16
Student -- UC17
Student -- UC18
Student -- UC19

UC19 -- AI
@enduml
```

## 2. Activity Diagram - Đăng nhập

```mermaid
flowchart TD
    A[Người dùng mở trang đăng nhập] --> B[Nhập email và password]
    B --> C[Nhấn đăng nhập]
    C --> D["Frontend gọi POST /api/login"]
    D --> E{Dữ liệu hợp lệ?}
    E -- Không --> F[Trả lỗi validation 422]
    E -- Có --> G{Email/password đúng?}
    G -- Không --> H[Trả lỗi 401]
    G -- Có --> I{Tài khoản active?}
    I -- Locked/Inactive --> J[Trả lỗi 403]
    I -- Active --> K[Tạo JWT và trả role]
    K --> L{Role}
    L -- Admin --> M["Chuyển đến /admin/dashboard"]
    L -- Student --> N["Chuyển đến /student/dashboard"]
```

## 3. Activity Diagram - Student nộp bài

```mermaid
flowchart TD
    A[Student đăng nhập] --> B["Mở /student/assignments"]
    B --> C[Chọn assignment]
    C --> D["Frontend gọi API chi tiết assignment"]
    D --> E{Assignment thuộc student?}
    E -- Không --> F[Từ chối truy cập]
    E -- Có --> G[Mở form nộp bài]
    G --> H[Nhập nội dung hoặc chọn file]
    H --> I["Gửi POST /api/student/assignments/{assignmentId}/submit"]
    I --> J{Dữ liệu hợp lệ?}
    J -- Không --> K[Hiển thị lỗi validation]
    J -- Có --> L[Lưu submission]
    L --> M[Hiển thị chi tiết bài nộp]
```

## 4. Activity Diagram - Tạo roadmap bằng AI

```mermaid
flowchart TD
    A[Student mở trang tạo roadmap] --> B[Nhập môn học, mục tiêu, thời gian học]
    B --> C["Gửi POST /api/student/roadmaps/generate-ai"]
    C --> D{AI Provider được cấu hình?}
    D -- Không --> E[Hiển thị lỗi thiếu API key]
    D -- Có --> F[Gọi AI Provider]
    F --> G{Provider trả thành công?}
    G -- Không --> H[Hiển thị lỗi quota/rate limit/API]
    G -- Có --> I{JSON hợp lệ?}
    I -- Không --> J[Hiển thị lỗi phản hồi AI không hợp lệ]
    I -- Có --> K[Hiển thị preview roadmap]
    K --> L[Student lưu roadmap]
```

## 5. Sequence Diagram - Chấm điểm bài nộp

```mermaid
sequenceDiagram
    actor Admin
    participant UI as React UI
    participant API as PHP API
    participant DB as MySQL

    Admin->>UI: Mở chi tiết bài nộp
    UI->>API: GET /api/admin/submissions/{id}
    API->>DB: Truy vấn submission
    DB-->>API: Dữ liệu submission
    API-->>UI: Trả chi tiết submission
    Admin->>UI: Nhập điểm và feedback
    UI->>API: PUT /api/admin/submissions/{id}/grade
    API->>API: Validate điểm/feedback
    API->>DB: Cập nhật kết quả chấm
    DB-->>API: Thành công
    API-->>UI: Trả thông báo thành công
```
