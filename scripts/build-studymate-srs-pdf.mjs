import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs/promises";
import path from "node:path";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const python = "C:\\Users\\ASUS\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe";
const scriptPath = path.join(root, "tmp/pdfs/build_studymate_srs.py");

const pythonSource = String.raw`
from __future__ import annotations

from datetime import date
from pathlib import Path
import re
import textwrap

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(r"C:\xampp\htdocs\StudyMate")
OUTPUT_DIR = ROOT / "output" / "pdf"
DOCS_DIR = ROOT / "docs" / "srs-testing"
DIAGRAM_DIR = DOCS_DIR / "diagrams" / "by-function"
PDF_PATH = OUTPUT_DIR / "SRS_StudyMate_v1.0.pdf"
MD_PATH = DOCS_DIR / "SRS_StudyMate_v1.0.md"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
MD_PATH.parent.mkdir(parents=True, exist_ok=True)

FONT_REGULAR = r"C:\Windows\Fonts\arial.ttf"
FONT_BOLD = r"C:\Windows\Fonts\arialbd.ttf"
FONT_ITALIC = r"C:\Windows\Fonts\ariali.ttf"
FONT_BOLD_ITALIC = r"C:\Windows\Fonts\arialbi.ttf"

pdfmetrics.registerFont(TTFont("DocFont", FONT_REGULAR))
pdfmetrics.registerFont(TTFont("DocFont-Bold", FONT_BOLD))
pdfmetrics.registerFont(TTFont("DocFont-Italic", FONT_ITALIC))
pdfmetrics.registerFont(TTFont("DocFont-BoldItalic", FONT_BOLD_ITALIC))

PAGE_WIDTH, PAGE_HEIGHT = A4

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="DocTitle",
    fontName="DocFont-Bold",
    fontSize=19,
    leading=25,
    alignment=TA_CENTER,
    spaceAfter=16,
))
styles.add(ParagraphStyle(
    name="DocSubtitle",
    fontName="DocFont",
    fontSize=13,
    leading=18,
    alignment=TA_CENTER,
    spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="Heading1VN",
    fontName="DocFont-Bold",
    fontSize=15,
    leading=20,
    spaceBefore=14,
    spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="Heading2VN",
    fontName="DocFont-Bold",
    fontSize=13,
    leading=18,
    spaceBefore=10,
    spaceAfter=6,
))
styles.add(ParagraphStyle(
    name="Heading3VN",
    fontName="DocFont-Bold",
    fontSize=11.5,
    leading=16,
    spaceBefore=8,
    spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="BodyVN",
    fontName="DocFont",
    fontSize=10,
    leading=14,
    alignment=TA_LEFT,
    spaceAfter=5,
))
styles.add(ParagraphStyle(
    name="SmallVN",
    fontName="DocFont",
    fontSize=8.5,
    leading=11,
    spaceAfter=3,
))
styles.add(ParagraphStyle(
    name="TableCell",
    fontName="DocFont",
    fontSize=8.2,
    leading=10.5,
))
styles.add(ParagraphStyle(
    name="TableHeader",
    fontName="DocFont-Bold",
    fontSize=8.4,
    leading=10.5,
    alignment=TA_CENTER,
))
styles.add(ParagraphStyle(
    name="Caption",
    fontName="DocFont-Italic",
    fontSize=8.5,
    leading=11,
    alignment=TA_CENTER,
    spaceBefore=3,
    spaceAfter=8,
))

def esc(text: object) -> str:
    text = "" if text is None else str(text)
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\n", "<br/>")
    )

def P(text: str, style: str = "BodyVN"):
    return Paragraph(esc(text), styles[style])

def bullets(items):
    return ListFlowable(
        [ListItem(P(item), leftIndent=8) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=16,
        bulletFontName="DocFont",
        bulletFontSize=7,
    )

def numbered(items):
    return ListFlowable(
        [ListItem(P(item), leftIndent=10) for item in items],
        bulletType="1",
        leftIndent=16,
        bulletFontName="DocFont",
        bulletFontSize=8,
    )

def table(data, widths=None, repeat_rows=1, font_size=8.2):
    rows = []
    for r, row in enumerate(data):
        style = "TableHeader" if r < repeat_rows else "TableCell"
        rows.append([Paragraph(esc(cell), styles[style]) for cell in row])
    t = Table(rows, colWidths=widths, repeatRows=repeat_rows, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#6b7280")),
        ("BACKGROUND", (0, 0), (-1, repeat_rows - 1), colors.HexColor("#e5e7eb")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return t

def image(path: Path, caption: str, max_w=15.2*cm, max_h=12*cm):
    if not path.exists():
        return [P(f"[Không tìm thấy hình: {path.name}]", "SmallVN")]
    img = Image(str(path))
    ratio = min(max_w / img.imageWidth, max_h / img.imageHeight)
    img.drawWidth = img.imageWidth * ratio
    img.drawHeight = img.imageHeight * ratio
    return [img, Paragraph(esc(caption), styles["Caption"])]

FUNCTIONS = [
    {
        "no": 1,
        "title": "Chức năng đăng ký, đăng nhập và quản lý phiên",
        "usecase_id": "UC_AUTH",
        "usecase_name": "Đăng ký, đăng nhập, xem thông tin tài khoản và đăng xuất",
        "brief": "Chức năng xác thực là cổng truy cập của StudyMate AI. Hệ thống cho phép người dùng đăng ký tài khoản sinh viên, đăng nhập bằng email và mật khẩu, nhận JWT token, truy cập thông tin tài khoản hiện tại qua /api/me và đăng xuất khỏi giao diện.",
        "actors": "Guest, Admin, Student",
        "requirements": "FR-AUTH-01 đến FR-AUTH-05; NFR-01, NFR-02",
        "basic": [
            "Guest mở màn hình đăng ký hoặc đăng nhập.",
            "Với đăng ký, người dùng nhập họ tên, email, mật khẩu, xác nhận mật khẩu, số điện thoại và mã sinh viên nếu có.",
            "Hệ thống kiểm tra dữ liệu, kiểm tra email trùng và tạo tài khoản role student ở trạng thái active.",
            "Với đăng nhập, người dùng nhập email và mật khẩu.",
            "Hệ thống xác thực mật khẩu, kiểm tra trạng thái tài khoản, sinh JWT token và trả redirect_url theo role.",
            "Frontend lưu token, gọi /api/me khi cần xác minh phiên và chuyển người dùng đến dashboard phù hợp.",
            "Khi đăng xuất, frontend gọi /api/logout, xóa token/session và chuyển về màn hình đăng nhập."
        ],
        "alternative": [
            "Email đăng ký đã tồn tại: hệ thống trả 422 và hiển thị lỗi tại trường email.",
            "Password dưới 6 ký tự hoặc confirm password không khớp: hệ thống không tạo tài khoản.",
            "Sai email hoặc mật khẩu khi đăng nhập: hệ thống trả 401.",
            "Tài khoản locked hoặc inactive: hệ thống trả 403.",
            "Thiếu token ở API cần xác thực: hệ thống trả 401; token sai hoặc hết hạn trả 403."
        ],
        "special": [
            "Mật khẩu phải được hash trước khi lưu.",
            "JWT payload chứa user_id, email và role.",
            "Thông tin public user không được trả về password.",
            "Role admin và student phải được phân quyền qua middleware."
        ],
        "pre": [
            "Đăng nhập yêu cầu tài khoản tồn tại và active.",
            "Các API /api/me, /api/logout yêu cầu header Authorization Bearer token hợp lệ."
        ],
        "post": [
            "Đăng ký thành công tạo user role student.",
            "Đăng nhập thành công tạo token và điều hướng đúng dashboard.",
            "Đăng xuất làm sạch phiên phía frontend."
        ],
        "interface": [
            ["Route/UI", "API", "Actor", "Mô tả"],
            ["/register", "POST /api/register", "Guest", "Tạo tài khoản student mới."],
            ["/login", "POST /api/login", "Guest/Admin/Student", "Xác thực và nhận token."],
            ["App session", "GET /api/me", "Admin/Student", "Lấy thông tin tài khoản hiện tại."],
            ["Logout button", "POST /api/logout", "Admin/Student", "Kết thúc phiên đăng nhập."]
        ],
        "workflow": [
            ["Scenario", "Actor", "System"],
            ["Đăng ký", "Nhập thông tin đăng ký và nhấn Đăng ký.", "Validate, kiểm tra email trùng, tạo tài khoản student."],
            ["Đăng nhập", "Nhập email/password và nhấn Đăng nhập.", "Xác thực, tạo JWT, trả role và redirect_url."],
            ["Kiểm tra phiên", "Frontend gửi token.", "Trả thông tin public user nếu token hợp lệ."],
            ["Đăng xuất", "Nhấn Đăng xuất.", "Trả thành công; frontend xóa token."]
        ],
        "screen": [
            ["No", "Field", "Control type", "Required", "Data type", "Default", "Description"],
            ["1", "Họ tên", "Text Input", "Yes", "String", "Blank", "3-150 ký tự khi đăng ký."],
            ["2", "Email", "Text Input", "Yes", "Email", "Blank", "Đúng định dạng và không trùng."],
            ["3", "Mật khẩu", "Password Input", "Yes", "String", "Blank", "Tối thiểu 6 ký tự, được hash khi lưu."],
            ["4", "Nhập lại mật khẩu", "Password Input", "Yes", "String", "Blank", "Phải khớp mật khẩu."],
            ["5", "Số điện thoại", "Text Input", "No", "String", "Blank", "Nếu nhập phải đúng pattern điện thoại."],
            ["6", "Đăng nhập/Đăng ký", "Button", "Yes", "Action", "N/A", "Gửi form sau khi dữ liệu hợp lệ."]
        ],
        "diagrams": [("auth-usecase.png", "Use Case Diagram - Authentication"), ("auth-activity.png", "Activity Diagram - Authentication")]
    },
    {
        "no": 2,
        "title": "Chức năng bảng điều khiển",
        "usecase_id": "UC_DASHBOARD",
        "usecase_name": "Xem dashboard theo vai trò",
        "brief": "Dashboard là trang đầu sau khi đăng nhập, hiển thị không gian làm việc riêng cho Admin hoặc Student. Admin xem tổng quan quản trị; Student xem khu vực học tập cá nhân và các lối tắt đến môn học, bài tập, điểm, mục tiêu, lịch học và lộ trình.",
        "actors": "Admin, Student",
        "requirements": "FR-AUTH-02, FR-AUTH-04, NFR-02",
        "basic": [
            "Người dùng đăng nhập thành công.",
            "Hệ thống xác định role từ token/user data.",
            "Nếu role là admin, hệ thống chuyển đến /admin/dashboard và hiển thị menu quản trị.",
            "Nếu role là student, hệ thống chuyển đến /student/dashboard hoặc /dashboard và hiển thị menu học tập.",
            "Người dùng chọn một menu để đi đến module tương ứng."
        ],
        "alternative": [
            "User chưa đăng nhập truy cập dashboard: hệ thống chuyển về /login hoặc trả lỗi auth.",
            "Student truy cập route admin: RoleMiddleware trả 403.",
            "Admin truy cập route student cá nhân: hệ thống cần kiểm soát quyền và dữ liệu theo role."
        ],
        "special": [
            "Menu hiển thị phải phù hợp với role.",
            "Các menu placeholder như Lessons, Quiz, Tasks, Notes, AI Assistant, Progress phải được đánh dấu chưa hoàn thiện nếu chưa có API nghiệp vụ tương ứng."
        ],
        "pre": ["Người dùng đã đăng nhập và token hợp lệ."],
        "post": ["Dashboard hiển thị đúng vai trò và điều hướng đúng module."],
        "interface": [
            ["Route/UI", "API", "Actor", "Mô tả"],
            ["/admin/dashboard", "GET /api/admin/dashboard", "Admin", "Dashboard quản trị."],
            ["/student/dashboard", "GET /api/student/dashboard", "Student", "Dashboard sinh viên."],
            ["Sidebar/Menu", "Client route", "Admin/Student", "Điều hướng chức năng theo vai trò."]
        ],
        "workflow": [
            ["Scenario", "Actor", "System"],
            ["Truy cập dashboard", "Đăng nhập thành công.", "Điều hướng theo role."],
            ["Chọn menu", "Nhấn Sinh viên/Môn học/Bài tập...", "Mở module tương ứng."],
            ["Truy cập trái quyền", "Student mở admin route.", "Từ chối 403."]
        ],
        "screen": [
            ["No", "Field", "Control type", "Required", "Data type", "Default", "Description"],
            ["1", "Brand/User info", "Read-only", "N/A", "Object", "Current user", "Hiển thị họ tên, email, role."],
            ["2", "Admin menu", "Navigation", "N/A", "Route", "N/A", "Dashboard, Sinh viên, Môn học, Bài tập, Thống kê..."],
            ["3", "Student menu", "Navigation", "N/A", "Route", "N/A", "Môn học của tôi, Bài tập, Điểm, Mục tiêu, Lịch, Roadmap..."],
            ["4", "Đăng xuất", "Button", "Yes", "Action", "N/A", "Gọi logout và xóa session."]
        ],
        "diagrams": [("use-case-diagram.png", "Use Case Diagram tổng quan StudyMate")]
    },
    {
        "no": 3,
        "title": "Chức năng quản lý sinh viên",
        "usecase_id": "UC_STUDENT_MANAGEMENT",
        "usecase_name": "Quản lý hồ sơ và trạng thái sinh viên",
        "brief": "Chức năng quản lý sinh viên cho phép Admin xem danh sách, tìm kiếm/lọc, xem chi tiết, tạo mới, cập nhật, xóa hoặc vô hiệu hóa sinh viên, import danh sách từ file và reset mật khẩu.",
        "actors": "Admin",
        "requirements": "FR-STU-01 đến FR-STU-05",
        "basic": [
            "Admin mở màn hình /admin/students.",
            "Hệ thống tải danh sách sinh viên với phân trang, keyword và status filter.",
            "Admin tạo hoặc cập nhật sinh viên bằng form.",
            "Hệ thống validate họ tên, email, phone, mã sinh viên, status và uniqueness.",
            "Admin có thể disable, enable, lock hoặc reset password sinh viên.",
            "Admin có thể import sinh viên từ file CSV/XLS/XLSX theo template."
        ],
        "alternative": [
            "Email hoặc student_code trùng: trả 422.",
            "Mã sinh viên chứa ký tự không hợp lệ hoặc emoji: trả lỗi validation.",
            "File import không đúng định dạng hoặc quá 5MB: trả lỗi file.",
            "Reset password dưới 6 ký tự: trả lỗi new_password.",
            "Xóa sinh viên đã có dữ liệu học tập: hệ thống chuyển trạng thái inactive thay vì xóa cứng."
        ],
        "special": [
            "Chỉ Admin được truy cập route /api/admin/students.",
            "Email và student_code phải duy nhất.",
            "Status chỉ nhận active, inactive, locked."
        ],
        "pre": ["Admin đã đăng nhập và có token hợp lệ."],
        "post": ["Dữ liệu sinh viên được cập nhật đúng; trạng thái ảnh hưởng trực tiếp đến khả năng đăng nhập."],
        "interface": [
            ["Route/UI", "API", "Actor", "Mô tả"],
            ["/admin/students", "GET /api/admin/students", "Admin", "Danh sách sinh viên."],
            ["/admin/students/create", "POST /api/admin/students", "Admin", "Tạo sinh viên."],
            ["/admin/students/{id}/edit", "PUT /api/admin/students/{id}", "Admin", "Cập nhật sinh viên."],
            ["/admin/students/import", "POST /api/admin/students/import", "Admin", "Import từ file."],
            ["Status actions", "PUT disable/enable/lock/reset-password", "Admin", "Quản lý trạng thái và mật khẩu."]
        ],
        "workflow": [
            ["Scenario", "Actor", "System"],
            ["Xem danh sách", "Mở trang sinh viên.", "Trả danh sách và pagination."],
            ["Tạo/cập nhật", "Nhập thông tin và lưu.", "Validate, lưu DB, trả dữ liệu mới."],
            ["Import", "Chọn file template.", "Kiểm tra file, import, trả summary/errors."],
            ["Reset mật khẩu", "Nhập mật khẩu mới hoặc để trống.", "Dùng mật khẩu mới hoặc student_code làm mặc định."]
        ],
        "screen": [
            ["No", "Field", "Control type", "Required", "Data type", "Default", "Description"],
            ["1", "Họ tên", "Text Input", "Yes", "String", "Blank", "3-150 ký tự."],
            ["2", "Email", "Text Input", "Yes", "Email", "Blank", "Đúng định dạng, không trùng."],
            ["3", "Số điện thoại", "Text Input", "No", "String", "Blank", "Pattern điện thoại hợp lệ."],
            ["4", "Mã sinh viên", "Text Input", "Yes", "String", "Blank", "Tối đa 50 ký tự, chữ và số."],
            ["5", "Trạng thái", "Dropdown", "Yes", "Enum", "active", "active, inactive, locked."],
            ["6", "File import", "File Input", "Yes", "File", "Blank", "CSV, XLS, XLSX; tối đa 5MB."]
        ],
        "diagrams": [("student-management-usecase.png", "Use Case Diagram - Quản lý sinh viên"), ("student-management-activity.png", "Activity Diagram - Quản lý sinh viên")]
    },
    {
        "no": 4,
        "title": "Chức năng quản lý môn học và phân công sinh viên",
        "usecase_id": "UC_SUBJECT_MANAGEMENT",
        "usecase_name": "Quản lý môn học và gán sinh viên vào môn",
        "brief": "Chức năng môn học cho phép Admin CRUD môn học, tải ảnh đại diện, quản lý sinh viên được gán vào từng môn. Student chỉ xem danh sách và chi tiết môn học thuộc tài khoản của mình.",
        "actors": "Admin, Student",
        "requirements": "FR-SUB-01 đến FR-SUB-05",
        "basic": [
            "Admin mở danh sách môn học.",
            "Admin tạo, sửa hoặc xóa môn học.",
            "Hệ thống validate tên môn, mã môn, tín chỉ, trạng thái, màu và ảnh.",
            "Admin mở danh sách sinh viên trong môn, xem sinh viên khả dụng và gán sinh viên.",
            "Student mở Môn học của tôi để xem các môn đã được gán."
        ],
        "alternative": [
            "Mã môn sai định dạng hoặc trùng: trả lỗi validation.",
            "Ảnh sai định dạng, MIME không hợp lệ hoặc quá 2MB: trả lỗi image.",
            "Gán trùng sinh viên vào cùng môn: trả 409.",
            "Student xem môn chưa được gán: trả 403."
        ],
        "special": [
            "Không được sửa subject_code khi update.",
            "Credits chỉ nhận số nguyên 1-30.",
            "Status môn học gồm studying, paused, completed."
        ],
        "pre": ["Admin hoặc Student đã đăng nhập; subject/student tồn tại khi thao tác gán."],
        "post": ["Môn học được lưu; quan hệ student-subject được cập nhật; Student chỉ thấy môn của mình."],
        "interface": [
            ["Route/UI", "API", "Actor", "Mô tả"],
            ["/admin/subjects", "GET/POST /api/subjects", "Admin", "Danh sách và tạo môn."],
            ["/admin/subjects/{id}/edit", "PUT/POST /api/subjects/{id}", "Admin", "Cập nhật môn học."],
            ["/admin/subjects/{subjectId}/students", "GET/POST/DELETE /api/admin/subjects/{subjectId}/students", "Admin", "Gán/gỡ sinh viên."],
            ["/student/my-subjects", "GET /api/student/my-subjects", "Student", "Môn học của tôi."]
        ],
        "workflow": [
            ["Scenario", "Actor", "System"],
            ["CRUD môn học", "Admin nhập thông tin môn.", "Validate và lưu dữ liệu."],
            ["Gán sinh viên", "Admin chọn sinh viên khả dụng.", "Kiểm tra trùng và tạo assignment."],
            ["Gỡ sinh viên", "Admin chọn sinh viên đang gán.", "Xóa quan hệ nếu tồn tại."],
            ["Student xem môn", "Student mở My Subjects.", "Chỉ trả môn active được gán."]
        ],
        "screen": [
            ["No", "Field", "Control type", "Required", "Data type", "Default", "Description"],
            ["1", "Mã môn học", "Text Input", "Yes", "String", "Blank", "Tối đa 50 ký tự, chữ/số/gạch ngang/gạch dưới; không sửa khi update."],
            ["2", "Tên môn học", "Text Input", "Yes", "String", "Blank", "Tối đa 255 ký tự."],
            ["3", "Tín chỉ", "Number Input", "Yes", "Integer", "3", "Từ 1 đến 30."],
            ["4", "Trạng thái", "Dropdown", "Yes", "Enum", "studying", "studying, paused, completed."],
            ["5", "Màu đại diện", "Color Input", "No", "Hex", "Blank", "Mã màu #RGB hoặc #RRGGBB."],
            ["6", "Ảnh môn học", "File Input", "No", "Image", "Blank", "jpg, jpeg, png, webp, gif; tối đa 2MB."]
        ],
        "diagrams": [("subject-management-usecase.png", "Use Case Diagram - Quản lý môn học"), ("subject-management-activity.png", "Activity Diagram - Quản lý môn học")]
    },
    {
        "no": 5,
        "title": "Chức năng quản lý bài tập, bài nộp và chấm điểm",
        "usecase_id": "UC_ASSIGNMENT_GRADING",
        "usecase_name": "Quản lý bài tập, nộp bài, điểm và feedback",
        "brief": "Phân hệ bài tập kết nối hoạt động của Admin và Student: Admin tạo bài tập theo môn, Student xem bài tập được giao và nộp bài, Admin xem submission và chấm điểm, Student xem điểm và feedback.",
        "actors": "Admin, Student",
        "requirements": "FR-ASG-01, FR-ASG-02, FR-SUBM-01, FR-SUBM-02, FR-GRD-01 đến FR-GRD-03",
        "basic": [
            "Admin tạo bài tập với subject, title, description, deadline, status và file đính kèm nếu có.",
            "Hệ thống validate subject tồn tại, title, deadline, status và file.",
            "Student xem danh sách bài tập thuộc môn học của mình.",
            "Student nộp bài bằng nội dung hoặc file.",
            "Admin xem bài nộp theo assignment, mở chi tiết submission và nhập điểm/feedback.",
            "Student xem điểm và feedback của chính mình."
        ],
        "alternative": [
            "Assignment open có deadline quá khứ: trả lỗi deadline.",
            "File assignment/submission sai định dạng hoặc quá 10MB: trả lỗi file.",
            "Student nộp bài trống cả content và file: trả 422.",
            "Score không phải số hoặc ngoài 0-10: trả lỗi score.",
            "Student truy cập assignment/submission không thuộc mình: trả 403 hoặc 404."
        ],
        "special": [
            "Assignment status chỉ gồm draft, open, closed.",
            "Submission late được xác định theo deadline.",
            "Feedback tối đa 5000 ký tự."
        ],
        "pre": ["Admin/Student đã đăng nhập; Student phải được gán vào môn chứa assignment."],
        "post": ["Bài tập/submission/grade được lưu và hiển thị đúng cho actor có quyền."],
        "interface": [
            ["Route/UI", "API", "Actor", "Mô tả"],
            ["/admin/assignments", "GET/POST /api/admin/assignments", "Admin", "Danh sách và tạo bài tập."],
            ["/admin/assignments/{id}/edit", "PUT/POST /api/admin/assignments/{id}", "Admin", "Cập nhật bài tập."],
            ["/student/assignments", "GET /api/student/assignments", "Student", "Bài tập được giao."],
            ["/student/assignments/{assignmentId}/submit", "POST /api/student/assignments/{assignmentId}/submit", "Student", "Nộp bài."],
            ["/admin/submissions/{id}", "PUT /api/admin/submissions/{id}/grade", "Admin", "Chấm điểm."]
        ],
        "workflow": [
            ["Scenario", "Actor", "System"],
            ["Tạo bài tập", "Admin nhập form.", "Validate và lưu assignment."],
            ["Nộp bài", "Student nhập content/file.", "Kiểm tra quyền, validate và lưu submission."],
            ["Chấm điểm", "Admin nhập score/feedback.", "Validate và cập nhật grade."],
            ["Xem điểm", "Student mở grades.", "Chỉ trả điểm của student hiện tại."]
        ],
        "screen": [
            ["No", "Field", "Control type", "Required", "Data type", "Default", "Description"],
            ["1", "Môn học", "Dropdown", "Yes", "Integer", "Blank", "Subject phải tồn tại."],
            ["2", "Tiêu đề bài tập", "Text Input", "Yes", "String", "Blank", "Tối đa 255 ký tự."],
            ["3", "Deadline", "DateTime Input", "Yes", "DateTime", "Blank", "Nếu status open phải ở tương lai."],
            ["4", "Trạng thái", "Dropdown", "Yes", "Enum", "draft", "draft, open, closed."],
            ["5", "File đính kèm", "File Input", "No", "File", "Blank", "pdf/doc/docx/zip/rar/png/jpg/jpeg; tối đa 10MB."],
            ["6", "Nội dung bài nộp", "Textarea", "Conditional", "String", "Blank", "Bắt buộc nếu không upload file."],
            ["7", "Điểm", "Number Input", "Yes", "Float", "Blank", "Từ 0 đến 10."],
            ["8", "Feedback", "Textarea", "No", "String", "Blank", "Tối đa 5000 ký tự."]
        ],
        "diagrams": [("assignment-grading-usecase.png", "Use Case Diagram - Bài tập và chấm điểm"), ("assignment-grading-activity.png", "Activity Diagram - Bài tập và chấm điểm")]
    },
    {
        "no": 6,
        "title": "Chức năng quản lý mục tiêu học tập",
        "usecase_id": "UC_LEARNING_GOAL",
        "usecase_name": "Quản lý mục tiêu học tập cá nhân",
        "brief": "Chức năng mục tiêu học tập cho phép Student tạo và theo dõi các mục tiêu học tập cá nhân. Dữ liệu được giới hạn theo tài khoản student hiện tại.",
        "actors": "Student",
        "requirements": "FR-GOAL-01",
        "basic": [
            "Student mở danh sách mục tiêu học tập.",
            "Student tạo mục tiêu mới bằng form.",
            "Student xem chi tiết, cập nhật hoặc xóa mục tiêu.",
            "Hệ thống chỉ thao tác trên mục tiêu thuộc user hiện tại."
        ],
        "alternative": [
            "Thiếu trường bắt buộc hoặc dữ liệu sai định dạng: hiển thị lỗi validation.",
            "Student truy cập mục tiêu không thuộc mình: trả lỗi không tìm thấy hoặc không có quyền."
        ],
        "special": ["Dữ liệu mục tiêu là dữ liệu cá nhân, cần phân tách theo user_id."],
        "pre": ["Student đã đăng nhập."],
        "post": ["Mục tiêu được tạo/cập nhật/xóa và danh sách phản ánh trạng thái mới."],
        "interface": [
            ["Route/UI", "API", "Actor", "Mô tả"],
            ["/student/learning-goals", "GET /api/student/learning-goals", "Student", "Danh sách mục tiêu."],
            ["/student/learning-goals/create", "POST /api/student/learning-goals", "Student", "Tạo mục tiêu."],
            ["/student/learning-goals/{id}/edit", "PUT /api/student/learning-goals/{id}", "Student", "Cập nhật mục tiêu."],
            ["Delete action", "DELETE /api/student/learning-goals/{id}", "Student", "Xóa mục tiêu."]
        ],
        "workflow": [
            ["Scenario", "Actor", "System"],
            ["Tạo mục tiêu", "Student nhập form.", "Validate và lưu goal."],
            ["Cập nhật", "Student chỉnh sửa goal.", "Validate quyền và cập nhật."],
            ["Xóa", "Student xác nhận xóa.", "Xóa goal thuộc user hiện tại."]
        ],
        "screen": [
            ["No", "Field", "Control type", "Required", "Data type", "Default", "Description"],
            ["1", "Tiêu đề mục tiêu", "Text Input", "Yes", "String", "Blank", "Tên mục tiêu học tập."],
            ["2", "Môn học", "Dropdown", "No", "Integer", "Blank", "Liên kết mục tiêu với môn học nếu có."],
            ["3", "Mô tả", "Textarea", "No", "String", "Blank", "Mô tả mục tiêu và phạm vi học."],
            ["4", "Trạng thái/Tiến độ", "Dropdown/Input", "No", "Enum/Number", "N/A", "Theo dõi mức hoàn thành nếu UI cung cấp."]
        ],
        "diagrams": [("learning-goal-usecase.png", "Use Case Diagram - Mục tiêu học tập"), ("learning-goal-activity.png", "Activity Diagram - Mục tiêu học tập")]
    },
    {
        "no": 7,
        "title": "Chức năng quản lý lịch học",
        "usecase_id": "UC_STUDY_SCHEDULE",
        "usecase_name": "Quản lý lịch học cá nhân",
        "brief": "Chức năng lịch học cho phép Student tạo, xem, cập nhật và xóa lịch tự học, lịch lớp, ôn tập, bài tập hoặc thi. Hệ thống kiểm soát ngày giờ và trạng thái để tránh lịch không hợp lệ.",
        "actors": "Student",
        "requirements": "FR-SCH-01",
        "basic": [
            "Student mở calendar/list lịch học.",
            "Student tạo lịch với môn học, tiêu đề, ngày học, giờ bắt đầu, giờ kết thúc, loại lịch và trạng thái.",
            "Hệ thống validate ngày giờ, loại lịch, trạng thái và lưu lịch.",
            "Student cập nhật hoặc xóa lịch học của mình."
        ],
        "alternative": [
            "end_time nhỏ hơn hoặc bằng start_time: trả lỗi end_time.",
            "study_date sai định dạng: trả lỗi study_date.",
            "Tạo lịch upcoming ở quá khứ: trả lỗi study_date.",
            "Đánh dấu completed cho lịch trong tương lai: trả lỗi status."
        ],
        "special": [
            "schedule_type gồm class, self_study, review, assignment, exam.",
            "status gồm upcoming, completed, cancelled.",
            "Roadmap có thể tự tạo lịch học cho từng roadmap item."
        ],
        "pre": ["Student đã đăng nhập; subject hợp lệ nếu lịch gắn với môn học."],
        "post": ["Lịch học được lưu và hiển thị trên calendar/list theo user hiện tại."],
        "interface": [
            ["Route/UI", "API", "Actor", "Mô tả"],
            ["/student/schedules", "GET /api/study-schedules", "Student", "Danh sách/calendar lịch học."],
            ["/student/schedules/create", "POST /api/study-schedules", "Student", "Tạo lịch học."],
            ["/student/schedules/{id}/edit", "PUT /api/study-schedules/{id}", "Student", "Cập nhật lịch học."],
            ["Delete action", "DELETE /api/study-schedules/{id}", "Student", "Xóa lịch học."]
        ],
        "workflow": [
            ["Scenario", "Actor", "System"],
            ["Tạo lịch", "Student nhập thông tin lịch.", "Validate ngày giờ, loại lịch, trạng thái và lưu."],
            ["Cập nhật lịch", "Student chỉnh sửa lịch.", "Validate quyền và cập nhật."],
            ["Xóa lịch", "Student xác nhận xóa.", "Xóa lịch thuộc user hiện tại."]
        ],
        "screen": [
            ["No", "Field", "Control type", "Required", "Data type", "Default", "Description"],
            ["1", "Môn học", "Dropdown", "Yes", "Integer", "Blank", "Subject ID hợp lệ."],
            ["2", "Tiêu đề lịch", "Text Input", "Yes", "String", "Blank", "Tối đa 255 ký tự."],
            ["3", "Ngày học", "Date Input", "Yes", "Date", "Blank", "YYYY-MM-DD."],
            ["4", "Giờ bắt đầu", "Time Input", "Yes", "Time", "Blank", "HH:mm."],
            ["5", "Giờ kết thúc", "Time Input", "Yes", "Time", "Blank", "Phải lớn hơn giờ bắt đầu."],
            ["6", "Loại lịch", "Dropdown", "Yes", "Enum", "self_study", "class, self_study, review, assignment, exam."],
            ["7", "Trạng thái", "Dropdown", "Yes", "Enum", "upcoming", "upcoming, completed, cancelled."]
        ],
        "diagrams": [("study-schedule-usecase.png", "Use Case Diagram - Lịch học"), ("study-schedule-activity.png", "Activity Diagram - Lịch học")]
    },
    {
        "no": 8,
        "title": "Chức năng quản lý lộ trình học và AI Roadmap",
        "usecase_id": "UC_LEARNING_ROADMAP",
        "usecase_name": "Tạo và theo dõi lộ trình học cá nhân hóa",
        "brief": "Chức năng lộ trình học cho phép Student tạo roadmap thủ công hoặc sinh roadmap bằng AI dựa trên môn học, mục tiêu, trình độ, thời gian học và ngày học khả dụng. Hệ thống lưu roadmap, tạo item, cập nhật trạng thái/kết quả và tính tiến độ.",
        "actors": "Student, AI Provider",
        "requirements": "FR-RM-01 đến FR-RM-03; NFR-04",
        "basic": [
            "Student mở danh sách roadmap.",
            "Student chọn tạo roadmap thủ công hoặc tạo bằng AI.",
            "Student nhập subject, goal, current_level, study_time_per_day, available_weekdays, preferred_start_time, session_duration, start_date và end_date.",
            "Nếu tạo bằng AI, hệ thống gọi provider OpenAI/Gemini đã cấu hình và yêu cầu response JSON.",
            "Hệ thống hiển thị preview hoặc lưu roadmap cùng các item.",
            "Student cập nhật trạng thái, kết quả, thời lượng học thực tế hoặc dời lịch item.",
            "Hệ thống cập nhật progress theo ngày/tuần/toàn roadmap."
        ],
        "alternative": [
            "Thiếu API key hoặc provider bị lock do quota/rate limit: hiển thị lỗi rõ ràng, không làm sập hệ thống.",
            "AI trả JSON không hợp lệ hoặc không có items: trả lỗi tạo roadmap.",
            "end_date nhỏ hơn start_date hoặc không chọn weekday: trả lỗi validation.",
            "Item trùng lịch học hiện có: hệ thống trả danh sách conflict và gợi ý slot khác nếu có."
        ],
        "special": [
            "current_level gồm beginner, intermediate, advanced.",
            "available_weekdays là danh sách số 1-7.",
            "session_duration_minutes tối thiểu 15 phút.",
            "Roadmap status gồm draft, active, completed, paused.",
            "Item status gồm not_started, in_progress, completed, not_completed, rescheduled."
        ],
        "pre": ["Student đã đăng nhập; subject phải thuộc danh sách môn được gán cho student."],
        "post": ["Roadmap và items được lưu; lịch học liên quan có thể được tạo; tiến độ được tính lại sau mỗi cập nhật item."],
        "interface": [
            ["Route/UI", "API", "Actor", "Mô tả"],
            ["/student/roadmaps", "GET /api/student/roadmaps", "Student", "Danh sách roadmap."],
            ["/student/roadmaps/generate", "POST /api/student/roadmaps/generate-ai", "Student", "Sinh roadmap bằng AI."],
            ["/student/roadmaps", "POST /api/student/roadmaps", "Student", "Lưu roadmap."],
            ["/student/roadmaps/{id}", "GET/PUT/DELETE /api/student/roadmaps/{id}", "Student", "Chi tiết, cập nhật, xóa roadmap."],
            ["Roadmap item actions", "PUT /api/student/roadmap-items/{id}/status|result|schedule", "Student", "Cập nhật item."]
        ],
        "workflow": [
            ["Scenario", "Actor", "System"],
            ["Tạo AI roadmap", "Student nhập form tạo AI.", "Validate input, gọi AI Provider, kiểm tra JSON và trả preview."],
            ["Lưu roadmap", "Student xác nhận lưu.", "Validate items, kiểm tra conflict lịch và lưu DB."],
            ["Cập nhật item", "Student cập nhật status/result/schedule.", "Lưu item và tính lại progress."],
            ["Lỗi provider", "AI Provider lỗi hoặc hết quota.", "Trả thông báo cấu hình/quota/rate limit thân thiện."]
        ],
        "screen": [
            ["No", "Field", "Control type", "Required", "Data type", "Default", "Description"],
            ["1", "Môn học", "Dropdown", "Yes", "Integer", "Blank", "Subject thuộc student."],
            ["2", "Mục tiêu", "Textarea", "Yes", "String", "Blank", "Mục tiêu học tập."],
            ["3", "Trình độ", "Dropdown", "Yes", "Enum", "beginner", "beginner, intermediate, advanced."],
            ["4", "Thời gian học mỗi ngày", "Number Input", "Yes", "Float", "Blank", "Phải lớn hơn 0."],
            ["5", "Ngày có thể học", "Checkbox group", "Yes", "Array", "Blank", "Chọn ít nhất một ngày 1-7."],
            ["6", "Giờ bắt đầu ưu tiên", "Time Input", "Yes", "Time", "Blank", "HH:mm."],
            ["7", "Thời lượng mỗi buổi", "Number Input", "Yes", "Integer", "60", "Tối thiểu 15 phút."],
            ["8", "Ngày bắt đầu/kết thúc", "Date Input", "Yes", "Date", "Blank", "end_date >= start_date."],
            ["9", "Generate AI", "Button", "Conditional", "Action", "N/A", "Gọi AI Provider và nhận JSON roadmap."]
        ],
        "diagrams": [("learning-roadmap-usecase.png", "Use Case Diagram - Lộ trình học"), ("learning-roadmap-activity.png", "Activity Diagram - Lộ trình học")]
    },
    {
        "no": 9,
        "title": "Các chức năng hiển thị placeholder/chưa hoàn thiện",
        "usecase_id": "UC_PLACEHOLDER_MODULES",
        "usecase_name": "Bài học, Quiz, Nhiệm vụ, Ghi chú, AI Assistant tổng quát và Tiến độ",
        "brief": "Một số mục xuất hiện trong menu frontend nhưng source được phân tích chưa có API nghiệp vụ hoàn chỉnh tương ứng. Các mục này cần được ghi nhận trong SRS để tránh nhầm lẫn phạm vi kiểm thử.",
        "actors": "Admin, Student",
        "requirements": "Out of current implemented scope",
        "basic": [
            "Người dùng chọn menu placeholder.",
            "Frontend hiển thị màn hình thông báo chức năng đang được chuẩn bị hoặc khu vực chưa hoàn thiện.",
            "Hệ thống không thực hiện thao tác nghiệp vụ ghi dữ liệu nếu chưa có API tương ứng."
        ],
        "alternative": [
            "Nếu người dùng kỳ vọng thao tác nghiệp vụ, hệ thống cần hiển thị thông báo rõ rằng chức năng chưa hoàn thiện.",
            "Tester không nên viết test case pass/fail nghiệp vụ sâu cho module chưa có implementation."
        ],
        "special": [
            "Các module này cần được tách thành yêu cầu phát triển tương lai.",
            "Khi API được bổ sung, SRS và traceability matrix phải cập nhật lại."
        ],
        "pre": ["Người dùng đã đăng nhập nếu menu nằm trong vùng dashboard."],
        "post": ["Người dùng nhìn thấy placeholder, không có dữ liệu nghiệp vụ mới được tạo."],
        "interface": [
            ["Route/UI", "API", "Actor", "Mô tả"],
            ["/admin/lessons", "N/A", "Admin", "Placeholder quản lý bài học."],
            ["/admin/quizzes", "N/A", "Admin", "Placeholder quản lý quiz."],
            ["/tasks", "N/A", "Student", "Placeholder nhiệm vụ học tập."],
            ["/notes", "N/A", "Student", "Placeholder ghi chú."],
            ["/assistant", "N/A", "Student", "Placeholder AI Assistant tổng quát."],
            ["/progress", "N/A", "Student", "Placeholder tiến độ học tập."]
        ],
        "workflow": [
            ["Scenario", "Actor", "System"],
            ["Mở placeholder", "Người dùng chọn menu.", "Hiển thị màn hình placeholder."],
            ["Kiểm thử phạm vi", "Tester rà soát API.", "Đánh dấu chưa đủ scope để kiểm thử nghiệp vụ."]
        ],
        "screen": [
            ["No", "Field", "Control type", "Required", "Data type", "Default", "Description"],
            ["1", "Tiêu đề module", "Read-only", "N/A", "String", "N/A", "Tên chức năng đang chuẩn bị."],
            ["2", "Mô tả", "Read-only", "N/A", "String", "N/A", "Thông báo phạm vi chức năng."],
            ["3", "Quay lại dashboard", "Button/Link", "No", "Action", "N/A", "Điều hướng về dashboard."]
        ],
        "diagrams": []
    },
]

def build_story():
    story = []
    story.append(Spacer(1, 2.2*cm))
    story.append(P("PHẦN MỀM HỖ TRỢ HỌC TẬP STUDYMATE AI", "DocTitle"))
    story.append(P("Tài liệu đặc tả yêu cầu phần mềm (SRS)", "DocSubtitle"))
    story.append(P("Phiên bản 1.0", "DocSubtitle"))
    story.append(Spacer(1, 1.2*cm))
    story.append(P("Dựa trên cấu trúc mẫu SRS PCM ver1.1 và source code StudyMate hiện tại.", "DocSubtitle"))
    story.append(Spacer(1, 8*cm))
    story.append(P("TP. Hồ Chí Minh, 07/2026", "DocSubtitle"))
    story.append(PageBreak())

    story.append(P("MỤC LỤC", "Heading1VN"))
    toc_rows = [["Mục", "Nội dung"]]
    toc_rows.append(["I", "Record of Change"])
    toc_rows.append(["II", "Phân tích hệ thống phần mềm"])
    for f in FUNCTIONS:
        toc_rows.append([str(f["no"]), f["title"]])
    toc_rows.append(["III", "Yêu cầu phi chức năng và phạm vi kiểm thử"])
    toc_rows.append(["IV", "Kết luận"])
    story.append(table(toc_rows, [2.2*cm, 13.8*cm]))
    story.append(PageBreak())

    story.append(P("I. RECORD OF CHANGE", "Heading1VN"))
    story.append(P("*A - Added, M - Modified, D - Deleted", "SmallVN"))
    story.append(table([
        ["Effective Date", "Changed Items", "A/M/D", "Change Description", "New Version"],
        ["07/2026", "Toàn bộ tài liệu", "A", "Tạo SRS StudyMate AI theo format mẫu: Use Case, Interface, Workflows, Screen Description và Activity Diagram cho từng chức năng hiện có.", "1.0"],
    ], [2.8*cm, 3.2*cm, 1.5*cm, 7.0*cm, 2.0*cm]))
    story.append(PageBreak())

    story.append(P("II. PHÂN TÍCH HỆ THỐNG PHẦN MỀM", "Heading1VN"))
    story.append(P("StudyMate AI là website hỗ trợ học tập được xây dựng theo kiến trúc PHP MVC cho backend và React/Vite cho frontend. Hệ thống sử dụng JWT để xác thực API, middleware để phân quyền admin/student, MySQL để lưu dữ liệu học tập và AI Provider để sinh lộ trình học cá nhân hóa.", "BodyVN"))
    story.append(table([
        ["Nhóm", "Thành phần/Source", "Vai trò"],
        ["Backend", "routes/*.php, controllers/*.php, models/*.php", "API nghiệp vụ, validation, phân quyền và truy vấn dữ liệu."],
        ["Frontend", "src/App.jsx, src/pages, src/modules", "Giao diện và route cho Admin/Student."],
        ["Database", "studymate.sql, database/migrations", "Lưu user, subject, assignment, submission, goal, schedule, roadmap."],
        ["AI", "services/AIService.php", "Gọi OpenAI/Gemini để tạo roadmap JSON."],
    ], [3.0*cm, 5.2*cm, 7.2*cm]))
    story.append(Spacer(1, 8))
    story.append(table([
        ["Actor", "Mô tả", "Quyền chính"],
        ["Guest", "Người chưa đăng nhập.", "Đăng ký, đăng nhập."],
        ["Admin", "Quản trị viên.", "Quản lý sinh viên, môn học, bài tập, bài nộp và dashboard admin."],
        ["Student", "Sinh viên.", "Xem môn học, nộp bài, xem điểm, quản lý mục tiêu, lịch học và roadmap."],
        ["AI Provider", "Dịch vụ ngoài.", "Trả JSON roadmap khi hệ thống gọi API."],
    ], [2.8*cm, 5.0*cm, 7.6*cm]))

    for f in FUNCTIONS:
        story.append(PageBreak())
        prefix = str(f["no"])
        story.append(P(f"{prefix}. {f['title']}", "Heading1VN"))
        story.append(P(f"{prefix}.1. UseCase {f['usecase_name']}", "Heading2VN"))
        story.append(P(f"{prefix}.1.1. Use-Case ID", "Heading3VN"))
        story.append(bullets([f["usecase_id"]]))
        story.append(P(f"{prefix}.1.2. Use-Case Name", "Heading3VN"))
        story.append(bullets([f["usecase_name"]]))
        story.append(P(f"{prefix}.1.3. Brief Description", "Heading3VN"))
        story.append(P(f["brief"]))
        story.append(P(f"Actor: {f['actors']}", "BodyVN"))
        story.append(P(f"Requirement liên quan: {f['requirements']}", "BodyVN"))
        story.append(P(f"{prefix}.1.4. Flow of Events", "Heading3VN"))
        story.append(P("Luồng chính (Basic Flow):", "BodyVN"))
        story.append(numbered(f["basic"]))
        story.append(P("Luồng thay thế (Alternative Flows):", "BodyVN"))
        story.append(bullets(f["alternative"]))
        story.append(P(f"{prefix}.1.5. Special Requirements", "Heading3VN"))
        story.append(bullets(f["special"]))
        story.append(P(f"{prefix}.1.6. Pre-Conditions", "Heading3VN"))
        story.append(bullets(f["pre"]))
        story.append(P(f"{prefix}.1.7. Post-Conditions", "Heading3VN"))
        story.append(bullets(f["post"]))
        story.append(P(f"{prefix}.2. Interface", "Heading2VN"))
        story.append(table(f["interface"], [3.6*cm, 4.6*cm, 2.7*cm, 5.0*cm]))
        story.append(P(f"{prefix}.3. Workflows", "Heading2VN"))
        story.append(table(f["workflow"], [4.0*cm, 5.4*cm, 6.4*cm]))
        story.append(P(f"{prefix}.4. Screen Description", "Heading2VN"))
        story.append(table(f["screen"], [1.0*cm, 2.8*cm, 2.4*cm, 1.8*cm, 2.0*cm, 1.9*cm, 4.0*cm]))
        if f["diagrams"]:
            story.append(P(f"{prefix}.5. Activity Diagram / Use Case Diagram", "Heading2VN"))
            for img_name, caption in f["diagrams"]:
                img_path = DIAGRAM_DIR / img_name
                if not img_path.exists():
                    img_path = ROOT / "docs" / "srs-testing" / "diagrams" / img_name
                story.extend(image(img_path, caption))

    story.append(PageBreak())
    story.append(P("III. YÊU CẦU PHI CHỨC NĂNG VÀ PHẠM VI KIỂM THỬ", "Heading1VN"))
    story.append(table([
        ["ID", "Yêu cầu", "Tiêu chí kiểm thử"],
        ["NFR-01", "Bảo mật xác thực", "API cần token phải trả 401 khi thiếu token và 403 khi token sai/hết hạn."],
        ["NFR-02", "Phân quyền", "Student không truy cập được API admin; dữ liệu cá nhân chỉ trả cho đúng user."],
        ["NFR-03", "Toàn vẹn dữ liệu", "Không lưu dữ liệu thiếu trường bắt buộc, sai định dạng, score/date/file không hợp lệ."],
        ["NFR-04", "Khả dụng AI", "Thiếu key, quota hoặc response AI lỗi phải có thông báo rõ và không làm sập hệ thống."],
        ["NFR-05", "Dễ dùng", "Form hiển thị lỗi validation rõ ràng, giữ dữ liệu đã nhập khi có lỗi."],
        ["NFR-06", "Hiệu năng cơ bản", "Danh sách sinh viên/môn/bài tập tải được trong thời gian chấp nhận với dữ liệu mẫu."],
    ], [2.2*cm, 4.2*cm, 9.4*cm]))
    story.append(Spacer(1, 8))
    story.append(P("Phạm vi kiểm thử ưu tiên gồm xác thực, phân quyền, validation form, upload file, CRUD dữ liệu học tập, luồng nộp/chấm bài và khả năng xử lý lỗi AI Provider. Các module placeholder cần được kiểm thử ở mức hiển thị và điều hướng, chưa kiểm thử nghiệp vụ sâu cho đến khi có API hoàn chỉnh.", "BodyVN"))

    story.append(P("IV. KẾT LUẬN", "Heading1VN"))
    story.append(P("Tài liệu SRS này mô tả đầy đủ các chức năng hiện có của StudyMate AI theo cấu trúc mẫu SRS: Use Case, luồng sự kiện, yêu cầu đặc biệt, điều kiện trước/sau, interface, workflow, screen description và diagram. Tài liệu có thể dùng làm cơ sở để xây dựng test scenario, test case, traceability matrix và kế hoạch kiểm thử thủ công/API cho dự án.", "BodyVN"))
    return story

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("DocFont", 8)
    canvas.drawString(2*cm, 1.15*cm, "StudyMate AI - Software Requirements Specification")
    canvas.drawRightString(PAGE_WIDTH - 2*cm, 1.15*cm, str(doc.page))
    canvas.restoreState()

def build_pdf():
    doc = BaseDocTemplate(
        str(PDF_PATH),
        pagesize=A4,
        rightMargin=1.8*cm,
        leftMargin=1.8*cm,
        topMargin=1.7*cm,
        bottomMargin=1.7*cm,
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="normal")
    doc.addPageTemplates([PageTemplate(id="srs", frames=[frame], onPage=footer)])
    doc.build(build_story())

def build_markdown():
    lines = [
        "# SRS StudyMate AI v1.0",
        "",
        "Tài liệu đặc tả yêu cầu phần mềm dựa trên cấu trúc mẫu SRS_PCM_ver1.1.",
        "",
        "## Record of Change",
        "",
        "| Effective Date | Changed Items | A/M/D | Change Description | New Version |",
        "|---|---|---|---|---|",
        "| 07/2026 | Toàn bộ tài liệu | A | Tạo SRS StudyMate AI theo format mẫu. | 1.0 |",
        "",
        "## Phân tích hệ thống phần mềm",
        "",
        "StudyMate AI là website hỗ trợ học tập với backend PHP MVC, frontend React/Vite, JWT authentication, middleware phân quyền và AI Provider tạo roadmap.",
        "",
    ]
    for f in FUNCTIONS:
        lines.append(f"## {f['no']}. {f['title']}")
        lines.append("")
        lines.append(f"**Use-Case ID:** {f['usecase_id']}")
        lines.append("")
        lines.append(f"**Use-Case Name:** {f['usecase_name']}")
        lines.append("")
        lines.append(f"**Brief Description:** {f['brief']}")
        lines.append("")
        lines.append(f"**Actor:** {f['actors']}")
        lines.append("")
        lines.append(f"**Requirement:** {f['requirements']}")
        lines.append("")
        lines.append("### Flow of Events")
        lines.append("")
        lines.append("Basic Flow:")
        for i, item in enumerate(f["basic"], 1):
            lines.append(f"{i}. {item}")
        lines.append("")
        lines.append("Alternative Flows:")
        for item in f["alternative"]:
            lines.append(f"- {item}")
        lines.append("")
        lines.append("### Special Requirements")
        for item in f["special"]:
            lines.append(f"- {item}")
        lines.append("")
        lines.append("### Pre-Conditions")
        for item in f["pre"]:
            lines.append(f"- {item}")
        lines.append("")
        lines.append("### Post-Conditions")
        for item in f["post"]:
            lines.append(f"- {item}")
        lines.append("")
        lines.append("### Interface")
        lines.append(markdown_table(f["interface"]))
        lines.append("")
        lines.append("### Workflows")
        lines.append(markdown_table(f["workflow"]))
        lines.append("")
        lines.append("### Screen Description")
        lines.append(markdown_table(f["screen"]))
        lines.append("")
        for img_name, caption in f["diagrams"]:
            rel = f"diagrams/by-function/{img_name}"
            if not (DIAGRAM_DIR / img_name).exists():
                rel = f"diagrams/{img_name}"
            lines.append(f"![{caption}]({rel})")
            lines.append("")
    MD_PATH.write_text("\n".join(lines), encoding="utf-8")

def markdown_table(rows):
    if not rows:
        return ""
    out = ["| " + " | ".join(rows[0]) + " |"]
    out.append("|" + "|".join(["---"] * len(rows[0])) + "|")
    for row in rows[1:]:
        out.append("| " + " | ".join(str(c).replace("\n", "<br>") for c in row) + " |")
    return "\n".join(out)

if __name__ == "__main__":
    build_markdown()
    build_pdf()
    print(PDF_PATH)
    print(MD_PATH)
`;

await fs.mkdir(path.dirname(scriptPath), { recursive: true });
await fs.writeFile(scriptPath, pythonSource, "utf8");
await execFileAsync(python, [scriptPath], {
  cwd: root,
  windowsHide: true,
  maxBuffer: 1024 * 1024 * 20
}).then(({ stdout, stderr }) => {
  if (stdout.trim()) process.stdout.write(stdout);
  if (stderr.trim()) process.stderr.write(stderr);
});
