from pathlib import Path
import shutil

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor


ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "docs" / "srs-testing"
DOCX_PATH = OUT_DIR / "SRS_StudyMate_v1.1.docx"
DIAGRAM_DIR = ROOT / "docs" / "srs-testing" / "diagrams"
BY_FUNCTION_DIAGRAM_DIR = DIAGRAM_DIR / "by-function"


FONT_NAME = "Times New Roman"
BODY_SIZE = Pt(13)
ACCENT = RGBColor(31, 78, 121)
MUTED = RGBColor(90, 90, 90)
HEADER_FILL = "D9EAF7"
LIGHT_FILL = "F4F8FB"


def set_run_font(run, size=13, bold=False, italic=False, color=None):
    run.font.name = FONT_NAME
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    if color:
        run.font.color.rgb = color
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.rFonts
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.append(rfonts)
    rfonts.set(qn("w:ascii"), FONT_NAME)
    rfonts.set(qn("w:hAnsi"), FONT_NAME)
    rfonts.set(qn("w:eastAsia"), FONT_NAME)


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=100, start=120, bottom=100, end=120):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for m, v in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{m}"))
        if node is None:
            node = OxmlElement(f"w:{m}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(v))
        node.set(qn("w:type"), "dxa")


def apply_table_style(table, widths=None):
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = "Table Grid"
    for row_idx, row in enumerate(table.rows):
        for col_idx, cell in enumerate(row.cells):
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            set_cell_margins(cell)
            if row_idx == 0:
                set_cell_shading(cell, HEADER_FILL)
                for paragraph in cell.paragraphs:
                    for run in paragraph.runs:
                        set_run_font(run, bold=True)
            else:
                for paragraph in cell.paragraphs:
                    for run in paragraph.runs:
                        set_run_font(run)
            if widths and col_idx < len(widths):
                cell.width = Cm(widths[col_idx])


def add_page_number(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = paragraph.add_run("Trang ")
    set_run_font(run, size=11)
    run_begin = paragraph.add_run()
    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    run_begin._r.append(fld_begin)
    run_instr = paragraph.add_run()
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = "PAGE"
    run_instr._r.append(instr)
    run_end = paragraph.add_run()
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")
    run_end._r.append(fld_end)
    for field_run in (run_begin, run_instr, run_end):
        set_run_font(field_run, size=11)


def add_paragraph(doc, text="", style=None, bold=False, italic=False, align=None, color=None, size=13):
    paragraph = doc.add_paragraph(style=style)
    if align is not None:
        paragraph.alignment = align
    paragraph.paragraph_format.space_after = Pt(6)
    paragraph.paragraph_format.line_spacing = 1.15
    if text:
        run = paragraph.add_run(text)
        set_run_font(run, size=size, bold=bold, italic=italic, color=color)
    return paragraph


def add_heading(doc, text, level=1):
    style = f"Heading {level}" if level <= 3 else "Normal"
    paragraph = doc.add_paragraph(style=style)
    paragraph.paragraph_format.space_before = Pt(10 if level == 1 else 8)
    paragraph.paragraph_format.space_after = Pt(6)
    run = paragraph.add_run(text)
    set_run_font(run, size=13, bold=True, color=ACCENT if level <= 2 else None)
    return paragraph


def add_bullets(doc, items):
    for item in items:
        paragraph = doc.add_paragraph(style="List Bullet")
        paragraph.paragraph_format.space_after = Pt(3)
        paragraph.paragraph_format.line_spacing = 1.15
        run = paragraph.add_run(item)
        set_run_font(run)


def add_numbered(doc, items):
    for item in items:
        paragraph = doc.add_paragraph(style="List Number")
        paragraph.paragraph_format.space_after = Pt(3)
        paragraph.paragraph_format.line_spacing = 1.15
        run = paragraph.add_run(item)
        set_run_font(run)


def add_kv_table(doc, rows, widths=(4.0, 11.2)):
    table = doc.add_table(rows=1, cols=2)
    table.rows[0].cells[0].text = "Mục"
    table.rows[0].cells[1].text = "Nội dung"
    for key, value in rows:
        cells = table.add_row().cells
        cells[0].text = key
        cells[1].text = value
    apply_table_style(table, widths=list(widths))
    add_paragraph(doc)
    return table


def add_matrix_table(doc, headers, rows, widths=None):
    table = doc.add_table(rows=1, cols=len(headers))
    for idx, header in enumerate(headers):
        table.rows[0].cells[idx].text = header
    for row_data in rows:
        cells = table.add_row().cells
        for idx, value in enumerate(row_data):
            cells[idx].text = value
    apply_table_style(table, widths=widths)
    add_paragraph(doc)
    return table


def add_screen_description_tables(doc, groups):
    headers = ["No", "Field", "Control type", "Required", "Data type", "Default value", "Description"]
    table = doc.add_table(rows=1, cols=len(headers))
    for idx, header in enumerate(headers):
        table.rows[0].cells[idx].text = header
    widths = [0.8, 2.4, 2.2, 1.6, 1.8, 2.0, 5.2]
    for group in groups:
        group_cells = table.add_row().cells
        merged = group_cells[0]
        for cell in group_cells[1:]:
            merged = merged.merge(cell)
        merged.text = group["name"]
        set_cell_shading(merged, LIGHT_FILL)
        for paragraph in merged.paragraphs:
            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
            for run in paragraph.runs:
                set_run_font(run, bold=True)
        for row_data in group["rows"]:
            row = table.add_row().cells
            for idx, value in enumerate(row_data):
                row[idx].text = str(value)
    apply_table_style(table, widths=widths)
    add_paragraph(doc)
    return table


def add_image_if_exists(doc, image_path, caption, width_cm=14.2):
    if not image_path.exists():
        return False
    paragraph = doc.add_paragraph()
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = paragraph.add_run()
    run.add_picture(str(image_path), width=Cm(width_cm))
    cap = doc.add_paragraph()
    cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    cap.paragraph_format.space_after = Pt(8)
    cap_run = cap.add_run(caption)
    set_run_font(cap_run, size=13, italic=True, color=MUTED)
    return True


def setup_document():
    doc = Document()
    section = doc.sections[0]
    section.page_width = Cm(21)
    section.page_height = Cm(29.7)
    section.top_margin = Cm(2)
    section.bottom_margin = Cm(2)
    section.right_margin = Cm(2)
    section.left_margin = Cm(3)
    section.header_distance = Cm(1.2)
    section.footer_distance = Cm(1.2)

    styles = doc.styles
    for style_name in ["Normal", "List Bullet", "List Number"]:
        style = styles[style_name]
        style.font.name = FONT_NAME
        style.font.size = BODY_SIZE
        style._element.rPr.rFonts.set(qn("w:ascii"), FONT_NAME)
        style._element.rPr.rFonts.set(qn("w:hAnsi"), FONT_NAME)
        style._element.rPr.rFonts.set(qn("w:eastAsia"), FONT_NAME)
        style.paragraph_format.space_after = Pt(6)
        style.paragraph_format.line_spacing = 1.15

    for heading_name in ["Heading 1", "Heading 2", "Heading 3"]:
        style = styles[heading_name]
        style.font.name = FONT_NAME
        style.font.size = BODY_SIZE
        style.font.bold = True
        style.font.color.rgb = ACCENT
        style._element.rPr.rFonts.set(qn("w:ascii"), FONT_NAME)
        style._element.rPr.rFonts.set(qn("w:hAnsi"), FONT_NAME)
        style._element.rPr.rFonts.set(qn("w:eastAsia"), FONT_NAME)

    footer = section.footer
    footer.paragraphs[0].text = ""
    add_page_number(footer.paragraphs[0])
    return doc


FUNCTIONS = [
    {
        "id": "UC-01",
        "title": "Đăng ký, đăng nhập và phân quyền",
        "actors": "Khách, Sinh viên, Quản trị viên",
        "goal": "Cho phép người dùng tạo tài khoản, đăng nhập, đăng xuất và được điều hướng đến đúng không gian làm việc theo vai trò.",
        "scope": [
            "Đăng ký tài khoản sinh viên với họ tên, email, số điện thoại, mã sinh viên và mật khẩu.",
            "Đăng nhập bằng email và mật khẩu.",
            "Kiểm tra trạng thái tài khoản trước khi cho phép truy cập.",
            "Điều hướng quản trị viên đến khu vực quản trị và sinh viên đến khu vực học tập.",
            "Đăng xuất và kết thúc phiên làm việc."
        ],
        "main_flow": [
            "Người dùng mở màn hình đăng nhập hoặc đăng ký.",
            "Người dùng nhập thông tin bắt buộc và gửi biểu mẫu.",
            "Hệ thống kiểm tra tính đầy đủ, định dạng thông tin và trạng thái tài khoản.",
            "Nếu hợp lệ, hệ thống xác nhận đăng nhập và chuyển người dùng đến màn hình phù hợp.",
            "Người dùng có thể đăng xuất để quay lại trạng thái chưa đăng nhập."
        ],
        "exceptions": [
            "Email hoặc mật khẩu không đúng: hiển thị thông báo lỗi rõ ràng.",
            "Tài khoản bị khóa hoặc ngừng hoạt động: từ chối đăng nhập và hiển thị lý do.",
            "Thông tin đăng ký thiếu hoặc sai định dạng: đánh dấu trường lỗi ngay trên biểu mẫu."
        ],
        "screen": [
            ("Màn hình đăng nhập", "Gồm ô Email, Mật khẩu, nút Đăng nhập, liên kết chuyển sang Đăng ký và vùng hiển thị lỗi. Khi nhập sai, thông báo đặt gần biểu mẫu để người dùng sửa ngay."),
            ("Màn hình đăng ký", "Gồm các trường Họ tên, Email, Số điện thoại, Mã sinh viên, Mật khẩu, Xác nhận mật khẩu. Nút gửi chỉ dùng cho thao tác tạo tài khoản sinh viên."),
            ("Khu vực sau đăng nhập", "Hiển thị tên người dùng, vai trò, menu chức năng tương ứng và nút đăng xuất. Sinh viên không nhìn thấy chức năng quản trị."),
            ("Trạng thái lỗi", "Các lỗi phổ biến gồm thiếu trường bắt buộc, mật khẩu không khớp, email đã tồn tại, tài khoản không được phép truy cập.")
        ],
        "usecase_img": "auth-usecase.png",
        "activity_img": "auth-activity.png",
    },
    {
        "id": "UC-02",
        "title": "Quản lý sinh viên",
        "actors": "Quản trị viên",
        "goal": "Quản trị viên quản lý danh sách sinh viên, hồ sơ, trạng thái tài khoản, mật khẩu và nhập danh sách hàng loạt.",
        "scope": [
            "Xem danh sách sinh viên có tìm kiếm, lọc trạng thái và phân trang.",
            "Thêm mới, xem chi tiết, chỉnh sửa, khóa, kích hoạt, vô hiệu hóa và xóa sinh viên.",
            "Đặt lại mật khẩu cho sinh viên.",
            "Tải mẫu nhập danh sách và nhập sinh viên từ tệp.",
            "Xuất báo cáo danh sách sinh viên khi cần tổng hợp."
        ],
        "main_flow": [
            "Quản trị viên mở màn hình danh sách sinh viên.",
            "Hệ thống hiển thị bảng sinh viên kèm bộ lọc và các thao tác nhanh.",
            "Quản trị viên chọn thêm mới, chỉnh sửa, khóa/mở, đặt lại mật khẩu hoặc xóa.",
            "Hệ thống kiểm tra dữ liệu và cập nhật danh sách.",
            "Nếu nhập hàng loạt, hệ thống đọc tệp, báo số bản ghi thành công và bản ghi lỗi."
        ],
        "exceptions": [
            "Email hoặc mã sinh viên trùng: hệ thống từ chối lưu và chỉ rõ bản ghi lỗi.",
            "Tệp nhập sai định dạng hoặc vượt giới hạn: hiển thị thông báo và giữ nguyên dữ liệu hiện có.",
            "Xóa sinh viên đang có dữ liệu liên quan: hệ thống cần xác nhận trước khi thực hiện."
        ],
        "screen": [
            ("Danh sách sinh viên", "Bảng gồm STT, họ tên, email, mã sinh viên, số điện thoại, trạng thái, lần đăng nhập gần nhất, ngày tạo và cột thao tác. Phía trên có ô tìm kiếm, bộ lọc trạng thái, nút Thêm sinh viên và Nhập danh sách."),
            ("Form thêm/sửa sinh viên", "Các trường nhập gồm Họ tên, Email, Mã sinh viên, Số điện thoại, Mật khẩu khi tạo mới và Trạng thái. Mỗi trường có vùng báo lỗi riêng khi dữ liệu không hợp lệ."),
            ("Màn hình nhập danh sách", "Có nút tải mẫu, khu vực chọn tệp, mô tả định dạng yêu cầu và bảng kết quả sau khi nhập. Dòng lỗi phải chỉ ra sinh viên nào chưa được tạo."),
            ("Hộp xác nhận thao tác", "Các thao tác khóa, vô hiệu hóa, đặt lại mật khẩu và xóa đều có hộp xác nhận để tránh thao tác nhầm.")
        ],
        "usecase_img": "student-management-usecase.png",
        "activity_img": "student-management-activity.png",
    },
    {
        "id": "UC-03",
        "title": "Quản lý môn học và phân công sinh viên",
        "actors": "Quản trị viên, Sinh viên",
        "goal": "Tổ chức danh mục môn học, cập nhật thông tin môn và phân công sinh viên vào môn học phù hợp.",
        "scope": [
            "Quản trị viên tạo, sửa, xóa và xem chi tiết môn học.",
            "Quản trị viên gán hoặc gỡ sinh viên khỏi môn học.",
            "Sinh viên xem danh sách môn được phân công và chi tiết môn.",
            "Môn học có mã môn, tên môn, mô tả, số tín chỉ, trạng thái, màu nhận diện và hình đại diện.",
            "Xuất báo cáo môn học và báo cáo sinh viên theo môn."
        ],
        "main_flow": [
            "Quản trị viên mở danh sách môn học và chọn tạo mới hoặc sửa.",
            "Hệ thống hiển thị biểu mẫu thông tin môn học.",
            "Quản trị viên lưu thông tin và chuyển sang màn hình phân công sinh viên nếu cần.",
            "Hệ thống hiển thị danh sách sinh viên đã học môn và danh sách sinh viên có thể gán.",
            "Sinh viên đăng nhập sẽ nhìn thấy môn được phân công trong khu vực học tập."
        ],
        "exceptions": [
            "Mã môn trùng hoặc sai định dạng: không cho lưu và yêu cầu chỉnh sửa.",
            "Ảnh môn học không phù hợp: từ chối tải lên và nêu lý do.",
            "Gán trùng sinh viên vào cùng môn: hệ thống giữ nguyên dữ liệu và thông báo."
        ],
        "screen": [
            ("Danh sách môn học", "Hiển thị dạng thẻ hoặc bảng với mã môn, tên môn, số tín chỉ, trạng thái, màu nhận diện và nút xem/sửa/xóa. Có bộ lọc theo trạng thái và ô tìm kiếm theo tên hoặc mã môn."),
            ("Form môn học", "Gồm Mã môn, Tên môn, Mô tả, Số tín chỉ, Trạng thái, Màu nhận diện và Hình đại diện. Khi sửa, mã môn được giữ ổn định để tránh nhầm dữ liệu học tập."),
            ("Chi tiết môn học", "Hiển thị thông tin tổng quan, mô tả, danh sách sinh viên, bài tập liên quan và các thao tác quản trị phù hợp."),
            ("Màn hình phân công sinh viên", "Bên trái là sinh viên đang thuộc môn, bên phải hoặc hộp chọn là sinh viên có thể thêm. Có tìm kiếm, nút gán, nút gỡ và cảnh báo khi thao tác ảnh hưởng dữ liệu học tập.")
        ],
        "usecase_img": "subject-management-usecase.png",
        "activity_img": "subject-management-activity.png",
    },
    {
        "id": "UC-04",
        "title": "Quản lý bài tập, nộp bài và chấm điểm",
        "actors": "Quản trị viên, Sinh viên",
        "goal": "Quản trị viên giao bài tập theo môn, sinh viên nộp bài, quản trị viên chấm điểm và sinh viên xem kết quả.",
        "scope": [
            "Quản trị viên tạo, sửa, xóa bài tập theo môn học.",
            "Bài tập có tiêu đề, mô tả, hạn nộp, trạng thái và tệp đính kèm nếu có.",
            "Sinh viên xem danh sách bài tập của các môn mình được phân công.",
            "Sinh viên nộp nội dung, tệp bài làm hoặc cập nhật bài nộp khi còn được phép.",
            "Quản trị viên xem danh sách bài nộp, chấm điểm và ghi phản hồi.",
            "Sinh viên xem điểm, phản hồi và trạng thái bài nộp."
        ],
        "main_flow": [
            "Quản trị viên tạo bài tập và đặt hạn nộp.",
            "Sinh viên mở danh sách bài tập, xem chi tiết và gửi bài làm.",
            "Hệ thống ghi nhận trạng thái nộp bài và thời điểm nộp.",
            "Quản trị viên mở danh sách bài nộp của bài tập và nhập điểm, phản hồi.",
            "Sinh viên mở màn hình điểm để xem kết quả sau khi được chấm."
        ],
        "exceptions": [
            "Bài tập đã đóng hoặc quá hạn: sinh viên không thể nộp mới nếu quy định không cho phép.",
            "Bài nộp thiếu cả nội dung và tệp: hệ thống yêu cầu bổ sung.",
            "Điểm ngoài thang điểm quy định: hệ thống không cho lưu.",
            "Tệp bài làm không đúng loại hoặc quá lớn: hiển thị lỗi trước khi gửi."
        ],
        "screen": [
            ("Danh sách bài tập của quản trị viên", "Bảng gồm tiêu đề, môn học, mã môn, hạn nộp, trạng thái, tệp đính kèm và thao tác xem/sửa/xóa/xem bài nộp. Bộ lọc giúp tìm theo môn, trạng thái hoặc từ khóa."),
            ("Form tạo/sửa bài tập", "Gồm Môn học, Tiêu đề, Mô tả yêu cầu, Hạn nộp, Trạng thái và Tệp đính kèm. Màn hình cần làm rõ bài tập đang ở bản nháp, đang mở hay đã đóng."),
            ("Danh sách bài tập của sinh viên", "Hiển thị từng bài tập dạng thẻ với môn học, hạn nộp, trạng thái bài tập, trạng thái bài nộp và nút Xem chi tiết/Nộp bài/Cập nhật bài nộp."),
            ("Màn hình nộp bài", "Có phần tóm tắt yêu cầu, hạn nộp, trạng thái, vùng nhập nội dung, khu vực chọn tệp, nút gửi và cảnh báo khi bài tập không còn mở."),
            ("Màn hình chấm điểm", "Quản trị viên xem thông tin sinh viên, nội dung bài nộp, tệp đính kèm, thời điểm nộp, ô nhập điểm và ô phản hồi. Sau khi lưu, trạng thái chuyển sang đã chấm."),
            ("Màn hình xem điểm", "Sinh viên nhìn thấy môn học, bài tập, điểm số, phản hồi, ngày chấm và trạng thái. Nếu chưa được chấm, màn hình hiển thị thông báo đang chờ đánh giá.")
        ],
        "usecase_img": "assignment-grading-usecase.png",
        "activity_img": "assignment-grading-activity.png",
    },
    {
        "id": "UC-05",
        "title": "Quản lý mục tiêu học tập",
        "actors": "Sinh viên",
        "goal": "Sinh viên tự đặt mục tiêu học tập theo môn, theo dõi tiến độ và dùng mục tiêu làm đầu vào cho lộ trình học.",
        "scope": [
            "Tạo, xem, sửa và xóa mục tiêu học tập.",
            "Gắn mục tiêu với môn học cụ thể.",
            "Ghi mô tả mục tiêu, ngày bắt đầu, ngày kết thúc và tiến độ.",
            "Cập nhật trạng thái mục tiêu theo quá trình học.",
            "Sử dụng mục tiêu làm cơ sở để tạo lộ trình học cá nhân."
        ],
        "main_flow": [
            "Sinh viên mở màn hình mục tiêu học tập.",
            "Sinh viên tạo mục tiêu mới hoặc chỉnh sửa mục tiêu hiện có.",
            "Hệ thống kiểm tra thông tin và lưu mục tiêu.",
            "Sinh viên theo dõi danh sách mục tiêu, trạng thái và tiến độ.",
            "Khi tạo lộ trình, sinh viên có thể chọn một mục tiêu đã có."
        ],
        "exceptions": [
            "Mục tiêu thiếu tiêu đề hoặc môn học: hệ thống yêu cầu bổ sung.",
            "Ngày kết thúc trước ngày bắt đầu: hệ thống cảnh báo và không cho lưu.",
            "Tiến độ không hợp lệ: hệ thống yêu cầu nhập lại."
        ],
        "screen": [
            ("Danh sách mục tiêu", "Hiển thị các mục tiêu theo thẻ hoặc bảng với tiêu đề, môn học, thời gian, tiến độ và trạng thái. Có nút tạo mới và thao tác xem/sửa/xóa."),
            ("Form mục tiêu", "Gồm Tên mục tiêu, Môn học, Mô tả, Ngày bắt đầu, Ngày kết thúc, Tiến độ và Trạng thái. Các trường ngày cần dễ chọn và có nhắc lỗi rõ ràng."),
            ("Chi tiết mục tiêu", "Hiển thị nội dung mục tiêu, môn liên quan, trạng thái hiện tại, tiến độ và các lộ trình có liên kết nếu có."),
            ("Trạng thái rỗng", "Khi chưa có mục tiêu, màn hình hiển thị lời nhắc tạo mục tiêu đầu tiên thay vì để bảng trống.")
        ],
        "usecase_img": "learning-goal-usecase.png",
        "activity_img": "learning-goal-activity.png",
    },
    {
        "id": "UC-06",
        "title": "Quản lý lịch học cá nhân",
        "actors": "Sinh viên",
        "goal": "Sinh viên tạo lịch học, theo dõi thời gian học, cập nhật trạng thái buổi học và tránh trùng lịch.",
        "scope": [
            "Tạo, xem, sửa và xóa lịch học.",
            "Gắn lịch học với môn học hoặc mục học cụ thể.",
            "Quản lý ngày học, giờ bắt đầu, giờ kết thúc, địa điểm, loại lịch và trạng thái.",
            "Đánh dấu lịch đã hoàn thành, hủy hoặc sắp diễn ra.",
            "Nhận cảnh báo khi thời gian không hợp lệ hoặc có khả năng trùng lịch."
        ],
        "main_flow": [
            "Sinh viên mở màn hình lịch học.",
            "Sinh viên tạo lịch mới với môn học, thời gian và nội dung.",
            "Hệ thống kiểm tra tính hợp lệ của ngày giờ.",
            "Lịch được hiển thị trong danh sách hoặc dạng thẻ theo thời gian.",
            "Sinh viên cập nhật trạng thái khi hoàn thành hoặc cần hủy buổi học."
        ],
        "exceptions": [
            "Giờ kết thúc không sau giờ bắt đầu: hệ thống từ chối lưu.",
            "Lịch sắp diễn ra nhưng ngày giờ đã ở quá khứ: hệ thống yêu cầu chỉnh lại.",
            "Lịch bị trùng với lịch khác: hệ thống cảnh báo để sinh viên cân nhắc."
        ],
        "screen": [
            ("Danh sách lịch học", "Hiển thị ngày học, khung giờ, môn học, tiêu đề, loại lịch, trạng thái và thao tác xem/sửa/xóa. Có thể nhóm theo ngày để sinh viên dễ theo dõi."),
            ("Form lịch học", "Gồm Tiêu đề, Môn học, Ngày học, Giờ bắt đầu, Giờ kết thúc, Địa điểm, Loại lịch, Trạng thái và Ghi chú. Khi đổi thời gian, hệ thống cần kiểm tra quan hệ bắt đầu-kết thúc."),
            ("Chi tiết lịch học", "Hiển thị toàn bộ thông tin buổi học, trạng thái hiện tại, môn học liên quan và các nút cập nhật nhanh như Hoàn thành hoặc Hủy."),
            ("Cảnh báo thời gian", "Nếu lịch có thời gian không hợp lệ hoặc có khả năng xung đột, thông báo phải xuất hiện gần trường thời gian để sinh viên sửa ngay.")
        ],
        "usecase_img": "study-schedule-usecase.png",
        "activity_img": "study-schedule-activity.png",
    },
    {
        "id": "UC-07",
        "title": "Tạo và theo dõi lộ trình học bằng AI",
        "actors": "Sinh viên",
        "goal": "Sinh viên tạo lộ trình học cá nhân hóa dựa trên môn học, mục tiêu, trình độ, quỹ thời gian và lịch học mong muốn.",
        "scope": [
            "Kiểm tra trạng thái sẵn sàng của tính năng AI trước khi tạo lộ trình.",
            "Nhập mục tiêu học, trình độ hiện tại, thời gian học mỗi ngày, ngày học trong tuần và khung thời gian ưu tiên.",
            "Xem bản xem trước lộ trình trước khi lưu.",
            "Lưu lộ trình, theo dõi tiến độ và cập nhật từng mục học.",
            "Đổi trạng thái mục học, ghi kết quả học và dời lịch từng mục khi cần."
        ],
        "main_flow": [
            "Sinh viên mở màn hình tạo lộ trình.",
            "Sinh viên chọn môn học, mục tiêu hoặc nhập mục tiêu mới.",
            "Sinh viên khai báo trình độ, thời gian học, ngày học, khung giờ và khoảng ngày.",
            "Hệ thống tạo bản xem trước gồm tổng quan, danh sách mục học và lịch đề xuất.",
            "Sinh viên lưu lộ trình, sau đó theo dõi tiến độ trên màn hình chi tiết.",
            "Trong quá trình học, sinh viên cập nhật trạng thái, kết quả hoặc dời lịch từng mục học."
        ],
        "exceptions": [
            "Tính năng AI chưa sẵn sàng: màn hình hiển thị thông báo và không cho gửi yêu cầu tạo lộ trình.",
            "Thiếu môn học, mục tiêu hoặc khoảng thời gian: hệ thống yêu cầu bổ sung.",
            "Lịch đề xuất bị xung đột: hệ thống thông báo danh sách xung đột để sinh viên điều chỉnh.",
            "Sinh viên rời màn hình xem trước: dữ liệu xem trước cần được giữ tạm để không mất kết quả vừa tạo."
        ],
        "screen": [
            ("Danh sách lộ trình", "Hiển thị các lộ trình theo thẻ với môn học, tiêu đề, mô tả ngắn, trạng thái, phần trăm tiến độ, số mục học, ngày bắt đầu và ngày kết thúc. Có nút Tạo lộ trình mới."),
            ("Form tạo lộ trình bằng AI", "Gồm Môn học, Mục tiêu học tập, Trình độ hiện tại, Thời gian học mỗi ngày, Các ngày có thể học, Giờ bắt đầu ưu tiên, Thời lượng mỗi buổi, giới hạn học mỗi ngày/tuần, nhắc lịch, ngày bắt đầu và ngày kết thúc."),
            ("Màn hình xem trước", "Hiển thị tiêu đề, tổng quan, mục tiêu, danh sách mục học theo ngày, thời lượng, ưu tiên và trạng thái ban đầu. Sinh viên có thể quay lại chỉnh thông tin hoặc lưu lộ trình."),
            ("Chi tiết lộ trình", "Có thanh tiến độ, thông tin môn học, thời gian học, ngày học, mục tiêu, danh sách các mục học và thao tác cập nhật trạng thái, ghi kết quả hoặc dời lịch."),
            ("Cập nhật mục học", "Mỗi mục học có trạng thái chưa bắt đầu, đang học, hoàn thành, chưa hoàn thành hoặc dời lịch. Khi dời lịch, sinh viên nhập ngày, giờ bắt đầu và thời lượng mới.")
        ],
        "usecase_img": "learning-roadmap-usecase.png",
        "activity_img": "learning-roadmap-activity.png",
    },
    {
        "id": "UC-08",
        "title": "Dashboard quản trị và dashboard sinh viên",
        "actors": "Quản trị viên, Sinh viên",
        "goal": "Cung cấp màn hình tổng quan để người dùng nhìn nhanh tình hình học tập, hạn nộp, tiến độ và hoạt động gần đây.",
        "scope": [
            "Quản trị viên xem tổng quan số lượng sinh viên, môn học, bài tập, bài nộp và hoạt động mới.",
            "Quản trị viên theo dõi hạn nộp sắp tới, sinh viên mới, môn học nổi bật và hoạt động gần đây.",
            "Sinh viên xem lịch học hôm nay, lịch sắp tới, bài tập sắp đến hạn, điểm mới nhất và tiến độ lộ trình.",
            "Sinh viên nhìn thấy các ghi nhận hoặc thành tích học tập gần đây nếu có.",
            "Dashboard cần có trạng thái đang tải, trạng thái lỗi và trạng thái chưa có dữ liệu."
        ],
        "main_flow": [
            "Người dùng đăng nhập và mở dashboard theo vai trò.",
            "Hệ thống tổng hợp các chỉ số và danh sách quan trọng.",
            "Người dùng xem thông tin tổng quan và bấm vào từng khối để đi đến màn hình chi tiết.",
            "Khi dữ liệu thay đổi ở bài tập, điểm, lịch hoặc lộ trình, dashboard phản ánh lại trạng thái mới."
        ],
        "exceptions": [
            "Không có dữ liệu: hiển thị trạng thái rỗng thân thiện, không để khoảng trắng khó hiểu.",
            "Không tải được dữ liệu: hiển thị thông báo lỗi và cho phép thử lại.",
            "Người dùng truy cập nhầm vai trò: hệ thống điều hướng hoặc từ chối truy cập phù hợp."
        ],
        "screen": [
            ("Dashboard quản trị", "Gồm các thẻ thống kê tổng quan, danh sách hạn nộp sắp tới, sinh viên mới, môn học có hoạt động nổi bật và bảng hoạt động gần đây. Các thẻ nên có nhãn rõ, số liệu nổi bật và liên kết đến màn hình quản lý liên quan."),
            ("Dashboard sinh viên", "Gồm lịch hôm nay, lịch sắp tới, bài tập sắp đến hạn, điểm mới nhất, tiến độ lộ trình và ghi nhận gần đây. Thông tin cần ưu tiên việc cần làm trước, tránh trình bày quá dàn trải."),
            ("Trạng thái tải dữ liệu", "Trong lúc tải, màn hình hiển thị thông báo đang tải. Nếu lỗi, cần có thông báo dễ hiểu để người dùng biết có thể thử lại."),
            ("Điều hướng từ dashboard", "Mỗi khối tổng quan nên dẫn người dùng đến màn hình chi tiết tương ứng như bài tập, lịch học, điểm, lộ trình hoặc báo cáo.")
        ],
        "usecase_img": None,
        "activity_img": None,
    },
    {
        "id": "UC-09",
        "title": "Quản lý bài học",
        "actors": "Quản trị viên, Sinh viên",
        "goal": "Quản trị viên tạo nội dung bài học theo môn, sinh viên xem bài học và đánh dấu hoàn thành.",
        "scope": [
            "Quản trị viên xem, tạo, sửa và xóa bài học.",
            "Bài học có môn học, tiêu đề, nội dung mô tả, thời lượng, tài liệu học và liên kết video nếu có.",
            "Quản trị viên quản lý trạng thái nháp hoặc xuất bản.",
            "Sinh viên chỉ xem các bài học thuộc môn được phân công và đã sẵn sàng để học.",
            "Sinh viên đánh dấu bài học đã hoàn thành để cập nhật tiến độ."
        ],
        "main_flow": [
            "Quản trị viên tạo bài học và gắn với môn học.",
            "Khi bài học sẵn sàng, sinh viên mở danh sách bài học.",
            "Sinh viên xem chi tiết nội dung, tài liệu hoặc video.",
            "Sinh viên đánh dấu hoàn thành sau khi học xong.",
            "Hệ thống cập nhật trạng thái học của sinh viên."
        ],
        "exceptions": [
            "Bài học chưa xuất bản: sinh viên không nhìn thấy trong danh sách học.",
            "Sinh viên không thuộc môn học: hệ thống không cho xem bài học.",
            "Thiếu tiêu đề, môn học hoặc nội dung chính: hệ thống yêu cầu quản trị viên bổ sung trước khi lưu."
        ],
        "screen": [
            ("Danh sách bài học quản trị", "Hiển thị tiêu đề, môn học, trạng thái, thời lượng, tài liệu/video và thao tác xem/sửa/xóa. Có ô tìm kiếm và bộ lọc theo môn hoặc trạng thái."),
            ("Form bài học", "Gồm Môn học, Tiêu đề, Nội dung, Thời lượng dự kiến, Tài liệu đính kèm, Liên kết video và Trạng thái. Các trường tài liệu cần hiển thị tên tệp đã chọn hoặc tài liệu hiện có."),
            ("Danh sách bài học sinh viên", "Hiển thị bài học theo thẻ với mã môn, tên môn, tiêu đề, thời lượng, trạng thái đã học/chưa học và nút xem chi tiết."),
            ("Chi tiết bài học", "Hiển thị nội dung bài học, tài liệu, video nếu có và nút đánh dấu hoàn thành. Nếu đã hoàn thành, trạng thái cần thể hiện rõ để tránh bấm lặp.")
        ],
        "usecase_img": None,
        "activity_img": None,
    },
    {
        "id": "UC-10",
        "title": "Thông báo học tập",
        "actors": "Quản trị viên, Sinh viên",
        "goal": "Giúp người dùng theo dõi các nhắc nhở quan trọng như hạn nộp bài, lịch học hôm nay, lộ trình bị trễ và thông tin cần chú ý.",
        "scope": [
            "Hiển thị danh sách thông báo của người dùng.",
            "Hiển thị số lượng thông báo chưa đọc.",
            "Cho phép đánh dấu một thông báo là đã đọc.",
            "Cho phép đánh dấu tất cả thông báo là đã đọc.",
            "Mỗi thông báo có tiêu đề, nội dung, thông tin bổ sung, thời điểm xảy ra, trạng thái đọc và liên kết đến màn hình liên quan nếu có."
        ],
        "main_flow": [
            "Người dùng mở biểu tượng hoặc trang thông báo.",
            "Hệ thống hiển thị danh sách thông báo, ưu tiên thông báo chưa đọc.",
            "Người dùng bấm vào thông báo để xem nội dung hoặc đi đến màn hình liên quan.",
            "Hệ thống đánh dấu thông báo là đã đọc.",
            "Người dùng có thể bấm đánh dấu tất cả đã đọc."
        ],
        "exceptions": [
            "Không có thông báo: hiển thị trạng thái rỗng rõ ràng.",
            "Thông báo không còn liên kết hợp lệ: vẫn hiển thị nội dung, nhưng không điều hướng sai.",
            "Đánh dấu đã đọc thất bại: giữ trạng thái cũ và thông báo lỗi."
        ],
        "screen": [
            ("Danh sách thông báo", "Hiển thị tiêu đề, nội dung, nhãn đã đọc/chưa đọc, thời điểm, thông tin bổ sung và nút xem chi tiết nếu có liên kết. Thông báo chưa đọc cần nổi bật hơn thông báo đã đọc."),
            ("Bộ đếm chưa đọc", "Hiển thị số thông báo chưa đọc ở khu vực điều hướng hoặc đầu trang, tự cập nhật sau khi người dùng đánh dấu đã đọc."),
            ("Nút đánh dấu tất cả", "Đặt ở vùng dễ thấy trên trang thông báo, bị vô hiệu hóa khi không có thông báo hoặc tất cả đã đọc."),
            ("Trạng thái rỗng", "Khi chưa có thông báo, màn hình cần hiển thị thông điệp ngắn để người dùng biết hệ thống không bị lỗi.")
        ],
        "usecase_img": None,
        "activity_img": None,
    },
    {
        "id": "UC-11",
        "title": "Báo cáo và xuất dữ liệu",
        "actors": "Quản trị viên",
        "goal": "Quản trị viên xuất dữ liệu phục vụ đối chiếu, lưu trữ và đánh giá quá trình học tập.",
        "scope": [
            "Xuất danh sách sinh viên.",
            "Xuất danh sách môn học.",
            "Xuất danh sách sinh viên theo môn học.",
            "Xuất danh sách bài tập.",
            "Xuất danh sách bài nộp và điểm.",
            "Xuất báo cáo điểm, tiến độ học tập và ghi nhận liên quan đến AI."
        ],
        "main_flow": [
            "Quản trị viên mở khu vực báo cáo hoặc màn hình danh sách tương ứng.",
            "Quản trị viên chọn loại dữ liệu cần xuất.",
            "Hệ thống tạo tệp dữ liệu theo bộ lọc hiện tại nếu có.",
            "Quản trị viên tải tệp về để lưu trữ hoặc xử lý bên ngoài."
        ],
        "exceptions": [
            "Không có dữ liệu phù hợp: hệ thống vẫn phản hồi rõ ràng, tránh tạo báo cáo gây hiểu nhầm.",
            "Quá trình xuất lỗi: hệ thống hiển thị thông báo và cho phép thử lại."
        ],
        "screen": [
            ("Khu vực báo cáo", "Cung cấp nhóm nút xuất theo từng loại dữ liệu. Mỗi nút có nhãn rõ về nội dung xuất để tránh nhầm giữa sinh viên, môn học, phân công, bài tập và bài nộp."),
            ("Báo cáo theo danh sách", "Các màn hình danh sách nên có thao tác xuất dữ liệu tương ứng với bộ lọc đang áp dụng, giúp báo cáo khớp với dữ liệu người quản trị đang xem."),
            ("Trạng thái tải xuống", "Sau khi bấm xuất, hệ thống cần phản hồi đang xử lý, tải thành công hoặc lỗi để người dùng không bấm lặp nhiều lần.")
        ],
        "usecase_img": None,
        "activity_img": None,
    },
    {
        "id": "UC-12",
        "title": "Các module học tập bổ sung",
        "actors": "Sinh viên",
        "goal": "Cung cấp nền tảng mở rộng cho bài học, bài kiểm tra, nhiệm vụ, ghi chú, trợ lý học tập và theo dõi tiến độ.",
        "scope": [
            "Sinh viên xem bài học theo môn học và đánh dấu hoàn thành.",
            "Sinh viên xem khu vực bài kiểm tra hoặc nhiệm vụ học tập khi dữ liệu được bổ sung.",
            "Sinh viên quản lý ghi chú cá nhân phục vụ ôn tập.",
            "Sinh viên truy cập trợ lý học tập để nhận hỗ trợ theo ngữ cảnh học tập.",
            "Sinh viên theo dõi tiến độ học tập tổng hợp."
        ],
        "main_flow": [
            "Sinh viên chọn một module học tập từ menu.",
            "Hệ thống hiển thị dữ liệu học tập hiện có hoặc trạng thái chưa có dữ liệu.",
            "Sinh viên thực hiện thao tác phù hợp như xem bài học, đánh dấu hoàn thành, ghi chú hoặc xem tiến độ.",
            "Hệ thống cập nhật trạng thái học tập và giữ trải nghiệm nhất quán với các module chính."
        ],
        "exceptions": [
            "Module chưa có dữ liệu: hiển thị trạng thái rỗng có hướng dẫn ngắn.",
            "Không có quyền xem nội dung theo môn: hệ thống từ chối truy cập và hướng người dùng về danh sách hợp lệ."
        ],
        "screen": [
            ("Bài học", "Danh sách bài học theo môn, trạng thái hoàn thành và màn hình chi tiết bài học. Cần có nút đánh dấu hoàn thành rõ ràng."),
            ("Bài kiểm tra và nhiệm vụ", "Hiển thị danh sách nội dung học tập được giao, thời hạn nếu có và trạng thái hoàn thành. Khi chưa có dữ liệu, dùng thông báo rỗng thay vì bảng trống."),
            ("Ghi chú", "Cho phép sinh viên xem và quản lý ghi chú cá nhân theo môn hoặc theo chủ đề học tập."),
            ("Trợ lý học tập", "Khu vực tương tác hỗ trợ học tập, trả lời câu hỏi hoặc gợi ý hướng học. Màn hình cần phân biệt rõ nội dung người dùng gửi và phản hồi nhận được."),
            ("Tiến độ học tập", "Hiển thị tổng quan tiến độ theo môn, bài học, bài tập, lịch học và lộ trình. Các chỉ số cần dễ đọc, có trạng thái hoặc màu nhận diện phù hợp.")
        ],
        "usecase_img": None,
        "activity_img": None,
    },
]


REQUIREMENTS = [
    ("FR-01", "Tài khoản", "Hệ thống cho phép đăng ký, đăng nhập, đăng xuất và điều hướng theo vai trò."),
    ("FR-02", "Sinh viên", "Quản trị viên quản lý hồ sơ, trạng thái, mật khẩu và nhập danh sách sinh viên."),
    ("FR-03", "Môn học", "Quản trị viên quản lý môn học và phân công sinh viên; sinh viên xem môn được phân công."),
    ("FR-04", "Bài tập", "Quản trị viên giao bài tập; sinh viên xem, nộp và cập nhật bài nộp."),
    ("FR-05", "Chấm điểm", "Quản trị viên chấm bài, nhập điểm và phản hồi; sinh viên xem kết quả."),
    ("FR-06", "Mục tiêu học tập", "Sinh viên tạo và theo dõi mục tiêu học tập theo môn."),
    ("FR-07", "Lịch học", "Sinh viên quản lý lịch học cá nhân và trạng thái buổi học."),
    ("FR-08", "Lộ trình AI", "Sinh viên tạo, lưu và theo dõi lộ trình học cá nhân hóa bằng AI."),
    ("FR-09", "Dashboard", "Quản trị viên và sinh viên xem màn hình tổng quan theo vai trò."),
    ("FR-10", "Bài học", "Quản trị viên quản lý bài học; sinh viên xem và đánh dấu hoàn thành bài học."),
    ("FR-11", "Thông báo", "Người dùng xem thông báo, số chưa đọc và đánh dấu đã đọc."),
    ("FR-12", "Báo cáo", "Quản trị viên xuất dữ liệu sinh viên, môn học, phân công, bài tập, bài nộp, điểm, tiến độ và ghi nhận AI."),
    ("FR-13", "Module học tập bổ sung", "Sinh viên sử dụng bài kiểm tra, nhiệm vụ, ghi chú, trợ lý học tập và tiến độ khi được kích hoạt.")
]


TEST_SCENARIOS = [
    ("TS-01", "Đăng nhập thành công theo vai trò", "Người dùng được chuyển đến đúng khu vực làm việc."),
    ("TS-02", "Đăng nhập thất bại", "Hệ thống hiển thị lỗi khi thông tin sai hoặc tài khoản không hoạt động."),
    ("TS-03", "Thêm sinh viên hợp lệ", "Sinh viên mới xuất hiện trong danh sách và có trạng thái đúng."),
    ("TS-04", "Nhập danh sách sinh viên", "Tệp hợp lệ tạo nhiều sinh viên; bản ghi lỗi được báo rõ."),
    ("TS-05", "Tạo môn học và gán sinh viên", "Môn học được tạo và sinh viên được gán không bị trùng."),
    ("TS-06", "Sinh viên xem môn của mình", "Sinh viên chỉ thấy các môn được phân công."),
    ("TS-07", "Tạo bài tập", "Bài tập hiển thị cho sinh viên thuộc môn khi trạng thái phù hợp."),
    ("TS-08", "Nộp bài và cập nhật bài nộp", "Bài nộp được ghi nhận, cập nhật khi còn được phép."),
    ("TS-09", "Chấm điểm bài nộp", "Điểm và phản hồi hiển thị trên màn hình điểm của sinh viên."),
    ("TS-10", "Tạo mục tiêu học tập", "Mục tiêu được lưu, hiển thị và có thể chỉnh sửa."),
    ("TS-11", "Tạo lịch học cá nhân", "Lịch hợp lệ được lưu và hiển thị đúng thời gian."),
    ("TS-12", "Tạo lộ trình bằng AI", "Bản xem trước được sinh, lưu thành lộ trình và theo dõi tiến độ."),
    ("TS-13", "Dời lịch mục học", "Mục học nhận ngày giờ mới và cảnh báo khi có xung đột."),
    ("TS-14", "Xem dashboard theo vai trò", "Dashboard hiển thị đúng chỉ số và danh sách phù hợp với người dùng."),
    ("TS-15", "Quản lý và học bài học", "Bài học xuất bản hiển thị cho sinh viên và có thể đánh dấu hoàn thành."),
    ("TS-16", "Xử lý thông báo", "Thông báo chưa đọc được đếm đúng và đổi trạng thái sau khi đánh dấu đã đọc."),
    ("TS-17", "Xuất báo cáo", "Tệp báo cáo được tải xuống theo đúng loại dữ liệu."),
    ("TS-18", "Trạng thái rỗng", "Các màn hình chưa có dữ liệu hiển thị thông báo rỗng có ích.")
]


SCREEN_SPECS = {
    "UC-01": [
        {"name": "Màn hình đăng nhập", "rows": [
            (1, "Email", "Text input", "Yes", "Chuỗi", "Trống", "Nhập email tài khoản để đăng nhập."),
            (2, "Mật khẩu", "Password input", "Yes", "Chuỗi", "Trống", "Nhập mật khẩu; nội dung phải được che ký tự."),
            (3, "Đăng nhập", "Button", "N/A", "Không", "N/A", "Gửi thông tin đăng nhập và chuyển vào hệ thống nếu hợp lệ."),
            (4, "Thông báo lỗi", "Label", "No", "Chuỗi", "Ẩn", "Hiển thị lỗi khi thiếu thông tin, sai thông tin hoặc tài khoản bị hạn chế."),
            (5, "Chuyển đăng ký", "Link", "No", "Không", "N/A", "Dẫn khách sang màn hình tạo tài khoản sinh viên.")
        ]},
        {"name": "Màn hình đăng ký", "rows": [
            (1, "Họ tên", "Text input", "Yes", "Chuỗi", "Trống", "Nhập tên đầy đủ của sinh viên."),
            (2, "Email", "Text input", "Yes", "Chuỗi", "Trống", "Nhập email dùng để đăng nhập và nhận định danh tài khoản."),
            (3, "Số điện thoại", "Text input", "No", "Chuỗi", "Trống", "Nhập số điện thoại cá nhân nếu có."),
            (4, "Mã sinh viên", "Text input", "Yes", "Chuỗi", "Trống", "Nhập mã sinh viên duy nhất."),
            (5, "Mật khẩu", "Password input", "Yes", "Chuỗi", "Trống", "Nhập mật khẩu đăng nhập."),
            (6, "Xác nhận mật khẩu", "Password input", "Yes", "Chuỗi", "Trống", "Nhập lại mật khẩu để tránh sai sót."),
            (7, "Tạo tài khoản", "Button", "N/A", "Không", "N/A", "Gửi biểu mẫu đăng ký và hiển thị kết quả xử lý.")
        ]},
        {"name": "Khu vực sau đăng nhập", "rows": [
            (1, "Tên người dùng", "Label", "No", "Chuỗi", "Theo tài khoản", "Hiển thị họ tên người đang đăng nhập."),
            (2, "Vai trò", "Badge", "No", "Chuỗi", "Theo tài khoản", "Cho biết người dùng là sinh viên hay quản trị viên."),
            (3, "Menu chức năng", "Navigation", "No", "Danh sách", "Theo vai trò", "Chỉ hiển thị chức năng phù hợp với quyền sử dụng."),
            (4, "Đăng xuất", "Button", "No", "Không", "N/A", "Kết thúc phiên làm việc và quay về trạng thái chưa đăng nhập.")
        ]},
    ],
    "UC-02": [
        {"name": "Danh sách sinh viên", "rows": [
            (1, "Tìm kiếm", "Text input", "No", "Chuỗi", "Trống", "Tìm sinh viên theo họ tên, email hoặc mã sinh viên."),
            (2, "Lọc trạng thái", "Dropdown", "No", "Danh sách", "Tất cả", "Lọc theo hoạt động, ngừng hoạt động hoặc bị khóa."),
            (3, "Bảng sinh viên", "Table", "No", "Danh sách", "Theo dữ liệu", "Hiển thị STT, họ tên, email, mã sinh viên, số điện thoại, trạng thái và ngày tạo."),
            (4, "Thêm sinh viên", "Button", "No", "Không", "N/A", "Mở form thêm mới sinh viên."),
            (5, "Nhập danh sách", "Button", "No", "Không", "N/A", "Mở màn hình nhập sinh viên hàng loạt."),
            (6, "Thao tác dòng", "Button group", "No", "Không", "N/A", "Cho phép xem, sửa, đặt lại mật khẩu, khóa, bật/tắt trạng thái hoặc xóa sinh viên.")
        ]},
        {"name": "Form thêm/sửa sinh viên", "rows": [
            (1, "Họ tên", "Text input", "Yes", "Chuỗi", "Trống", "Nhập tên đầy đủ của sinh viên."),
            (2, "Email", "Text input", "Yes", "Chuỗi", "Trống", "Email phải duy nhất để định danh tài khoản."),
            (3, "Mã sinh viên", "Text input", "Yes", "Chuỗi", "Trống", "Mã sinh viên dùng để phân biệt hồ sơ."),
            (4, "Số điện thoại", "Text input", "No", "Chuỗi", "Trống", "Thông tin liên hệ bổ sung."),
            (5, "Mật khẩu", "Password input", "Khi tạo mới", "Chuỗi", "Trống", "Tạo mật khẩu ban đầu cho sinh viên."),
            (6, "Trạng thái", "Dropdown", "Yes", "Danh sách", "Hoạt động", "Chọn trạng thái sử dụng của tài khoản."),
            (7, "Lưu", "Button", "N/A", "Không", "N/A", "Lưu thông tin sau khi kiểm tra các trường bắt buộc.")
        ]},
        {"name": "Màn hình nhập danh sách", "rows": [
            (1, "Tải mẫu", "Button", "No", "Không", "N/A", "Tải tệp mẫu để quản trị viên điền đúng cột dữ liệu."),
            (2, "Tệp nhập", "File upload", "Yes", "Tệp", "Trống", "Chọn tệp danh sách sinh viên để nhập hàng loạt."),
            (3, "Kết quả nhập", "Table", "No", "Danh sách", "Ẩn", "Hiển thị số dòng thành công, dòng lỗi và lý do lỗi."),
            (4, "Xác nhận nhập", "Button", "N/A", "Không", "N/A", "Bắt đầu xử lý tệp đã chọn.")
        ]},
    ],
    "UC-03": [
        {"name": "Danh sách môn học", "rows": [
            (1, "Tìm kiếm môn", "Text input", "No", "Chuỗi", "Trống", "Tìm theo mã môn hoặc tên môn."),
            (2, "Lọc trạng thái", "Dropdown", "No", "Danh sách", "Tất cả", "Lọc môn đang học, tạm dừng hoặc hoàn thành."),
            (3, "Thẻ/Bảng môn học", "List/Card", "No", "Danh sách", "Theo dữ liệu", "Hiển thị mã môn, tên môn, số tín chỉ, trạng thái, màu và ảnh đại diện."),
            (4, "Thêm môn học", "Button", "No", "Không", "N/A", "Mở form tạo môn học mới."),
            (5, "Thao tác môn", "Button group", "No", "Không", "N/A", "Cho phép xem, sửa, xóa hoặc quản lý sinh viên của môn.")
        ]},
        {"name": "Form môn học", "rows": [
            (1, "Mã môn", "Text input", "Yes", "Chuỗi", "Trống", "Nhập mã môn duy nhất; khi sửa cần giữ ổn định."),
            (2, "Tên môn", "Text input", "Yes", "Chuỗi", "Trống", "Nhập tên đầy đủ của môn học."),
            (3, "Mô tả", "Textarea", "No", "Chuỗi", "Trống", "Nhập mô tả mục tiêu hoặc nội dung môn học."),
            (4, "Số tín chỉ", "Number input", "Yes", "Số", "3", "Nhập số tín chỉ phù hợp với môn học."),
            (5, "Trạng thái", "Dropdown", "Yes", "Danh sách", "Đang học", "Chọn trạng thái hiện tại của môn."),
            (6, "Màu nhận diện", "Color picker", "No", "Màu", "Theo hệ thống", "Chọn màu dùng để nhận diện môn trên giao diện."),
            (7, "Hình đại diện", "File upload", "No", "Tệp ảnh", "Trống", "Tải ảnh minh họa cho môn học."),
            (8, "Lưu", "Button", "N/A", "Không", "N/A", "Lưu thông tin môn học.")
        ]},
        {"name": "Màn hình phân công sinh viên", "rows": [
            (1, "Sinh viên đã gán", "Table", "No", "Danh sách", "Theo dữ liệu", "Hiển thị sinh viên đang thuộc môn học."),
            (2, "Sinh viên có thể gán", "Table/Modal", "No", "Danh sách", "Theo dữ liệu", "Hiển thị sinh viên chưa thuộc môn để chọn thêm."),
            (3, "Tìm sinh viên", "Text input", "No", "Chuỗi", "Trống", "Tìm nhanh trong danh sách phân công."),
            (4, "Gán sinh viên", "Button", "No", "Không", "N/A", "Thêm sinh viên vào môn học."),
            (5, "Gỡ sinh viên", "Button", "No", "Không", "N/A", "Xóa sinh viên khỏi danh sách của môn sau khi xác nhận.")
        ]},
    ],
    "UC-04": [
        {"name": "Danh sách bài tập quản trị", "rows": [
            (1, "Tìm kiếm", "Text input", "No", "Chuỗi", "Trống", "Tìm bài tập theo tiêu đề hoặc mô tả."),
            (2, "Lọc môn học", "Dropdown", "No", "Danh sách", "Tất cả", "Lọc bài tập theo môn."),
            (3, "Lọc trạng thái", "Dropdown", "No", "Danh sách", "Tất cả", "Lọc bản nháp, đang mở hoặc đã đóng."),
            (4, "Bảng bài tập", "Table", "No", "Danh sách", "Theo dữ liệu", "Hiển thị tiêu đề, môn học, hạn nộp, trạng thái, tệp và thao tác."),
            (5, "Tạo bài tập", "Button", "No", "Không", "N/A", "Mở form tạo bài tập mới."),
            (6, "Xem bài nộp", "Button", "No", "Không", "N/A", "Chuyển đến danh sách bài nộp của bài tập được chọn.")
        ]},
        {"name": "Form tạo/sửa bài tập", "rows": [
            (1, "Môn học", "Dropdown", "Yes", "Danh sách", "Trống", "Chọn môn nhận bài tập."),
            (2, "Tiêu đề", "Text input", "Yes", "Chuỗi", "Trống", "Nhập tên bài tập."),
            (3, "Mô tả yêu cầu", "Textarea", "No", "Chuỗi", "Trống", "Mô tả nội dung cần làm và tiêu chí nộp bài."),
            (4, "Hạn nộp", "Date time picker", "Yes", "Ngày giờ", "Trống", "Chọn thời điểm cuối cùng sinh viên được nộp."),
            (5, "Trạng thái", "Dropdown", "Yes", "Danh sách", "Đang mở", "Chọn bản nháp, đang mở hoặc đã đóng."),
            (6, "Tệp đính kèm", "File upload", "No", "Tệp", "Trống", "Tải tài liệu yêu cầu bài tập nếu có."),
            (7, "Lưu", "Button", "N/A", "Không", "N/A", "Lưu bài tập và phản hồi lỗi nếu dữ liệu chưa hợp lệ.")
        ]},
        {"name": "Màn hình nộp bài sinh viên", "rows": [
            (1, "Thông tin bài tập", "Info card", "No", "Chuỗi", "Theo dữ liệu", "Hiển thị môn học, tiêu đề, mô tả, trạng thái và hạn nộp."),
            (2, "Nội dung bài làm", "Textarea", "Có điều kiện", "Chuỗi", "Trống", "Sinh viên nhập câu trả lời hoặc mô tả bài làm."),
            (3, "Tệp bài làm", "File upload", "Có điều kiện", "Tệp", "Trống", "Tải tệp bài làm; cần có nội dung hoặc tệp."),
            (4, "Gửi/Cập nhật bài", "Button", "N/A", "Không", "N/A", "Gửi bài nộp mới hoặc cập nhật bài nộp hiện có khi còn được phép."),
            (5, "Cảnh báo hạn nộp", "Label", "No", "Chuỗi", "Theo trạng thái", "Cho biết bài tập còn mở, đã đóng hoặc quá hạn.")
        ]},
        {"name": "Màn hình chấm điểm và xem điểm", "rows": [
            (1, "Danh sách bài nộp", "Table", "No", "Danh sách", "Theo dữ liệu", "Quản trị viên xem sinh viên, thời điểm nộp, trạng thái và thao tác chấm."),
            (2, "Điểm", "Number input", "Yes", "Số", "Trống", "Nhập điểm theo thang điểm quy định."),
            (3, "Phản hồi", "Textarea", "No", "Chuỗi", "Trống", "Nhập nhận xét cho bài làm."),
            (4, "Lưu điểm", "Button", "N/A", "Không", "N/A", "Lưu điểm và phản hồi cho bài nộp."),
            (5, "Kết quả sinh viên", "Info card", "No", "Chuỗi/Số", "Theo dữ liệu", "Sinh viên xem điểm, phản hồi, trạng thái và ngày chấm.")
        ]},
    ],
    "UC-05": [
        {"name": "Danh sách mục tiêu học tập", "rows": [
            (1, "Danh sách mục tiêu", "Card/List", "No", "Danh sách", "Theo dữ liệu", "Hiển thị tiêu đề, môn học, thời gian, tiến độ và trạng thái."),
            (2, "Tạo mục tiêu", "Button", "No", "Không", "N/A", "Mở form tạo mục tiêu mới."),
            (3, "Lọc trạng thái", "Dropdown", "No", "Danh sách", "Tất cả", "Lọc mục tiêu đang thực hiện, hoàn thành, tạm dừng hoặc hủy."),
            (4, "Thao tác", "Button group", "No", "Không", "N/A", "Cho phép xem, sửa hoặc xóa mục tiêu.")
        ]},
        {"name": "Form mục tiêu", "rows": [
            (1, "Tên mục tiêu", "Text input", "Yes", "Chuỗi", "Trống", "Nhập mục tiêu học tập cần đạt."),
            (2, "Môn học", "Dropdown", "Yes", "Danh sách", "Trống", "Chọn môn học liên quan."),
            (3, "Mô tả", "Textarea", "No", "Chuỗi", "Trống", "Mô tả chi tiết kết quả mong muốn."),
            (4, "Ngày bắt đầu", "Date picker", "No", "Ngày", "Trống", "Chọn thời điểm bắt đầu theo dõi."),
            (5, "Ngày kết thúc", "Date picker", "No", "Ngày", "Trống", "Chọn thời điểm dự kiến hoàn thành."),
            (6, "Tiến độ", "Number input", "No", "Số", "0", "Nhập phần trăm hoàn thành mục tiêu."),
            (7, "Trạng thái", "Dropdown", "Yes", "Danh sách", "Đang thực hiện", "Chọn trạng thái hiện tại của mục tiêu."),
            (8, "Lưu", "Button", "N/A", "Không", "N/A", "Lưu mục tiêu học tập.")
        ]},
    ],
    "UC-06": [
        {"name": "Danh sách lịch học", "rows": [
            (1, "Tìm kiếm", "Text input", "No", "Chuỗi", "Trống", "Tìm lịch theo tiêu đề, môn học hoặc địa điểm."),
            (2, "Lọc loại lịch", "Dropdown", "No", "Danh sách", "Tất cả", "Lọc lịch học trên lớp, tự học, ôn tập, bài tập hoặc thi."),
            (3, "Lọc trạng thái", "Dropdown", "No", "Danh sách", "Tất cả", "Lọc lịch sắp diễn ra, đã hoàn thành hoặc đã hủy."),
            (4, "Danh sách lịch", "Card/List", "No", "Danh sách", "Theo dữ liệu", "Hiển thị ngày, giờ, môn học, tiêu đề, loại lịch và trạng thái."),
            (5, "Tạo lịch", "Button", "No", "Không", "N/A", "Mở form tạo lịch học mới.")
        ]},
        {"name": "Form lịch học", "rows": [
            (1, "Tiêu đề", "Text input", "Yes", "Chuỗi", "Trống", "Nhập nội dung chính của lịch học."),
            (2, "Môn học", "Dropdown", "No", "Danh sách", "Trống", "Chọn môn liên quan nếu có."),
            (3, "Ngày học", "Date picker", "Yes", "Ngày", "Hôm nay", "Chọn ngày diễn ra buổi học."),
            (4, "Giờ bắt đầu", "Time picker", "Yes", "Giờ", "Trống", "Chọn thời điểm bắt đầu."),
            (5, "Giờ kết thúc", "Time picker", "Yes", "Giờ", "Trống", "Chọn thời điểm kết thúc, phải sau giờ bắt đầu."),
            (6, "Địa điểm", "Text input", "No", "Chuỗi", "Trống", "Nhập địa điểm học nếu có."),
            (7, "Loại lịch", "Dropdown", "Yes", "Danh sách", "Tự học", "Chọn phân loại buổi học."),
            (8, "Trạng thái", "Dropdown", "Yes", "Danh sách", "Sắp diễn ra", "Chọn trạng thái của lịch."),
            (9, "Lưu", "Button", "N/A", "Không", "N/A", "Lưu lịch sau khi kiểm tra thời gian.")
        ]},
    ],
    "UC-07": [
        {"name": "Danh sách lộ trình", "rows": [
            (1, "Bộ lọc trạng thái", "Dropdown", "No", "Danh sách", "Tất cả", "Lọc lộ trình theo nháp, đang học, hoàn thành hoặc tạm dừng."),
            (2, "Thẻ lộ trình", "Card/List", "No", "Danh sách", "Theo dữ liệu", "Hiển thị môn học, tiêu đề, tổng quan, trạng thái, tiến độ và thời gian."),
            (3, "Tạo lộ trình mới", "Button", "No", "Không", "N/A", "Mở màn hình tạo lộ trình bằng AI."),
            (4, "Xóa lộ trình", "Button", "No", "Không", "N/A", "Xóa lộ trình sau khi người dùng xác nhận.")
        ]},
        {"name": "Form tạo lộ trình bằng AI", "rows": [
            (1, "Môn học", "Dropdown", "Yes", "Danh sách", "Trống", "Chọn môn cần tạo lộ trình."),
            (2, "Mục tiêu học tập", "Dropdown/Textarea", "Yes", "Chuỗi", "Trống", "Chọn mục tiêu có sẵn hoặc nhập mục tiêu mới."),
            (3, "Trình độ hiện tại", "Dropdown", "Yes", "Danh sách", "Beginner", "Chọn mức beginner, intermediate hoặc advanced."),
            (4, "Thời gian học mỗi ngày", "Number input", "Yes", "Số", "1", "Nhập số giờ có thể học mỗi ngày."),
            (5, "Ngày có thể học", "Checkbox group", "Yes", "Danh sách", "Thứ 2 - Thứ 6", "Chọn các ngày trong tuần có thể học."),
            (6, "Giờ bắt đầu ưu tiên", "Time picker", "Yes", "Giờ", "19:00", "Chọn khung giờ bắt đầu mong muốn."),
            (7, "Thời lượng mỗi buổi", "Number input", "Yes", "Số", "60", "Nhập số phút cho một buổi học."),
            (8, "Khoảng ngày", "Date range", "Yes", "Ngày", "Trống", "Chọn ngày bắt đầu và ngày kết thúc của lộ trình."),
            (9, "Tạo bản xem trước", "Button", "N/A", "Không", "N/A", "Gửi thông tin để hệ thống tạo lộ trình đề xuất.")
        ]},
        {"name": "Màn hình xem trước và chi tiết lộ trình", "rows": [
            (1, "Tổng quan", "Info card", "No", "Chuỗi", "Theo dữ liệu", "Hiển thị tiêu đề, môn học, mục tiêu và mô tả lộ trình."),
            (2, "Thanh tiến độ", "Progress bar", "No", "Số", "0%", "Hiển thị phần trăm hoàn thành."),
            (3, "Danh sách mục học", "Card/List", "No", "Danh sách", "Theo dữ liệu", "Hiển thị ngày, giờ, tiêu đề, thời lượng, ưu tiên và trạng thái từng mục."),
            (4, "Lưu lộ trình", "Button", "No", "Không", "N/A", "Lưu bản xem trước thành lộ trình chính thức."),
            (5, "Cập nhật trạng thái", "Dropdown", "No", "Danh sách", "Đang học", "Cập nhật trạng thái mục học trong quá trình thực hiện."),
            (6, "Ghi kết quả", "Textarea", "No", "Chuỗi", "Trống", "Ghi kết quả học, ghi chú hoặc mức độ hoàn thành."),
            (7, "Dời lịch", "Date/Time input", "No", "Ngày giờ", "Trống", "Chọn ngày giờ mới cho mục học cần dời.")
        ]},
    ],
    "UC-08": [
        {"name": "Dashboard quản trị", "rows": [
            (1, "Thẻ thống kê", "Info card", "No", "Số", "Theo dữ liệu", "Hiển thị số sinh viên, môn học, bài tập, bài nộp và chỉ số quan trọng."),
            (2, "Hạn nộp sắp tới", "List", "No", "Danh sách", "Theo dữ liệu", "Liệt kê các bài tập gần đến hạn để quản trị viên theo dõi."),
            (3, "Sinh viên mới", "List", "No", "Danh sách", "Theo dữ liệu", "Hiển thị các sinh viên được tạo gần đây."),
            (4, "Môn học nổi bật", "List/Chart", "No", "Danh sách", "Theo dữ liệu", "Hiển thị các môn có hoạt động hoặc số lượng học viên đáng chú ý."),
            (5, "Hoạt động gần đây", "Activity list", "No", "Danh sách", "Theo dữ liệu", "Tóm tắt các thay đổi mới trong hệ thống.")
        ]},
        {"name": "Dashboard sinh viên", "rows": [
            (1, "Lịch hôm nay", "List", "No", "Danh sách", "Theo dữ liệu", "Hiển thị các buổi học trong ngày."),
            (2, "Lịch sắp tới", "List", "No", "Danh sách", "Theo dữ liệu", "Hiển thị các lịch học tiếp theo."),
            (3, "Bài tập sắp đến hạn", "List", "No", "Danh sách", "Theo dữ liệu", "Nhắc sinh viên các bài tập cần xử lý sớm."),
            (4, "Điểm mới nhất", "Info card", "No", "Số/Chuỗi", "Theo dữ liệu", "Hiển thị kết quả chấm gần nhất nếu có."),
            (5, "Tiến độ lộ trình", "Progress widget", "No", "Số", "Theo dữ liệu", "Hiển thị tiến độ học theo lộ trình cá nhân."),
            (6, "Ghi nhận gần đây", "List", "No", "Danh sách", "Theo dữ liệu", "Hiển thị thành tích hoặc nhận diện học tập gần đây.")
        ]},
    ],
    "UC-09": [
        {"name": "Danh sách bài học quản trị", "rows": [
            (1, "Tìm kiếm", "Text input", "No", "Chuỗi", "Trống", "Tìm bài học theo tiêu đề hoặc nội dung."),
            (2, "Lọc môn học", "Dropdown", "No", "Danh sách", "Tất cả", "Lọc bài học theo môn."),
            (3, "Lọc trạng thái", "Dropdown", "No", "Danh sách", "Tất cả", "Lọc bài học nháp hoặc đã xuất bản."),
            (4, "Thẻ bài học", "Card/List", "No", "Danh sách", "Theo dữ liệu", "Hiển thị môn học, tiêu đề, mô tả ngắn, thời lượng, tài liệu và video."),
            (5, "Tạo bài học", "Button", "No", "Không", "N/A", "Mở form tạo bài học."),
            (6, "Thao tác bài học", "Button group", "No", "Không", "N/A", "Cho phép xem, sửa hoặc xóa bài học.")
        ]},
        {"name": "Form bài học", "rows": [
            (1, "Môn học", "Dropdown", "Yes", "Danh sách", "Trống", "Chọn môn học chứa bài học."),
            (2, "Tiêu đề", "Text input", "Yes", "Chuỗi", "Trống", "Nhập tên bài học."),
            (3, "Nội dung", "Textarea", "Yes", "Chuỗi", "Trống", "Nhập nội dung chính hoặc mô tả bài học."),
            (4, "Thời lượng", "Number input", "No", "Số", "Trống", "Nhập số phút học dự kiến."),
            (5, "Tài liệu", "File upload", "No", "Tệp", "Trống", "Tải tài liệu học nếu có."),
            (6, "Video", "Text input", "No", "Chuỗi", "Trống", "Nhập liên kết video học tập nếu có."),
            (7, "Trạng thái", "Dropdown", "Yes", "Danh sách", "Nháp", "Chọn nháp hoặc xuất bản."),
            (8, "Lưu", "Button", "N/A", "Không", "N/A", "Lưu bài học.")
        ]},
        {"name": "Bài học sinh viên", "rows": [
            (1, "Danh sách bài học", "Card/List", "No", "Danh sách", "Theo dữ liệu", "Hiển thị bài học thuộc môn sinh viên được phân công."),
            (2, "Trạng thái học", "Badge", "No", "Chuỗi", "Chưa học", "Cho biết bài học đã hoàn thành hay chưa."),
            (3, "Tài liệu/Video", "Link/Button", "No", "Không", "Theo dữ liệu", "Mở tài liệu hoặc video học tập nếu có."),
            (4, "Đánh dấu hoàn thành", "Button", "No", "Không", "N/A", "Cập nhật bài học đã học xong.")
        ]},
    ],
    "UC-10": [
        {"name": "Danh sách thông báo", "rows": [
            (1, "Bộ đếm chưa đọc", "Badge", "No", "Số", "0", "Hiển thị tổng số thông báo chưa đọc."),
            (2, "Danh sách thông báo", "List", "No", "Danh sách", "Theo dữ liệu", "Hiển thị tiêu đề, nội dung, thời điểm, trạng thái và liên kết nếu có."),
            (3, "Trạng thái đọc", "Badge", "No", "Chuỗi", "Theo dữ liệu", "Phân biệt thông báo đã đọc và chưa đọc."),
            (4, "Xem thông báo", "Link/Button", "No", "Không", "N/A", "Mở nội dung liên quan hoặc đánh dấu thông báo đã đọc."),
            (5, "Đánh dấu đã đọc", "Button", "No", "Không", "N/A", "Đổi trạng thái một thông báo sang đã đọc."),
            (6, "Đánh dấu tất cả", "Button", "No", "Không", "N/A", "Đổi toàn bộ thông báo sang đã đọc."),
            (7, "Trạng thái rỗng", "Empty state", "No", "Chuỗi", "Ẩn", "Hiển thị khi người dùng chưa có thông báo.")
        ]},
    ],
    "UC-11": [
        {"name": "Khu vực báo cáo", "rows": [
            (1, "Bộ lọc báo cáo", "Filter group", "No", "Danh sách", "Tất cả", "Cho phép lọc theo trạng thái, môn học hoặc khoảng thời gian tùy loại báo cáo."),
            (2, "Sinh viên", "Export button", "No", "Không", "N/A", "Xuất danh sách sinh viên."),
            (3, "Môn học", "Export button", "No", "Không", "N/A", "Xuất danh sách môn học."),
            (4, "Sinh viên theo môn", "Export button", "No", "Không", "N/A", "Xuất quan hệ phân công sinh viên vào môn học."),
            (5, "Bài tập", "Export button", "No", "Không", "N/A", "Xuất danh sách bài tập."),
            (6, "Bài nộp", "Export button", "No", "Không", "N/A", "Xuất danh sách bài nộp của sinh viên."),
            (7, "Điểm", "Export button", "No", "Không", "N/A", "Xuất kết quả điểm và phản hồi."),
            (8, "Tiến độ", "Export button", "No", "Không", "N/A", "Xuất dữ liệu tiến độ học tập."),
            (9, "Ghi nhận AI", "Export button", "No", "Không", "N/A", "Xuất dữ liệu ghi nhận hoặc kết quả liên quan đến AI.")
        ]},
    ],
    "UC-12": [
        {"name": "Các module học tập bổ sung", "rows": [
            (1, "Bài kiểm tra", "Menu/List", "No", "Danh sách", "Theo dữ liệu", "Hiển thị bài kiểm tra khi hệ thống có dữ liệu."),
            (2, "Nhiệm vụ", "Menu/List", "No", "Danh sách", "Theo dữ liệu", "Hiển thị nhiệm vụ học tập hoặc việc cần làm."),
            (3, "Ghi chú", "Editor/List", "No", "Chuỗi", "Trống", "Cho phép sinh viên xem và quản lý ghi chú học tập."),
            (4, "Trợ lý học tập", "Chat area", "No", "Chuỗi", "Trống", "Khu vực trao đổi câu hỏi và phản hồi hỗ trợ học tập."),
            (5, "Tiến độ tổng hợp", "Dashboard widget", "No", "Số/Danh sách", "Theo dữ liệu", "Tổng hợp tiến độ theo môn, bài học, bài tập, lịch và lộ trình."),
            (6, "Trạng thái rỗng", "Empty state", "No", "Chuỗi", "Ẩn", "Hiển thị khi module chưa có dữ liệu để tránh màn hình trống.")
        ]},
    ],
}


def build_doc():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = setup_document()

    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.paragraph_format.space_before = Pt(72)
    r = title.add_run("ĐẶC TẢ YÊU CẦU PHẦN MỀM")
    set_run_font(r, size=13, bold=True)
    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = subtitle.add_run("WEBSITE STUDYMATE")
    set_run_font(r, size=13, bold=True)
    add_paragraph(doc, "Tài liệu SRS phục vụ phân tích, thiết kế kiểm thử và nghiệm thu chức năng", align=WD_ALIGN_PARAGRAPH.CENTER, italic=True)
    add_paragraph(doc)
    add_kv_table(doc, [
        ("Tên hệ thống", "StudyMate"),
        ("Phiên bản tài liệu", "1.1"),
        ("Ngày lập", "30/07/2026"),
        ("Mục đích", "Mô tả đầy đủ chức năng, màn hình, use case, sơ đồ và cơ sở xây dựng kiểm thử cho website StudyMate."),
        ("Phạm vi trình bày", "Tập trung vào nghiệp vụ và trải nghiệm người dùng; không trình bày chi tiết triển khai kỹ thuật.")
    ])
    doc.add_page_break()

    add_heading(doc, "Lịch sử thay đổi", 1)
    add_matrix_table(doc, ["Phiên bản", "Ngày", "Nội dung thay đổi"], [
        ("1.0", "Trước 30/07/2026", "Tạo bản SRS ban đầu cho các chức năng cốt lõi của StudyMate."),
        ("1.1", "30/07/2026", "Chuẩn hóa định dạng Word, bổ sung chức năng mới, mở rộng mô tả màn hình và nhúng diagram.")
    ], widths=[2.5, 3.0, 9.6])

    add_heading(doc, "Mục lục", 1)
    add_numbered(doc, [
        "Giới thiệu",
        "Mô tả tổng quan hệ thống",
        "Người dùng và quyền sử dụng",
        "Yêu cầu chức năng",
        "Use case chi tiết theo chức năng",
        "Mô tả màn hình",
        "Diagram minh họa",
        "Yêu cầu phi chức năng",
        "Kịch bản kiểm thử",
        "Ma trận truy vết yêu cầu"
    ])
    doc.add_page_break()

    add_heading(doc, "1. Giới thiệu", 1)
    add_paragraph(doc, "StudyMate là website hỗ trợ quản lý học tập dành cho sinh viên và quản trị viên. Hệ thống tập trung vào quản lý tài khoản sinh viên, môn học, bài tập, bài nộp, điểm số, mục tiêu học tập, lịch học cá nhân và lộ trình học được cá nhân hóa bằng AI.")
    add_paragraph(doc, "Tài liệu này được dùng làm cơ sở để xây dựng kiểm thử chức năng, kiểm thử giao diện, kiểm thử luồng nghiệp vụ và nghiệm thu sản phẩm. Nội dung được trình bày theo hướng người dùng cuối, tránh mô tả chi tiết triển khai kỹ thuật.")
    add_heading(doc, "1.1 Mục tiêu tài liệu", 2)
    add_bullets(doc, [
        "Xác định rõ phạm vi chức năng của website StudyMate.",
        "Mô tả actor, điều kiện, luồng chính, luồng ngoại lệ và kết quả mong đợi.",
        "Làm rõ screen description để hỗ trợ thiết kế test case theo giao diện.",
        "Cung cấp diagram và use case cho từng nhóm chức năng quan trọng.",
        "Thiết lập ma trận truy vết giữa yêu cầu, use case và kịch bản kiểm thử."
    ])
    add_heading(doc, "1.2 Phạm vi hệ thống", 2)
    add_paragraph(doc, "Phạm vi bao gồm khu vực dành cho khách, sinh viên và quản trị viên. Khách có thể đăng ký hoặc đăng nhập. Sinh viên quản lý hoạt động học tập cá nhân. Quản trị viên quản lý dữ liệu nền tảng như sinh viên, môn học, bài tập, bài nộp và báo cáo.")

    add_heading(doc, "2. Mô tả tổng quan hệ thống", 1)
    add_paragraph(doc, "Website StudyMate vận hành theo mô hình hai nhóm người dùng chính: quản trị viên và sinh viên. Quản trị viên chịu trách nhiệm tạo dữ liệu học tập, phân công sinh viên, giao bài và theo dõi kết quả. Sinh viên sử dụng hệ thống để xem môn học, làm bài tập, nhận điểm, lập kế hoạch học và theo dõi tiến độ.")
    add_heading(doc, "2.1 Nhóm người dùng", 2)
    add_matrix_table(doc, ["Actor", "Mô tả", "Quyền chính"], [
        ("Khách", "Người chưa đăng nhập.", "Đăng ký tài khoản sinh viên, đăng nhập."),
        ("Sinh viên", "Người học sử dụng StudyMate để quản lý hoạt động học tập cá nhân.", "Xem môn học, xem/nộp bài tập, xem điểm, quản lý mục tiêu, lịch học và lộ trình."),
        ("Quản trị viên", "Người quản lý dữ liệu học tập của hệ thống.", "Quản lý sinh viên, môn học, phân công, bài tập, bài nộp, điểm và báo cáo.")
    ], widths=[3.0, 5.5, 6.6])
    add_heading(doc, "2.2 Danh sách chức năng", 2)
    add_matrix_table(doc, ["Mã", "Nhóm chức năng", "Mô tả"], REQUIREMENTS, widths=[2.0, 4.2, 8.9])
    add_image_if_exists(doc, DIAGRAM_DIR / "use-case-diagram.png", "Hình 1. Use case tổng quan của StudyMate", width_cm=14.0)
    doc.add_page_break()

    add_heading(doc, "3. Yêu cầu chức năng chi tiết", 1)
    for fn in FUNCTIONS:
        add_heading(doc, f"{fn['id']} - {fn['title']}", 2)
        add_kv_table(doc, [
            ("Actor", fn["actors"]),
            ("Mục tiêu", fn["goal"]),
            ("Kết quả mong đợi", "Người dùng hoàn thành tác vụ với dữ liệu được lưu, hiển thị hoặc phản hồi rõ ràng theo đúng quyền sử dụng.")
        ], widths=(3.6, 11.5))
        add_heading(doc, "Phạm vi chức năng", 3)
        add_bullets(doc, fn["scope"])
        add_heading(doc, "Luồng xử lý chính", 3)
        add_numbered(doc, fn["main_flow"])
        add_heading(doc, "Luồng ngoại lệ và quy tắc nghiệp vụ", 3)
        add_bullets(doc, fn["exceptions"])
        add_heading(doc, "Screen description chi tiết", 3)
        add_screen_description_tables(doc, SCREEN_SPECS.get(fn["id"], []))
        if fn.get("usecase_img"):
            add_image_if_exists(doc, BY_FUNCTION_DIAGRAM_DIR / fn["usecase_img"], f"Hình - Use case: {fn['title']}", width_cm=13.2)
        if fn.get("activity_img"):
            add_image_if_exists(doc, BY_FUNCTION_DIAGRAM_DIR / fn["activity_img"], f"Hình - Activity diagram: {fn['title']}", width_cm=13.2)
        if fn["id"] in {"UC-03", "UC-06"}:
            doc.add_page_break()

    add_heading(doc, "4. Yêu cầu phi chức năng", 1)
    add_matrix_table(doc, ["Nhóm", "Yêu cầu"], [
        ("Bảo mật", "Người dùng chỉ truy cập chức năng phù hợp với vai trò; thông tin nhạy cảm phải được bảo vệ; thao tác quan trọng cần xác nhận."),
        ("Tính đúng đắn dữ liệu", "Các biểu mẫu phải kiểm tra trường bắt buộc, định dạng email, số điện thoại, ngày giờ, điểm số, trạng thái và tệp đính kèm."),
        ("Khả dụng", "Thông báo lỗi và trạng thái rỗng phải dễ hiểu; người dùng biết cần làm gì tiếp theo."),
        ("Hiệu năng", "Danh sách lớn cần có phân trang, tìm kiếm hoặc lọc để tránh khó thao tác."),
        ("Tính nhất quán", "Các màn hình danh sách, form, chi tiết và hộp xác nhận cần dùng cùng cách đặt nhãn, thông báo và thao tác."),
        ("Khả năng kiểm thử", "Mỗi yêu cầu chức năng phải có kịch bản kiểm thử và dữ liệu đầu vào/đầu ra rõ ràng.")
    ], widths=[4.0, 11.1])

    add_heading(doc, "5. Kịch bản kiểm thử tổng quan", 1)
    add_matrix_table(doc, ["Mã", "Kịch bản", "Kết quả mong đợi"], TEST_SCENARIOS, widths=[2.0, 5.9, 7.2])

    add_heading(doc, "6. Test case mẫu", 1)
    add_matrix_table(doc, ["TC", "Điều kiện", "Bước kiểm thử", "Kết quả mong đợi"], [
        ("TC-01", "Người dùng chưa đăng nhập", "Mở trang đăng nhập, nhập email/mật khẩu hợp lệ, bấm Đăng nhập.", "Vào đúng màn hình theo vai trò và hiển thị thông tin người dùng."),
        ("TC-02", "Quản trị viên đã đăng nhập", "Tạo sinh viên với họ tên, email, mã sinh viên và trạng thái hợp lệ.", "Sinh viên được thêm vào danh sách, thông tin hiển thị chính xác."),
        ("TC-03", "Quản trị viên đã đăng nhập", "Tạo môn học mới, sau đó gán một sinh viên vào môn.", "Môn học có trong danh sách và sinh viên xuất hiện trong danh sách đã gán."),
        ("TC-04", "Sinh viên thuộc môn có bài tập mở", "Mở bài tập, nhập nội dung, chọn tệp hợp lệ và gửi bài.", "Bài nộp được ghi nhận, trạng thái chuyển sang đã nộp hoặc đã cập nhật."),
        ("TC-05", "Có bài nộp chưa chấm", "Quản trị viên mở bài nộp, nhập điểm và phản hồi, bấm Lưu.", "Điểm và phản hồi hiển thị ở màn hình xem điểm của sinh viên."),
        ("TC-06", "Sinh viên đã đăng nhập", "Tạo mục tiêu học tập với môn học và khoảng ngày hợp lệ.", "Mục tiêu xuất hiện trong danh sách và có thể xem chi tiết."),
        ("TC-07", "Sinh viên đã đăng nhập", "Tạo lịch học có giờ bắt đầu trước giờ kết thúc.", "Lịch được lưu và hiển thị trong danh sách lịch học."),
        ("TC-08", "Sinh viên có môn học", "Tạo lộ trình AI, xem trước, sau đó lưu.", "Lộ trình được lưu, có danh sách mục học và thanh tiến độ ban đầu."),
        ("TC-09", "Lộ trình đã có mục học", "Đổi trạng thái một mục sang hoàn thành.", "Tiến độ lộ trình được cập nhật tương ứng."),
        ("TC-10", "Quản trị viên có dữ liệu", "Xuất báo cáo bài nộp.", "Tệp báo cáo được tải xuống và chứa đúng nhóm dữ liệu.")
    ], widths=[1.6, 3.5, 5.6, 4.4])

    add_heading(doc, "7. Ma trận truy vết yêu cầu", 1)
    add_matrix_table(doc, ["Yêu cầu", "Use case liên quan", "Kịch bản kiểm thử"], [
        ("FR-01", "UC-01", "TS-01, TS-02, TC-01"),
        ("FR-02", "UC-02", "TS-03, TS-04, TC-02"),
        ("FR-03", "UC-03", "TS-05, TS-06, TC-03"),
        ("FR-04", "UC-04", "TS-07, TS-08, TC-04"),
        ("FR-05", "UC-04", "TS-09, TC-05"),
        ("FR-06", "UC-05", "TS-10, TC-06"),
        ("FR-07", "UC-06", "TS-11, TS-13, TC-07"),
        ("FR-08", "UC-07", "TS-12, TS-13, TC-08, TC-09"),
        ("FR-09", "UC-08", "TS-14"),
        ("FR-10", "UC-09", "TS-15"),
        ("FR-11", "UC-10", "TS-16"),
        ("FR-12", "UC-11", "TS-17, TC-10"),
        ("FR-13", "UC-12", "TS-18")
    ], widths=[2.3, 4.0, 8.8])

    add_heading(doc, "8. Phụ lục diagram", 1)
    add_paragraph(doc, "Các sơ đồ trong tài liệu được nhúng dưới dạng hình ảnh để phục vụ báo cáo Word. Bộ nguồn sơ đồ và tệp hình tương ứng đã được lưu trong thư mục diagram của tài liệu SRS.")
    for img, caption in [
        ("activity-login.png", "Activity diagram - Đăng nhập"),
        ("activity-submit-assignment.png", "Activity diagram - Nộp bài"),
        ("sequence-grade-submission.png", "Sequence diagram - Chấm điểm bài nộp"),
        ("activity-generate-roadmap-ai.png", "Activity diagram - Tạo lộ trình AI"),
    ]:
        add_image_if_exists(doc, DIAGRAM_DIR / img, caption, width_cm=13.5)

    doc.core_properties.title = "SRS StudyMate v1.1"
    doc.core_properties.subject = "Software Requirements Specification for StudyMate"
    doc.core_properties.author = "Codex"
    doc.core_properties.comments = "Times New Roman 13, margins top/bottom/right 2 cm and left 3 cm."
    doc.save(DOCX_PATH)
    mirror = ROOT / "output" / "docx" / DOCX_PATH.name
    mirror.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(DOCX_PATH, mirror)
    return DOCX_PATH, mirror


if __name__ == "__main__":
    docx_path, mirror_path = build_doc()
    print(docx_path)
    print(mirror_path)
