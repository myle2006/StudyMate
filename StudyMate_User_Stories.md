# STUDYMATE AI - USER STORY SPECIFICATION

## 1. Document Information

| Field | Value |
| --- | --- |
| Document Name | StudyMate AI - User Story Specification |
| File | StudyMate_User_Stories.md |
| Project | StudyMate AI - Website tro ly hoc tap ca nhan cho sinh vien |
| Version | 1.0 |
| Created Date | 2026-08-07 |
| Prepared By | Senior BA/QA - Codex |
| Source Artifacts | routes/api.php, routes/*.php, models/*, database/migrations/*.sql, SRS testing docs |
| Target Audience | Product Owner, BA, Developer, QA, PM |

## 2. Project Overview

StudyMate AI la website ho tro sinh vien quan ly viec hoc va su dung AI de ca nhan hoa qua trinh hoc tap. Tech stack gom React frontend, PHP MVC backend, MySQL database va AI API duoc goi tu backend PHP. Hai role chinh la Admin va Student.

Tai lieu nay tach tung chuc nang thanh User Story doc lap de Developer implement, Tester viet test case, PM/BA quan ly backlog va trace User Story -> Acceptance Criteria -> API -> Database -> Test Case.

## 3. Roles

| Role | Mo ta | Quyen chinh |
| --- | --- | --- |
| Guest | Nguoi chua dang nhap | Dang ky, dang nhap, xem trang public neu co. |
| Admin | Quan tri vien | Quan ly sinh vien, mon hoc, bai tap, submission/grading va dashboard admin. |
| Student | Sinh vien | Quan ly lich hoc, learning goal, AI roadmap, progress, bai nop, AI image recognition va dashboard ca nhan. |
| System | Backend/middleware/integration | Kiem tra auth/status/permission, goi AI API, dong bo roadmap voi schedule, tinh progress. |

## 4. User Story Naming Convention

Format: `US-[MODULE]-XXX - [Ten User Story]`.

| Module Code | Module |
| --- | --- |
| AUTH | Authentication & Authorization |
| STU | Student Management |
| SUB | Subject Management |
| ASM | Assignment Management |
| GRD | Submission & Grading |
| SCH | Schedule Management |
| GOAL | Learning Goal |
| AIR | AI Personalized Learning Roadmap |
| PROG | Learning Progress |
| IMG | AI Image Recognition |
| DASH | Dashboard |

Priority: P0 - Critical, P1 - High, P2 - Medium, P3 - Low. Story Point dung Fibonacci: 1, 2, 3, 5, 8, 13.


## 5. Authentication User Stories

## US-AUTH-001 - Register Student Account

**Priority:** P0  
**Story Point:** 5 - Bao gom validate identity, duplicate va hash password.  
**Dependency:** None

### User Story

As a Guest,  
I want to dang ky tai khoan Student moi,  
So that co tai khoan hoc tap ca nhan.

### Description

Nguoi dung/He thong thuc hien **Register Student Account** trong module **Authentication**. Chuc nang xu ly cac du lieu chinh: **full_name, email, password, confirm_password, student_code; email/student_code unique**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Khong co dependency nghiep vu bat buoc.
- Nguoi dung co dung role: Guest.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Guest thuc hien thao tac **Register Student Account** tren man hinh /register.

### Main Flow

1. Guest mo man hinh /register.
2. He thong tai du lieu/phu thuoc can thiet: None.
3. Guest nhap hoac chon du lieu lien quan: full_name, email, password, confirm_password, student_code; email/student_code unique.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/register.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: users, roles.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den full_name, email, password, confirm_password, student_code; email/student_code unique phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Register Student Account thanh cong**

Given Guest da dap ung dieu kien tien quyet
And du lieu hop le cho full_name, email, password, confirm_password, student_code; email/student_code unique
When Guest xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/register
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Guest dang o man hinh chuc nang
When bo trong truong bat buoc cua full_name, email, password, confirm_password, student_code; email/student_code unique
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu full_name, email, password, confirm_password, student_code; email/student_code unique sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu full_name, email, password, confirm_password, student_code; email/student_code unique nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/register
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

**AC07 - Duplicate data**

Given du lieu full_name, email, password, confirm_password, student_code; email/student_code unique vi pham rang buoc duy nhat neu chuc nang co duplicate rule
When submit
Then he thong phai tu choi duplicate
And khong tao ban ghi trung.

**AC08 - Server/database error**

Given backend hoac database gap loi
When Guest thuc hien thao tac
Then he thong phai tra 500/503 than thien
And khong luu du lieu dang do.

**AC09 - UI state consistency**

Given thao tac Register Student Account thanh cong hoac that bai
When UI nhan response
Then loading state ket thuc dung luc
And success/error/empty state khong gay nham lan.

**AC10 - Audit/log/security**

Given chuc nang Register Student Account duoc thuc hien
When backend ghi log hoac audit
Then log du du lieu debug can thiet
And khong ghi password, token, API key hoac du lieu nhay cam.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Register Student Account duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Authentication |
| User Story ID | US-AUTH-001 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10 |
| Related API | /api/register |
| Related Database Table | users, roles |
| Related UI Screen | /register |
| Related Test Case | TC-AUTH-001 |

## US-AUTH-002 - Login

**Priority:** P0  
**Story Point:** 8 - Critical cho security, session, role routing va account status.  
**Dependency:** Registered active account

### User Story

As a Admin/Student,  
I want to dang nhap bang email va mat khau,  
So that truy cap dashboard dung role.

### Description

Nguoi dung/He thong thuc hien **Login** trong module **Authentication**. Chuc nang xu ly cac du lieu chinh: **email, password, status active, last_login_at, token/session**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Registered active account da san sang.
- Nguoi dung co dung role: Admin/Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin/Student thuc hien thao tac **Login** tren man hinh /login.

### Main Flow

1. Admin/Student mo man hinh /login.
2. He thong tai du lieu/phu thuoc can thiet: Registered active account.
3. Admin/Student nhap hoac chon du lieu lien quan: email, password, status active, last_login_at, token/session.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/login.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: users, roles.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den email, password, status active, last_login_at, token/session phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Login thanh cong**

Given Admin/Student da dap ung dieu kien tien quyet
And du lieu hop le cho email, password, status active, last_login_at, token/session
When Admin/Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/login
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin/Student dang o man hinh chuc nang
When bo trong truong bat buoc cua email, password, status active, last_login_at, token/session
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu email, password, status active, last_login_at, token/session sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu email, password, status active, last_login_at, token/session nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/login
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

**AC07 - Duplicate data**

Given du lieu email, password, status active, last_login_at, token/session vi pham rang buoc duy nhat neu chuc nang co duplicate rule
When submit
Then he thong phai tu choi duplicate
And khong tao ban ghi trung.

**AC08 - Server/database error**

Given backend hoac database gap loi
When Admin/Student thuc hien thao tac
Then he thong phai tra 500/503 than thien
And khong luu du lieu dang do.

**AC09 - UI state consistency**

Given thao tac Login thanh cong hoac that bai
When UI nhan response
Then loading state ket thuc dung luc
And success/error/empty state khong gay nham lan.

**AC10 - Audit/log/security**

Given chuc nang Login duoc thuc hien
When backend ghi log hoac audit
Then log du du lieu debug can thiet
And khong ghi password, token, API key hoac du lieu nhay cam.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Login duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Authentication |
| User Story ID | US-AUTH-002 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10 |
| Related API | /api/login |
| Related Database Table | users, roles |
| Related UI Screen | /login |
| Related Test Case | TC-AUTH-002 |

## US-AUTH-003 - Logout

**Priority:** P0  
**Story Point:** 3 - Xu ly session/token va redirect.  
**Dependency:** Login

### User Story

As a Admin/Student,  
I want to dang xuat khoi he thong,  
So that ket thuc phien lam viec an toan.

### Description

Nguoi dung/He thong thuc hien **Logout** trong module **Authentication**. Chuc nang xu ly cac du lieu chinh: **token/session invalidation, redirect login**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Login da san sang.
- Nguoi dung co dung role: Admin/Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin/Student thuc hien thao tac **Logout** tren man hinh Header account menu.

### Main Flow

1. Admin/Student mo man hinh Header account menu.
2. He thong tai du lieu/phu thuoc can thiet: Login.
3. Admin/Student nhap hoac chon du lieu lien quan: token/session invalidation, redirect login.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/logout.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: token/session store neu co.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den token/session invalidation, redirect login phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Logout thanh cong**

Given Admin/Student da dap ung dieu kien tien quyet
And du lieu hop le cho token/session invalidation, redirect login
When Admin/Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/logout
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin/Student dang o man hinh chuc nang
When bo trong truong bat buoc cua token/session invalidation, redirect login
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu token/session invalidation, redirect login sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu token/session invalidation, redirect login nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/logout
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Logout duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Authentication |
| User Story ID | US-AUTH-003 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/logout |
| Related Database Table | token/session store neu co |
| Related UI Screen | Header account menu |
| Related Test Case | TC-AUTH-003 |

## US-AUTH-004 - Role Based Authorization

**Priority:** P0  
**Story Point:** 8 - Middleware anh huong toan he thong.  
**Dependency:** Login, roles table, AuthMiddleware, RoleMiddleware

### User Story

As a System,  
I want to kiem tra quyen Admin/Student,  
So that bao ve route va du lieu theo role.

### Description

Nguoi dung/He thong thuc hien **Role Based Authorization** trong module **Authentication**. Chuc nang xu ly cac du lieu chinh: **401 unauthenticated, 403 unauthorized, backend enforcement**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Login, roles table, AuthMiddleware, RoleMiddleware da san sang.
- Nguoi dung co dung role: System.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

System thuc hien thao tac **Role Based Authorization** tren man hinh PrivateRoute/AdminRoute/StudentRoute.

### Main Flow

1. System mo man hinh PrivateRoute/AdminRoute/StudentRoute.
2. He thong tai du lieu/phu thuoc can thiet: Login, roles table, AuthMiddleware, RoleMiddleware.
3. System nhap hoac chon du lieu lien quan: 401 unauthenticated, 403 unauthorized, backend enforcement.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den All protected API routes.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: users, roles.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den 401 unauthenticated, 403 unauthorized, backend enforcement phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Role Based Authorization thanh cong**

Given System da dap ung dieu kien tien quyet
And du lieu hop le cho 401 unauthenticated, 403 unauthorized, backend enforcement
When System xac nhan thao tac
Then he thong phai xu ly thanh cong qua All protected API routes
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given System dang o man hinh chuc nang
When bo trong truong bat buoc cua 401 unauthenticated, 403 unauthorized, backend enforcement
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu 401 unauthenticated, 403 unauthorized, backend enforcement sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu 401 unauthenticated, 403 unauthorized, backend enforcement nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap All protected API routes
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

**AC07 - Duplicate data**

Given du lieu 401 unauthenticated, 403 unauthorized, backend enforcement vi pham rang buoc duy nhat neu chuc nang co duplicate rule
When submit
Then he thong phai tu choi duplicate
And khong tao ban ghi trung.

**AC08 - Server/database error**

Given backend hoac database gap loi
When System thuc hien thao tac
Then he thong phai tra 500/503 than thien
And khong luu du lieu dang do.

**AC09 - UI state consistency**

Given thao tac Role Based Authorization thanh cong hoac that bai
When UI nhan response
Then loading state ket thuc dung luc
And success/error/empty state khong gay nham lan.

**AC10 - Audit/log/security**

Given chuc nang Role Based Authorization duoc thuc hien
When backend ghi log hoac audit
Then log du du lieu debug can thiet
And khong ghi password, token, API key hoac du lieu nhay cam.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Role Based Authorization duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Authentication |
| User Story ID | US-AUTH-004 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10 |
| Related API | All protected API routes |
| Related Database Table | users, roles |
| Related UI Screen | PrivateRoute/AdminRoute/StudentRoute |
| Related Test Case | TC-AUTH-004 |

## US-AUTH-005 - Change Password

**Priority:** P1  
**Story Point:** 5 - Can old password, new password policy va hash.  
**Dependency:** Login

### User Story

As a Admin/Student,  
I want to doi mat khau ca nhan,  
So that bao ve tai khoan khi mat khau cu khong an toan.

### Description

Nguoi dung/He thong thuc hien **Change Password** trong module **Authentication**. Chuc nang xu ly cac du lieu chinh: **old_password, new_password, confirm_password, password_hash**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Login da san sang.
- Nguoi dung co dung role: Admin/Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin/Student thuc hien thao tac **Change Password** tren man hinh /profile/change-password.

### Main Flow

1. Admin/Student mo man hinh /profile/change-password.
2. He thong tai du lieu/phu thuoc can thiet: Login.
3. Admin/Student nhap hoac chon du lieu lien quan: old_password, new_password, confirm_password, password_hash.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/change-password (proposed).
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: users.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den old_password, new_password, confirm_password, password_hash phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Change Password thanh cong**

Given Admin/Student da dap ung dieu kien tien quyet
And du lieu hop le cho old_password, new_password, confirm_password, password_hash
When Admin/Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/change-password (proposed)
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin/Student dang o man hinh chuc nang
When bo trong truong bat buoc cua old_password, new_password, confirm_password, password_hash
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu old_password, new_password, confirm_password, password_hash sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu old_password, new_password, confirm_password, password_hash nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/change-password (proposed)
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Change Password duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Authentication |
| User Story ID | US-AUTH-005 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/change-password (proposed) |
| Related Database Table | users |
| Related UI Screen | /profile/change-password |
| Related Test Case | TC-AUTH-005 |

## US-AUTH-006 - Check Current Account Status

**Priority:** P1  
**Story Point:** 3 - Dong bo /api/me voi UI session.  
**Dependency:** Login

### User Story

As a Admin/Student,  
I want to kiem tra trang thai tai khoan hien tai,  
So that biet tai khoan con hop le hay bi chan.

### Description

Nguoi dung/He thong thuc hien **Check Current Account Status** trong module **Authentication**. Chuc nang xu ly cac du lieu chinh: **status active/inactive/locked, role, current user**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Login da san sang.
- Nguoi dung co dung role: Admin/Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin/Student thuc hien thao tac **Check Current Account Status** tren man hinh AuthContext/account menu.

### Main Flow

1. Admin/Student mo man hinh AuthContext/account menu.
2. He thong tai du lieu/phu thuoc can thiet: Login.
3. Admin/Student nhap hoac chon du lieu lien quan: status active/inactive/locked, role, current user.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/me.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: users, roles.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den status active/inactive/locked, role, current user phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Check Current Account Status thanh cong**

Given Admin/Student da dap ung dieu kien tien quyet
And du lieu hop le cho status active/inactive/locked, role, current user
When Admin/Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/me
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin/Student dang o man hinh chuc nang
When bo trong truong bat buoc cua status active/inactive/locked, role, current user
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu status active/inactive/locked, role, current user sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu status active/inactive/locked, role, current user nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/me
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Check Current Account Status duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Authentication |
| User Story ID | US-AUTH-006 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/me |
| Related Database Table | users, roles |
| Related UI Screen | AuthContext/account menu |
| Related Test Case | TC-AUTH-006 |

## US-AUTH-007 - Block Inactive or Locked Access

**Priority:** P0  
**Story Point:** 5 - Bao mat tren moi API protected.  
**Dependency:** Account status, AuthMiddleware

### User Story

As a System,  
I want to chan tai khoan inactive/locked truy cap,  
So that ngan thao tac tu tai khoan bi vo hieu hoa.

### Description

Nguoi dung/He thong thuc hien **Block Inactive or Locked Access** trong module **Authentication**. Chuc nang xu ly cac du lieu chinh: **inactive/locked account, stale token, forced logout**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Account status, AuthMiddleware da san sang.
- Nguoi dung co dung role: System.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

System thuc hien thao tac **Block Inactive or Locked Access** tren man hinh PrivateRoute/AdminRoute/StudentRoute.

### Main Flow

1. System mo man hinh PrivateRoute/AdminRoute/StudentRoute.
2. He thong tai du lieu/phu thuoc can thiet: Account status, AuthMiddleware.
3. System nhap hoac chon du lieu lien quan: inactive/locked account, stale token, forced logout.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den All protected API routes.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: users.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den inactive/locked account, stale token, forced logout phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Block Inactive or Locked Access thanh cong**

Given System da dap ung dieu kien tien quyet
And du lieu hop le cho inactive/locked account, stale token, forced logout
When System xac nhan thao tac
Then he thong phai xu ly thanh cong qua All protected API routes
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given System dang o man hinh chuc nang
When bo trong truong bat buoc cua inactive/locked account, stale token, forced logout
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu inactive/locked account, stale token, forced logout sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu inactive/locked account, stale token, forced logout nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap All protected API routes
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Block Inactive or Locked Access duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Authentication |
| User Story ID | US-AUTH-007 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | All protected API routes |
| Related Database Table | users |
| Related UI Screen | PrivateRoute/AdminRoute/StudentRoute |
| Related Test Case | TC-AUTH-007 |


## 6. Student Management User Stories

## US-STU-001 - View Student List

**Priority:** P1  
**Story Point:** 3 - Can pagination/search status.  
**Dependency:** Login, Admin authorization

### User Story

As a Admin,  
I want to xem danh sach sinh vien,  
So that quan ly tai khoan Student.

### Description

Nguoi dung/He thong thuc hien **View Student List** trong module **Student Management**. Chuc nang xu ly cac du lieu chinh: **pagination, status, student_code, email**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Login, Admin authorization da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **View Student List** tren man hinh /admin/students.

### Main Flow

1. Admin mo man hinh /admin/students.
2. He thong tai du lieu/phu thuoc can thiet: Login, Admin authorization.
3. Admin nhap hoac chon du lieu lien quan: pagination, status, student_code, email.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/admin/students.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: users, roles.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den pagination, status, student_code, email phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - View Student List thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho pagination, status, student_code, email
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/admin/students
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua pagination, status, student_code, email
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu pagination, status, student_code, email sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu pagination, status, student_code, email nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/admin/students
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang View Student List duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Student Management |
| User Story ID | US-STU-001 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/admin/students |
| Related Database Table | users, roles |
| Related UI Screen | /admin/students |
| Related Test Case | TC-STU-001 |

## US-STU-002 - Create Student

**Priority:** P1  
**Story Point:** 5 - Co duplicate email/student_code va hash password.  
**Dependency:** View Student List

### User Story

As a Admin,  
I want to them sinh vien moi,  
So that tao tai khoan hoc tap cho sinh vien.

### Description

Nguoi dung/He thong thuc hien **Create Student** trong module **Student Management**. Chuc nang xu ly cac du lieu chinh: **full_name, email, student_code, phone, password, status**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- View Student List da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **Create Student** tren man hinh /admin/students/create.

### Main Flow

1. Admin mo man hinh /admin/students/create.
2. He thong tai du lieu/phu thuoc can thiet: View Student List.
3. Admin nhap hoac chon du lieu lien quan: full_name, email, student_code, phone, password, status.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/admin/students.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: users, roles.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den full_name, email, student_code, phone, password, status phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Create Student thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho full_name, email, student_code, phone, password, status
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/admin/students
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua full_name, email, student_code, phone, password, status
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu full_name, email, student_code, phone, password, status sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu full_name, email, student_code, phone, password, status nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/admin/students
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Create Student duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Student Management |
| User Story ID | US-STU-002 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/admin/students |
| Related Database Table | users, roles |
| Related UI Screen | /admin/students/create |
| Related Test Case | TC-STU-002 |

## US-STU-003 - Update Student Information

**Priority:** P1  
**Story Point:** 5 - Can duplicate check va khong doi role trai phep.  
**Dependency:** Student exists

### User Story

As a Admin,  
I want to sua thong tin sinh vien,  
So that giu ho so sinh vien chinh xac.

### Description

Nguoi dung/He thong thuc hien **Update Student Information** trong module **Student Management**. Chuc nang xu ly cac du lieu chinh: **full_name, email, phone, student_code, status**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Student exists da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **Update Student Information** tren man hinh /admin/students/{id}/edit.

### Main Flow

1. Admin mo man hinh /admin/students/{id}/edit.
2. He thong tai du lieu/phu thuoc can thiet: Student exists.
3. Admin nhap hoac chon du lieu lien quan: full_name, email, phone, student_code, status.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/admin/students/{id}.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: users.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den full_name, email, phone, student_code, status phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Update Student Information thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho full_name, email, phone, student_code, status
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/admin/students/{id}
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua full_name, email, phone, student_code, status
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu full_name, email, phone, student_code, status sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu full_name, email, phone, student_code, status nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/admin/students/{id}
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Update Student Information duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Student Management |
| User Story ID | US-STU-003 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/admin/students/{id} |
| Related Database Table | users |
| Related UI Screen | /admin/students/{id}/edit |
| Related Test Case | TC-STU-003 |

## US-STU-004 - Delete Student

**Priority:** P1  
**Story Point:** 5 - Anh huong enrollment, submission, roadmap; can soft delete/cascade rule.  
**Dependency:** Student exists

### User Story

As a Admin,  
I want to xoa sinh vien,  
So that loai bo tai khoan khong con su dung.

### Description

Nguoi dung/He thong thuc hien **Delete Student** trong module **Student Management**. Chuc nang xu ly cac du lieu chinh: **foreign key, soft delete/cascade, not delete admin**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Student exists da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **Delete Student** tren man hinh /admin/students/{id}.

### Main Flow

1. Admin mo man hinh /admin/students/{id}.
2. He thong tai du lieu/phu thuoc can thiet: Student exists.
3. Admin nhap hoac chon du lieu lien quan: foreign key, soft delete/cascade, not delete admin.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/admin/students/{id}.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: users, student_subjects, assignment_submissions, learning_roadmaps.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den foreign key, soft delete/cascade, not delete admin phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Delete Student thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho foreign key, soft delete/cascade, not delete admin
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/admin/students/{id}
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua foreign key, soft delete/cascade, not delete admin
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu foreign key, soft delete/cascade, not delete admin sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu foreign key, soft delete/cascade, not delete admin nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/admin/students/{id}
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Delete Student duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Student Management |
| User Story ID | US-STU-004 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/admin/students/{id} |
| Related Database Table | users, student_subjects, assignment_submissions, learning_roadmaps |
| Related UI Screen | /admin/students/{id} |
| Related Test Case | TC-STU-004 |

## US-STU-005 - Disable Student Account

**Priority:** P1  
**Story Point:** 3 - Doi status va chan login.  
**Dependency:** Student exists

### User Story

As a Admin,  
I want to disable tai khoan sinh vien,  
So that tam dung truy cap nhung giu du lieu.

### Description

Nguoi dung/He thong thuc hien **Disable Student Account** trong module **Student Management**. Chuc nang xu ly cac du lieu chinh: **status inactive, current sessions**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Student exists da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **Disable Student Account** tren man hinh /admin/students.

### Main Flow

1. Admin mo man hinh /admin/students.
2. He thong tai du lieu/phu thuoc can thiet: Student exists.
3. Admin nhap hoac chon du lieu lien quan: status inactive, current sessions.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/admin/students/{id}/disable.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: users.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den status inactive, current sessions phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Disable Student Account thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho status inactive, current sessions
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/admin/students/{id}/disable
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua status inactive, current sessions
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu status inactive, current sessions sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu status inactive, current sessions nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/admin/students/{id}/disable
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Disable Student Account duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Student Management |
| User Story ID | US-STU-005 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/admin/students/{id}/disable |
| Related Database Table | users |
| Related UI Screen | /admin/students |
| Related Test Case | TC-STU-005 |

## US-STU-006 - Enable Student Account

**Priority:** P1  
**Story Point:** 3 - Doi status va verify login lai.  
**Dependency:** Disabled student account

### User Story

As a Admin,  
I want to enable tai khoan sinh vien,  
So that cho sinh vien tiep tuc su dung.

### Description

Nguoi dung/He thong thuc hien **Enable Student Account** trong module **Student Management**. Chuc nang xu ly cac du lieu chinh: **status active, login allowed**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Disabled student account da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **Enable Student Account** tren man hinh /admin/students.

### Main Flow

1. Admin mo man hinh /admin/students.
2. He thong tai du lieu/phu thuoc can thiet: Disabled student account.
3. Admin nhap hoac chon du lieu lien quan: status active, login allowed.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/admin/students/{id}/enable.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: users.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den status active, login allowed phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Enable Student Account thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho status active, login allowed
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/admin/students/{id}/enable
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua status active, login allowed
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu status active, login allowed sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu status active, login allowed nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/admin/students/{id}/enable
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Enable Student Account duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Student Management |
| User Story ID | US-STU-006 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/admin/students/{id}/enable |
| Related Database Table | users |
| Related UI Screen | /admin/students |
| Related Test Case | TC-STU-006 |

## US-STU-007 - Import Students by CSV/Excel

**Priority:** P1  
**Story Point:** 13 - Phuc tap do file parsing, row validation, duplicate, transaction va report.  
**Dependency:** Admin authorization, import template

### User Story

As a Admin,  
I want to import danh sach sinh vien tu CSV/Excel,  
So that tao nhieu tai khoan nhanh va giam nhap tay.

### Description

Nguoi dung/He thong thuc hien **Import Students by CSV/Excel** trong module **Student Management**. Chuc nang xu ly cac du lieu chinh: **CSV/XLSX template, row errors, duplicate email/student_code, partial/rollback policy**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Admin authorization, import template da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **Import Students by CSV/Excel** tren man hinh /admin/students/import.

### Main Flow

1. Admin mo man hinh /admin/students/import.
2. He thong tai du lieu/phu thuoc can thiet: Admin authorization, import template.
3. Admin nhap hoac chon du lieu lien quan: CSV/XLSX template, row errors, duplicate email/student_code, partial/rollback policy.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/admin/students/import.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: users, roles, import_logs (proposed).
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den CSV/XLSX template, row errors, duplicate email/student_code, partial/rollback policy phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Import Students by CSV/Excel thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho CSV/XLSX template, row errors, duplicate email/student_code, partial/rollback policy
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/admin/students/import
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua CSV/XLSX template, row errors, duplicate email/student_code, partial/rollback policy
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu CSV/XLSX template, row errors, duplicate email/student_code, partial/rollback policy sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu CSV/XLSX template, row errors, duplicate email/student_code, partial/rollback policy nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/admin/students/import
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

**AC07 - Duplicate data**

Given du lieu CSV/XLSX template, row errors, duplicate email/student_code, partial/rollback policy vi pham rang buoc duy nhat neu chuc nang co duplicate rule
When submit
Then he thong phai tu choi duplicate
And khong tao ban ghi trung.

**AC08 - Server/database error**

Given backend hoac database gap loi
When Admin thuc hien thao tac
Then he thong phai tra 500/503 than thien
And khong luu du lieu dang do.

**AC09 - UI state consistency**

Given thao tac Import Students by CSV/Excel thanh cong hoac that bai
When UI nhan response
Then loading state ket thuc dung luc
And success/error/empty state khong gay nham lan.

**AC10 - Audit/log/security**

Given chuc nang Import Students by CSV/Excel duoc thuc hien
When backend ghi log hoac audit
Then log du du lieu debug can thiet
And khong ghi password, token, API key hoac du lieu nhay cam.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Import Students by CSV/Excel duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |
| OUT-08 | Import Report | Bao cao total/success/failed/row errors. |
| OUT-09 | Import Template | Template tai ve dung cot bat buoc. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Student Management |
| User Story ID | US-STU-007 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10 |
| Related API | /api/admin/students/import |
| Related Database Table | users, roles, import_logs (proposed) |
| Related UI Screen | /admin/students/import |
| Related Test Case | TC-STU-007 |

## US-STU-008 - Search and Filter Students

**Priority:** P1  
**Story Point:** 3 - Query list va empty state.  
**Dependency:** View Student List

### User Story

As a Admin,  
I want to tim kiem va loc sinh vien,  
So that tim nhanh tai khoan can quan ly.

### Description

Nguoi dung/He thong thuc hien **Search and Filter Students** trong module **Student Management**. Chuc nang xu ly cac du lieu chinh: **search keyword, status active/inactive/locked, pagination**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- View Student List da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **Search and Filter Students** tren man hinh /admin/students.

### Main Flow

1. Admin mo man hinh /admin/students.
2. He thong tai du lieu/phu thuoc can thiet: View Student List.
3. Admin nhap hoac chon du lieu lien quan: search keyword, status active/inactive/locked, pagination.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/admin/students?search=&status=&page=.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: users, roles.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den search keyword, status active/inactive/locked, pagination phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Search and Filter Students thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho search keyword, status active/inactive/locked, pagination
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/admin/students?search=&status=&page=
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua search keyword, status active/inactive/locked, pagination
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu search keyword, status active/inactive/locked, pagination sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu search keyword, status active/inactive/locked, pagination nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/admin/students?search=&status=&page=
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Search and Filter Students duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Student Management |
| User Story ID | US-STU-008 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/admin/students?search=&status=&page= |
| Related Database Table | users, roles |
| Related UI Screen | /admin/students |
| Related Test Case | TC-STU-008 |


## 7. Subject Management User Stories

## US-SUB-001 - View Subject List

**Priority:** P1  
**Story Point:** 3 - Can scope theo role.  
**Dependency:** Login

### User Story

As a Admin/Student,  
I want to xem danh sach mon hoc,  
So that biet mon dang quan ly hoac dang hoc.

### Description

Nguoi dung/He thong thuc hien **View Subject List** trong module **Subject Management**. Chuc nang xu ly cac du lieu chinh: **subject code, name, teacher, study time, status**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Login da san sang.
- Nguoi dung co dung role: Admin/Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin/Student thuc hien thao tac **View Subject List** tren man hinh /admin/subjects, /student/subjects.

### Main Flow

1. Admin/Student mo man hinh /admin/subjects, /student/subjects.
2. He thong tai du lieu/phu thuoc can thiet: Login.
3. Admin/Student nhap hoac chon du lieu lien quan: subject code, name, teacher, study time, status.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/subjects or /api/student/my-subjects.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: subjects, student_subjects.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den subject code, name, teacher, study time, status phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - View Subject List thanh cong**

Given Admin/Student da dap ung dieu kien tien quyet
And du lieu hop le cho subject code, name, teacher, study time, status
When Admin/Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/subjects or /api/student/my-subjects
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin/Student dang o man hinh chuc nang
When bo trong truong bat buoc cua subject code, name, teacher, study time, status
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu subject code, name, teacher, study time, status sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu subject code, name, teacher, study time, status nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/subjects or /api/student/my-subjects
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang View Subject List duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Subject Management |
| User Story ID | US-SUB-001 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/subjects or /api/student/my-subjects |
| Related Database Table | subjects, student_subjects |
| Related UI Screen | /admin/subjects, /student/subjects |
| Related Test Case | TC-SUB-001 |

## US-SUB-002 - Create Subject

**Priority:** P1  
**Story Point:** 5 - Co validation ma mon/ten/giang vien/thoi gian.  
**Dependency:** Admin authorization

### User Story

As a Admin,  
I want to them mon hoc,  
So that mo mon hoc moi cho sinh vien.

### Description

Nguoi dung/He thong thuc hien **Create Subject** trong module **Subject Management**. Chuc nang xu ly cac du lieu chinh: **code, name, teacher, schedule_time, description, duplicate code**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Admin authorization da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **Create Subject** tren man hinh /admin/subjects/create.

### Main Flow

1. Admin mo man hinh /admin/subjects/create.
2. He thong tai du lieu/phu thuoc can thiet: Admin authorization.
3. Admin nhap hoac chon du lieu lien quan: code, name, teacher, schedule_time, description, duplicate code.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/subjects.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: subjects.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den code, name, teacher, schedule_time, description, duplicate code phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Create Subject thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho code, name, teacher, schedule_time, description, duplicate code
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/subjects
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua code, name, teacher, schedule_time, description, duplicate code
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu code, name, teacher, schedule_time, description, duplicate code sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu code, name, teacher, schedule_time, description, duplicate code nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/subjects
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Create Subject duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Subject Management |
| User Story ID | US-SUB-002 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/subjects |
| Related Database Table | subjects |
| Related UI Screen | /admin/subjects/create |
| Related Test Case | TC-SUB-002 |

## US-SUB-003 - Update Subject

**Priority:** P1  
**Story Point:** 5 - Anh huong assignment, enrollment va roadmap.  
**Dependency:** Subject exists

### User Story

As a Admin,  
I want to sua mon hoc,  
So that cap nhat thong tin mon hoc.

### Description

Nguoi dung/He thong thuc hien **Update Subject** trong module **Subject Management**. Chuc nang xu ly cac du lieu chinh: **code, name, teacher, study time, description, archived status**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Subject exists da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **Update Subject** tren man hinh /admin/subjects/{id}/edit.

### Main Flow

1. Admin mo man hinh /admin/subjects/{id}/edit.
2. He thong tai du lieu/phu thuoc can thiet: Subject exists.
3. Admin nhap hoac chon du lieu lien quan: code, name, teacher, study time, description, archived status.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/subjects/{id}.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: subjects.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den code, name, teacher, study time, description, archived status phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Update Subject thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho code, name, teacher, study time, description, archived status
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/subjects/{id}
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua code, name, teacher, study time, description, archived status
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu code, name, teacher, study time, description, archived status sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu code, name, teacher, study time, description, archived status nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/subjects/{id}
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Update Subject duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Subject Management |
| User Story ID | US-SUB-003 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/subjects/{id} |
| Related Database Table | subjects |
| Related UI Screen | /admin/subjects/{id}/edit |
| Related Test Case | TC-SUB-003 |

## US-SUB-004 - Delete Subject

**Priority:** P1  
**Story Point:** 5 - Can check assignment/enrollment/goal dependency.  
**Dependency:** Subject exists

### User Story

As a Admin,  
I want to xoa mon hoc,  
So that loai bo mon khong con ap dung.

### Description

Nguoi dung/He thong thuc hien **Delete Subject** trong module **Subject Management**. Chuc nang xu ly cac du lieu chinh: **foreign key, archived/soft delete, dependency warning**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Subject exists da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **Delete Subject** tren man hinh /admin/subjects/{id}.

### Main Flow

1. Admin mo man hinh /admin/subjects/{id}.
2. He thong tai du lieu/phu thuoc can thiet: Subject exists.
3. Admin nhap hoac chon du lieu lien quan: foreign key, archived/soft delete, dependency warning.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/subjects/{id}.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: subjects, student_subjects, assignments, learning_goals.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den foreign key, archived/soft delete, dependency warning phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Delete Subject thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho foreign key, archived/soft delete, dependency warning
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/subjects/{id}
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua foreign key, archived/soft delete, dependency warning
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu foreign key, archived/soft delete, dependency warning sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu foreign key, archived/soft delete, dependency warning nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/subjects/{id}
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Delete Subject duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Subject Management |
| User Story ID | US-SUB-004 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/subjects/{id} |
| Related Database Table | subjects, student_subjects, assignments, learning_goals |
| Related UI Screen | /admin/subjects/{id} |
| Related Test Case | TC-SUB-004 |

## US-SUB-005 - Search and Filter Subjects

**Priority:** P1  
**Story Point:** 3 - Query list va role scope.  
**Dependency:** View Subject List

### User Story

As a Admin/Student,  
I want to tim kiem/loc mon hoc,  
So that tim nhanh mon theo ma, ten, giang vien, status.

### Description

Nguoi dung/He thong thuc hien **Search and Filter Subjects** trong module **Subject Management**. Chuc nang xu ly cac du lieu chinh: **keyword, active/archived, empty state**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- View Subject List da san sang.
- Nguoi dung co dung role: Admin/Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin/Student thuc hien thao tac **Search and Filter Subjects** tren man hinh /admin/subjects, /student/subjects.

### Main Flow

1. Admin/Student mo man hinh /admin/subjects, /student/subjects.
2. He thong tai du lieu/phu thuoc can thiet: View Subject List.
3. Admin/Student nhap hoac chon du lieu lien quan: keyword, active/archived, empty state.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/subjects?search=&status=.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: subjects.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den keyword, active/archived, empty state phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Search and Filter Subjects thanh cong**

Given Admin/Student da dap ung dieu kien tien quyet
And du lieu hop le cho keyword, active/archived, empty state
When Admin/Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/subjects?search=&status=
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin/Student dang o man hinh chuc nang
When bo trong truong bat buoc cua keyword, active/archived, empty state
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu keyword, active/archived, empty state sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu keyword, active/archived, empty state nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/subjects?search=&status=
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Search and Filter Subjects duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Subject Management |
| User Story ID | US-SUB-005 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/subjects?search=&status= |
| Related Database Table | subjects |
| Related UI Screen | /admin/subjects, /student/subjects |
| Related Test Case | TC-SUB-005 |

## US-SUB-006 - Assign Student to Subject

**Priority:** P1  
**Story Point:** 5 - Unique enrollment va status active.  
**Dependency:** Subject exists, Student exists

### User Story

As a Admin,  
I want to gan sinh vien vao mon hoc,  
So that cho sinh vien xem mon, bai tap va tao muc tieu.

### Description

Nguoi dung/He thong thuc hien **Assign Student to Subject** trong module **Subject Management**. Chuc nang xu ly cac du lieu chinh: **subject active, student active, unique student_subject**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Subject exists, Student exists da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **Assign Student to Subject** tren man hinh /admin/subjects/{subjectId}/students.

### Main Flow

1. Admin mo man hinh /admin/subjects/{subjectId}/students.
2. He thong tai du lieu/phu thuoc can thiet: Subject exists, Student exists.
3. Admin nhap hoac chon du lieu lien quan: subject active, student active, unique student_subject.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/admin/subjects/{subjectId}/students.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: student_subjects, users, subjects.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den subject active, student active, unique student_subject phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Assign Student to Subject thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho subject active, student active, unique student_subject
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/admin/subjects/{subjectId}/students
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua subject active, student active, unique student_subject
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu subject active, student active, unique student_subject sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu subject active, student active, unique student_subject nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/admin/subjects/{subjectId}/students
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Assign Student to Subject duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Subject Management |
| User Story ID | US-SUB-006 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/admin/subjects/{subjectId}/students |
| Related Database Table | student_subjects, users, subjects |
| Related UI Screen | /admin/subjects/{subjectId}/students |
| Related Test Case | TC-SUB-006 |

## US-SUB-007 - Remove Student from Subject

**Priority:** P1  
**Story Point:** 5 - Anh huong assignment/roadmap cua sinh vien.  
**Dependency:** Assigned student

### User Story

As a Admin,  
I want to xoa sinh vien khoi mon hoc,  
So that thu hoi quyen truy cap mon.

### Description

Nguoi dung/He thong thuc hien **Remove Student from Subject** trong module **Subject Management**. Chuc nang xu ly cac du lieu chinh: **status removed, access revoke, existing submissions policy**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Assigned student da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **Remove Student from Subject** tren man hinh /admin/subjects/{subjectId}/students.

### Main Flow

1. Admin mo man hinh /admin/subjects/{subjectId}/students.
2. He thong tai du lieu/phu thuoc can thiet: Assigned student.
3. Admin nhap hoac chon du lieu lien quan: status removed, access revoke, existing submissions policy.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/admin/subjects/{subjectId}/students/{studentId}.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: student_subjects.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den status removed, access revoke, existing submissions policy phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Remove Student from Subject thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho status removed, access revoke, existing submissions policy
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/admin/subjects/{subjectId}/students/{studentId}
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua status removed, access revoke, existing submissions policy
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu status removed, access revoke, existing submissions policy sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu status removed, access revoke, existing submissions policy nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/admin/subjects/{subjectId}/students/{studentId}
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Remove Student from Subject duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Subject Management |
| User Story ID | US-SUB-007 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/admin/subjects/{subjectId}/students/{studentId} |
| Related Database Table | student_subjects |
| Related UI Screen | /admin/subjects/{subjectId}/students |
| Related Test Case | TC-SUB-007 |


## 8. Assignment User Stories

## US-ASM-001 - Create Assignment

**Priority:** P1  
**Story Point:** 5 - Lien quan subject, deadline, file dinh kem.  
**Dependency:** Admin authorization, Subject exists

### User Story

As a Admin,  
I want to tao bai tap,  
So that giao nhiem vu hoc tap cho sinh vien.

### Description

Nguoi dung/He thong thuc hien **Create Assignment** trong module **Assignment Management**. Chuc nang xu ly cac du lieu chinh: **subject_id, title, description, deadline, attachment, status**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Admin authorization, Subject exists da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **Create Assignment** tren man hinh /admin/assignments/create.

### Main Flow

1. Admin mo man hinh /admin/assignments/create.
2. He thong tai du lieu/phu thuoc can thiet: Admin authorization, Subject exists.
3. Admin nhap hoac chon du lieu lien quan: subject_id, title, description, deadline, attachment, status.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/admin/assignments.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: assignments, subjects.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den subject_id, title, description, deadline, attachment, status phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Create Assignment thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho subject_id, title, description, deadline, attachment, status
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/admin/assignments
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua subject_id, title, description, deadline, attachment, status
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu subject_id, title, description, deadline, attachment, status sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu subject_id, title, description, deadline, attachment, status nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/admin/assignments
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Create Assignment duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Assignment Management |
| User Story ID | US-ASM-001 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/admin/assignments |
| Related Database Table | assignments, subjects |
| Related UI Screen | /admin/assignments/create |
| Related Test Case | TC-ASM-001 |

## US-ASM-002 - Update Assignment

**Priority:** P1  
**Story Point:** 5 - Co submission da ton tai va deadline change.  
**Dependency:** Assignment exists

### User Story

As a Admin,  
I want to chinh sua bai tap,  
So that cap nhat yeu cau/deadline.

### Description

Nguoi dung/He thong thuc hien **Update Assignment** trong module **Assignment Management**. Chuc nang xu ly cac du lieu chinh: **title, description, deadline, attachment, status open/closed/draft**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Assignment exists da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **Update Assignment** tren man hinh /admin/assignments/{id}/edit.

### Main Flow

1. Admin mo man hinh /admin/assignments/{id}/edit.
2. He thong tai du lieu/phu thuoc can thiet: Assignment exists.
3. Admin nhap hoac chon du lieu lien quan: title, description, deadline, attachment, status open/closed/draft.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/admin/assignments/{id}.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: assignments.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den title, description, deadline, attachment, status open/closed/draft phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Update Assignment thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho title, description, deadline, attachment, status open/closed/draft
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/admin/assignments/{id}
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua title, description, deadline, attachment, status open/closed/draft
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu title, description, deadline, attachment, status open/closed/draft sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu title, description, deadline, attachment, status open/closed/draft nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/admin/assignments/{id}
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Update Assignment duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Assignment Management |
| User Story ID | US-ASM-002 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/admin/assignments/{id} |
| Related Database Table | assignments |
| Related UI Screen | /admin/assignments/{id}/edit |
| Related Test Case | TC-ASM-002 |

## US-ASM-003 - Delete Assignment

**Priority:** P1  
**Story Point:** 5 - Can policy voi bai nop da ton tai.  
**Dependency:** Assignment exists

### User Story

As a Admin,  
I want to xoa bai tap,  
So that loai bo bai tap tao sai.

### Description

Nguoi dung/He thong thuc hien **Delete Assignment** trong module **Assignment Management**. Chuc nang xu ly cac du lieu chinh: **soft delete, existing submissions, permission**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Assignment exists da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **Delete Assignment** tren man hinh /admin/assignments/{id}.

### Main Flow

1. Admin mo man hinh /admin/assignments/{id}.
2. He thong tai du lieu/phu thuoc can thiet: Assignment exists.
3. Admin nhap hoac chon du lieu lien quan: soft delete, existing submissions, permission.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/admin/assignments/{id}.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: assignments, assignment_submissions.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den soft delete, existing submissions, permission phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Delete Assignment thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho soft delete, existing submissions, permission
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/admin/assignments/{id}
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua soft delete, existing submissions, permission
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu soft delete, existing submissions, permission sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu soft delete, existing submissions, permission nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/admin/assignments/{id}
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Delete Assignment duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Assignment Management |
| User Story ID | US-ASM-003 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/admin/assignments/{id} |
| Related Database Table | assignments, assignment_submissions |
| Related UI Screen | /admin/assignments/{id} |
| Related Test Case | TC-ASM-003 |

## US-ASM-004 - Set Assignment Deadline and Status

**Priority:** P1  
**Story Point:** 5 - Anh huong late/open/closed.  
**Dependency:** Assignment exists

### User Story

As a Admin,  
I want to dat deadline va status bai tap,  
So that kiem soat thoi han va trang thai nop.

### Description

Nguoi dung/He thong thuc hien **Set Assignment Deadline and Status** trong module **Assignment Management**. Chuc nang xu ly cac du lieu chinh: **deadline future/past, status draft/open/closed, late rule**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Assignment exists da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **Set Assignment Deadline and Status** tren man hinh /admin/assignments/{id}/edit.

### Main Flow

1. Admin mo man hinh /admin/assignments/{id}/edit.
2. He thong tai du lieu/phu thuoc can thiet: Assignment exists.
3. Admin nhap hoac chon du lieu lien quan: deadline future/past, status draft/open/closed, late rule.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/admin/assignments/{id}.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: assignments.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den deadline future/past, status draft/open/closed, late rule phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Set Assignment Deadline and Status thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho deadline future/past, status draft/open/closed, late rule
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/admin/assignments/{id}
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua deadline future/past, status draft/open/closed, late rule
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu deadline future/past, status draft/open/closed, late rule sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu deadline future/past, status draft/open/closed, late rule nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/admin/assignments/{id}
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Set Assignment Deadline and Status duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Assignment Management |
| User Story ID | US-ASM-004 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/admin/assignments/{id} |
| Related Database Table | assignments |
| Related UI Screen | /admin/assignments/{id}/edit |
| Related Test Case | TC-ASM-004 |

## US-ASM-005 - View Assignment List as Admin

**Priority:** P2  
**Story Point:** 3 - List/filter thong tin.  
**Dependency:** Admin authorization

### User Story

As a Admin,  
I want to xem danh sach bai tap,  
So that theo doi bai tap theo mon va deadline.

### Description

Nguoi dung/He thong thuc hien **View Assignment List as Admin** trong module **Assignment Management**. Chuc nang xu ly cac du lieu chinh: **subject filter, status, deadline sort**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Admin authorization da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **View Assignment List as Admin** tren man hinh /admin/assignments.

### Main Flow

1. Admin mo man hinh /admin/assignments.
2. He thong tai du lieu/phu thuoc can thiet: Admin authorization.
3. Admin nhap hoac chon du lieu lien quan: subject filter, status, deadline sort.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/admin/assignments.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: assignments, subjects.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den subject filter, status, deadline sort phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - View Assignment List as Admin thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho subject filter, status, deadline sort
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/admin/assignments
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua subject filter, status, deadline sort
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu subject filter, status, deadline sort sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu subject filter, status, deadline sort nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/admin/assignments
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang View Assignment List as Admin duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Assignment Management |
| User Story ID | US-ASM-005 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/admin/assignments |
| Related Database Table | assignments, subjects |
| Related UI Screen | /admin/assignments |
| Related Test Case | TC-ASM-005 |

## US-ASM-006 - View Assignments and Deadlines as Student

**Priority:** P1  
**Story Point:** 3 - Phai loc theo mon duoc gan.  
**Dependency:** Student assigned to subject

### User Story

As a Student,  
I want to xem bai tap va deadline,  
So that biet viec can lam.

### Description

Nguoi dung/He thong thuc hien **View Assignments and Deadlines as Student** trong module **Assignment Management**. Chuc nang xu ly cac du lieu chinh: **assigned subjects only, upcoming deadline, submission status**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Student assigned to subject da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **View Assignments and Deadlines as Student** tren man hinh /student/assignments.

### Main Flow

1. Student mo man hinh /student/assignments.
2. He thong tai du lieu/phu thuoc can thiet: Student assigned to subject.
3. Student nhap hoac chon du lieu lien quan: assigned subjects only, upcoming deadline, submission status.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/assignments.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: assignments, student_subjects.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den assigned subjects only, upcoming deadline, submission status phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - View Assignments and Deadlines as Student thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho assigned subjects only, upcoming deadline, submission status
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/assignments
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua assigned subjects only, upcoming deadline, submission status
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu assigned subjects only, upcoming deadline, submission status sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu assigned subjects only, upcoming deadline, submission status nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/assignments
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang View Assignments and Deadlines as Student duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Assignment Management |
| User Story ID | US-ASM-006 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/assignments |
| Related Database Table | assignments, student_subjects |
| Related UI Screen | /student/assignments |
| Related Test Case | TC-ASM-006 |

## US-ASM-007 - Submit Assignment

**Priority:** P1  
**Story Point:** 8 - Quan trong do upload, duplicate, late status, ownership.  
**Dependency:** Login, Assignment open, Student assigned to subject

### User Story

As a Student,  
I want to nop bai tap,  
So that hoan thanh yeu cau mon hoc.

### Description

Nguoi dung/He thong thuc hien **Submit Assignment** trong module **Assignment Management**. Chuc nang xu ly cac du lieu chinh: **content/file, file size/type, unique assignment_id+student_id, late submitted_at**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Login, Assignment open, Student assigned to subject da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **Submit Assignment** tren man hinh /student/assignments/{assignmentId}/submit.

### Main Flow

1. Student mo man hinh /student/assignments/{assignmentId}/submit.
2. He thong tai du lieu/phu thuoc can thiet: Login, Assignment open, Student assigned to subject.
3. Student nhap hoac chon du lieu lien quan: content/file, file size/type, unique assignment_id+student_id, late submitted_at.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/assignments/{assignmentId}/submit.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: assignment_submissions, assignments.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den content/file, file size/type, unique assignment_id+student_id, late submitted_at phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Submit Assignment thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho content/file, file size/type, unique assignment_id+student_id, late submitted_at
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/assignments/{assignmentId}/submit
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua content/file, file size/type, unique assignment_id+student_id, late submitted_at
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu content/file, file size/type, unique assignment_id+student_id, late submitted_at sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu content/file, file size/type, unique assignment_id+student_id, late submitted_at nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/assignments/{assignmentId}/submit
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

**AC07 - Duplicate data**

Given du lieu content/file, file size/type, unique assignment_id+student_id, late submitted_at vi pham rang buoc duy nhat neu chuc nang co duplicate rule
When submit
Then he thong phai tu choi duplicate
And khong tao ban ghi trung.

**AC08 - Server/database error**

Given backend hoac database gap loi
When Student thuc hien thao tac
Then he thong phai tra 500/503 than thien
And khong luu du lieu dang do.

**AC09 - UI state consistency**

Given thao tac Submit Assignment thanh cong hoac that bai
When UI nhan response
Then loading state ket thuc dung luc
And success/error/empty state khong gay nham lan.

**AC10 - Audit/log/security**

Given chuc nang Submit Assignment duoc thuc hien
When backend ghi log hoac audit
Then log du du lieu debug can thiet
And khong ghi password, token, API key hoac du lieu nhay cam.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Submit Assignment duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |
| OUT-08 | Uploaded File | File luu dung storage va lien ket submission. |
| OUT-09 | Submission Status | submitted/late dung theo deadline server. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Assignment Management |
| User Story ID | US-ASM-007 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10 |
| Related API | /api/student/assignments/{assignmentId}/submit |
| Related Database Table | assignment_submissions, assignments |
| Related UI Screen | /student/assignments/{assignmentId}/submit |
| Related Test Case | TC-ASM-007 |

## US-ASM-008 - View Submission Status as Student

**Priority:** P1  
**Story Point:** 3 - Status dong bo voi submission.  
**Dependency:** Submit Assignment

### User Story

As a Student,  
I want to xem trang thai nop bai,  
So that biet da nop, tre han hay da cham diem.

### Description

Nguoi dung/He thong thuc hien **View Submission Status as Student** trong module **Assignment Management**. Chuc nang xu ly cac du lieu chinh: **submitted/late/graded, submitted_at, file/content**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Submit Assignment da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **View Submission Status as Student** tren man hinh /student/submissions/{id}.

### Main Flow

1. Student mo man hinh /student/submissions/{id}.
2. He thong tai du lieu/phu thuoc can thiet: Submit Assignment.
3. Student nhap hoac chon du lieu lien quan: submitted/late/graded, submitted_at, file/content.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/assignments/{assignmentId}/submission.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: assignment_submissions.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den submitted/late/graded, submitted_at, file/content phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - View Submission Status as Student thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho submitted/late/graded, submitted_at, file/content
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/assignments/{assignmentId}/submission
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua submitted/late/graded, submitted_at, file/content
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu submitted/late/graded, submitted_at, file/content sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu submitted/late/graded, submitted_at, file/content nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/assignments/{assignmentId}/submission
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang View Submission Status as Student duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Assignment Management |
| User Story ID | US-ASM-008 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/assignments/{assignmentId}/submission |
| Related Database Table | assignment_submissions |
| Related UI Screen | /student/submissions/{id} |
| Related Test Case | TC-ASM-008 |


## 9. Submission & Grading User Stories

## US-GRD-001 - View Submitted and Missing Students

**Priority:** P1  
**Story Point:** 5 - Join enrollment va submissions.  
**Dependency:** Assignment exists, Subject enrollment

### User Story

As a Admin,  
I want to xem sinh vien da nop/chua nop,  
So that theo doi muc do hoan thanh bai tap.

### Description

Nguoi dung/He thong thuc hien **View Submitted and Missing Students** trong module **Submission & Grading**. Chuc nang xu ly cac du lieu chinh: **submitted/missing/late, enrolled students**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Assignment exists, Subject enrollment da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **View Submitted and Missing Students** tren man hinh /admin/assignments/{assignmentId}/submissions.

### Main Flow

1. Admin mo man hinh /admin/assignments/{assignmentId}/submissions.
2. He thong tai du lieu/phu thuoc can thiet: Assignment exists, Subject enrollment.
3. Admin nhap hoac chon du lieu lien quan: submitted/missing/late, enrolled students.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/admin/assignments/{assignmentId}/submissions.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: assignments, student_subjects, assignment_submissions.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den submitted/missing/late, enrolled students phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - View Submitted and Missing Students thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho submitted/missing/late, enrolled students
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/admin/assignments/{assignmentId}/submissions
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua submitted/missing/late, enrolled students
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu submitted/missing/late, enrolled students sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu submitted/missing/late, enrolled students nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/admin/assignments/{assignmentId}/submissions
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang View Submitted and Missing Students duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Submission & Grading |
| User Story ID | US-GRD-001 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/admin/assignments/{assignmentId}/submissions |
| Related Database Table | assignments, student_subjects, assignment_submissions |
| Related UI Screen | /admin/assignments/{assignmentId}/submissions |
| Related Test Case | TC-GRD-001 |

## US-GRD-002 - View Submission Detail

**Priority:** P1  
**Story Point:** 5 - Permission va file access.  
**Dependency:** Submission exists

### User Story

As a Admin,  
I want to xem chi tiet bai nop,  
So that danh gia noi dung va file nop.

### Description

Nguoi dung/He thong thuc hien **View Submission Detail** trong module **Submission & Grading**. Chuc nang xu ly cac du lieu chinh: **content, file, submitted_at, status**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Submission exists da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **View Submission Detail** tren man hinh /admin/submissions/{id}.

### Main Flow

1. Admin mo man hinh /admin/submissions/{id}.
2. He thong tai du lieu/phu thuoc can thiet: Submission exists.
3. Admin nhap hoac chon du lieu lien quan: content, file, submitted_at, status.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/admin/submissions/{id}.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: assignment_submissions, assignments, users.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den content, file, submitted_at, status phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - View Submission Detail thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho content, file, submitted_at, status
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/admin/submissions/{id}
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua content, file, submitted_at, status
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu content, file, submitted_at, status sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu content, file, submitted_at, status nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/admin/submissions/{id}
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang View Submission Detail duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Submission & Grading |
| User Story ID | US-GRD-002 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/admin/submissions/{id} |
| Related Database Table | assignment_submissions, assignments, users |
| Related UI Screen | /admin/submissions/{id} |
| Related Test Case | TC-GRD-002 |

## US-GRD-003 - Grade Submission and Add Feedback

**Priority:** P1  
**Story Point:** 8 - Score boundary, status graded va audit.  
**Dependency:** View Submission Detail

### User Story

As a Admin,  
I want to nhap diem va nhan xet,  
So that tra ket qua hoc tap cho sinh vien.

### Description

Nguoi dung/He thong thuc hien **Grade Submission and Add Feedback** trong module **Submission & Grading**. Chuc nang xu ly cac du lieu chinh: **score range, feedback length, graded_by, graded_at**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- View Submission Detail da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **Grade Submission and Add Feedback** tren man hinh /admin/submissions/{id}.

### Main Flow

1. Admin mo man hinh /admin/submissions/{id}.
2. He thong tai du lieu/phu thuoc can thiet: View Submission Detail.
3. Admin nhap hoac chon du lieu lien quan: score range, feedback length, graded_by, graded_at.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/admin/submissions/{id}/grade.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: assignment_submissions, users.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den score range, feedback length, graded_by, graded_at phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Grade Submission and Add Feedback thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho score range, feedback length, graded_by, graded_at
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/admin/submissions/{id}/grade
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua score range, feedback length, graded_by, graded_at
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu score range, feedback length, graded_by, graded_at sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu score range, feedback length, graded_by, graded_at nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/admin/submissions/{id}/grade
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

**AC07 - Duplicate data**

Given du lieu score range, feedback length, graded_by, graded_at vi pham rang buoc duy nhat neu chuc nang co duplicate rule
When submit
Then he thong phai tu choi duplicate
And khong tao ban ghi trung.

**AC08 - Server/database error**

Given backend hoac database gap loi
When Admin thuc hien thao tac
Then he thong phai tra 500/503 than thien
And khong luu du lieu dang do.

**AC09 - UI state consistency**

Given thao tac Grade Submission and Add Feedback thanh cong hoac that bai
When UI nhan response
Then loading state ket thuc dung luc
And success/error/empty state khong gay nham lan.

**AC10 - Audit/log/security**

Given chuc nang Grade Submission and Add Feedback duoc thuc hien
When backend ghi log hoac audit
Then log du du lieu debug can thiet
And khong ghi password, token, API key hoac du lieu nhay cam.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Grade Submission and Add Feedback duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Submission & Grading |
| User Story ID | US-GRD-003 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10 |
| Related API | /api/admin/submissions/{id}/grade |
| Related Database Table | assignment_submissions, users |
| Related UI Screen | /admin/submissions/{id} |
| Related Test Case | TC-GRD-003 |

## US-GRD-004 - View Grade

**Priority:** P1  
**Story Point:** 3 - Student chi xem diem cua minh.  
**Dependency:** Submission graded

### User Story

As a Student,  
I want to xem diem bai tap,  
So that nam duoc ket qua hoc tap.

### Description

Nguoi dung/He thong thuc hien **View Grade** trong module **Submission & Grading**. Chuc nang xu ly cac du lieu chinh: **score, status graded, own submission**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Submission graded da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **View Grade** tren man hinh /student/grades.

### Main Flow

1. Student mo man hinh /student/grades.
2. He thong tai du lieu/phu thuoc can thiet: Submission graded.
3. Student nhap hoac chon du lieu lien quan: score, status graded, own submission.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/grades, /api/student/submissions/{id}/grade.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: assignment_submissions.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den score, status graded, own submission phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - View Grade thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho score, status graded, own submission
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/grades, /api/student/submissions/{id}/grade
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua score, status graded, own submission
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu score, status graded, own submission sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu score, status graded, own submission nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/grades, /api/student/submissions/{id}/grade
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang View Grade duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Submission & Grading |
| User Story ID | US-GRD-004 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/grades, /api/student/submissions/{id}/grade |
| Related Database Table | assignment_submissions |
| Related UI Screen | /student/grades |
| Related Test Case | TC-GRD-004 |

## US-GRD-005 - View Feedback

**Priority:** P1  
**Story Point:** 3 - Permission va empty feedback.  
**Dependency:** Submission graded

### User Story

As a Student,  
I want to xem feedback bai nop,  
So that biet cach cai thien.

### Description

Nguoi dung/He thong thuc hien **View Feedback** trong module **Submission & Grading**. Chuc nang xu ly cac du lieu chinh: **feedback text, own submission, not graded state**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Submission graded da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **View Feedback** tren man hinh /student/grades/{submissionId}.

### Main Flow

1. Student mo man hinh /student/grades/{submissionId}.
2. He thong tai du lieu/phu thuoc can thiet: Submission graded.
3. Student nhap hoac chon du lieu lien quan: feedback text, own submission, not graded state.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/submissions/{id}/grade.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: assignment_submissions.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den feedback text, own submission, not graded state phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - View Feedback thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho feedback text, own submission, not graded state
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/submissions/{id}/grade
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua feedback text, own submission, not graded state
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu feedback text, own submission, not graded state sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu feedback text, own submission, not graded state nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/submissions/{id}/grade
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang View Feedback duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Submission & Grading |
| User Story ID | US-GRD-005 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/submissions/{id}/grade |
| Related Database Table | assignment_submissions |
| Related UI Screen | /student/grades/{submissionId} |
| Related Test Case | TC-GRD-005 |


## 10. Schedule User Stories

## US-SCH-001 - Create Study Schedule

**Priority:** P1  
**Story Point:** 5 - Validation ngay gio va owner.  
**Dependency:** Login, Subject assigned

### User Story

As a Student,  
I want to tao lich hoc ca nhan,  
So that sap xep thoi gian hoc.

### Description

Nguoi dung/He thong thuc hien **Create Study Schedule** trong module **Schedule Management**. Chuc nang xu ly cac du lieu chinh: **subject_id, title, study_date, start_time, end_time, schedule_type**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Login, Subject assigned da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **Create Study Schedule** tren man hinh /student/schedules/create.

### Main Flow

1. Student mo man hinh /student/schedules/create.
2. He thong tai du lieu/phu thuoc can thiet: Login, Subject assigned.
3. Student nhap hoac chon du lieu lien quan: subject_id, title, study_date, start_time, end_time, schedule_type.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/study-schedules.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: study_schedules, subjects.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den subject_id, title, study_date, start_time, end_time, schedule_type phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Create Study Schedule thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho subject_id, title, study_date, start_time, end_time, schedule_type
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/study-schedules
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua subject_id, title, study_date, start_time, end_time, schedule_type
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu subject_id, title, study_date, start_time, end_time, schedule_type sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu subject_id, title, study_date, start_time, end_time, schedule_type nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/study-schedules
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Create Study Schedule duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Schedule Management |
| User Story ID | US-SCH-001 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/study-schedules |
| Related Database Table | study_schedules, subjects |
| Related UI Screen | /student/schedules/create |
| Related Test Case | TC-SCH-001 |

## US-SCH-002 - Update Study Schedule

**Priority:** P1  
**Story Point:** 5 - Owner, time range va roadmap link.  
**Dependency:** Schedule exists

### User Story

As a Student,  
I want to chinh sua lich hoc,  
So that dieu chinh ke hoach.

### Description

Nguoi dung/He thong thuc hien **Update Study Schedule** trong module **Schedule Management**. Chuc nang xu ly cac du lieu chinh: **time range, subject, status, roadmap_item_id**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Schedule exists da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **Update Study Schedule** tren man hinh /student/schedules/{id}/edit.

### Main Flow

1. Student mo man hinh /student/schedules/{id}/edit.
2. He thong tai du lieu/phu thuoc can thiet: Schedule exists.
3. Student nhap hoac chon du lieu lien quan: time range, subject, status, roadmap_item_id.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/study-schedules/{id}.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: study_schedules.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den time range, subject, status, roadmap_item_id phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Update Study Schedule thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho time range, subject, status, roadmap_item_id
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/study-schedules/{id}
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua time range, subject, status, roadmap_item_id
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu time range, subject, status, roadmap_item_id sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu time range, subject, status, roadmap_item_id nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/study-schedules/{id}
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Update Study Schedule duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Schedule Management |
| User Story ID | US-SCH-002 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/study-schedules/{id} |
| Related Database Table | study_schedules |
| Related UI Screen | /student/schedules/{id}/edit |
| Related Test Case | TC-SCH-002 |

## US-SCH-003 - Delete Study Schedule

**Priority:** P1  
**Story Point:** 3 - Owner va soft delete.  
**Dependency:** Schedule exists

### User Story

As a Student,  
I want to xoa lich hoc,  
So that loai bo buoi hoc khong con phu hop.

### Description

Nguoi dung/He thong thuc hien **Delete Study Schedule** trong module **Schedule Management**. Chuc nang xu ly cac du lieu chinh: **owner, deleted_at/cancelled, roadmap linked policy**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Schedule exists da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **Delete Study Schedule** tren man hinh /student/schedules/{id}.

### Main Flow

1. Student mo man hinh /student/schedules/{id}.
2. He thong tai du lieu/phu thuoc can thiet: Schedule exists.
3. Student nhap hoac chon du lieu lien quan: owner, deleted_at/cancelled, roadmap linked policy.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/study-schedules/{id}.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: study_schedules.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den owner, deleted_at/cancelled, roadmap linked policy phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Delete Study Schedule thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho owner, deleted_at/cancelled, roadmap linked policy
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/study-schedules/{id}
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua owner, deleted_at/cancelled, roadmap linked policy
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu owner, deleted_at/cancelled, roadmap linked policy sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu owner, deleted_at/cancelled, roadmap linked policy nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/study-schedules/{id}
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Delete Study Schedule duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Schedule Management |
| User Story ID | US-SCH-003 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/study-schedules/{id} |
| Related Database Table | study_schedules |
| Related UI Screen | /student/schedules/{id} |
| Related Test Case | TC-SCH-003 |

## US-SCH-004 - View Schedule by Day Week Month

**Priority:** P1  
**Story Point:** 5 - Calendar view va date range.  
**Dependency:** Login

### User Story

As a Student,  
I want to xem lich theo ngay/tuan/thang,  
So that theo doi ke hoach truc quan.

### Description

Nguoi dung/He thong thuc hien **View Schedule by Day Week Month** trong module **Schedule Management**. Chuc nang xu ly cac du lieu chinh: **date range, timezone, schedule status**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Login da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **View Schedule by Day Week Month** tren man hinh /student/schedules.

### Main Flow

1. Student mo man hinh /student/schedules.
2. He thong tai du lieu/phu thuoc can thiet: Login.
3. Student nhap hoac chon du lieu lien quan: date range, timezone, schedule status.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/study-schedules?view=day|week|month&date=.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: study_schedules.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den date range, timezone, schedule status phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - View Schedule by Day Week Month thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho date range, timezone, schedule status
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/study-schedules?view=day|week|month&date=
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua date range, timezone, schedule status
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu date range, timezone, schedule status sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu date range, timezone, schedule status nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/study-schedules?view=day|week|month&date=
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang View Schedule by Day Week Month duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Schedule Management |
| User Story ID | US-SCH-004 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/study-schedules?view=day|week|month&date= |
| Related Database Table | study_schedules |
| Related UI Screen | /student/schedules |
| Related Test Case | TC-SCH-004 |

## US-SCH-005 - Set Study Time for Subject or Goal

**Priority:** P1  
**Story Point:** 5 - Lien ket goal/roadmap/schedule.  
**Dependency:** Subject assigned, Learning goal optional

### User Story

As a Student,  
I want to dat thoi gian hoc cho mon/muc tieu,  
So that moi muc tieu co khung gio hoc cu the.

### Description

Nguoi dung/He thong thuc hien **Set Study Time for Subject or Goal** trong module **Schedule Management**. Chuc nang xu ly cac du lieu chinh: **subject/goal, preferred slot, conflict check**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Subject assigned, Learning goal optional da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **Set Study Time for Subject or Goal** tren man hinh /student/schedules/create.

### Main Flow

1. Student mo man hinh /student/schedules/create.
2. He thong tai du lieu/phu thuoc can thiet: Subject assigned, Learning goal optional.
3. Student nhap hoac chon du lieu lien quan: subject/goal, preferred slot, conflict check.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/study-schedules.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: study_schedules, learning_goals, learning_roadmap_items.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den subject/goal, preferred slot, conflict check phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Set Study Time for Subject or Goal thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho subject/goal, preferred slot, conflict check
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/study-schedules
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua subject/goal, preferred slot, conflict check
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu subject/goal, preferred slot, conflict check sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu subject/goal, preferred slot, conflict check nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/study-schedules
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Set Study Time for Subject or Goal duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Schedule Management |
| User Story ID | US-SCH-005 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/study-schedules |
| Related Database Table | study_schedules, learning_goals, learning_roadmap_items |
| Related UI Screen | /student/schedules/create |
| Related Test Case | TC-SCH-005 |


## 11. Learning Goal User Stories

## US-GOAL-001 - Create Learning Goal

**Priority:** P1  
**Story Point:** 8 - Input cho AI, date/time/level validation.  
**Dependency:** Login, Subject assigned

### User Story

As a Student,  
I want to tao muc tieu hoc tap,  
So that co dau vao ro cho ke hoach hoc va AI Roadmap.

### Description

Nguoi dung/He thong thuc hien **Create Learning Goal** trong module **Learning Goal**. Chuc nang xu ly cac du lieu chinh: **subject, goal, current_level, study_time_per_day, start_date, end_date, preferred time**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Login, Subject assigned da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **Create Learning Goal** tren man hinh /student/learning-goals/create.

### Main Flow

1. Student mo man hinh /student/learning-goals/create.
2. He thong tai du lieu/phu thuoc can thiet: Login, Subject assigned.
3. Student nhap hoac chon du lieu lien quan: subject, goal, current_level, study_time_per_day, start_date, end_date, preferred time.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/learning-goals.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: learning_goals, subjects, users.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den subject, goal, current_level, study_time_per_day, start_date, end_date, preferred time phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Create Learning Goal thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho subject, goal, current_level, study_time_per_day, start_date, end_date, preferred time
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/learning-goals
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua subject, goal, current_level, study_time_per_day, start_date, end_date, preferred time
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu subject, goal, current_level, study_time_per_day, start_date, end_date, preferred time sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu subject, goal, current_level, study_time_per_day, start_date, end_date, preferred time nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/learning-goals
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

**AC07 - Duplicate data**

Given du lieu subject, goal, current_level, study_time_per_day, start_date, end_date, preferred time vi pham rang buoc duy nhat neu chuc nang co duplicate rule
When submit
Then he thong phai tu choi duplicate
And khong tao ban ghi trung.

**AC08 - Server/database error**

Given backend hoac database gap loi
When Student thuc hien thao tac
Then he thong phai tra 500/503 than thien
And khong luu du lieu dang do.

**AC09 - UI state consistency**

Given thao tac Create Learning Goal thanh cong hoac that bai
When UI nhan response
Then loading state ket thuc dung luc
And success/error/empty state khong gay nham lan.

**AC10 - Audit/log/security**

Given chuc nang Create Learning Goal duoc thuc hien
When backend ghi log hoac audit
Then log du du lieu debug can thiet
And khong ghi password, token, API key hoac du lieu nhay cam.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Create Learning Goal duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Learning Goal |
| User Story ID | US-GOAL-001 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10 |
| Related API | /api/student/learning-goals |
| Related Database Table | learning_goals, subjects, users |
| Related UI Screen | /student/learning-goals/create |
| Related Test Case | TC-GOAL-001 |

## US-GOAL-002 - Update Learning Goal

**Priority:** P1  
**Story Point:** 5 - Owner va roadmap linked consistency.  
**Dependency:** Learning goal exists

### User Story

As a Student,  
I want to chinh sua muc tieu,  
So that dieu chinh theo nang luc va lich hoc.

### Description

Nguoi dung/He thong thuc hien **Update Learning Goal** trong module **Learning Goal**. Chuc nang xu ly cac du lieu chinh: **owner, date range, status, linked roadmap**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Learning goal exists da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **Update Learning Goal** tren man hinh /student/learning-goals/{id}/edit.

### Main Flow

1. Student mo man hinh /student/learning-goals/{id}/edit.
2. He thong tai du lieu/phu thuoc can thiet: Learning goal exists.
3. Student nhap hoac chon du lieu lien quan: owner, date range, status, linked roadmap.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/learning-goals/{id}.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: learning_goals.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den owner, date range, status, linked roadmap phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Update Learning Goal thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho owner, date range, status, linked roadmap
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/learning-goals/{id}
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua owner, date range, status, linked roadmap
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu owner, date range, status, linked roadmap sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu owner, date range, status, linked roadmap nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/learning-goals/{id}
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Update Learning Goal duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Learning Goal |
| User Story ID | US-GOAL-002 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/learning-goals/{id} |
| Related Database Table | learning_goals |
| Related UI Screen | /student/learning-goals/{id}/edit |
| Related Test Case | TC-GOAL-002 |

## US-GOAL-003 - Delete Learning Goal

**Priority:** P1  
**Story Point:** 3 - Lien quan roadmap tu goal.  
**Dependency:** Learning goal exists

### User Story

As a Student,  
I want to xoa muc tieu,  
So that loai bo muc tieu khong con theo duoi.

### Description

Nguoi dung/He thong thuc hien **Delete Learning Goal** trong module **Learning Goal**. Chuc nang xu ly cac du lieu chinh: **owner, linked roadmap policy**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Learning goal exists da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **Delete Learning Goal** tren man hinh /student/learning-goals/{id}.

### Main Flow

1. Student mo man hinh /student/learning-goals/{id}.
2. He thong tai du lieu/phu thuoc can thiet: Learning goal exists.
3. Student nhap hoac chon du lieu lien quan: owner, linked roadmap policy.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/learning-goals/{id}.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: learning_goals, learning_roadmaps.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den owner, linked roadmap policy phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Delete Learning Goal thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho owner, linked roadmap policy
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/learning-goals/{id}
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua owner, linked roadmap policy
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu owner, linked roadmap policy sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu owner, linked roadmap policy nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/learning-goals/{id}
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Delete Learning Goal duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Learning Goal |
| User Story ID | US-GOAL-003 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/learning-goals/{id} |
| Related Database Table | learning_goals, learning_roadmaps |
| Related UI Screen | /student/learning-goals/{id} |
| Related Test Case | TC-GOAL-003 |

## US-GOAL-004 - View Learning Goal List and Detail

**Priority:** P1  
**Story Point:** 3 - List/detail dung owner.  
**Dependency:** Login

### User Story

As a Student,  
I want to xem danh sach/chi tiet muc tieu,  
So that theo doi muc tieu dang thuc hien.

### Description

Nguoi dung/He thong thuc hien **View Learning Goal List and Detail** trong module **Learning Goal**. Chuc nang xu ly cac du lieu chinh: **active/completed/paused/cancelled, subject**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Login da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **View Learning Goal List and Detail** tren man hinh /student/learning-goals.

### Main Flow

1. Student mo man hinh /student/learning-goals.
2. He thong tai du lieu/phu thuoc can thiet: Login.
3. Student nhap hoac chon du lieu lien quan: active/completed/paused/cancelled, subject.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/learning-goals, /api/student/learning-goals/{id}.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: learning_goals, subjects.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den active/completed/paused/cancelled, subject phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - View Learning Goal List and Detail thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho active/completed/paused/cancelled, subject
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/learning-goals, /api/student/learning-goals/{id}
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua active/completed/paused/cancelled, subject
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu active/completed/paused/cancelled, subject sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu active/completed/paused/cancelled, subject nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/learning-goals, /api/student/learning-goals/{id}
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang View Learning Goal List and Detail duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Learning Goal |
| User Story ID | US-GOAL-004 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/learning-goals, /api/student/learning-goals/{id} |
| Related Database Table | learning_goals, subjects |
| Related UI Screen | /student/learning-goals |
| Related Test Case | TC-GOAL-004 |

## US-GOAL-005 - Track Learning Goal Status

**Priority:** P1  
**Story Point:** 5 - Status anh huong dashboard/roadmap.  
**Dependency:** Learning goal exists

### User Story

As a Student,  
I want to theo doi trang thai hoan thanh muc tieu,  
So that biet muc tieu dang active/paused/completed.

### Description

Nguoi dung/He thong thuc hien **Track Learning Goal Status** trong module **Learning Goal**. Chuc nang xu ly cac du lieu chinh: **status transition, progress related**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Learning goal exists da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **Track Learning Goal Status** tren man hinh /student/learning-goals/{id}.

### Main Flow

1. Student mo man hinh /student/learning-goals/{id}.
2. He thong tai du lieu/phu thuoc can thiet: Learning goal exists.
3. Student nhap hoac chon du lieu lien quan: status transition, progress related.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/learning-goals/{id}.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: learning_goals, learning_roadmaps.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den status transition, progress related phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - Track Learning Goal Status thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho status transition, progress related
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/learning-goals/{id}
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua status transition, progress related
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu status transition, progress related sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu status transition, progress related nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/learning-goals/{id}
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Track Learning Goal Status duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Learning Goal |
| User Story ID | US-GOAL-005 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/learning-goals/{id} |
| Related Database Table | learning_goals, learning_roadmaps |
| Related UI Screen | /student/learning-goals/{id} |
| Related Test Case | TC-GOAL-005 |


## 12. AI Learning Roadmap User Stories

## US-AIR-001 - Generate AI Roadmap Suggestion

**Priority:** P1  
**Story Point:** 13 - AI API, schema, timeout, khong luu truoc Confirm.  
**Dependency:** Login, Subject, Learning Goal, AI API Integration

### User Story

As a Student,  
I want to gui thong tin muc tieu de AI tao lo trinh goi y,  
So that nhan ke hoach hoc ca nhan hoa.

### Description

Nguoi dung/He thong thuc hien **Generate AI Roadmap Suggestion** trong module **AI Learning Roadmap**. Chuc nang xu ly cac du lieu chinh: **subject, goal, level, study_time, date range, AI JSON schema, suggestion only**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Login, Subject, Learning Goal, AI API Integration da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **Generate AI Roadmap Suggestion** tren man hinh /student/roadmaps/generate.

### Main Flow

1. Student mo man hinh /student/roadmaps/generate.
2. He thong tai du lieu/phu thuoc can thiet: Login, Subject, Learning Goal, AI API Integration.
3. Student nhap hoac chon du lieu lien quan: subject, goal, level, study_time, date range, AI JSON schema, suggestion only.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/roadmaps/generate-ai.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: No persistent write before confirm; ai_logs (proposed).
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den subject, goal, level, study_time, date range, AI JSON schema, suggestion only phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.
- AI API chi duoc goi tu backend PHP, khong goi truc tiep tu frontend.
- AI response phai duoc validate schema truoc khi hien thi hoac luu.
- Roadmap AI o trang thai Suggestion khong duoc luu vao database truoc khi Student nhan Confirm.

### Acceptance Criteria

**AC01 - Generate AI Roadmap Suggestion thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho subject, goal, level, study_time, date range, AI JSON schema, suggestion only
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/roadmaps/generate-ai
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua subject, goal, level, study_time, date range, AI JSON schema, suggestion only
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu subject, goal, level, study_time, date range, AI JSON schema, suggestion only sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu subject, goal, level, study_time, date range, AI JSON schema, suggestion only nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/roadmaps/generate-ai
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

**AC07 - Duplicate data**

Given du lieu subject, goal, level, study_time, date range, AI JSON schema, suggestion only vi pham rang buoc duy nhat neu chuc nang co duplicate rule
When submit
Then he thong phai tu choi duplicate
And khong tao ban ghi trung.

**AC08 - Server/database error**

Given backend hoac database gap loi
When Student thuc hien thao tac
Then he thong phai tra 500/503 than thien
And khong luu du lieu dang do.

**AC09 - UI state consistency**

Given thao tac Generate AI Roadmap Suggestion thanh cong hoac that bai
When UI nhan response
Then loading state ket thuc dung luc
And success/error/empty state khong gay nham lan.

**AC10 - Audit/log/security**

Given chuc nang Generate AI Roadmap Suggestion duoc thuc hien
When backend ghi log hoac audit
Then log du du lieu debug can thiet
And khong ghi password, token, API key hoac du lieu nhay cam.

**AC11 - AI timeout handling**

Given AI API khong phan hoi trong timeout cau hinh
When backend goi AI
Then API tra 503/504
And UI hien fallback/retry.

**AC12 - AI response schema validation**

Given AI tra response rong hoac sai schema
When backend parse response
Then he thong tu choi response khong hop le
And khong luu/hien thi ket qua sai.

**AC13 - API key protection**

Given nguoi dung kiem tra frontend source/network
When su dung chuc nang AI
Then khong co AI API key nao xuat hien o frontend.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Ap dung bo sung DoD-AI trong Section 16.
- Chuc nang Generate AI Roadmap Suggestion duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |
| OUT-08 | JSON Roadmap from AI | JSON dung schema gom overview/items. |
| OUT-09 | Roadmap Suggestion | Suggestion hien tren UI va chua luu DB. |
| OUT-10 | AI Error State | Timeout/API/schema error co fallback. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | AI Learning Roadmap |
| User Story ID | US-AIR-001 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10, AC11, AC12, AC13 |
| Related API | /api/student/roadmaps/generate-ai |
| Related Database Table | No persistent write before confirm; ai_logs (proposed) |
| Related UI Screen | /student/roadmaps/generate |
| Related Test Case | TC-AIR-001 |

## US-AIR-002 - View Roadmap Suggestion

**Priority:** P1  
**Story Point:** 5 - Can hien ro chua persist.  
**Dependency:** Generate AI Roadmap Suggestion

### User Story

As a Student,  
I want to xem lo trinh o trang thai Suggestion,  
So that danh gia truoc khi luu.

### Description

Nguoi dung/He thong thuc hien **View Roadmap Suggestion** trong module **AI Learning Roadmap**. Chuc nang xu ly cac du lieu chinh: **suggestion state, item list, not persisted**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Generate AI Roadmap Suggestion da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **View Roadmap Suggestion** tren man hinh /student/roadmaps/preview.

### Main Flow

1. Student mo man hinh /student/roadmaps/preview.
2. He thong tai du lieu/phu thuoc can thiet: Generate AI Roadmap Suggestion.
3. Student nhap hoac chon du lieu lien quan: suggestion state, item list, not persisted.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/roadmaps/generate-ai response.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: No persistent write before confirm.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den suggestion state, item list, not persisted phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.
- AI API chi duoc goi tu backend PHP, khong goi truc tiep tu frontend.
- AI response phai duoc validate schema truoc khi hien thi hoac luu.
- Roadmap AI o trang thai Suggestion khong duoc luu vao database truoc khi Student nhan Confirm.

### Acceptance Criteria

**AC01 - View Roadmap Suggestion thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho suggestion state, item list, not persisted
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/roadmaps/generate-ai response
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua suggestion state, item list, not persisted
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu suggestion state, item list, not persisted sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu suggestion state, item list, not persisted nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/roadmaps/generate-ai response
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Ap dung bo sung DoD-AI trong Section 16.
- Chuc nang View Roadmap Suggestion duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | AI Learning Roadmap |
| User Story ID | US-AIR-002 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/roadmaps/generate-ai response |
| Related Database Table | No persistent write before confirm |
| Related UI Screen | /student/roadmaps/preview |
| Related Test Case | TC-AIR-002 |

## US-AIR-003 - Edit Roadmap Suggestion

**Priority:** P1  
**Story Point:** 8 - User control truoc persist.  
**Dependency:** View Roadmap Suggestion

### User Story

As a Student,  
I want to chinh sua/xoa/them activity trong suggestion,  
So that bien goi y AI thanh ke hoach phu hop.

### Description

Nguoi dung/He thong thuc hien **Edit Roadmap Suggestion** trong module **AI Learning Roadmap**. Chuc nang xu ly cac du lieu chinh: **edit title/date/time/duration, add/delete activities, validation**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- View Roadmap Suggestion da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **Edit Roadmap Suggestion** tren man hinh /student/roadmaps/preview.

### Main Flow

1. Student mo man hinh /student/roadmaps/preview.
2. He thong tai du lieu/phu thuoc can thiet: View Roadmap Suggestion.
3. Student nhap hoac chon du lieu lien quan: edit title/date/time/duration, add/delete activities, validation.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den Client-side edit then /api/student/roadmaps on confirm.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: No persistent write before confirm.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den edit title/date/time/duration, add/delete activities, validation phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.
- AI API chi duoc goi tu backend PHP, khong goi truc tiep tu frontend.
- AI response phai duoc validate schema truoc khi hien thi hoac luu.
- Roadmap AI o trang thai Suggestion khong duoc luu vao database truoc khi Student nhan Confirm.

### Acceptance Criteria

**AC01 - Edit Roadmap Suggestion thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho edit title/date/time/duration, add/delete activities, validation
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua Client-side edit then /api/student/roadmaps on confirm
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua edit title/date/time/duration, add/delete activities, validation
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu edit title/date/time/duration, add/delete activities, validation sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu edit title/date/time/duration, add/delete activities, validation nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap Client-side edit then /api/student/roadmaps on confirm
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

**AC07 - Duplicate data**

Given du lieu edit title/date/time/duration, add/delete activities, validation vi pham rang buoc duy nhat neu chuc nang co duplicate rule
When submit
Then he thong phai tu choi duplicate
And khong tao ban ghi trung.

**AC08 - Server/database error**

Given backend hoac database gap loi
When Student thuc hien thao tac
Then he thong phai tra 500/503 than thien
And khong luu du lieu dang do.

**AC09 - UI state consistency**

Given thao tac Edit Roadmap Suggestion thanh cong hoac that bai
When UI nhan response
Then loading state ket thuc dung luc
And success/error/empty state khong gay nham lan.

**AC10 - Audit/log/security**

Given chuc nang Edit Roadmap Suggestion duoc thuc hien
When backend ghi log hoac audit
Then log du du lieu debug can thiet
And khong ghi password, token, API key hoac du lieu nhay cam.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Ap dung bo sung DoD-AI trong Section 16.
- Chuc nang Edit Roadmap Suggestion duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |
| OUT-08 | Roadmap Edited | Preview da sua dung validation. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | AI Learning Roadmap |
| User Story ID | US-AIR-003 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10 |
| Related API | Client-side edit then /api/student/roadmaps on confirm |
| Related Database Table | No persistent write before confirm |
| Related UI Screen | /student/roadmaps/preview |
| Related Test Case | TC-AIR-003 |

## US-AIR-004 - Confirm Roadmap and Save

**Priority:** P1  
**Story Point:** 13 - Transaction persist roadmap/items, idempotency va schedule link.  
**Dependency:** Generate Roadmap, Edit Roadmap

### User Story

As a Student,  
I want to confirm lo trinh de luu database,  
So that bien suggestion thanh ke hoach chinh thuc.

### Description

Nguoi dung/He thong thuc hien **Confirm Roadmap and Save** trong module **AI Learning Roadmap**. Chuc nang xu ly cac du lieu chinh: **confirm, transaction, generated_by_ai, idempotency, no duplicate**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Generate Roadmap, Edit Roadmap da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **Confirm Roadmap and Save** tren man hinh /student/roadmaps/preview.

### Main Flow

1. Student mo man hinh /student/roadmaps/preview.
2. He thong tai du lieu/phu thuoc can thiet: Generate Roadmap, Edit Roadmap.
3. Student nhap hoac chon du lieu lien quan: confirm, transaction, generated_by_ai, idempotency, no duplicate.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/roadmaps.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: learning_roadmaps, learning_roadmap_items.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den confirm, transaction, generated_by_ai, idempotency, no duplicate phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.
- AI API chi duoc goi tu backend PHP, khong goi truc tiep tu frontend.
- AI response phai duoc validate schema truoc khi hien thi hoac luu.
- Roadmap AI o trang thai Suggestion khong duoc luu vao database truoc khi Student nhan Confirm.

### Acceptance Criteria

**AC01 - Confirm Roadmap and Save thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho confirm, transaction, generated_by_ai, idempotency, no duplicate
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/roadmaps
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua confirm, transaction, generated_by_ai, idempotency, no duplicate
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu confirm, transaction, generated_by_ai, idempotency, no duplicate sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu confirm, transaction, generated_by_ai, idempotency, no duplicate nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/roadmaps
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

**AC07 - Duplicate data**

Given du lieu confirm, transaction, generated_by_ai, idempotency, no duplicate vi pham rang buoc duy nhat neu chuc nang co duplicate rule
When submit
Then he thong phai tu choi duplicate
And khong tao ban ghi trung.

**AC08 - Server/database error**

Given backend hoac database gap loi
When Student thuc hien thao tac
Then he thong phai tra 500/503 than thien
And khong luu du lieu dang do.

**AC09 - UI state consistency**

Given thao tac Confirm Roadmap and Save thanh cong hoac that bai
When UI nhan response
Then loading state ket thuc dung luc
And success/error/empty state khong gay nham lan.

**AC10 - Audit/log/security**

Given chuc nang Confirm Roadmap and Save duoc thuc hien
When backend ghi log hoac audit
Then log du du lieu debug can thiet
And khong ghi password, token, API key hoac du lieu nhay cam.

**AC11 - AI timeout handling**

Given AI API khong phan hoi trong timeout cau hinh
When backend goi AI
Then API tra 503/504
And UI hien fallback/retry.

**AC12 - AI response schema validation**

Given AI tra response rong hoac sai schema
When backend parse response
Then he thong tu choi response khong hop le
And khong luu/hien thi ket qua sai.

**AC13 - API key protection**

Given nguoi dung kiem tra frontend source/network
When su dung chuc nang AI
Then khong co AI API key nao xuat hien o frontend.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Ap dung bo sung DoD-AI trong Section 16.
- Chuc nang Confirm Roadmap and Save duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |
| OUT-08 | Roadmap Confirmed | Roadmap duoc tao sau Confirm. |
| OUT-09 | Roadmap Database Record | learning_roadmaps/items luu dung. |
| OUT-10 | Roadmap Edited | Noi dung luu la ban user da edit. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | AI Learning Roadmap |
| User Story ID | US-AIR-004 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10, AC11, AC12, AC13 |
| Related API | /api/student/roadmaps |
| Related Database Table | learning_roadmaps, learning_roadmap_items |
| Related UI Screen | /student/roadmaps/preview |
| Related Test Case | TC-AIR-004 |

## US-AIR-005 - Auto Create Schedule Items from Confirmed Roadmap

**Priority:** P1  
**Story Point:** 8 - Tich hop roadmap -> schedule va conflict time.  
**Dependency:** Confirm Roadmap, Schedule Management

### User Story

As a System,  
I want to tu dong dua buoi hoc vao lich ca nhan,  
So that Student co lich hoc ngay sau confirm.

### Description

Nguoi dung/He thong thuc hien **Auto Create Schedule Items from Confirmed Roadmap** trong module **AI Learning Roadmap**. Chuc nang xu ly cac du lieu chinh: **schedule_id, roadmap_id, roadmap_item_id, conflict, transaction**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Confirm Roadmap, Schedule Management da san sang.
- Nguoi dung co dung role: System.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

System thuc hien thao tac **Auto Create Schedule Items from Confirmed Roadmap** tren man hinh /student/schedules.

### Main Flow

1. System mo man hinh /student/schedules.
2. He thong tai du lieu/phu thuoc can thiet: Confirm Roadmap, Schedule Management.
3. System nhap hoac chon du lieu lien quan: schedule_id, roadmap_id, roadmap_item_id, conflict, transaction.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/roadmaps.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: study_schedules, learning_roadmap_items, learning_roadmaps.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den schedule_id, roadmap_id, roadmap_item_id, conflict, transaction phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.
- AI API chi duoc goi tu backend PHP, khong goi truc tiep tu frontend.
- AI response phai duoc validate schema truoc khi hien thi hoac luu.
- Roadmap AI o trang thai Suggestion khong duoc luu vao database truoc khi Student nhan Confirm.

### Acceptance Criteria

**AC01 - Auto Create Schedule Items from Confirmed Roadmap thanh cong**

Given System da dap ung dieu kien tien quyet
And du lieu hop le cho schedule_id, roadmap_id, roadmap_item_id, conflict, transaction
When System xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/roadmaps
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given System dang o man hinh chuc nang
When bo trong truong bat buoc cua schedule_id, roadmap_id, roadmap_item_id, conflict, transaction
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu schedule_id, roadmap_id, roadmap_item_id, conflict, transaction sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu schedule_id, roadmap_id, roadmap_item_id, conflict, transaction nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/roadmaps
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

**AC07 - Duplicate data**

Given du lieu schedule_id, roadmap_id, roadmap_item_id, conflict, transaction vi pham rang buoc duy nhat neu chuc nang co duplicate rule
When submit
Then he thong phai tu choi duplicate
And khong tao ban ghi trung.

**AC08 - Server/database error**

Given backend hoac database gap loi
When System thuc hien thao tac
Then he thong phai tra 500/503 than thien
And khong luu du lieu dang do.

**AC09 - UI state consistency**

Given thao tac Auto Create Schedule Items from Confirmed Roadmap thanh cong hoac that bai
When UI nhan response
Then loading state ket thuc dung luc
And success/error/empty state khong gay nham lan.

**AC10 - Audit/log/security**

Given chuc nang Auto Create Schedule Items from Confirmed Roadmap duoc thuc hien
When backend ghi log hoac audit
Then log du du lieu debug can thiet
And khong ghi password, token, API key hoac du lieu nhay cam.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Ap dung bo sung DoD-AI trong Section 16.
- Chuc nang Auto Create Schedule Items from Confirmed Roadmap duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |
| OUT-08 | Schedule Items | study_schedules duoc tao tu roadmap item. |
| OUT-09 | Progress Tracking Items | Roadmap item san sang track theo ngay. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | AI Learning Roadmap |
| User Story ID | US-AIR-005 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10 |
| Related API | /api/student/roadmaps |
| Related Database Table | study_schedules, learning_roadmap_items, learning_roadmaps |
| Related UI Screen | /student/schedules |
| Related Test Case | TC-AIR-005 |

## US-AIR-006 - Update Roadmap Item Schedule or Result

**Priority:** P1  
**Story Point:** 5 - Cap nhat item va schedule linked.  
**Dependency:** Confirmed Roadmap

### User Story

As a Student,  
I want to doi lich hoac ghi ket qua hoc tung activity,  
So that giu lo trinh phu hop thuc te.

### Description

Nguoi dung/He thong thuc hien **Update Roadmap Item Schedule or Result** trong module **AI Learning Roadmap**. Chuc nang xu ly cac du lieu chinh: **reschedule, learned_content, unfinished_content, actual minutes**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Confirmed Roadmap da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **Update Roadmap Item Schedule or Result** tren man hinh /student/roadmaps/{id}/edit.

### Main Flow

1. Student mo man hinh /student/roadmaps/{id}/edit.
2. He thong tai du lieu/phu thuoc can thiet: Confirmed Roadmap.
3. Student nhap hoac chon du lieu lien quan: reschedule, learned_content, unfinished_content, actual minutes.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/roadmap-items/{id}/schedule, /api/student/roadmap-items/{id}/result.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: learning_roadmap_items, study_schedules.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den reschedule, learned_content, unfinished_content, actual minutes phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.
- Roadmap AI o trang thai Suggestion khong duoc luu vao database truoc khi Student nhan Confirm.

### Acceptance Criteria

**AC01 - Update Roadmap Item Schedule or Result thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho reschedule, learned_content, unfinished_content, actual minutes
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/roadmap-items/{id}/schedule, /api/student/roadmap-items/{id}/result
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua reschedule, learned_content, unfinished_content, actual minutes
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu reschedule, learned_content, unfinished_content, actual minutes sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu reschedule, learned_content, unfinished_content, actual minutes nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/roadmap-items/{id}/schedule, /api/student/roadmap-items/{id}/result
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Update Roadmap Item Schedule or Result duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | AI Learning Roadmap |
| User Story ID | US-AIR-006 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/roadmap-items/{id}/schedule, /api/student/roadmap-items/{id}/result |
| Related Database Table | learning_roadmap_items, study_schedules |
| Related UI Screen | /student/roadmaps/{id}/edit |
| Related Test Case | TC-AIR-006 |

## US-AIR-007 - View AI Service Status

**Priority:** P2  
**Story Point:** 3 - Endpoint ai-status phuc vu fallback.  
**Dependency:** Login

### User Story

As a Student,  
I want to kiem tra trang thai AI Roadmap service,  
So that biet khi nao co the tao lo trinh.

### Description

Nguoi dung/He thong thuc hien **View AI Service Status** trong module **AI Learning Roadmap**. Chuc nang xu ly cac du lieu chinh: **available/unavailable, model configured, fallback**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Login da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **View AI Service Status** tren man hinh /student/roadmaps/generate.

### Main Flow

1. Student mo man hinh /student/roadmaps/generate.
2. He thong tai du lieu/phu thuoc can thiet: Login.
3. Student nhap hoac chon du lieu lien quan: available/unavailable, model configured, fallback.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/roadmaps/ai-status.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: ai_logs/config (proposed).
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den available/unavailable, model configured, fallback phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.
- AI API chi duoc goi tu backend PHP, khong goi truc tiep tu frontend.
- AI response phai duoc validate schema truoc khi hien thi hoac luu.
- Roadmap AI o trang thai Suggestion khong duoc luu vao database truoc khi Student nhan Confirm.

### Acceptance Criteria

**AC01 - View AI Service Status thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho available/unavailable, model configured, fallback
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/roadmaps/ai-status
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua available/unavailable, model configured, fallback
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu available/unavailable, model configured, fallback sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu available/unavailable, model configured, fallback nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/roadmaps/ai-status
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Ap dung bo sung DoD-AI trong Section 16.
- Chuc nang View AI Service Status duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | AI Learning Roadmap |
| User Story ID | US-AIR-007 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/roadmaps/ai-status |
| Related Database Table | ai_logs/config (proposed) |
| Related UI Screen | /student/roadmaps/generate |
| Related Test Case | TC-AIR-007 |


## 13. Learning Progress User Stories

## US-PROG-001 - View Roadmap Completion Percent

**Priority:** P1  
**Story Point:** 5 - Tinh tu item status/completion_percent.  
**Dependency:** Confirmed Roadmap

### User Story

As a Student,  
I want to xem % hoan thanh lo trinh,  
So that biet tien do so voi muc tieu.

### Description

Nguoi dung/He thong thuc hien **View Roadmap Completion Percent** trong module **Learning Progress**. Chuc nang xu ly cac du lieu chinh: **progress_percent, completed items, total items**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Confirmed Roadmap da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **View Roadmap Completion Percent** tren man hinh /student/roadmaps/{id}.

### Main Flow

1. Student mo man hinh /student/roadmaps/{id}.
2. He thong tai du lieu/phu thuoc can thiet: Confirmed Roadmap.
3. Student nhap hoac chon du lieu lien quan: progress_percent, completed items, total items.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/roadmaps/{id}/progress.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: learning_roadmaps, learning_roadmap_items.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den progress_percent, completed items, total items phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.
- Roadmap AI o trang thai Suggestion khong duoc luu vao database truoc khi Student nhan Confirm.

### Acceptance Criteria

**AC01 - View Roadmap Completion Percent thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho progress_percent, completed items, total items
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/roadmaps/{id}/progress
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua progress_percent, completed items, total items
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu progress_percent, completed items, total items sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu progress_percent, completed items, total items nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/roadmaps/{id}/progress
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang View Roadmap Completion Percent duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Learning Progress |
| User Story ID | US-PROG-001 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/roadmaps/{id}/progress |
| Related Database Table | learning_roadmaps, learning_roadmap_items |
| Related UI Screen | /student/roadmaps/{id} |
| Related Test Case | TC-PROG-001 |

## US-PROG-002 - View Completed and Pending Tasks

**Priority:** P1  
**Story Point:** 3 - Loc item theo status.  
**Dependency:** Confirmed Roadmap

### User Story

As a Student,  
I want to xem task da hoan thanh/chua hoan thanh,  
So that uu tien viec hoc tiep theo.

### Description

Nguoi dung/He thong thuc hien **View Completed and Pending Tasks** trong module **Learning Progress**. Chuc nang xu ly cac du lieu chinh: **completed, not_started, in_progress, not_completed**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Confirmed Roadmap da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **View Completed and Pending Tasks** tren man hinh /student/roadmaps/{id}.

### Main Flow

1. Student mo man hinh /student/roadmaps/{id}.
2. He thong tai du lieu/phu thuoc can thiet: Confirmed Roadmap.
3. Student nhap hoac chon du lieu lien quan: completed, not_started, in_progress, not_completed.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/roadmaps/{id}.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: learning_roadmap_items.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den completed, not_started, in_progress, not_completed phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - View Completed and Pending Tasks thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho completed, not_started, in_progress, not_completed
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/roadmaps/{id}
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua completed, not_started, in_progress, not_completed
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu completed, not_started, in_progress, not_completed sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu completed, not_started, in_progress, not_completed nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/roadmaps/{id}
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang View Completed and Pending Tasks duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Learning Progress |
| User Story ID | US-PROG-002 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/roadmaps/{id} |
| Related Database Table | learning_roadmap_items |
| Related UI Screen | /student/roadmaps/{id} |
| Related Test Case | TC-PROG-002 |

## US-PROG-003 - Mark Roadmap Task Completed

**Priority:** P1  
**Story Point:** 5 - Cap nhat status va percent.  
**Dependency:** Confirmed Roadmap item

### User Story

As a Student,  
I want to danh dau activity hoan thanh,  
So that cap nhat tien do chinh xac.

### Description

Nguoi dung/He thong thuc hien **Mark Roadmap Task Completed** trong module **Learning Progress**. Chuc nang xu ly cac du lieu chinh: **status completed, completion_percent, actual_study_minutes**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Confirmed Roadmap item da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **Mark Roadmap Task Completed** tren man hinh /student/roadmaps/{id}.

### Main Flow

1. Student mo man hinh /student/roadmaps/{id}.
2. He thong tai du lieu/phu thuoc can thiet: Confirmed Roadmap item.
3. Student nhap hoac chon du lieu lien quan: status completed, completion_percent, actual_study_minutes.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/roadmap-items/{id}/status.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: learning_roadmap_items, learning_roadmaps.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den status completed, completion_percent, actual_study_minutes phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.
- Roadmap AI o trang thai Suggestion khong duoc luu vao database truoc khi Student nhan Confirm.

### Acceptance Criteria

**AC01 - Mark Roadmap Task Completed thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho status completed, completion_percent, actual_study_minutes
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/roadmap-items/{id}/status
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua status completed, completion_percent, actual_study_minutes
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu status completed, completion_percent, actual_study_minutes sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu status completed, completion_percent, actual_study_minutes nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/roadmap-items/{id}/status
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang Mark Roadmap Task Completed duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Learning Progress |
| User Story ID | US-PROG-003 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/roadmap-items/{id}/status |
| Related Database Table | learning_roadmap_items, learning_roadmaps |
| Related UI Screen | /student/roadmaps/{id} |
| Related Test Case | TC-PROG-003 |

## US-PROG-004 - View Daily Progress

**Priority:** P1  
**Story Point:** 5 - Group by planned_date/study date.  
**Dependency:** Confirmed Roadmap

### User Story

As a Student,  
I want to xem tien do theo ngay,  
So that kiem soat viec hoc hang ngay.

### Description

Nguoi dung/He thong thuc hien **View Daily Progress** trong module **Learning Progress**. Chuc nang xu ly cac du lieu chinh: **planned_date, daily completed/pending, overdue**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Confirmed Roadmap da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **View Daily Progress** tren man hinh /student/roadmaps/{id}/progress.

### Main Flow

1. Student mo man hinh /student/roadmaps/{id}/progress.
2. He thong tai du lieu/phu thuoc can thiet: Confirmed Roadmap.
3. Student nhap hoac chon du lieu lien quan: planned_date, daily completed/pending, overdue.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/roadmaps/{id}/progress?group_by=day.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: learning_roadmap_items, study_schedules.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den planned_date, daily completed/pending, overdue phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - View Daily Progress thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho planned_date, daily completed/pending, overdue
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/roadmaps/{id}/progress?group_by=day
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua planned_date, daily completed/pending, overdue
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu planned_date, daily completed/pending, overdue sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu planned_date, daily completed/pending, overdue nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/roadmaps/{id}/progress?group_by=day
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang View Daily Progress duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Learning Progress |
| User Story ID | US-PROG-004 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/roadmaps/{id}/progress?group_by=day |
| Related Database Table | learning_roadmap_items, study_schedules |
| Related UI Screen | /student/roadmaps/{id}/progress |
| Related Test Case | TC-PROG-004 |

## US-PROG-005 - View Progress by Subject

**Priority:** P1  
**Story Point:** 5 - Aggregate theo subject.  
**Dependency:** Confirmed Roadmap, Subject assigned

### User Story

As a Student,  
I want to xem tien do theo mon hoc,  
So that so sanh muc do hoan thanh giua cac mon.

### Description

Nguoi dung/He thong thuc hien **View Progress by Subject** trong module **Learning Progress**. Chuc nang xu ly cac du lieu chinh: **subject_id, progress percent, active roadmap**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Confirmed Roadmap, Subject assigned da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **View Progress by Subject** tren man hinh /student/dashboard.

### Main Flow

1. Student mo man hinh /student/dashboard.
2. He thong tai du lieu/phu thuoc can thiet: Confirmed Roadmap, Subject assigned.
3. Student nhap hoac chon du lieu lien quan: subject_id, progress percent, active roadmap.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/dashboard or /api/student/roadmaps/{id}/progress.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: learning_roadmaps, subjects.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den subject_id, progress percent, active roadmap phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - View Progress by Subject thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho subject_id, progress percent, active roadmap
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/dashboard or /api/student/roadmaps/{id}/progress
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua subject_id, progress percent, active roadmap
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu subject_id, progress percent, active roadmap sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu subject_id, progress percent, active roadmap nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/dashboard or /api/student/roadmaps/{id}/progress
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang View Progress by Subject duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Learning Progress |
| User Story ID | US-PROG-005 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/dashboard or /api/student/roadmaps/{id}/progress |
| Related Database Table | learning_roadmaps, subjects |
| Related UI Screen | /student/dashboard |
| Related Test Case | TC-PROG-005 |

## US-PROG-006 - View Upcoming Deadlines

**Priority:** P1  
**Story Point:** 3 - Lay assignment deadline va schedule upcoming.  
**Dependency:** Assignment, Schedule

### User Story

As a Student,  
I want to xem deadline sap toi,  
So that khong bo lo bai tap va hoat dong quan trong.

### Description

Nguoi dung/He thong thuc hien **View Upcoming Deadlines** trong module **Learning Progress**. Chuc nang xu ly cac du lieu chinh: **nearest deadline, overdue, next activity**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Assignment, Schedule da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **View Upcoming Deadlines** tren man hinh /student/dashboard.

### Main Flow

1. Student mo man hinh /student/dashboard.
2. He thong tai du lieu/phu thuoc can thiet: Assignment, Schedule.
3. Student nhap hoac chon du lieu lien quan: nearest deadline, overdue, next activity.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/dashboard, /api/student/assignments.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: assignments, study_schedules.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den nearest deadline, overdue, next activity phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - View Upcoming Deadlines thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho nearest deadline, overdue, next activity
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/dashboard, /api/student/assignments
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua nearest deadline, overdue, next activity
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu nearest deadline, overdue, next activity sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu nearest deadline, overdue, next activity nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/dashboard, /api/student/assignments
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang View Upcoming Deadlines duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Learning Progress |
| User Story ID | US-PROG-006 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/dashboard, /api/student/assignments |
| Related Database Table | assignments, study_schedules |
| Related UI Screen | /student/dashboard |
| Related Test Case | TC-PROG-006 |


## 14. AI Image Recognition User Stories

## US-IMG-001 - Upload Image for Recognition

**Priority:** P2  
**Story Point:** 5 - Upload validation va storage tam.  
**Dependency:** Login, AI image model integration

### User Story

As a Student,  
I want to upload anh can nhan dang,  
So that phan tich hinh anh phuc vu hoc tap.

### Description

Nguoi dung/He thong thuc hien **Upload Image for Recognition** trong module **AI Image Recognition**. Chuc nang xu ly cac du lieu chinh: **image file, MIME, size, owner, temporary storage**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Login, AI image model integration da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **Upload Image for Recognition** tren man hinh /student/ai-recognition.

### Main Flow

1. Student mo man hinh /student/ai-recognition.
2. He thong tai du lieu/phu thuoc can thiet: Login, AI image model integration.
3. Student nhap hoac chon du lieu lien quan: image file, MIME, size, owner, temporary storage.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/image-recognition/upload (proposed).
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: image_recognition_requests (proposed), users.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den image file, MIME, size, owner, temporary storage phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.
- AI API chi duoc goi tu backend PHP, khong goi truc tiep tu frontend.
- AI response phai duoc validate schema truoc khi hien thi hoac luu.
- AI Image Recognition doc lap va khong duoc dung de tao Learning Roadmap.

### Acceptance Criteria

**AC01 - Upload Image for Recognition thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho image file, MIME, size, owner, temporary storage
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/image-recognition/upload (proposed)
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua image file, MIME, size, owner, temporary storage
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu image file, MIME, size, owner, temporary storage sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu image file, MIME, size, owner, temporary storage nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/image-recognition/upload (proposed)
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Ap dung bo sung DoD-AI trong Section 16.
- Chuc nang Upload Image for Recognition duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | AI Image Recognition |
| User Story ID | US-IMG-001 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/image-recognition/upload (proposed) |
| Related Database Table | image_recognition_requests (proposed), users |
| Related UI Screen | /student/ai-recognition |
| Related Test Case | TC-IMG-001 |

## US-IMG-002 - Recognize Image with AI Model

**Priority:** P2  
**Story Point:** 13 - AI doc lap, schema/timeout/error va file security.  
**Dependency:** Upload Image, AI image model integration

### User Story

As a Student,  
I want to gui anh den AI model va nhan ket qua,  
So that biet class/object, confidence, bounding box va suggestion.

### Description

Nguoi dung/He thong thuc hien **Recognize Image with AI Model** trong module **AI Image Recognition**. Chuc nang xu ly cac du lieu chinh: **classes, confidence, bounding_box, related suggestion, not used for roadmap**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Upload Image, AI image model integration da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **Recognize Image with AI Model** tren man hinh /student/ai-recognition.

### Main Flow

1. Student mo man hinh /student/ai-recognition.
2. He thong tai du lieu/phu thuoc can thiet: Upload Image, AI image model integration.
3. Student nhap hoac chon du lieu lien quan: classes, confidence, bounding_box, related suggestion, not used for roadmap.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/image-recognition/analyze (proposed).
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: image_recognition_requests, image_recognition_results (proposed).
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den classes, confidence, bounding_box, related suggestion, not used for roadmap phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.
- AI API chi duoc goi tu backend PHP, khong goi truc tiep tu frontend.
- AI response phai duoc validate schema truoc khi hien thi hoac luu.
- AI Image Recognition doc lap va khong duoc dung de tao Learning Roadmap.

### Acceptance Criteria

**AC01 - Recognize Image with AI Model thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho classes, confidence, bounding_box, related suggestion, not used for roadmap
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/image-recognition/analyze (proposed)
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua classes, confidence, bounding_box, related suggestion, not used for roadmap
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu classes, confidence, bounding_box, related suggestion, not used for roadmap sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu classes, confidence, bounding_box, related suggestion, not used for roadmap nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/image-recognition/analyze (proposed)
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

**AC07 - Duplicate data**

Given du lieu classes, confidence, bounding_box, related suggestion, not used for roadmap vi pham rang buoc duy nhat neu chuc nang co duplicate rule
When submit
Then he thong phai tu choi duplicate
And khong tao ban ghi trung.

**AC08 - Server/database error**

Given backend hoac database gap loi
When Student thuc hien thao tac
Then he thong phai tra 500/503 than thien
And khong luu du lieu dang do.

**AC09 - UI state consistency**

Given thao tac Recognize Image with AI Model thanh cong hoac that bai
When UI nhan response
Then loading state ket thuc dung luc
And success/error/empty state khong gay nham lan.

**AC10 - Audit/log/security**

Given chuc nang Recognize Image with AI Model duoc thuc hien
When backend ghi log hoac audit
Then log du du lieu debug can thiet
And khong ghi password, token, API key hoac du lieu nhay cam.

**AC11 - AI timeout handling**

Given AI API khong phan hoi trong timeout cau hinh
When backend goi AI
Then API tra 503/504
And UI hien fallback/retry.

**AC12 - AI response schema validation**

Given AI tra response rong hoac sai schema
When backend parse response
Then he thong tu choi response khong hop le
And khong luu/hien thi ket qua sai.

**AC13 - API key protection**

Given nguoi dung kiem tra frontend source/network
When su dung chuc nang AI
Then khong co AI API key nao xuat hien o frontend.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Ap dung bo sung DoD-AI trong Section 16.
- Chuc nang Recognize Image with AI Model duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |
| OUT-08 | Recognition JSON | Response co class/object, confidence, bounding box neu co. |
| OUT-09 | Bounding Box Overlay | Box hien dung toa do tren anh. |
| OUT-10 | Related Suggestions | Noi dung de xuat lien quan ket qua. |
| OUT-11 | AI Isolation | Khong tao/cap nhat Learning Roadmap. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | AI Image Recognition |
| User Story ID | US-IMG-002 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10, AC11, AC12, AC13 |
| Related API | /api/student/image-recognition/analyze (proposed) |
| Related Database Table | image_recognition_requests, image_recognition_results (proposed) |
| Related UI Screen | /student/ai-recognition |
| Related Test Case | TC-IMG-002 |

## US-IMG-003 - View Recognition Result and Related Suggestions

**Priority:** P2  
**Story Point:** 5 - Render schema AI va low confidence.  
**Dependency:** Recognize Image with AI Model

### User Story

As a Student,  
I want to xem ket qua nhan dang va noi dung de xuat,  
So that su dung ket qua AI de ho tro hoc tap.

### Description

Nguoi dung/He thong thuc hien **View Recognition Result and Related Suggestions** trong module **AI Image Recognition**. Chuc nang xu ly cac du lieu chinh: **result detail, confidence, bounding boxes, empty/low confidence**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Recognize Image with AI Model da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **View Recognition Result and Related Suggestions** tren man hinh /student/ai-recognition/results/{id}.

### Main Flow

1. Student mo man hinh /student/ai-recognition/results/{id}.
2. He thong tai du lieu/phu thuoc can thiet: Recognize Image with AI Model.
3. Student nhap hoac chon du lieu lien quan: result detail, confidence, bounding boxes, empty/low confidence.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/image-recognition/results/{id} (proposed).
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: image_recognition_results (proposed).
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den result detail, confidence, bounding boxes, empty/low confidence phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.
- AI API chi duoc goi tu backend PHP, khong goi truc tiep tu frontend.
- AI response phai duoc validate schema truoc khi hien thi hoac luu.
- AI Image Recognition doc lap va khong duoc dung de tao Learning Roadmap.

### Acceptance Criteria

**AC01 - View Recognition Result and Related Suggestions thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho result detail, confidence, bounding boxes, empty/low confidence
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/image-recognition/results/{id} (proposed)
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua result detail, confidence, bounding boxes, empty/low confidence
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu result detail, confidence, bounding boxes, empty/low confidence sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu result detail, confidence, bounding boxes, empty/low confidence nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/image-recognition/results/{id} (proposed)
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Ap dung bo sung DoD-AI trong Section 16.
- Chuc nang View Recognition Result and Related Suggestions duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | AI Image Recognition |
| User Story ID | US-IMG-003 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/image-recognition/results/{id} (proposed) |
| Related Database Table | image_recognition_results (proposed) |
| Related UI Screen | /student/ai-recognition/results/{id} |
| Related Test Case | TC-IMG-003 |


## 15. Dashboard User Stories

## US-DASH-001 - View Admin Dashboard

**Priority:** P1  
**Story Point:** 5 - Aggregate nhieu bang va permission admin.  
**Dependency:** Login, Admin authorization

### User Story

As a Admin,  
I want to xem dashboard quan tri,  
So that nam tinh hinh sinh vien, mon hoc, account, assignment, submission va progress.

### Description

Nguoi dung/He thong thuc hien **View Admin Dashboard** trong module **Dashboard**. Chuc nang xu ly cac du lieu chinh: **total students, subjects, active/inactive, assignment stats, submissions, progress**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Login, Admin authorization da san sang.
- Nguoi dung co dung role: Admin.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Admin thuc hien thao tac **View Admin Dashboard** tren man hinh /admin/dashboard.

### Main Flow

1. Admin mo man hinh /admin/dashboard.
2. He thong tai du lieu/phu thuoc can thiet: Login, Admin authorization.
3. Admin nhap hoac chon du lieu lien quan: total students, subjects, active/inactive, assignment stats, submissions, progress.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/admin/dashboard.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: users, subjects, assignments, assignment_submissions, learning_roadmaps.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den total students, subjects, active/inactive, assignment stats, submissions, progress phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - View Admin Dashboard thanh cong**

Given Admin da dap ung dieu kien tien quyet
And du lieu hop le cho total students, subjects, active/inactive, assignment stats, submissions, progress
When Admin xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/admin/dashboard
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Admin dang o man hinh chuc nang
When bo trong truong bat buoc cua total students, subjects, active/inactive, assignment stats, submissions, progress
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu total students, subjects, active/inactive, assignment stats, submissions, progress sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu total students, subjects, active/inactive, assignment stats, submissions, progress nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/admin/dashboard
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang View Admin Dashboard duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Dashboard |
| User Story ID | US-DASH-001 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/admin/dashboard |
| Related Database Table | users, subjects, assignments, assignment_submissions, learning_roadmaps |
| Related UI Screen | /admin/dashboard |
| Related Test Case | TC-DASH-001 |

## US-DASH-002 - View Student Dashboard

**Priority:** P1  
**Story Point:** 5 - Aggregate ca nhan dung owner.  
**Dependency:** Login, Student authorization, Schedule/Assignment/Roadmap data

### User Story

As a Student,  
I want to xem dashboard hoc tap ca nhan,  
So that biet lich hom nay, deadline, muc tieu, progress va activity tiep theo.

### Description

Nguoi dung/He thong thuc hien **View Student Dashboard** trong module **Dashboard**. Chuc nang xu ly cac du lieu chinh: **today schedule, nearest deadline, active goal, roadmap progress, incomplete assignments**. He thong phai phan hoi ro rang tren UI, API va database; dong thoi bao dam authorization theo role, validation hai lop va khong lam anh huong cac chuc nang hien co.

### Preconditions

- Login, Student authorization, Schedule/Assignment/Roadmap data da san sang.
- Nguoi dung co dung role: Student.
- Backend, frontend va database dang hoat dong.
- Neu lien quan du lieu chu so huu, ban ghi phai thuoc dung nguoi dung dang nhap.

### Trigger

Student thuc hien thao tac **View Student Dashboard** tren man hinh /student/dashboard.

### Main Flow

1. Student mo man hinh /student/dashboard.
2. He thong tai du lieu/phu thuoc can thiet: Login, Student authorization, Schedule/Assignment/Roadmap data.
3. Student nhap hoac chon du lieu lien quan: today schedule, nearest deadline, active goal, roadmap progress, incomplete assignments.
4. Frontend React validate du lieu dau vao va hien loi tai truong neu co.
5. Frontend gui request den /api/student/dashboard.
6. Backend PHP MVC xac thuc, kiem tra role/status, validate payload va xu ly business rule.
7. Backend thao tac voi bang: study_schedules, assignments, assignment_submissions, learning_goals, learning_roadmaps.
8. He thong tra response ro rang va UI cap nhat trang thai moi.

### Alternative Flow

- Nguoi dung huy thao tac truoc khi luu; he thong quay lai man hinh truoc va khong doi database.
- Danh sach khong co du lieu; UI hien empty state va hanh dong tiep theo phu hop.
- Nguoi dung refresh trang; frontend tai lai du lieu moi nhat tu backend.

### Exception Flow

- Du lieu thieu/sai format/vuot boundary: API tra 422 va chi ro truong loi.
- Nguoi dung chua dang nhap/sai role/status inactive/locked: API tra 401/403.
- Ban ghi khong ton tai hoac khong thuoc owner: API tra 404/403.
- Loi database/API/AI neu co: API tra 500/503/504 va UI hien message than thien.

### Business Rules

- Backend la nguon quyet dinh validation va permission; khong tin payload role/owner tu frontend.
- Du lieu lien quan den today schedule, nearest deadline, active goal, roadmap progress, incomplete assignments phai duoc validate o ca frontend va backend.
- Moi thao tac thay doi du lieu phai dam bao tinh nhat quan database va khong ghi du lieu dang do.
- Response loi khong duoc expose stack trace, token, password hash hoac API key.

### Acceptance Criteria

**AC01 - View Student Dashboard thanh cong**

Given Student da dap ung dieu kien tien quyet
And du lieu hop le cho today schedule, nearest deadline, active goal, roadmap progress, incomplete assignments
When Student xac nhan thao tac
Then he thong phai xu ly thanh cong qua /api/student/dashboard
And UI hien thi ket qua moi nhat.

**AC02 - Empty required data**

Given Student dang o man hinh chuc nang
When bo trong truong bat buoc cua today schedule, nearest deadline, active goal, roadmap progress, incomplete assignments
Then frontend phai chan submit neu co the
And backend phai tra 422 neu request van duoc gui.

**AC03 - Invalid data validation**

Given du lieu today schedule, nearest deadline, active goal, roadmap progress, incomplete assignments sai dinh dang hoac khong hop le
When gui request den backend
Then API phai tra 422 voi message ro rang
And database khong thay doi.

**AC04 - Boundary validation**

Given du lieu today schedule, nearest deadline, active goal, roadmap progress, incomplete assignments nam tai bien min/max
When thuc hien thao tac
Then he thong chap nhan gia tri bien hop le
And tu choi gia tri vuot bien.

**AC05 - Permission validation**

Given nguoi dung chua dang nhap hoac sai role
When truy cap /api/student/dashboard
Then API phai tra 401/403
And khong tra du lieu nhay cam.

**AC06 - Not found or unavailable data**

Given ban ghi lien quan khong ton tai, bi xoa hoac khong thuoc nguoi dung
When thuc hien thao tac
Then API phai tra 404/403 phu hop
And UI hien thong bao co the hieu duoc.

### Definition of Done

- Ap dung day du DoD-GEN trong Section 16.
- Chuc nang View Student Dashboard duoc verify tren UI, API, database va test case lien quan.

### Output Criteria

| Output ID | Output | Expected Result |
| --- | --- | --- |
| OUT-01 | UI | Man hinh hien thi dung, co loading/empty/error state. |
| OUT-02 | API | API tra dung HTTP status va schema. |
| OUT-03 | Database | Du lieu luu/truy van dung database va dung owner. |
| OUT-04 | Validation | Invalid/empty/boundary data bi tu choi. |
| OUT-05 | Permission | Chi dung role duoc phep thao tac. |
| OUT-06 | Error Handling | Loi duoc xu ly va thong bao ro. |
| OUT-07 | Testing | Acceptance Criteria tuong ung da pass. |

### Traceability

| Item | Reference |
| --- | --- |
| Module | Dashboard |
| User Story ID | US-DASH-002 |
| Acceptance Criteria | AC01, AC02, AC03, AC04, AC05, AC06 |
| Related API | /api/student/dashboard |
| Related Database Table | study_schedules, assignments, assignment_submissions, learning_goals, learning_roadmaps |
| Related UI Screen | /student/dashboard |
| Related Test Case | TC-DASH-002 |


## 16. Definition of Done

### DoD-GEN - Ap dung cho moi User Story

- UI da hoan thanh.
- Backend API da hoan thanh.
- Database da xu ly dung.
- Validation frontend hoat dong.
- Validation backend hoat dong.
- Authorization/Permission dung.
- Error message ro rang.
- Khong xuat hien loi Critical/Blocker.
- Khong con bug High severity chua xu ly.
- Acceptance Criteria da pass.
- Test Case da duoc viet.
- Test Case Critical/High da duoc execute.
- API da duoc kiem thu.
- Du lieu luu database chinh xac.
- Khong lam anh huong cac chuc nang hien co.
- Co xu ly truong hop API/database bi loi.
- Code da duoc commit len Git.
- Co the deploy len moi truong test/staging.

### DoD-AI - Bo sung cho User Story lien quan AI

- AI response dung schema.
- Co xu ly timeout.
- Co xu ly API error.
- Co xu ly response rong.
- Khong expose API key o frontend.
- AI output khong duoc luu truc tiep neu can user confirm.
- Co fallback/error message khi AI khong phan hoi.
- Co log can thiet de debug va khong log secret.

### Ghi chu ap dung

Moi User Story co muc Definition of Done rieng. Khi nghiem thu, QA phai check day du DoD-GEN va DoD-AI neu story lien quan AI.

## 17. Dependency Matrix

| User Story ID | Dependency | Impact if Missing |
| --- | --- | --- |
| US-AUTH-001 | None | Co the thuc hien doc lap. |
| US-AUTH-002 | Registered active account | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-AUTH-003 | Login | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-AUTH-004 | Login, roles table, AuthMiddleware, RoleMiddleware | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-AUTH-005 | Login | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-AUTH-006 | Login | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-AUTH-007 | Account status, AuthMiddleware | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-STU-001 | Login, Admin authorization | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-STU-002 | View Student List | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-STU-003 | Student exists | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-STU-004 | Student exists | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-STU-005 | Student exists | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-STU-006 | Disabled student account | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-STU-007 | Admin authorization, import template | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-STU-008 | View Student List | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-SUB-001 | Login | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-SUB-002 | Admin authorization | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-SUB-003 | Subject exists | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-SUB-004 | Subject exists | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-SUB-005 | View Subject List | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-SUB-006 | Subject exists, Student exists | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-SUB-007 | Assigned student | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-ASM-001 | Admin authorization, Subject exists | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-ASM-002 | Assignment exists | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-ASM-003 | Assignment exists | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-ASM-004 | Assignment exists | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-ASM-005 | Admin authorization | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-ASM-006 | Student assigned to subject | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-ASM-007 | Login, Assignment open, Student assigned to subject | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-ASM-008 | Submit Assignment | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-GRD-001 | Assignment exists, Subject enrollment | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-GRD-002 | Submission exists | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-GRD-003 | View Submission Detail | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-GRD-004 | Submission graded | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-GRD-005 | Submission graded | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-SCH-001 | Login, Subject assigned | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-SCH-002 | Schedule exists | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-SCH-003 | Schedule exists | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-SCH-004 | Login | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-SCH-005 | Subject assigned, Learning goal optional | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-GOAL-001 | Login, Subject assigned | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-GOAL-002 | Learning goal exists | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-GOAL-003 | Learning goal exists | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-GOAL-004 | Login | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-GOAL-005 | Learning goal exists | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-AIR-001 | Login, Subject, Learning Goal, AI API Integration | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-AIR-002 | Generate AI Roadmap Suggestion | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-AIR-003 | View Roadmap Suggestion | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-AIR-004 | Generate Roadmap, Edit Roadmap | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-AIR-005 | Confirm Roadmap, Schedule Management | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-AIR-006 | Confirmed Roadmap | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-AIR-007 | Login | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-PROG-001 | Confirmed Roadmap | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-PROG-002 | Confirmed Roadmap | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-PROG-003 | Confirmed Roadmap item | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-PROG-004 | Confirmed Roadmap | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-PROG-005 | Confirmed Roadmap, Subject assigned | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-PROG-006 | Assignment, Schedule | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-IMG-001 | Login, AI image model integration | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-IMG-002 | Upload Image, AI image model integration | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-IMG-003 | Recognize Image with AI Model | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-DASH-001 | Login, Admin authorization | Khong the hoan thanh end-to-end neu dependency chua san sang. |
| US-DASH-002 | Login, Student authorization, Schedule/Assignment/Roadmap data | Khong the hoan thanh end-to-end neu dependency chua san sang. |

## 18. User Story Summary

| User Story ID | Module | Role | User Story | Priority | Story Point | Dependency |
| --- | --- | --- | --- | --- | ---: | --- |
| US-AUTH-001 | Authentication | Guest | Register Student Account | P0 | 5 | None |
| US-AUTH-002 | Authentication | Admin/Student | Login | P0 | 8 | Registered active account |
| US-AUTH-003 | Authentication | Admin/Student | Logout | P0 | 3 | Login |
| US-AUTH-004 | Authentication | System | Role Based Authorization | P0 | 8 | Login, roles table, AuthMiddleware, RoleMiddleware |
| US-AUTH-005 | Authentication | Admin/Student | Change Password | P1 | 5 | Login |
| US-AUTH-006 | Authentication | Admin/Student | Check Current Account Status | P1 | 3 | Login |
| US-AUTH-007 | Authentication | System | Block Inactive or Locked Access | P0 | 5 | Account status, AuthMiddleware |
| US-STU-001 | Student Management | Admin | View Student List | P1 | 3 | Login, Admin authorization |
| US-STU-002 | Student Management | Admin | Create Student | P1 | 5 | View Student List |
| US-STU-003 | Student Management | Admin | Update Student Information | P1 | 5 | Student exists |
| US-STU-004 | Student Management | Admin | Delete Student | P1 | 5 | Student exists |
| US-STU-005 | Student Management | Admin | Disable Student Account | P1 | 3 | Student exists |
| US-STU-006 | Student Management | Admin | Enable Student Account | P1 | 3 | Disabled student account |
| US-STU-007 | Student Management | Admin | Import Students by CSV/Excel | P1 | 13 | Admin authorization, import template |
| US-STU-008 | Student Management | Admin | Search and Filter Students | P1 | 3 | View Student List |
| US-SUB-001 | Subject Management | Admin/Student | View Subject List | P1 | 3 | Login |
| US-SUB-002 | Subject Management | Admin | Create Subject | P1 | 5 | Admin authorization |
| US-SUB-003 | Subject Management | Admin | Update Subject | P1 | 5 | Subject exists |
| US-SUB-004 | Subject Management | Admin | Delete Subject | P1 | 5 | Subject exists |
| US-SUB-005 | Subject Management | Admin/Student | Search and Filter Subjects | P1 | 3 | View Subject List |
| US-SUB-006 | Subject Management | Admin | Assign Student to Subject | P1 | 5 | Subject exists, Student exists |
| US-SUB-007 | Subject Management | Admin | Remove Student from Subject | P1 | 5 | Assigned student |
| US-ASM-001 | Assignment Management | Admin | Create Assignment | P1 | 5 | Admin authorization, Subject exists |
| US-ASM-002 | Assignment Management | Admin | Update Assignment | P1 | 5 | Assignment exists |
| US-ASM-003 | Assignment Management | Admin | Delete Assignment | P1 | 5 | Assignment exists |
| US-ASM-004 | Assignment Management | Admin | Set Assignment Deadline and Status | P1 | 5 | Assignment exists |
| US-ASM-005 | Assignment Management | Admin | View Assignment List as Admin | P2 | 3 | Admin authorization |
| US-ASM-006 | Assignment Management | Student | View Assignments and Deadlines as Student | P1 | 3 | Student assigned to subject |
| US-ASM-007 | Assignment Management | Student | Submit Assignment | P1 | 8 | Login, Assignment open, Student assigned to subject |
| US-ASM-008 | Assignment Management | Student | View Submission Status as Student | P1 | 3 | Submit Assignment |
| US-GRD-001 | Submission & Grading | Admin | View Submitted and Missing Students | P1 | 5 | Assignment exists, Subject enrollment |
| US-GRD-002 | Submission & Grading | Admin | View Submission Detail | P1 | 5 | Submission exists |
| US-GRD-003 | Submission & Grading | Admin | Grade Submission and Add Feedback | P1 | 8 | View Submission Detail |
| US-GRD-004 | Submission & Grading | Student | View Grade | P1 | 3 | Submission graded |
| US-GRD-005 | Submission & Grading | Student | View Feedback | P1 | 3 | Submission graded |
| US-SCH-001 | Schedule Management | Student | Create Study Schedule | P1 | 5 | Login, Subject assigned |
| US-SCH-002 | Schedule Management | Student | Update Study Schedule | P1 | 5 | Schedule exists |
| US-SCH-003 | Schedule Management | Student | Delete Study Schedule | P1 | 3 | Schedule exists |
| US-SCH-004 | Schedule Management | Student | View Schedule by Day Week Month | P1 | 5 | Login |
| US-SCH-005 | Schedule Management | Student | Set Study Time for Subject or Goal | P1 | 5 | Subject assigned, Learning goal optional |
| US-GOAL-001 | Learning Goal | Student | Create Learning Goal | P1 | 8 | Login, Subject assigned |
| US-GOAL-002 | Learning Goal | Student | Update Learning Goal | P1 | 5 | Learning goal exists |
| US-GOAL-003 | Learning Goal | Student | Delete Learning Goal | P1 | 3 | Learning goal exists |
| US-GOAL-004 | Learning Goal | Student | View Learning Goal List and Detail | P1 | 3 | Login |
| US-GOAL-005 | Learning Goal | Student | Track Learning Goal Status | P1 | 5 | Learning goal exists |
| US-AIR-001 | AI Learning Roadmap | Student | Generate AI Roadmap Suggestion | P1 | 13 | Login, Subject, Learning Goal, AI API Integration |
| US-AIR-002 | AI Learning Roadmap | Student | View Roadmap Suggestion | P1 | 5 | Generate AI Roadmap Suggestion |
| US-AIR-003 | AI Learning Roadmap | Student | Edit Roadmap Suggestion | P1 | 8 | View Roadmap Suggestion |
| US-AIR-004 | AI Learning Roadmap | Student | Confirm Roadmap and Save | P1 | 13 | Generate Roadmap, Edit Roadmap |
| US-AIR-005 | AI Learning Roadmap | System | Auto Create Schedule Items from Confirmed Roadmap | P1 | 8 | Confirm Roadmap, Schedule Management |
| US-AIR-006 | AI Learning Roadmap | Student | Update Roadmap Item Schedule or Result | P1 | 5 | Confirmed Roadmap |
| US-AIR-007 | AI Learning Roadmap | Student | View AI Service Status | P2 | 3 | Login |
| US-PROG-001 | Learning Progress | Student | View Roadmap Completion Percent | P1 | 5 | Confirmed Roadmap |
| US-PROG-002 | Learning Progress | Student | View Completed and Pending Tasks | P1 | 3 | Confirmed Roadmap |
| US-PROG-003 | Learning Progress | Student | Mark Roadmap Task Completed | P1 | 5 | Confirmed Roadmap item |
| US-PROG-004 | Learning Progress | Student | View Daily Progress | P1 | 5 | Confirmed Roadmap |
| US-PROG-005 | Learning Progress | Student | View Progress by Subject | P1 | 5 | Confirmed Roadmap, Subject assigned |
| US-PROG-006 | Learning Progress | Student | View Upcoming Deadlines | P1 | 3 | Assignment, Schedule |
| US-IMG-001 | AI Image Recognition | Student | Upload Image for Recognition | P2 | 5 | Login, AI image model integration |
| US-IMG-002 | AI Image Recognition | Student | Recognize Image with AI Model | P2 | 13 | Upload Image, AI image model integration |
| US-IMG-003 | AI Image Recognition | Student | View Recognition Result and Related Suggestions | P2 | 5 | Recognize Image with AI Model |
| US-DASH-001 | Dashboard | Admin | View Admin Dashboard | P1 | 5 | Login, Admin authorization |
| US-DASH-002 | Dashboard | Student | View Student Dashboard | P1 | 5 | Login, Student authorization, Schedule/Assignment/Roadmap data |

## 19. Requirement Traceability Matrix

| User Story | Acceptance Criteria | API | Database | UI | Test Case |
| --- | --- | --- | --- | --- | --- |
| US-AUTH-001 | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10 | /api/register | users, roles | /register | TC-AUTH-001 |
| US-AUTH-002 | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10 | /api/login | users, roles | /login | TC-AUTH-002 |
| US-AUTH-003 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/logout | token/session store neu co | Header account menu | TC-AUTH-003 |
| US-AUTH-004 | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10 | All protected API routes | users, roles | PrivateRoute/AdminRoute/StudentRoute | TC-AUTH-004 |
| US-AUTH-005 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/change-password (proposed) | users | /profile/change-password | TC-AUTH-005 |
| US-AUTH-006 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/me | users, roles | AuthContext/account menu | TC-AUTH-006 |
| US-AUTH-007 | AC01, AC02, AC03, AC04, AC05, AC06 | All protected API routes | users | PrivateRoute/AdminRoute/StudentRoute | TC-AUTH-007 |
| US-STU-001 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/admin/students | users, roles | /admin/students | TC-STU-001 |
| US-STU-002 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/admin/students | users, roles | /admin/students/create | TC-STU-002 |
| US-STU-003 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/admin/students/{id} | users | /admin/students/{id}/edit | TC-STU-003 |
| US-STU-004 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/admin/students/{id} | users, student_subjects, assignment_submissions, learning_roadmaps | /admin/students/{id} | TC-STU-004 |
| US-STU-005 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/admin/students/{id}/disable | users | /admin/students | TC-STU-005 |
| US-STU-006 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/admin/students/{id}/enable | users | /admin/students | TC-STU-006 |
| US-STU-007 | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10 | /api/admin/students/import | users, roles, import_logs (proposed) | /admin/students/import | TC-STU-007 |
| US-STU-008 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/admin/students?search=&status=&page= | users, roles | /admin/students | TC-STU-008 |
| US-SUB-001 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/subjects or /api/student/my-subjects | subjects, student_subjects | /admin/subjects, /student/subjects | TC-SUB-001 |
| US-SUB-002 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/subjects | subjects | /admin/subjects/create | TC-SUB-002 |
| US-SUB-003 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/subjects/{id} | subjects | /admin/subjects/{id}/edit | TC-SUB-003 |
| US-SUB-004 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/subjects/{id} | subjects, student_subjects, assignments, learning_goals | /admin/subjects/{id} | TC-SUB-004 |
| US-SUB-005 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/subjects?search=&status= | subjects | /admin/subjects, /student/subjects | TC-SUB-005 |
| US-SUB-006 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/admin/subjects/{subjectId}/students | student_subjects, users, subjects | /admin/subjects/{subjectId}/students | TC-SUB-006 |
| US-SUB-007 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/admin/subjects/{subjectId}/students/{studentId} | student_subjects | /admin/subjects/{subjectId}/students | TC-SUB-007 |
| US-ASM-001 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/admin/assignments | assignments, subjects | /admin/assignments/create | TC-ASM-001 |
| US-ASM-002 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/admin/assignments/{id} | assignments | /admin/assignments/{id}/edit | TC-ASM-002 |
| US-ASM-003 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/admin/assignments/{id} | assignments, assignment_submissions | /admin/assignments/{id} | TC-ASM-003 |
| US-ASM-004 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/admin/assignments/{id} | assignments | /admin/assignments/{id}/edit | TC-ASM-004 |
| US-ASM-005 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/admin/assignments | assignments, subjects | /admin/assignments | TC-ASM-005 |
| US-ASM-006 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/assignments | assignments, student_subjects | /student/assignments | TC-ASM-006 |
| US-ASM-007 | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10 | /api/student/assignments/{assignmentId}/submit | assignment_submissions, assignments | /student/assignments/{assignmentId}/submit | TC-ASM-007 |
| US-ASM-008 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/assignments/{assignmentId}/submission | assignment_submissions | /student/submissions/{id} | TC-ASM-008 |
| US-GRD-001 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/admin/assignments/{assignmentId}/submissions | assignments, student_subjects, assignment_submissions | /admin/assignments/{assignmentId}/submissions | TC-GRD-001 |
| US-GRD-002 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/admin/submissions/{id} | assignment_submissions, assignments, users | /admin/submissions/{id} | TC-GRD-002 |
| US-GRD-003 | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10 | /api/admin/submissions/{id}/grade | assignment_submissions, users | /admin/submissions/{id} | TC-GRD-003 |
| US-GRD-004 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/grades, /api/student/submissions/{id}/grade | assignment_submissions | /student/grades | TC-GRD-004 |
| US-GRD-005 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/submissions/{id}/grade | assignment_submissions | /student/grades/{submissionId} | TC-GRD-005 |
| US-SCH-001 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/study-schedules | study_schedules, subjects | /student/schedules/create | TC-SCH-001 |
| US-SCH-002 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/study-schedules/{id} | study_schedules | /student/schedules/{id}/edit | TC-SCH-002 |
| US-SCH-003 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/study-schedules/{id} | study_schedules | /student/schedules/{id} | TC-SCH-003 |
| US-SCH-004 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/study-schedules?view=day|week|month&date= | study_schedules | /student/schedules | TC-SCH-004 |
| US-SCH-005 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/study-schedules | study_schedules, learning_goals, learning_roadmap_items | /student/schedules/create | TC-SCH-005 |
| US-GOAL-001 | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10 | /api/student/learning-goals | learning_goals, subjects, users | /student/learning-goals/create | TC-GOAL-001 |
| US-GOAL-002 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/learning-goals/{id} | learning_goals | /student/learning-goals/{id}/edit | TC-GOAL-002 |
| US-GOAL-003 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/learning-goals/{id} | learning_goals, learning_roadmaps | /student/learning-goals/{id} | TC-GOAL-003 |
| US-GOAL-004 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/learning-goals, /api/student/learning-goals/{id} | learning_goals, subjects | /student/learning-goals | TC-GOAL-004 |
| US-GOAL-005 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/learning-goals/{id} | learning_goals, learning_roadmaps | /student/learning-goals/{id} | TC-GOAL-005 |
| US-AIR-001 | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10, AC11, AC12, AC13 | /api/student/roadmaps/generate-ai | No persistent write before confirm; ai_logs (proposed) | /student/roadmaps/generate | TC-AIR-001 |
| US-AIR-002 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/roadmaps/generate-ai response | No persistent write before confirm | /student/roadmaps/preview | TC-AIR-002 |
| US-AIR-003 | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10 | Client-side edit then /api/student/roadmaps on confirm | No persistent write before confirm | /student/roadmaps/preview | TC-AIR-003 |
| US-AIR-004 | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10, AC11, AC12, AC13 | /api/student/roadmaps | learning_roadmaps, learning_roadmap_items | /student/roadmaps/preview | TC-AIR-004 |
| US-AIR-005 | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10 | /api/student/roadmaps | study_schedules, learning_roadmap_items, learning_roadmaps | /student/schedules | TC-AIR-005 |
| US-AIR-006 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/roadmap-items/{id}/schedule, /api/student/roadmap-items/{id}/result | learning_roadmap_items, study_schedules | /student/roadmaps/{id}/edit | TC-AIR-006 |
| US-AIR-007 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/roadmaps/ai-status | ai_logs/config (proposed) | /student/roadmaps/generate | TC-AIR-007 |
| US-PROG-001 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/roadmaps/{id}/progress | learning_roadmaps, learning_roadmap_items | /student/roadmaps/{id} | TC-PROG-001 |
| US-PROG-002 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/roadmaps/{id} | learning_roadmap_items | /student/roadmaps/{id} | TC-PROG-002 |
| US-PROG-003 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/roadmap-items/{id}/status | learning_roadmap_items, learning_roadmaps | /student/roadmaps/{id} | TC-PROG-003 |
| US-PROG-004 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/roadmaps/{id}/progress?group_by=day | learning_roadmap_items, study_schedules | /student/roadmaps/{id}/progress | TC-PROG-004 |
| US-PROG-005 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/dashboard or /api/student/roadmaps/{id}/progress | learning_roadmaps, subjects | /student/dashboard | TC-PROG-005 |
| US-PROG-006 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/dashboard, /api/student/assignments | assignments, study_schedules | /student/dashboard | TC-PROG-006 |
| US-IMG-001 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/image-recognition/upload (proposed) | image_recognition_requests (proposed), users | /student/ai-recognition | TC-IMG-001 |
| US-IMG-002 | AC01, AC02, AC03, AC04, AC05, AC06, AC07, AC08, AC09, AC10, AC11, AC12, AC13 | /api/student/image-recognition/analyze (proposed) | image_recognition_requests, image_recognition_results (proposed) | /student/ai-recognition | TC-IMG-002 |
| US-IMG-003 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/image-recognition/results/{id} (proposed) | image_recognition_results (proposed) | /student/ai-recognition/results/{id} | TC-IMG-003 |
| US-DASH-001 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/admin/dashboard | users, subjects, assignments, assignment_submissions, learning_roadmaps | /admin/dashboard | TC-DASH-001 |
| US-DASH-002 | AC01, AC02, AC03, AC04, AC05, AC06 | /api/student/dashboard | study_schedules, assignments, assignment_submissions, learning_goals, learning_roadmaps | /student/dashboard | TC-DASH-002 |
