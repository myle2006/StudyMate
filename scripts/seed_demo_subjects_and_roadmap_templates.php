<?php

declare(strict_types=1);

define('BASE_PATH', dirname(__DIR__));

require BASE_PATH . '/core/helpers.php';
require BASE_PATH . '/core/Database.php';

$db = Database::connection();
$db->exec('SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci');

function runSqlFile(PDO $db, string $path): void
{
    $sql = file_get_contents($path);
    if ($sql === false) {
        throw new RuntimeException("Không đọc được file SQL: {$path}");
    }

    foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
        if ($statement !== '') {
            $db->exec($statement);
        }
    }
}

function fetchOne(PDO $db, string $sql, array $params = []): ?array
{
    $statement = $db->prepare($sql);
    $statement->execute($params);
    $row = $statement->fetch(PDO::FETCH_ASSOC);

    return $row ?: null;
}

function fetchValue(PDO $db, string $sql, array $params = []): mixed
{
    $statement = $db->prepare($sql);
    $statement->execute($params);

    return $statement->fetchColumn();
}

function relatedCount(PDO $db, int $subjectId): int
{
    $queries = [
        'SELECT COUNT(*) FROM student_subjects WHERE subject_id = :id',
        'SELECT COUNT(*) FROM assignments WHERE subject_id = :id',
        'SELECT COUNT(*) FROM lessons WHERE subject_id = :id',
        'SELECT COUNT(*) FROM learning_goals WHERE subject_id = :id',
        'SELECT COUNT(*) FROM learning_roadmaps WHERE subject_id = :id',
        'SELECT COUNT(*) FROM study_schedules WHERE subject_id = :id',
    ];

    return array_sum(array_map(
        static fn (string $sql): int => (int) fetchValue($db, $sql, ['id' => $subjectId]),
        $queries
    ));
}

function buildTasks(array $module, int $phaseNumber, int $startWeek, int $durationWeeks, bool $deep): array
{
    $midWeek = $startWeek + max(0, min($durationWeeks - 1, intdiv($durationWeeks, 2)));
    $tasks = [
        [
            'week_number' => $startWeek,
            'title' => 'Học trọng tâm: ' . $module['topic'],
            'description' => $module['learn'],
            'expected_result' => $module['outcome'],
            'suggested_task' => $module['practice'],
            'reference_materials' => $module['refs'],
            'completion_criteria' => 'Ghi chú được ý chính và tự giải thích lại bằng ví dụ của môn học.',
            'priority' => 'high',
        ],
        [
            'week_number' => $midWeek,
            'title' => 'Thực hành: ' . $module['practice_title'],
            'description' => $module['practice'],
            'expected_result' => $module['artifact'],
            'suggested_task' => $module['exercise'],
            'reference_materials' => $module['refs'],
            'completion_criteria' => $module['criteria'],
            'priority' => $phaseNumber >= 4 ? 'high' : 'medium',
        ],
    ];

    if ($deep) {
        $tasks[] = [
            'week_number' => $startWeek + $durationWeeks - 1,
            'title' => 'Mở rộng và phản biện: ' . $module['topic'],
            'description' => $module['deep_dive'],
            'expected_result' => 'Có checklist tự đánh giá, ghi lại điểm chưa chắc và kế hoạch cải thiện.',
            'suggested_task' => $module['advanced_exercise'],
            'reference_materials' => $module['refs'],
            'completion_criteria' => 'Hoàn thành bài nâng cao và nộp minh chứng hoặc báo cáo ngắn.',
            'priority' => 'medium',
        ];
    }

    return $tasks;
}

function buildTemplate(array $subject, int $durationMonths): array
{
    $duration = [
        1 => ['name' => 'Lộ trình nhanh', 'weeks' => 4, 'phase_weeks' => [1, 1, 1, 1], 'hours' => 10, 'level' => 'beginner'],
        3 => ['name' => 'Lộ trình tiêu chuẩn', 'weeks' => 12, 'phase_weeks' => [2, 2, 2, 2, 2, 2], 'hours' => 6, 'level' => 'beginner'],
        6 => ['name' => 'Lộ trình chuyên sâu', 'weeks' => 24, 'phase_weeks' => [4, 4, 4, 4, 4, 4], 'hours' => 4, 'level' => 'intermediate'],
    ][$durationMonths];

    $modules = $durationMonths === 1
        ? [$subject['modules'][0], $subject['modules'][1], $subject['modules'][2], $subject['modules'][5]]
        : $subject['modules'];

    $phases = [];
    $startWeek = 1;
    foreach ($modules as $index => $module) {
        $phaseWeeks = $duration['phase_weeks'][$index] ?? end($duration['phase_weeks']);
        $endWeek = $startWeek + $phaseWeeks - 1;
        $phases[] = [
            'phase_number' => $index + 1,
            'title' => $module['phase'],
            'overview' => $module['learn'],
            'start_week' => $startWeek,
            'end_week' => $endWeek,
            'duration_weeks' => $phaseWeeks,
            'outcome' => $module['outcome'],
            'completion_criteria' => $module['criteria'],
            'tasks' => buildTasks($module, $index + 1, $startWeek, $phaseWeeks, $durationMonths === 6),
        ];
        $startWeek = $endWeek + 1;
    }

    $durationLabel = $durationMonths . ' tháng';

    return [
        'template_code' => $subject['code'] . '-' . $durationMonths . 'M',
        'duration_months' => $durationMonths,
        'title' => "{$duration['name']} {$durationLabel}: {$subject['name']}",
        'overview' => "{$duration['name']} cho môn {$subject['name']}, tập trung vào {$subject['focus']}.",
        'goal' => "{$subject['goal']} Hoàn thành trong {$durationLabel} với sản phẩm/bài kiểm tra cuối lộ trình.",
        'current_level' => $duration['level'],
        'total_weeks' => $duration['weeks'],
        'study_hours_per_week' => $duration['hours'],
        'completion_criteria' => $subject['completion'],
        'final_assessment' => $subject['final'],
        'reference_materials' => implode("\n", $subject['references']),
        'phases' => $phases,
    ];
}

$subjects = [
    'KTPM' => [
        'code' => 'KTPM',
        'name' => 'Kiểm thử phần mềm',
        'description' => 'Nguyên lý kiểm thử, STLC, thiết kế test case, quản lý lỗi và báo cáo chất lượng phần mềm.',
        'credits' => 3,
        'color' => '#2563EB',
        'focus' => 'STLC, test design, test case, bug report và kiểm thử dự án nhỏ',
        'goal' => 'Sinh viên hiểu vai trò kiểm thử, viết được test case rõ ràng, thực hiện kiểm thử chức năng và lập bug report có bằng chứng.',
        'completion' => 'Hoàn thành test plan, bộ test case, bug report và checklist regression cho một chức năng mẫu.',
        'final' => 'Nộp hồ sơ kiểm thử hoàn chỉnh cho một module web/app và trình bày các lỗi quan trọng.',
        'references' => ['ISTQB Foundation syllabus', 'Software Testing Help - Test Case Design', 'Atlassian Jira bug report guide'],
        'modules' => [
            ['phase' => 'STLC và tư duy kiểm thử', 'topic' => 'STLC, vai trò QA và mức kiểm thử', 'learn' => 'Phân biệt verification/validation, test level, test type và quy trình STLC trong dự án phần mềm.', 'outcome' => 'Vẽ được quy trình kiểm thử cho một tính năng.', 'practice_title' => 'Phân tích yêu cầu', 'practice' => 'Chọn một màn hình đăng nhập, xác định acceptance criteria và rủi ro chính.', 'artifact' => 'Bảng phân tích yêu cầu và rủi ro.', 'exercise' => 'Viết 8 tình huống kiểm thử từ yêu cầu đăng nhập.', 'criteria' => 'Tình huống có expected result rõ ràng và bao phủ happy/negative cases.', 'deep_dive' => 'So sánh test level với test type trong một dự án web có API.', 'advanced_exercise' => 'Lập ma trận traceability requirement-test case.', 'refs' => 'ISTQB: Testing throughout SDLC'],
            ['phase' => 'Kỹ thuật thiết kế test', 'topic' => 'Equivalence partitioning, boundary value, decision table', 'learn' => 'Dùng kỹ thuật hộp đen để giảm số test nhưng vẫn giữ độ bao phủ.', 'outcome' => 'Thiết kế test case theo kỹ thuật phù hợp.', 'practice_title' => 'Thiết kế test data', 'practice' => 'Tạo test data cho form đăng ký có tuổi, email, mật khẩu và role.', 'artifact' => 'Bộ test case có test data.', 'exercise' => 'Viết decision table cho chính sách giảm giá.', 'criteria' => 'Có trace giữa điều kiện, dữ liệu và expected result.', 'deep_dive' => 'Phân tích khi nào nên dùng pairwise thay vì decision table.', 'advanced_exercise' => 'Tối ưu bộ test case còn tối đa 12 case nhưng giữ rủi ro chính.', 'refs' => 'ISTQB: Test techniques'],
            ['phase' => 'Test case, checklist và bug report', 'topic' => 'Chuẩn viết test case và báo lỗi', 'learn' => 'Cấu trúc test case, severity/priority, evidence và vòng đời defect.', 'outcome' => 'Tạo được test case và bug report chuyên nghiệp.', 'practice_title' => 'Lập bug report', 'practice' => 'Thực hiện kiểm thử thủ công một chức năng và ghi bug report có bước tái hiện.', 'artifact' => 'Tối thiểu 3 bug report có ảnh/log minh chứng.', 'exercise' => 'Review chéo bug report để sửa thiếu expected/actual result.', 'criteria' => 'Bug report tái hiện được và phân loại severity hợp lý.', 'deep_dive' => 'Phân tích nguyên nhân bug report bị developer reject.', 'advanced_exercise' => 'Viết defect summary theo nhóm nguyên nhân.', 'refs' => 'Jira defect workflow'],
            ['phase' => 'Kiểm thử API và regression', 'topic' => 'API testing, smoke test và regression suite', 'learn' => 'Hiểu status code, payload, auth token và cách chọn regression test.', 'outcome' => 'Tạo checklist smoke/regression cho một release nhỏ.', 'practice_title' => 'Kiểm thử API', 'practice' => 'Dùng Postman kiểm thử endpoint CRUD đơn giản.', 'artifact' => 'Collection API test có assertion cơ bản.', 'exercise' => 'Thiết kế regression suite cho chức năng đăng nhập/sửa hồ sơ.', 'criteria' => 'Có phân loại smoke, sanity và regression.', 'deep_dive' => 'Đánh giá rủi ro khi regression suite quá lớn.', 'advanced_exercise' => 'Đề xuất chiến lược regression theo risk-based testing.', 'refs' => 'Postman Learning Center'],
            ['phase' => 'Quản lý chất lượng và báo cáo', 'topic' => 'Test metrics, coverage và báo cáo tiến độ', 'learn' => 'Theo dõi pass rate, defect density, escaped defect và coverage.', 'outcome' => 'Tạo báo cáo kiểm thử ngắn cho stakeholder.', 'practice_title' => 'Báo cáo test summary', 'practice' => 'Tổng hợp kết quả test theo module, mức nghiêm trọng và trạng thái lỗi.', 'artifact' => 'Test summary report một trang.', 'exercise' => 'Đề xuất go/no-go cho release dựa trên dữ liệu lỗi.', 'criteria' => 'Kết luận dựa trên số liệu, không cảm tính.', 'deep_dive' => 'Phân biệt metric hữu ích và vanity metric trong QA.', 'advanced_exercise' => 'Tạo dashboard test metrics mẫu.', 'refs' => 'ISO/IEC/IEEE 29119 overview'],
            ['phase' => 'Dự án kiểm thử cuối môn', 'topic' => 'Test plan và bộ hồ sơ QA hoàn chỉnh', 'learn' => 'Kết hợp phân tích yêu cầu, thiết kế test, thực thi, báo lỗi và báo cáo.', 'outcome' => 'Hoàn thành hồ sơ kiểm thử cho một module thực tế.', 'practice_title' => 'Capstone QA package', 'practice' => 'Chọn một module web, lập test plan, test case, bug report và summary.', 'artifact' => 'Bộ tài liệu QA cuối môn.', 'exercise' => 'Trình bày 5 rủi ro chất lượng lớn nhất và cách kiểm soát.', 'criteria' => 'Có đủ test plan, case, evidence, defect summary và kết luận release.', 'deep_dive' => 'Phân tích trade-off giữa thời gian test và rủi ro release.', 'advanced_exercise' => 'Bổ sung risk matrix và test prioritization.', 'refs' => 'IEEE test documentation examples'],
        ],
    ],
    'KTTD' => [
        'code' => 'KTTD',
        'name' => 'Kiểm thử tự động',
        'description' => 'Tự động hóa kiểm thử giao diện, API, cấu trúc test suite, báo cáo và tích hợp CI.',
        'credits' => 3,
        'color' => '#EA580C',
        'focus' => 'automation framework, locator, assertion, page object, API automation và CI',
        'goal' => 'Sinh viên xây dựng được test automation suite ổn định cho UI/API và hiểu cách bảo trì kịch bản tự động.',
        'completion' => 'Hoàn thành automation suite có page object, assertion, report và hướng dẫn chạy.',
        'final' => 'Demo bộ test tự động chạy được trên local, sinh report và có ít nhất một pipeline CI mô phỏng.',
        'references' => ['Playwright Docs', 'Selenium Documentation', 'Martin Fowler - Test Pyramid'],
        'modules' => [
            ['phase' => 'Nền tảng automation', 'topic' => 'Test pyramid, flaky test và lựa chọn công cụ', 'learn' => 'Hiểu khi nào nên tự động hóa, phân biệt UI/API/unit test và chi phí bảo trì.', 'outcome' => 'Chọn được phạm vi automation hợp lý.', 'practice_title' => 'Thiết lập môi trường', 'practice' => 'Cài Playwright/Selenium và chạy test mẫu đầu tiên.', 'artifact' => 'Repo automation khởi tạo.', 'exercise' => 'Viết README hướng dẫn cài đặt và chạy test.', 'criteria' => 'Test chạy lại được trên máy khác.', 'deep_dive' => 'Phân tích nguyên nhân flaky test trong UI automation.', 'advanced_exercise' => 'Tạo checklist chống flaky test.', 'refs' => 'Playwright Getting Started'],
            ['phase' => 'Locator và assertion', 'topic' => 'Selector ổn định, wait và assertion', 'learn' => 'Dùng role/text/test id, explicit wait và assertion có ý nghĩa.', 'outcome' => 'Viết test ít phụ thuộc layout.', 'practice_title' => 'Kiểm thử form', 'practice' => 'Tự động hóa đăng nhập, validation lỗi và trạng thái thành công.', 'artifact' => '3 test UI có assertion.', 'exercise' => 'Refactor selector yếu sang selector ổn định.', 'criteria' => 'Không dùng sleep cứng và assertion rõ expected behavior.', 'deep_dive' => 'So sánh CSS selector, XPath và role locator.', 'advanced_exercise' => 'Tạo locator strategy guideline cho team.', 'refs' => 'Playwright Locators'],
            ['phase' => 'Test runner và fixture', 'topic' => 'Hook, fixture, test data và parallel run', 'learn' => 'Tổ chức setup/teardown, tách dữ liệu test và chạy song song an toàn.', 'outcome' => 'Tạo suite có cấu trúc và không phụ thuộc thứ tự chạy.', 'practice_title' => 'Tổ chức suite', 'practice' => 'Tách test đăng nhập, hồ sơ và danh sách thành spec riêng.', 'artifact' => 'Suite có fixture dùng chung.', 'exercise' => 'Thêm data-driven test cho 5 bộ dữ liệu.', 'criteria' => 'Test độc lập và có report pass/fail.', 'deep_dive' => 'Phân tích shared state trong parallel test.', 'advanced_exercise' => 'Tách test data theo environment.', 'refs' => 'Playwright Test Fixtures'],
            ['phase' => 'Page Object và maintainability', 'topic' => 'Page object, component object và helper', 'learn' => 'Giảm trùng lặp thao tác UI, đặt tên action theo nghiệp vụ.', 'outcome' => 'Refactor suite sang page object.', 'practice_title' => 'Refactor framework', 'practice' => 'Tạo LoginPage, DashboardPage và assertion helper.', 'artifact' => 'Framework có page object.', 'exercise' => 'Đo số dòng lặp giảm sau refactor.', 'criteria' => 'Test đọc như flow nghiệp vụ, selector nằm trong page object.', 'deep_dive' => 'Khi nào page object trở nên quá nặng.', 'advanced_exercise' => 'Tách component object cho modal/table.', 'refs' => 'Selenium Page Object patterns'],
            ['phase' => 'API automation và mock', 'topic' => 'API request, contract check và test data setup', 'learn' => 'Dùng API để setup dữ liệu, kiểm tra status/schema và giảm phụ thuộc UI.', 'outcome' => 'Kết hợp UI test với API helper.', 'practice_title' => 'API regression', 'practice' => 'Viết test CRUD API có auth token và schema assertion.', 'artifact' => 'API test collection/spec.', 'exercise' => 'Tạo data setup bằng API trước UI test.', 'criteria' => 'Có kiểm tra status, payload và cleanup.', 'deep_dive' => 'So sánh UI regression và API regression về tốc độ/rủi ro.', 'advanced_exercise' => 'Mock response lỗi để test recovery UI.', 'refs' => 'Postman/Newman or Playwright APIRequestContext'],
            ['phase' => 'CI, report và dự án cuối', 'topic' => 'CI pipeline, trace, screenshot và báo cáo', 'learn' => 'Chạy automation trong pipeline, lưu artifact và đọc report lỗi.', 'outcome' => 'Có automation project sẵn sàng demo.', 'practice_title' => 'Pipeline automation', 'practice' => 'Cấu hình job chạy test, xuất HTML report và screenshot khi fail.', 'artifact' => 'Pipeline hoặc script CI mô phỏng.', 'exercise' => 'Tổng hợp test report và đề xuất test suite smoke.', 'criteria' => 'Pipeline chạy được và report đủ thông tin debug.', 'deep_dive' => 'Thiết kế chiến lược tagging test theo smoke/regression.', 'advanced_exercise' => 'Chia suite theo browser hoặc module.', 'refs' => 'GitHub Actions/CI examples'],
        ],
    ],
];

$subjects += [
    'WEB201' => [
        'code' => 'WEB201', 'name' => 'Lập trình Web', 'description' => 'Xây dựng giao diện, xử lý tương tác, kết nối API và triển khai ứng dụng web.', 'credits' => 3, 'color' => '#0EA5E9',
        'focus' => 'HTML/CSS, JavaScript, React, API, authentication và triển khai', 'goal' => 'Sinh viên xây dựng được ứng dụng web có giao diện responsive, dữ liệu động và form validation.', 'completion' => 'Hoàn thành web app nhỏ có routing, form, API mock/thật và tài liệu chạy.', 'final' => 'Demo mini web app CRUD có responsive và kiểm thử cơ bản.', 'references' => ['MDN Web Docs', 'React Docs', 'web.dev Learn'],
        'modules' => [
            ['phase'=>'HTML/CSS responsive','topic'=>'Semantic HTML, layout và responsive CSS','learn'=>'Tạo cấu trúc trang rõ nghĩa, dùng flex/grid và breakpoint hợp lý.','outcome'=>'Dựng được layout responsive cho trang dashboard.','practice_title'=>'Dựng layout','practice'=>'Tạo trang danh sách sản phẩm/bài học có header, filter và card.','artifact'=>'Trang responsive không vỡ ở mobile.','exercise'=>'Tối ưu spacing và typography theo design system.','criteria'=>'Không có overflow ngang và HTML có cấu trúc rõ.','deep_dive'=>'Phân tích accessibility landmark và responsive images.','advanced_exercise'=>'Thêm dark/light token đơn giản.','refs'=>'MDN HTML/CSS'],
            ['phase'=>'JavaScript và DOM','topic'=>'ES modules, event, state và fetch','learn'=>'Xử lý sự kiện, validate form và gọi API bằng fetch.','outcome'=>'Tạo được form tương tác có trạng thái loading/error.','practice_title'=>'Form tương tác','practice'=>'Viết form đăng ký có validate và preview dữ liệu.','artifact'=>'Form JS chạy ổn định.','exercise'=>'Thêm debounce cho ô tìm kiếm.','criteria'=>'Có xử lý lỗi và không reload trang ngoài ý muốn.','deep_dive'=>'So sánh client state và server state.','advanced_exercise'=>'Tạo module helper gọi API.','refs'=>'MDN JavaScript'],
            ['phase'=>'React component','topic'=>'Component, props, state và effect','learn'=>'Chia UI thành component, truyền dữ liệu và xử lý side effect.','outcome'=>'Xây dựng được màn hình React có list/filter/detail.','practice_title'=>'React list view','practice'=>'Tạo danh sách môn học với search và status badge.','artifact'=>'React component tái sử dụng.','exercise'=>'Tách Card, Badge, SearchBox.','criteria'=>'State rõ ràng, component không quá lớn.','deep_dive'=>'Phân tích useEffect dependency và render loop.','advanced_exercise'=>'Thêm custom hook gọi API.','refs'=>'React Learn'],
            ['phase'=>'Backend/API cơ bản','topic'=>'REST API, validation và database','learn'=>'Thiết kế endpoint CRUD, validate input và trả JSON nhất quán.','outcome'=>'Kết nối frontend với API thật hoặc mock.','practice_title'=>'CRUD API','practice'=>'Tạo API quản lý ghi chú hoặc môn học.','artifact'=>'Endpoint GET/POST/PUT/DELETE.','exercise'=>'Thêm thông báo lỗi validation trên frontend.','criteria'=>'API có status code và message rõ.','deep_dive'=>'So sánh REST resource và action endpoint.','advanced_exercise'=>'Thêm pagination/filter.','refs'=>'REST API design guide'],
            ['phase'=>'Auth và bảo vệ route','topic'=>'Login, token và protected route','learn'=>'Lưu token an toàn tương đối, gắn Authorization và xử lý redirect.','outcome'=>'Ứng dụng có luồng đăng nhập cơ bản.','practice_title'=>'Login flow','practice'=>'Tạo trang login và route guard cho dashboard.','artifact'=>'Auth flow hoạt động.','exercise'=>'Hiển thị trạng thái hết hạn phiên.','criteria'=>'Không truy cập dashboard khi chưa login.','deep_dive'=>'Phân tích rủi ro XSS/token storage.','advanced_exercise'=>'Thêm refresh session mô phỏng.','refs'=>'OWASP Authentication Cheat Sheet'],
            ['phase'=>'Triển khai dự án web','topic'=>'Build, deploy và kiểm tra chất lượng','learn'=>'Build production, kiểm tra lỗi console, responsive và performance cơ bản.','outcome'=>'Có web app hoàn chỉnh để demo.','practice_title'=>'Deploy mini app','practice'=>'Build và triển khai app lên hosting/local server.','artifact'=>'URL hoặc hướng dẫn chạy dự án.','exercise'=>'Viết checklist smoke test sau deploy.','criteria'=>'Build thành công, không lỗi console chính.','deep_dive'=>'Phân tích bundle size và code splitting.','advanced_exercise'=>'Tối ưu lazy route.','refs'=>'Vite deployment guide'],
        ],
    ],
    'DB101' => [
        'code'=>'DB101','name'=>'Cơ sở dữ liệu','description'=>'Mô hình dữ liệu quan hệ, SQL, chuẩn hóa, transaction, index và tối ưu truy vấn.','credits'=>3,'color'=>'#16A34A','focus'=>'ERD, SQL, normalization, transaction, index và thiết kế schema','goal'=>'Sinh viên thiết kế được schema quan hệ, viết SQL đúng và biết tối ưu truy vấn cơ bản.','completion'=>'Hoàn thành ERD, schema SQL, bộ truy vấn và báo cáo tối ưu cho bài toán mẫu.','final'=>'Nộp database project có script tạo bảng, seed data và truy vấn báo cáo.','references'=>['PostgreSQL/MySQL Documentation','Database System Concepts','Use The Index, Luke'],
        'modules'=>[
            ['phase'=>'Mô hình quan hệ và ERD','topic'=>'Entity, relationship, key và cardinality','learn'=>'Phân tích nghiệp vụ thành entity, attribute, PK/FK và quan hệ.','outcome'=>'Vẽ được ERD cho bài toán quản lý học tập.','practice_title'=>'Vẽ ERD','practice'=>'Thiết kế ERD cho hệ thống môn học-sinh viên-bài tập.','artifact'=>'ERD có PK/FK rõ.','exercise'=>'Chuyển mô tả nghiệp vụ thành bảng quan hệ.','criteria'=>'Không thiếu key chính và mô tả đúng cardinality.','deep_dive'=>'Phân biệt weak entity và associative entity.','advanced_exercise'=>'Tách quan hệ N-N thành bảng trung gian.','refs'=>'Database design basics'],
            ['phase'=>'SQL truy vấn dữ liệu','topic'=>'SELECT, JOIN, GROUP BY và subquery','learn'=>'Viết truy vấn lấy dữ liệu nhiều bảng, lọc và tổng hợp.','outcome'=>'Tạo báo cáo từ nhiều bảng bằng SQL.','practice_title'=>'Báo cáo SQL','practice'=>'Viết truy vấn điểm trung bình, tiến độ và số bài nộp.','artifact'=>'10 câu SQL có kết quả đúng.','exercise'=>'Tối ưu truy vấn dùng JOIN thay vì xử lý thủ công.','criteria'=>'Kết quả đúng, alias rõ và tránh Cartesian join.','deep_dive'=>'So sánh subquery và join theo ngữ cảnh.','advanced_exercise'=>'Viết CTE cho báo cáo phức tạp.','refs'=>'MySQL SELECT reference'],
            ['phase'=>'Chuẩn hóa dữ liệu','topic'=>'1NF, 2NF, 3NF và anomaly','learn'=>'Nhận diện lặp dữ liệu, phụ thuộc hàm và bất thường cập nhật.','outcome'=>'Chuẩn hóa schema đến 3NF khi phù hợp.','practice_title'=>'Refactor schema','practice'=>'Chuẩn hóa bảng đơn hàng/môn học đang bị lặp dữ liệu.','artifact'=>'Schema trước/sau chuẩn hóa.','exercise'=>'Giải thích trade-off giữa chuẩn hóa và hiệu năng đọc.','criteria'=>'Loại bỏ dữ liệu lặp không cần thiết.','deep_dive'=>'Phân tích denormalization có kiểm soát.','advanced_exercise'=>'Thiết kế bảng audit/report riêng.','refs'=>'Normalization guide'],
            ['phase'=>'Transaction và toàn vẹn','topic'=>'ACID, constraint và transaction isolation','learn'=>'Dùng constraint, transaction và rollback để bảo vệ dữ liệu.','outcome'=>'Viết thao tác nhiều bảng an toàn.','practice_title'=>'Transaction demo','practice'=>'Tạo transaction ghi đơn hàng và chi tiết đơn hàng.','artifact'=>'Script có commit/rollback.','exercise'=>'Thêm unique/check/foreign key phù hợp.','criteria'=>'Không tạo orphan record khi lỗi giữa chừng.','deep_dive'=>'Mô phỏng dirty/non-repeatable read.','advanced_exercise'=>'So sánh isolation level.','refs'=>'MySQL InnoDB transaction'],
            ['phase'=>'Index và tối ưu truy vấn','topic'=>'Index, EXPLAIN và query plan','learn'=>'Đọc EXPLAIN, thêm index đúng cột và tránh index thừa.','outcome'=>'Cải thiện truy vấn chậm có căn cứ.','practice_title'=>'Tối ưu truy vấn','practice'=>'Đo trước/sau khi thêm index cho truy vấn filter/sort.','artifact'=>'Báo cáo EXPLAIN trước/sau.','exercise'=>'Xác định index cho bảng lịch học.','criteria'=>'Có số liệu hoặc plan chứng minh cải thiện.','deep_dive'=>'Phân tích composite index và leftmost prefix.','advanced_exercise'=>'Tạo checklist review index.','refs'=>'Use The Index, Luke'],
            ['phase'=>'Dự án database cuối môn','topic'=>'Schema, seed data và báo cáo nghiệp vụ','learn'=>'Tổng hợp thiết kế, truy vấn, constraint và tối ưu.','outcome'=>'Hoàn thành database project có dữ liệu mẫu.','practice_title'=>'Database capstone','practice'=>'Xây DB quản lý học tập nhỏ với báo cáo tiến độ.','artifact'=>'SQL schema, seed và report queries.','exercise'=>'Trình bày quyết định thiết kế và rủi ro dữ liệu.','criteria'=>'Script chạy lại được, có FK và báo cáo đúng.','deep_dive'=>'Chuẩn bị migration rollback và backup plan.','advanced_exercise'=>'Thêm view/procedure cho báo cáo.','refs'=>'MySQL migration practices'],
        ],
    ],
    'PY101' => [
        'code'=>'PY101','name'=>'Lập trình Python','description'=>'Cú pháp Python, cấu trúc dữ liệu, hàm, module, file, OOP và dự án tự động hóa nhỏ.','credits'=>3,'color'=>'#F59E0B','focus'=>'syntax, data structures, functions, files, OOP và mini project','goal'=>'Sinh viên viết được chương trình Python sạch, xử lý file/API và xây mini project tự động hóa.','completion'=>'Hoàn thành bài tập theo module, code có hàm/module rõ và mini project cuối môn.','final'=>'Demo Python mini project xử lý dữ liệu hoặc tự động hóa tác vụ học tập.','references'=>['Python Official Tutorial','Automate the Boring Stuff with Python','Real Python'],
        'modules'=>[
            ['phase'=>'Cú pháp và kiểu dữ liệu','topic'=>'Biến, kiểu dữ liệu, điều kiện và vòng lặp','learn'=>'Viết script Python cơ bản, xử lý input/output và flow control.','outcome'=>'Giải được bài toán nhỏ bằng Python.','practice_title'=>'Script cơ bản','practice'=>'Viết chương trình tính điểm trung bình và xếp loại.','artifact'=>'Script chạy đúng với nhiều input.','exercise'=>'Thêm validate input và thông báo lỗi.','criteria'=>'Code rõ tên biến và xử lý case lỗi.','deep_dive'=>'Phân tích mutability của list/dict/string.','advanced_exercise'=>'Viết test case thủ công cho script.','refs'=>'Python Tutorial: Control Flow'],
            ['phase'=>'Cấu trúc dữ liệu','topic'=>'List, tuple, set, dict và comprehension','learn'=>'Chọn cấu trúc dữ liệu phù hợp, duyệt và biến đổi dữ liệu.','outcome'=>'Xử lý danh sách bản ghi hiệu quả.','practice_title'=>'Xử lý danh sách','practice'=>'Tổng hợp danh sách sinh viên theo môn và trạng thái.','artifact'=>'Script lọc/sắp xếp/nhóm dữ liệu.','exercise'=>'Dùng dict để đếm tần suất lỗi.','criteria'=>'Không lặp code và dùng cấu trúc hợp lý.','deep_dive'=>'So sánh list comprehension và loop thường.','advanced_exercise'=>'Tối ưu xử lý dữ liệu lớn hơn 10k dòng.','refs'=>'Python Data Structures'],
            ['phase'=>'Hàm và module','topic'=>'Function, scope, module và package đơn giản','learn'=>'Tách chương trình thành hàm nhỏ, tái sử dụng và dễ test.','outcome'=>'Tổ chức code Python có module rõ.','practice_title'=>'Refactor thành module','practice'=>'Tách script xử lý điểm thành module input, calculate, report.','artifact'=>'Project Python nhiều file.','exercise'=>'Viết docstring và type hint cho hàm chính.','criteria'=>'Hàm có trách nhiệm nhỏ và dễ gọi lại.','deep_dive'=>'Phân tích side effect trong function.','advanced_exercise'=>'Thêm unit test bằng unittest/pytest cơ bản.','refs'=>'Python Modules'],
            ['phase'=>'File, CSV và API','topic'=>'Đọc ghi file, CSV/JSON và HTTP request','learn'=>'Xử lý dữ liệu từ file và API, bắt lỗi khi dữ liệu thiếu.','outcome'=>'Tạo script nhập/xuất dữ liệu học tập.','practice_title'=>'CSV report','practice'=>'Đọc file CSV điểm, xuất báo cáo JSON/CSV.','artifact'=>'Script convert và báo cáo dữ liệu.','exercise'=>'Gọi API mock và lưu kết quả ra file.','criteria'=>'Có xử lý file không tồn tại và dữ liệu lỗi.','deep_dive'=>'So sánh CSV, JSON và SQLite cho dữ liệu nhỏ.','advanced_exercise'=>'Thêm logging cho quá trình xử lý.','refs'=>'Python csv/json docs'],
            ['phase'=>'OOP và exception','topic'=>'Class, object, exception và context manager','learn'=>'Mô hình hóa đối tượng, đóng gói logic và xử lý lỗi rõ ràng.','outcome'=>'Viết class phục vụ nghiệp vụ đơn giản.','practice_title'=>'OOP mini domain','practice'=>'Tạo class Student, Subject, GradeReport.','artifact'=>'Module OOP có exception riêng.','exercise'=>'Thêm phương thức tính GPA và validate dữ liệu.','criteria'=>'Class không ôm quá nhiều trách nhiệm.','deep_dive'=>'So sánh dataclass và class thường.','advanced_exercise'=>'Dùng context manager để đọc file an toàn.','refs'=>'Python Classes'],
            ['phase'=>'Mini project Python','topic'=>'Automation/data mini project','learn'=>'Tổng hợp kiến thức Python để giải một tác vụ thực tế.','outcome'=>'Hoàn thành mini project có README và dữ liệu mẫu.','practice_title'=>'Python capstone','practice'=>'Xây tool tạo báo cáo tiến độ học tập từ CSV/API.','artifact'=>'Mini project chạy bằng command line.','exercise'=>'Đóng gói script với cấu hình và hướng dẫn chạy.','criteria'=>'Có input mẫu, output mẫu, README và xử lý lỗi.','deep_dive'=>'Phân tích cách mở rộng project thành package.','advanced_exercise'=>'Thêm test tự động cho luồng chính.','refs'=>'Automate the Boring Stuff'],
        ],
    ],
];

$subjects += [
    'AI101' => [
        'code'=>'AI101','name'=>'Trí tuệ nhân tạo','description'=>'Nhập môn AI, machine learning, xử lý dữ liệu, đánh giá mô hình và dự án AI nhỏ có trách nhiệm.','credits'=>3,'color'=>'#7C3AED','focus'=>'machine learning, preprocessing, supervised learning, evaluation và AI project','goal'=>'Sinh viên hiểu quy trình xây dựng mô hình AI cơ bản, đánh giá kết quả và nhận diện rủi ro đạo đức/dữ liệu.','completion'=>'Hoàn thành notebook xử lý dữ liệu, huấn luyện mô hình và báo cáo đánh giá.', 'final'=>'Demo mini AI project có dataset, model, metric và phần phân tích giới hạn.', 'references'=>['Google Machine Learning Crash Course','scikit-learn User Guide','Elements of AI'],
        'modules'=>[
            ['phase'=>'Tổng quan AI và ML','topic'=>'AI, ML, supervised/unsupervised learning','learn'=>'Phân biệt các nhánh AI, pipeline ML và bài toán phân loại/hồi quy.','outcome'=>'Mô tả được quy trình giải bài toán ML cơ bản.','practice_title'=>'Phân loại bài toán','practice'=>'Chọn 5 bài toán thực tế và xác định loại ML phù hợp.','artifact'=>'Bảng phân tích bài toán AI.','exercise'=>'Vẽ pipeline dữ liệu-mô hình-đánh giá cho bài toán điểm số.','criteria'=>'Nêu đúng input, output, metric và rủi ro dữ liệu.','deep_dive'=>'Phân tích khác biệt giữa rule-based và learning-based system.','advanced_exercise'=>'Viết proposal AI một trang cho bài toán học tập.','refs'=>'ML Crash Course: Framing'],
            ['phase'=>'Dữ liệu và tiền xử lý','topic'=>'Dataset, feature, missing value và split data','learn'=>'Làm sạch dữ liệu, encode feature và chia train/validation/test.','outcome'=>'Chuẩn bị được dataset cho mô hình ML.','practice_title'=>'Data preprocessing','practice'=>'Làm sạch dataset nhỏ, xử lý thiếu và chuẩn hóa cột số.','artifact'=>'Notebook preprocessing có giải thích.','exercise'=>'Tạo train/test split và kiểm tra leakage.','criteria'=>'Không để dữ liệu test ảnh hưởng train.','deep_dive'=>'Phân tích data leakage và bias trong dataset.','advanced_exercise'=>'Tạo data profiling report.','refs'=>'scikit-learn preprocessing'],
            ['phase'=>'Mô hình supervised','topic'=>'Linear model, decision tree và baseline','learn'=>'Huấn luyện baseline, so sánh mô hình và tránh overfitting đơn giản.','outcome'=>'Train được mô hình phân loại/hồi quy cơ bản.','practice_title'=>'Train baseline','practice'=>'Huấn luyện logistic regression hoặc decision tree cho dataset mẫu.','artifact'=>'Notebook train model có metric.','exercise'=>'So sánh baseline với mô hình thứ hai.','criteria'=>'Có lý do chọn metric và nhận xét kết quả.','deep_dive'=>'Phân tích bias-variance bằng ví dụ.','advanced_exercise'=>'Tune hyperparameter bằng grid search nhỏ.','refs'=>'scikit-learn supervised learning'],
            ['phase'=>'Đánh giá mô hình','topic'=>'Accuracy, precision, recall, F1, confusion matrix','learn'=>'Chọn metric theo mục tiêu và đọc lỗi mô hình.','outcome'=>'Đánh giá mô hình không chỉ dựa vào accuracy.','practice_title'=>'Model evaluation','practice'=>'Tạo confusion matrix và phân tích false positive/false negative.','artifact'=>'Báo cáo đánh giá mô hình.','exercise'=>'Đề xuất cải thiện model dựa trên lỗi.','criteria'=>'Kết luận gắn với metric và ngữ cảnh.','deep_dive'=>'Phân tích class imbalance và threshold.','advanced_exercise'=>'Vẽ ROC/PR curve nếu phù hợp.','refs'=>'ML Crash Course: Classification'],
            ['phase'=>'NLP/CV và ứng dụng AI','topic'=>'Text/image features và mô hình có sẵn','learn'=>'Hiểu cách dùng mô hình/embedding có sẵn cho bài toán nhỏ.','outcome'=>'Thử nghiệm một ứng dụng AI đơn giản.','practice_title'=>'AI ứng dụng','practice'=>'Tạo demo phân loại văn bản ngắn hoặc nhận diện ảnh mẫu.','artifact'=>'Prototype AI nhỏ.','exercise'=>'Ghi lại giới hạn và lỗi thường gặp của prototype.','criteria'=>'Không phóng đại khả năng mô hình.','deep_dive'=>'So sánh model tự huấn luyện và pretrained model.','advanced_exercise'=>'Thử embedding hoặc vector search cơ bản.','refs'=>'Hugging Face/Scikit examples'],
            ['phase'=>'Dự án AI có trách nhiệm','topic'=>'Mini project, ethics và model card','learn'=>'Tổng hợp pipeline AI, đánh giá rủi ro và trình bày minh bạch.','outcome'=>'Hoàn thành mini project AI có báo cáo.','practice_title'=>'AI capstone','practice'=>'Xây notebook AI hoàn chỉnh từ dataset đến metric và model card.','artifact'=>'Notebook, report và model card ngắn.','exercise'=>'Trình bày limitation, bias và hướng cải thiện.','criteria'=>'Có dữ liệu, model, metric, phân tích lỗi và đạo đức.','deep_dive'=>'Phân tích tác động sai lệch dữ liệu với người dùng cuối.','advanced_exercise'=>'Thêm checklist responsible AI cho project.','refs'=>'Google Responsible AI practices'],
        ],
    ],
    'PM101' => [
        'code'=>'PM101','name'=>'Quản lý dự án phần mềm','description'=>'Khởi tạo, lập kế hoạch, Agile/Scrum, quản trị rủi ro, truyền thông và báo cáo dự án phần mềm.','credits'=>3,'color'=>'#0891B2','focus'=>'scope, WBS, schedule, Agile, risk, quality và project reporting','goal'=>'Sinh viên lập được kế hoạch dự án phần mềm, theo dõi tiến độ và quản trị rủi ro/chất lượng.','completion'=>'Hoàn thành project charter, WBS, backlog, risk register và báo cáo tiến độ.', 'final'=>'Trình bày kế hoạch quản lý dự án phần mềm hoàn chỉnh cho một sản phẩm mẫu.', 'references'=>['PMBOK overview','Scrum Guide','Atlassian Agile project management'],
        'modules'=>[
            ['phase'=>'Khởi tạo và phạm vi','topic'=>'Project charter, stakeholder và scope','learn'=>'Xác định mục tiêu, phạm vi, stakeholder và tiêu chí thành công.','outcome'=>'Viết được project charter ngắn.','practice_title'=>'Project charter','practice'=>'Lập charter cho dự án web quản lý học tập.','artifact'=>'Project charter một trang.','exercise'=>'Xác định in-scope/out-of-scope và giả định.','criteria'=>'Mục tiêu đo được và phạm vi rõ.','deep_dive'=>'Phân tích stakeholder power-interest matrix.','advanced_exercise'=>'Tạo stakeholder communication need.','refs'=>'PMBOK project charter'],
            ['phase'=>'WBS và kế hoạch tiến độ','topic'=>'WBS, milestone, dependency và estimation','learn'=>'Chia nhỏ công việc, ước lượng và xác định phụ thuộc.','outcome'=>'Tạo kế hoạch tiến độ có milestone.','practice_title'=>'Lập WBS','practice'=>'Tạo WBS và timeline cho 6 tuần phát triển MVP.','artifact'=>'WBS và Gantt/timeline.','exercise'=>'Xác định critical dependency.','criteria'=>'Task đủ nhỏ, có owner và duration hợp lý.','deep_dive'=>'So sánh estimation theo expert judgment và planning poker.','advanced_exercise'=>'Tạo baseline schedule và buffer.','refs'=>'WBS practice guide'],
            ['phase'=>'Agile/Scrum','topic'=>'Backlog, sprint, planning, review và retrospective','learn'=>'Tổ chức backlog, sprint goal và nghi thức Scrum cơ bản.','outcome'=>'Lập được sprint backlog cho một sprint.','practice_title'=>'Sprint planning','practice'=>'Viết user story, acceptance criteria và sprint backlog.','artifact'=>'Product backlog + sprint backlog.','exercise'=>'Ưu tiên backlog bằng MoSCoW hoặc value/effort.','criteria'=>'User story có giá trị người dùng và criteria test được.','deep_dive'=>'Phân tích anti-pattern trong daily meeting.','advanced_exercise'=>'Tạo definition of ready/done.','refs'=>'Scrum Guide'],
            ['phase'=>'Rủi ro và chất lượng','topic'=>'Risk register, mitigation và quality plan','learn'=>'Nhận diện rủi ro, đánh giá impact/probability và lên phương án xử lý.','outcome'=>'Tạo risk register và quality checklist.','practice_title'=>'Risk workshop','practice'=>'Lập 10 rủi ro cho dự án web và kế hoạch ứng phó.','artifact'=>'Risk register có owner.','exercise'=>'Thêm quality gate cho từng milestone.','criteria'=>'Rủi ro có trigger, owner và response rõ.','deep_dive'=>'Phân tích rủi ro scope creep và technical debt.','advanced_exercise'=>'Tạo risk burndown đơn giản.','refs'=>'Risk management basics'],
            ['phase'=>'Truyền thông và báo cáo','topic'=>'Status report, meeting note và change request','learn'=>'Báo cáo tiến độ, issue, decision và thay đổi phạm vi minh bạch.','outcome'=>'Viết được status report cho stakeholder.','practice_title'=>'Weekly report','practice'=>'Tạo báo cáo tuần có progress, issue, risk và next step.','artifact'=>'Status report mẫu.','exercise'=>'Soạn change request cho yêu cầu phát sinh.','criteria'=>'Báo cáo ngắn, có dữ liệu và hành động tiếp theo.','deep_dive'=>'Phân tích cách truyền thông khi dự án trễ tiến độ.','advanced_exercise'=>'Tạo dashboard KPI dự án.','refs'=>'Atlassian status report'],
            ['phase'=>'Dự án quản lý cuối môn','topic'=>'Project management package','learn'=>'Tổng hợp charter, backlog, schedule, risk và báo cáo thành một bộ hồ sơ.','outcome'=>'Hoàn thành kế hoạch quản lý dự án phần mềm.','practice_title'=>'PM capstone','practice'=>'Lập bộ tài liệu quản lý cho dự án phần mềm mẫu.','artifact'=>'Project management package.','exercise'=>'Trình bày trade-off scope-time-cost-quality.','criteria'=>'Có charter, WBS, backlog, risk, quality, report và final presentation.','deep_dive'=>'Phân tích bài học kinh nghiệm và cải tiến process.','advanced_exercise'=>'Tạo roadmap release 2 phiên bản.','refs'=>'PM case study examples'],
        ],
    ],
    'DSA101' => [
        'code'=>'DSA101','name'=>'Cấu trúc dữ liệu và giải thuật','description'=>'Độ phức tạp thuật toán, mảng, stack/queue, linked list, hash, tree, graph, sort/search và luyện giải bài.','credits'=>3,'color'=>'#DC2626','focus'=>'complexity, data structures, recursion, tree, graph và algorithmic problem solving','goal'=>'Sinh viên chọn được cấu trúc dữ liệu phù hợp, phân tích độ phức tạp và giải bài lập trình cơ bản-trung bình.','completion'=>'Hoàn thành bộ bài tập theo chủ đề, giải thích được complexity và nộp mini problem set cuối môn.', 'final'=>'Nộp bộ lời giải có phân tích thuật toán và code sạch cho 8-12 bài tổng hợp.', 'references'=>['VisuAlgo','CLRS selected chapters','LeetCode Explore'],
        'modules'=>[
            ['phase'=>'Độ phức tạp và mảng','topic'=>'Big-O, array, string và two pointers','learn'=>'Phân tích thời gian/bộ nhớ và dùng array/string cho bài toán tuyến tính.','outcome'=>'Giải được bài array/string có O(n).','practice_title'=>'Array drills','practice'=>'Giải bài tìm cặp tổng, đảo chuỗi và prefix sum.','artifact'=>'5 lời giải có complexity.','exercise'=>'Viết giải thích Big-O cho từng bài.','criteria'=>'Code đúng edge case và nêu complexity.','deep_dive'=>'So sánh O(n), O(n log n), O(n²) bằng dữ liệu tăng dần.','advanced_exercise'=>'Tối ưu bài O(n²) xuống O(n).','refs'=>'VisuAlgo array'],
            ['phase'=>'Stack, queue và linked list','topic'=>'Stack, queue, deque, linked list','learn'=>'Áp dụng cấu trúc tuyến tính cho undo, BFS đơn giản và xử lý ngoặc.','outcome'=>'Chọn đúng stack/queue/list theo bài toán.','practice_title'=>'Linear structures','practice'=>'Giải valid parentheses, queue simulation và reverse linked list.','artifact'=>'Bộ lời giải stack/queue/list.','exercise'=>'Mô phỏng call stack cho recursion đơn giản.','criteria'=>'Không nhầm LIFO/FIFO và xử lý null pointer.','deep_dive'=>'Phân tích trade-off array list vs linked list.','advanced_exercise'=>'Cài đặt deque đơn giản.','refs'=>'VisuAlgo linked list/stack'],
            ['phase'=>'Hashing và recursion','topic'=>'Hash map, set, recursion và backtracking nhập môn','learn'=>'Dùng hash để tra cứu nhanh và recursion để chia bài toán.','outcome'=>'Giải được bài đếm/tìm kiếm và recursion cơ bản.','practice_title'=>'Hash map practice','practice'=>'Giải frequency counter, anagram và subset nhỏ.','artifact'=>'Code dùng map/set hợp lý.','exercise'=>'Vẽ recursion tree cho bài subset.','criteria'=>'Không lạm dụng nested loop khi hash phù hợp.','deep_dive'=>'Phân tích collision và memory trade-off.','advanced_exercise'=>'Backtracking permutation có pruning.','refs'=>'LeetCode hash table explore'],
            ['phase'=>'Tree và binary search','topic'=>'Binary tree, BST, traversal và binary search','learn'=>'Duyệt cây, tìm kiếm có điều kiện và áp dụng binary search trên answer.','outcome'=>'Giải được bài tree traversal và search.','practice_title'=>'Tree traversal','practice'=>'Cài inorder/preorder/level-order và tìm chiều cao cây.','artifact'=>'Bộ bài tree cơ bản.','exercise'=>'Giải binary search trong sorted array và answer space.','criteria'=>'Xử lý base case và boundary chính xác.','deep_dive'=>'So sánh DFS recursion và iterative stack.','advanced_exercise'=>'Validate BST và lowest common ancestor.','refs'=>'VisuAlgo BST'],
            ['phase'=>'Graph và sorting','topic'=>'Graph representation, BFS/DFS, sort và greedy nhập môn','learn'=>'Biểu diễn graph, duyệt BFS/DFS và chọn thuật toán sắp xếp/tối ưu phù hợp.','outcome'=>'Giải bài graph/sort cơ bản.','practice_title'=>'Graph drills','practice'=>'Giải connected components, shortest path unweighted và custom sort.','artifact'=>'Bộ bài graph/sort.','exercise'=>'So sánh BFS và DFS theo bài toán.','criteria'=>'Biểu diễn adjacency list đúng và tránh lặp vô hạn.','deep_dive'=>'Phân tích stable sort và comparator.','advanced_exercise'=>'Dijkstra nhập môn với priority queue.','refs'=>'VisuAlgo graph/sorting'],
            ['phase'=>'Problem set cuối môn','topic'=>'Chiến lược giải bài và review code','learn'=>'Tổng hợp pattern, đọc đề, chọn cấu trúc dữ liệu và kiểm thử lời giải.','outcome'=>'Hoàn thành problem set tổng hợp.','practice_title'=>'DSA capstone','practice'=>'Giải 8-12 bài tổng hợp theo array, hash, tree, graph.','artifact'=>'Problem set có phân tích.','exercise'=>'Review lại lời giải, test edge case và refactor code.','criteria'=>'Mỗi bài có idea, complexity, code và test case.','deep_dive'=>'Phân tích cách nhận diện pattern từ constraint.','advanced_exercise'=>'Tạo notebook pattern cá nhân.','refs'=>'Competitive programming handbook selected topics'],
        ],
    ],
];

runSqlFile($db, BASE_PATH . '/database/migrations/create_roadmap_templates_tables.sql');

$adminId = (int) (fetchValue(
    $db,
    'SELECT u.id FROM users u INNER JOIN roles r ON r.id = u.role_id WHERE r.name = :role ORDER BY u.id LIMIT 1',
    ['role' => 'admin']
) ?: 1);

$kept = [];
$archived = [];
$softDeleted = [];
$templateReport = [];
$demoAssignments = [];

$db->beginTransaction();
try {
    foreach ($subjects as $subject) {
        $existing = fetchOne($db, 'SELECT id FROM subjects WHERE subject_code = :code LIMIT 1', ['code' => $subject['code']]);

        if ($existing) {
            $subjectId = (int) $existing['id'];
            $statement = $db->prepare(
                'UPDATE subjects
                 SET subject_name = :name,
                     description = :description,
                     credits = :credits,
                     status = :status,
                     color = :color,
                     created_by = COALESCE(created_by, :created_by),
                     deleted_at = NULL,
                     updated_at = NOW()
                 WHERE id = :id'
            );
            $statement->execute([
                'id' => $subjectId,
                'name' => $subject['name'],
                'description' => $subject['description'],
                'credits' => $subject['credits'],
                'status' => 'studying',
                'color' => $subject['color'],
                'created_by' => $adminId,
            ]);
        } else {
            $statement = $db->prepare(
                'INSERT INTO subjects (subject_code, subject_name, description, credits, status, color, created_by)
                 VALUES (:code, :name, :description, :credits, :status, :color, :created_by)'
            );
            $statement->execute([
                'code' => $subject['code'],
                'name' => $subject['name'],
                'description' => $subject['description'],
                'credits' => $subject['credits'],
                'status' => 'studying',
                'color' => $subject['color'],
                'created_by' => $adminId,
            ]);
            $subjectId = (int) $db->lastInsertId();
        }

        $kept[$subject['code']] = ['id' => $subjectId, 'name' => $subject['name']];

        foreach ([1, 3, 6] as $durationMonths) {
            $template = buildTemplate($subject, $durationMonths);
            $existingTemplate = fetchOne(
                $db,
                'SELECT id FROM roadmap_templates WHERE subject_id = :subject_id AND duration_months = :duration_months LIMIT 1',
                ['subject_id' => $subjectId, 'duration_months' => $durationMonths]
            );

            if ($existingTemplate) {
                $templateId = (int) $existingTemplate['id'];
                $statement = $db->prepare(
                    'UPDATE roadmap_templates
                     SET template_code = :template_code,
                         title = :title,
                         overview = :overview,
                         goal = :goal,
                         current_level = :current_level,
                         total_weeks = :total_weeks,
                         study_hours_per_week = :study_hours_per_week,
                         completion_criteria = :completion_criteria,
                         final_assessment = :final_assessment,
                         reference_materials = :reference_materials,
                         status = :status,
                         updated_at = NOW()
                     WHERE id = :id'
                );
                $statement->execute([
                    'id' => $templateId,
                    'template_code' => $template['template_code'],
                    'title' => $template['title'],
                    'overview' => $template['overview'],
                    'goal' => $template['goal'],
                    'current_level' => $template['current_level'],
                    'total_weeks' => $template['total_weeks'],
                    'study_hours_per_week' => $template['study_hours_per_week'],
                    'completion_criteria' => $template['completion_criteria'],
                    'final_assessment' => $template['final_assessment'],
                    'reference_materials' => $template['reference_materials'],
                    'status' => 'active',
                ]);
                $db->prepare('DELETE FROM roadmap_template_phases WHERE template_id = :id')->execute(['id' => $templateId]);
            } else {
                $statement = $db->prepare(
                    'INSERT INTO roadmap_templates
                        (subject_id, template_code, duration_months, title, overview, goal, current_level, total_weeks,
                         study_hours_per_week, completion_criteria, final_assessment, reference_materials, status)
                     VALUES
                        (:subject_id, :template_code, :duration_months, :title, :overview, :goal, :current_level, :total_weeks,
                         :study_hours_per_week, :completion_criteria, :final_assessment, :reference_materials, :status)'
                );
                $statement->execute([
                    'subject_id' => $subjectId,
                    'template_code' => $template['template_code'],
                    'duration_months' => $template['duration_months'],
                    'title' => $template['title'],
                    'overview' => $template['overview'],
                    'goal' => $template['goal'],
                    'current_level' => $template['current_level'],
                    'total_weeks' => $template['total_weeks'],
                    'study_hours_per_week' => $template['study_hours_per_week'],
                    'completion_criteria' => $template['completion_criteria'],
                    'final_assessment' => $template['final_assessment'],
                    'reference_materials' => $template['reference_materials'],
                    'status' => 'active',
                ]);
                $templateId = (int) $db->lastInsertId();
            }

            $phaseInsert = $db->prepare(
                'INSERT INTO roadmap_template_phases
                    (template_id, phase_number, title, overview, start_week, end_week, duration_weeks, outcome, completion_criteria)
                 VALUES
                    (:template_id, :phase_number, :title, :overview, :start_week, :end_week, :duration_weeks, :outcome, :completion_criteria)'
            );
            $taskInsert = $db->prepare(
                'INSERT INTO roadmap_template_tasks
                    (phase_id, task_number, week_number, title, description, expected_result, suggested_task,
                     reference_materials, completion_criteria, priority)
                 VALUES
                    (:phase_id, :task_number, :week_number, :title, :description, :expected_result, :suggested_task,
                     :reference_materials, :completion_criteria, :priority)'
            );

            $taskCount = 0;
            foreach ($template['phases'] as $phase) {
                $phaseInsert->execute([
                    'template_id' => $templateId,
                    'phase_number' => $phase['phase_number'],
                    'title' => $phase['title'],
                    'overview' => $phase['overview'],
                    'start_week' => $phase['start_week'],
                    'end_week' => $phase['end_week'],
                    'duration_weeks' => $phase['duration_weeks'],
                    'outcome' => $phase['outcome'],
                    'completion_criteria' => $phase['completion_criteria'],
                ]);
                $phaseId = (int) $db->lastInsertId();

                foreach ($phase['tasks'] as $taskIndex => $task) {
                    $taskInsert->execute([
                        'phase_id' => $phaseId,
                        'task_number' => $taskIndex + 1,
                        'week_number' => $task['week_number'],
                        'title' => $task['title'],
                        'description' => $task['description'],
                        'expected_result' => $task['expected_result'],
                        'suggested_task' => $task['suggested_task'],
                        'reference_materials' => $task['reference_materials'],
                        'completion_criteria' => $task['completion_criteria'],
                        'priority' => $task['priority'],
                    ]);
                    $taskCount++;
                }
            }

            $templateReport[] = [
                'subject' => $subject['code'],
                'duration_months' => $durationMonths,
                'phases' => count($template['phases']),
                'tasks' => $taskCount,
            ];
        }
    }

    $keepCodes = array_keys($subjects);
    $statement = $db->query('SELECT id, subject_code, subject_name FROM subjects WHERE deleted_at IS NULL');
    foreach ($statement->fetchAll(PDO::FETCH_ASSOC) as $subject) {
        if (in_array($subject['subject_code'], $keepCodes, true)) {
            continue;
        }

        $count = relatedCount($db, (int) $subject['id']);
        if ($count > 0) {
            $db->prepare('UPDATE subjects SET status = :status, updated_at = NOW() WHERE id = :id')->execute([
                'status' => 'paused',
                'id' => (int) $subject['id'],
            ]);
            $archived[] = "{$subject['subject_code']} - {$subject['subject_name']} ({$count} liên kết)";
        } else {
            $db->prepare('UPDATE subjects SET status = :status, deleted_at = COALESCE(deleted_at, NOW()), updated_at = NOW() WHERE id = :id')->execute([
                'status' => 'paused',
                'id' => (int) $subject['id'],
            ]);
            $softDeleted[] = "{$subject['subject_code']} - {$subject['subject_name']}";
        }
    }

    $demoStudent = fetchOne(
        $db,
        'SELECT u.id FROM users u INNER JOIN roles r ON r.id = u.role_id WHERE u.email = :email AND r.name = :role LIMIT 1',
        ['email' => 'minhanh@student.com', 'role' => 'student']
    );
    if ($demoStudent) {
        $assignmentInsert = $db->prepare(
            'INSERT INTO student_subjects (student_id, subject_id, status, assigned_by, assigned_at)
             VALUES (:student_id, :subject_id, :status, :assigned_by, NOW())
             ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                assigned_by = VALUES(assigned_by),
                assigned_at = COALESCE(assigned_at, NOW()),
                removed_at = NULL,
                updated_at = NOW()'
        );

        foreach ($kept as $code => $subject) {
            $assignmentInsert->execute([
                'student_id' => (int) $demoStudent['id'],
                'subject_id' => (int) $subject['id'],
                'status' => 'active',
                'assigned_by' => $adminId,
            ]);
            $demoAssignments[] = "minhanh@student.com -> {$code}";
        }
    }

    $db->commit();
} catch (Throwable $exception) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    throw $exception;
}

$activeSubjects = fetchValue($db, 'SELECT COUNT(*) FROM subjects WHERE deleted_at IS NULL AND status = "studying"');
$templateCount = fetchValue($db, 'SELECT COUNT(*) FROM roadmap_templates WHERE status = "active"');
$duplicateCodes = fetchValue($db, 'SELECT COUNT(*) FROM (SELECT subject_code FROM subjects WHERE deleted_at IS NULL GROUP BY subject_code HAVING COUNT(*) > 1) d');
$duplicateTemplateDurations = fetchValue($db, 'SELECT COUNT(*) FROM (SELECT subject_id, duration_months FROM roadmap_templates WHERE status = "active" GROUP BY subject_id, duration_months HAVING COUNT(*) > 1) d');

$report = [
    'kept_subjects' => array_map(
        static fn (array $row, string $code): string => "{$code} - {$row['name']} (#{$row['id']})",
        $kept,
        array_keys($kept)
    ),
    'archived_subjects' => $archived,
    'soft_deleted_subjects' => $softDeleted,
    'demo_assignments' => $demoAssignments,
    'active_subject_count' => (int) $activeSubjects,
    'active_template_count' => (int) $templateCount,
    'duplicate_active_subject_codes' => (int) $duplicateCodes,
    'duplicate_active_template_subject_durations' => (int) $duplicateTemplateDurations,
    'templates' => $templateReport,
];

echo json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . PHP_EOL;
