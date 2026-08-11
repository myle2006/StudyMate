<?php

class RoadmapTemplateProvisioner
{
    public function __construct(private ?PDO $db = null)
    {
        $this->db ??= Database::connection();
    }

    public function ensureTables(): void
    {
        $path = BASE_PATH . '/database/migrations/create_roadmap_templates_tables.sql';
        $sql = file_get_contents($path);
        if ($sql === false) {
            throw new RuntimeException("Không đọc được file SQL: {$path}");
        }

        foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
            if ($statement !== '') {
                $this->db->exec($statement);
            }
        }
    }

    public function ensureForSubject(array $subject, bool $ensureTables = true): array
    {
        if ($ensureTables) {
            $this->ensureTables();
        }

        $report = [];
        foreach ([1, 3, 6] as $durationMonths) {
            $template = $this->buildTemplate($subject, $durationMonths);
            $existingTemplate = $this->fetchOne(
                'SELECT id, template_code, status
                 FROM roadmap_templates
                 WHERE subject_id = :subject_id AND duration_months = :duration_months
                 LIMIT 1',
                ['subject_id' => (int) $subject['id'], 'duration_months' => $durationMonths]
            );

            $result = $this->persistTemplate($subject, $template, $existingTemplate);
            $report[] = [
                'duration_months' => $durationMonths,
                'template_id' => $result['id'],
                'action' => $result['status'],
                'phases' => $result['phases'],
                'tasks' => $result['tasks'],
            ];
        }

        return $report;
    }

    public function ensureForAllCurrentSubjects(): array
    {
        $this->ensureTables();
        $subjects = $this->fetchAll(
            'SELECT id, subject_code, subject_name, description, status
             FROM subjects
             WHERE deleted_at IS NULL
             ORDER BY subject_code ASC'
        );

        $report = [];
        foreach ($subjects as $subject) {
            foreach ($this->ensureForSubject($subject, false) as $templateReport) {
                $report[] = [
                    'subject_code' => $subject['subject_code'],
                    'subject_name' => $subject['subject_name'],
                    'subject_status' => $subject['status'],
                    ...$templateReport,
                ];
            }
        }

        return $report;
    }

    public function coverageReport(): array
    {
        $coverage = $this->fetchAll(
            'SELECT s.subject_code, s.subject_name, s.status,
                    COUNT(DISTINCT t.id) AS active_template_count,
                    GROUP_CONCAT(DISTINCT t.duration_months ORDER BY t.duration_months) AS durations,
                    COUNT(DISTINCT p.id) AS phase_count,
                    COUNT(tt.id) AS task_count
             FROM subjects s
             LEFT JOIN roadmap_templates t ON t.subject_id = s.id AND t.status = "active"
             LEFT JOIN roadmap_template_phases p ON p.template_id = t.id
             LEFT JOIN roadmap_template_tasks tt ON tt.phase_id = p.id
             WHERE s.deleted_at IS NULL
             GROUP BY s.id, s.subject_code, s.subject_name, s.status
             ORDER BY s.subject_code ASC'
        );

        $duplicates = $this->fetchAll(
            'SELECT subject_id, duration_months, COUNT(*) AS duplicate_count
             FROM roadmap_templates
             WHERE status = "active"
             GROUP BY subject_id, duration_months
             HAVING COUNT(*) > 1'
        );

        return [
            'coverage' => $coverage,
            'duplicate_active_template_subject_durations' => $duplicates,
        ];
    }

    private function persistTemplate(array $subject, array $template, ?array $existingTemplate): array
    {
        $status = 'created';
        if ($existingTemplate) {
            $templateId = (int) $existingTemplate['id'];
            $needsContent = $this->templateNeedsContent($templateId) || $existingTemplate['status'] !== 'active';
            if (! $needsContent) {
                return ['id' => $templateId, 'status' => 'kept', 'phases' => null, 'tasks' => null];
            }

            $statement = $this->db->prepare(
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
                'template_code' => $existingTemplate['template_code'] ?: $template['template_code'],
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
            $this->db->prepare('DELETE FROM roadmap_template_phases WHERE template_id = :id')->execute(['id' => $templateId]);
            $status = 'repaired';
        } else {
            $templateCode = $this->uniqueTemplateCode($template['template_code'], (int) $subject['id']);
            $statement = $this->db->prepare(
                'INSERT INTO roadmap_templates
                    (subject_id, template_code, duration_months, title, overview, goal, current_level, total_weeks,
                     study_hours_per_week, completion_criteria, final_assessment, reference_materials, status)
                 VALUES
                    (:subject_id, :template_code, :duration_months, :title, :overview, :goal, :current_level, :total_weeks,
                     :study_hours_per_week, :completion_criteria, :final_assessment, :reference_materials, :status)'
            );
            $statement->execute([
                'subject_id' => (int) $subject['id'],
                'template_code' => $templateCode,
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
            $templateId = (int) $this->db->lastInsertId();
        }

        $taskCount = $this->insertPhasesAndTasks($templateId, $template['phases']);

        return ['id' => $templateId, 'status' => $status, 'phases' => count($template['phases']), 'tasks' => $taskCount];
    }

    private function insertPhasesAndTasks(int $templateId, array $phases): int
    {
        $phaseInsert = $this->db->prepare(
            'INSERT INTO roadmap_template_phases
                (template_id, phase_number, title, overview, start_week, end_week, duration_weeks, outcome, completion_criteria)
             VALUES
                (:template_id, :phase_number, :title, :overview, :start_week, :end_week, :duration_weeks, :outcome, :completion_criteria)'
        );
        $taskInsert = $this->db->prepare(
            'INSERT INTO roadmap_template_tasks
                (phase_id, task_number, week_number, title, description, expected_result, suggested_task,
                 reference_materials, completion_criteria, priority)
             VALUES
                (:phase_id, :task_number, :week_number, :title, :description, :expected_result, :suggested_task,
                 :reference_materials, :completion_criteria, :priority)'
        );

        $taskCount = 0;
        foreach ($phases as $phase) {
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
            $phaseId = (int) $this->db->lastInsertId();

            foreach ($phase['tasks'] as $index => $task) {
                $taskInsert->execute([
                    'phase_id' => $phaseId,
                    'task_number' => $index + 1,
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

        return $taskCount;
    }

    private function buildTemplate(array $subject, int $durationMonths): array
    {
        $blueprint = $this->domainBlueprint($subject);
        $duration = [
            1 => ['name' => 'Lộ trình nhanh', 'weeks' => 4, 'phase_weeks' => [1, 1, 1, 1], 'hours' => 10, 'level' => 'beginner'],
            3 => ['name' => 'Lộ trình tiêu chuẩn', 'weeks' => 12, 'phase_weeks' => [2, 2, 2, 2, 2, 2], 'hours' => 6, 'level' => 'beginner'],
            6 => ['name' => 'Lộ trình chuyên sâu', 'weeks' => 24, 'phase_weeks' => [4, 4, 4, 4, 4, 4], 'hours' => 4, 'level' => 'intermediate'],
        ][$durationMonths];

        $modules = $durationMonths === 1
            ? [$blueprint['modules'][0], $blueprint['modules'][1], $blueprint['modules'][2], $blueprint['modules'][5]]
            : $blueprint['modules'];

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
                'tasks' => $this->buildTasks($module, $startWeek, $phaseWeeks, $durationMonths === 6),
            ];
            $startWeek = $endWeek + 1;
        }

        $durationLabel = $durationMonths . ' tháng';
        $code = $this->slugCode((string) $subject['subject_code']);
        $name = (string) $subject['subject_name'];

        return [
            'template_code' => "{$code}-{$durationMonths}M",
            'duration_months' => $durationMonths,
            'title' => "{$duration['name']} {$durationLabel}: {$name}",
            'overview' => "{$duration['name']} cho môn {$name}, tập trung vào {$blueprint['focus']}.",
            'goal' => "{$blueprint['goal']} Hoàn thành trong {$durationLabel} với sản phẩm hoặc bài kiểm tra cuối lộ trình.",
            'current_level' => $duration['level'],
            'total_weeks' => $duration['weeks'],
            'study_hours_per_week' => $duration['hours'],
            'completion_criteria' => $blueprint['completion'],
            'final_assessment' => $blueprint['final'],
            'reference_materials' => implode("\n", $blueprint['references']),
            'phases' => $phases,
        ];
    }

    private function buildTasks(array $module, int $startWeek, int $durationWeeks, bool $deep): array
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
                'completion_criteria' => 'Ghi chú được ý chính và giải thích lại bằng ví dụ cụ thể.',
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
                'priority' => 'medium',
            ],
        ];

        if ($deep) {
            $tasks[] = [
                'week_number' => $startWeek + $durationWeeks - 1,
                'title' => 'Mở rộng: ' . $module['topic'],
                'description' => $module['deep_dive'],
                'expected_result' => 'Có ghi chú mở rộng, bài học kinh nghiệm và điểm cần cải thiện.',
                'suggested_task' => $module['advanced_exercise'],
                'reference_materials' => $module['refs'],
                'completion_criteria' => 'Hoàn thành bài nâng cao và tự đánh giá theo tiêu chí.',
                'priority' => 'medium',
            ];
        }

        return $tasks;
    }

    private function domainBlueprint(array $subject): array
    {
        $code = strtoupper((string) $subject['subject_code']);
        $name = (string) $subject['subject_name'];
        $description = trim((string) ($subject['description'] ?? ''));

        $blueprints = $this->specificBlueprints();
        if (isset($blueprints[$code])) {
            return $blueprints[$code];
        }

        $focus = $description !== ''
            ? (function_exists('mb_strtolower') ? mb_strtolower($description, 'UTF-8') : strtolower($description))
            : "kiến thức cốt lõi và thực hành của môn {$name}";

        return [
            'focus' => $focus,
            'goal' => "Sinh viên nắm được nền tảng môn {$name}, thực hành các kỹ năng trọng tâm và hoàn thành bài đánh giá/sản phẩm cuối môn.",
            'completion' => "Hoàn thành ghi chú học tập, bài thực hành theo giai đoạn, bài ôn tập và sản phẩm/bài kiểm tra cuối môn {$name}.",
            'final' => "Nộp bài tổng hợp cuối môn {$name} gồm phần lý thuyết, thực hành và tự đánh giá kết quả học tập.",
            'references' => ["Giáo trình {$name}", 'Tài liệu giảng viên cung cấp', 'Nguồn tham khảo chính thống theo chủ đề'],
            'modules' => $this->genericModules($name),
        ];
    }

    private function genericModules(string $name): array
    {
        return [
            ['phase' => 'Tổng quan và nền tảng', 'topic' => "Khái niệm nền tảng của {$name}", 'learn' => "Học mục tiêu môn học, thuật ngữ chính và bức tranh tổng quan của {$name}.", 'outcome' => 'Tóm tắt được kiến thức nền và phạm vi môn học.', 'practice_title' => 'Mindmap kiến thức', 'practice' => 'Vẽ mindmap các chủ đề chính và câu hỏi cần làm rõ.', 'artifact' => 'Mindmap và danh sách câu hỏi.', 'exercise' => 'Viết 10 flashcard thuật ngữ quan trọng.', 'criteria' => 'Mindmap đủ chủ đề lớn và mô tả được từng nhánh.', 'deep_dive' => 'So sánh kiến thức nền với một tình huống thực tế.', 'advanced_exercise' => 'Tạo bảng thuật ngữ có ví dụ.', 'refs' => "Giáo trình {$name}"],
            ['phase' => 'Kỹ năng cốt lõi', 'topic' => "Kỹ năng trọng tâm của {$name}", 'learn' => 'Học quy trình, phương pháp và thao tác quan trọng nhất.', 'outcome' => 'Áp dụng được kỹ năng cốt lõi vào bài tập nhỏ.', 'practice_title' => 'Core practice', 'practice' => 'Hoàn thành bài thực hành cơ bản theo hướng dẫn.', 'artifact' => 'Bài thực hành có ghi chú.', 'exercise' => 'Tự giải thêm 3 bài tương tự.', 'criteria' => 'Kết quả đúng yêu cầu và giải thích được cách làm.', 'deep_dive' => 'Phân tích lỗi thường gặp khi thực hành.', 'advanced_exercise' => 'Tối ưu hoặc cải tiến lời giải.', 'refs' => 'Tài liệu bài lab'],
            ['phase' => 'Thực hành có hướng dẫn', 'topic' => 'Bài tập theo tình huống', 'learn' => 'Áp dụng kiến thức vào tình huống gần thực tế và ghi lại quyết định.', 'outcome' => 'Hoàn thành bài tập tình huống có minh chứng.', 'practice_title' => 'Guided case', 'practice' => 'Làm một case study nhỏ và ghi lại bước thực hiện.', 'artifact' => 'Báo cáo case study.', 'exercise' => 'Review kết quả với rubric.', 'criteria' => 'Có dữ kiện, cách xử lý và kết luận rõ ràng.', 'deep_dive' => 'Phân tích phương án thay thế.', 'advanced_exercise' => 'Mở rộng case với ràng buộc mới.', 'refs' => 'Case study mẫu'],
            ['phase' => 'Ôn tập và đánh giá giữa lộ trình', 'topic' => 'Củng cố kiến thức và phát hiện lỗ hổng', 'learn' => 'Ôn các chủ đề đã học, làm quiz và tổng hợp điểm chưa chắc.', 'outcome' => 'Có kế hoạch bổ sung kiến thức yếu.', 'practice_title' => 'Mid review', 'practice' => 'Làm bài kiểm tra ngắn và phân tích lỗi sai.', 'artifact' => 'Bảng lỗi sai và kế hoạch sửa.', 'exercise' => 'Ôn lại 5 điểm yếu quan trọng nhất.', 'criteria' => 'Chỉ ra nguyên nhân lỗi và hành động cải thiện.', 'deep_dive' => 'Tự tạo bộ câu hỏi ôn tập.', 'advanced_exercise' => 'Giải bài nâng cao theo chủ đề yếu.', 'refs' => 'Ngân hàng câu hỏi ôn tập'],
            ['phase' => 'Ứng dụng nâng cao', 'topic' => 'Mở rộng và liên hệ thực tế', 'learn' => 'Tìm hiểu cách kiến thức môn học được dùng trong bối cảnh thực tế.', 'outcome' => 'Đề xuất được giải pháp hoặc hướng ứng dụng.', 'practice_title' => 'Applied practice', 'practice' => 'Thực hiện bài ứng dụng nâng cao có yêu cầu mở.', 'artifact' => 'Sản phẩm/báo cáo ứng dụng.', 'exercise' => 'So sánh hai phương án giải quyết.', 'criteria' => 'Có lập luận lựa chọn phương án và đánh giá rủi ro.', 'deep_dive' => 'Liên hệ với môn học hoặc kỹ năng khác.', 'advanced_exercise' => 'Bổ sung tiêu chí chất lượng cho sản phẩm.', 'refs' => 'Nguồn tham khảo mở rộng'],
            ['phase' => "Sản phẩm cuối môn {$name}", 'topic' => "Tổng hợp môn {$name}", 'learn' => 'Tổng hợp kiến thức, hoàn thiện sản phẩm hoặc bài kiểm tra cuối môn.', 'outcome' => 'Có sản phẩm cuối môn và phần tự đánh giá.', 'practice_title' => 'Final capstone', 'practice' => 'Hoàn thành sản phẩm/bài tổng hợp theo rubric.', 'artifact' => 'Sản phẩm cuối môn.', 'exercise' => 'Trình bày kết quả và bài học kinh nghiệm.', 'criteria' => 'Đáp ứng rubric, có minh chứng và kế hoạch cải thiện tiếp theo.', 'deep_dive' => 'Đánh giá điểm mạnh/yếu của sản phẩm.', 'advanced_exercise' => 'Cải tiến sản phẩm sau phản hồi.', 'refs' => 'Rubric cuối môn'],
        ];
    }

    private function specificBlueprints(): array
    {
        return [
            'NET101' => [
                'focus' => 'mô hình mạng, TCP/IP, địa chỉ IP, định tuyến, bảo mật cơ bản và xử lý sự cố mạng',
                'goal' => 'Sinh viên hiểu cách dữ liệu truyền qua mạng, cấu hình được mạng nhỏ, phân tích được lỗi kết nối phổ biến và đọc được sơ đồ mạng cơ bản.',
                'completion' => 'Hoàn thành sơ đồ mạng, bảng địa chỉ IP, bài cấu hình dịch vụ cơ bản và báo cáo xử lý sự cố.',
                'final' => 'Thiết kế và mô phỏng một mạng LAN nhỏ có chia subnet, kiểm thử kết nối, dịch vụ DNS/DHCP cơ bản và checklist bảo mật.',
                'references' => ['Cisco Networking Basics', 'Computer Networking: A Top-Down Approach', 'Wireshark User Guide'],
                'modules' => [
                    ['phase' => 'Nền tảng mạng máy tính', 'topic' => 'Mô hình OSI/TCP-IP và thiết bị mạng', 'learn' => 'Phân biệt layer, vai trò switch/router/access point và luồng dữ liệu từ ứng dụng đến đường truyền.', 'outcome' => 'Giải thích được đường đi của gói tin trong một mạng nhỏ.', 'practice_title' => 'Vẽ sơ đồ mạng', 'practice' => 'Vẽ sơ đồ LAN gồm máy trạm, switch, router, internet và ghi vai trò từng thiết bị.', 'artifact' => 'Sơ đồ mạng có chú thích layer và thiết bị.', 'exercise' => 'So sánh OSI và TCP/IP bằng bảng 4 cột.', 'criteria' => 'Sơ đồ đúng vai trò thiết bị và mô tả được encapsulation cơ bản.', 'deep_dive' => 'Phân tích vì sao lỗi ở từng layer tạo triệu chứng khác nhau.', 'advanced_exercise' => 'Lập checklist chẩn đoán lỗi theo layer.', 'refs' => 'Cisco Networking Basics'],
                    ['phase' => 'Địa chỉ IP và subnet', 'topic' => 'IPv4, subnet mask, gateway và DNS', 'learn' => 'Tính network/broadcast/host range, chọn subnet mask và đặt gateway phù hợp.', 'outcome' => 'Chia subnet cho một mạng nhỏ không trùng địa chỉ.', 'practice_title' => 'Subnetting lab', 'practice' => 'Chia mạng cho 3 phòng học, mỗi phòng có số máy khác nhau.', 'artifact' => 'Bảng subnet có network, gateway, host range.', 'exercise' => 'Tính nhanh 8 bài subnet /24, /26, /27.', 'criteria' => 'Không nhầm network/broadcast và đủ số host yêu cầu.', 'deep_dive' => 'So sánh fixed-length và variable-length subnet.', 'advanced_exercise' => 'Thiết kế VLSM cho 5 phòng ban.', 'refs' => 'Subnetting practice workbook'],
                    ['phase' => 'Chuyển mạch và định tuyến', 'topic' => 'Switching, VLAN nhập môn và routing cơ bản', 'learn' => 'Hiểu MAC table, ARP, default route và cách router chuyển gói giữa subnet.', 'outcome' => 'Mô phỏng được kết nối giữa hai mạng con.', 'practice_title' => 'Routing simulation', 'practice' => 'Cấu hình hai subnet kết nối qua router trong Packet Tracer hoặc công cụ tương đương.', 'artifact' => 'File mô phỏng có ping thành công giữa subnet.', 'exercise' => 'Ghi lại bảng ARP và routing table trước/sau khi ping.', 'criteria' => 'Ping đúng hướng và giải thích được vai trò gateway.', 'deep_dive' => 'Phân tích broadcast domain và collision domain.', 'advanced_exercise' => 'Thêm VLAN và router-on-a-stick ở mức mô phỏng.', 'refs' => 'Cisco Packet Tracer Labs'],
                    ['phase' => 'Giao thức ứng dụng và dịch vụ mạng', 'topic' => 'DNS, DHCP, HTTP/HTTPS và email basics', 'learn' => 'Hiểu cách client nhận IP, phân giải tên miền và gửi request web.', 'outcome' => 'Kiểm tra được dịch vụ mạng cơ bản bằng công cụ dòng lệnh.', 'practice_title' => 'Service diagnostics', 'practice' => 'Dùng ping, ipconfig/ifconfig, nslookup, tracert/traceroute và curl để kiểm tra kết nối.', 'artifact' => 'Báo cáo chẩn đoán 4 tình huống dịch vụ.', 'exercise' => 'Mô tả quá trình mở một website từ nhập URL đến nhận response.', 'criteria' => 'Chỉ ra được bước DNS, TCP/TLS và HTTP ở mức khái niệm.', 'deep_dive' => 'Phân tích khác biệt giữa lỗi DNS, lỗi route và lỗi dịch vụ web.', 'advanced_exercise' => 'Tạo checklist troubleshooting cho không vào được website.', 'refs' => 'Wireshark User Guide'],
                    ['phase' => 'Bảo mật và giám sát cơ bản', 'topic' => 'Firewall, port, packet capture và rủi ro mạng', 'learn' => 'Nhận diện port phổ biến, nguyên tắc firewall tối thiểu và cách đọc packet capture đơn giản.', 'outcome' => 'Đưa ra khuyến nghị bảo mật cơ bản cho mạng nhỏ.', 'practice_title' => 'Packet capture', 'practice' => 'Bắt gói DNS/HTTP mẫu bằng Wireshark và ghi nhận trường thông tin chính.', 'artifact' => 'Ảnh/chụp kết quả capture có chú thích.', 'exercise' => 'Liệt kê 10 port phổ biến và rủi ro khi mở công khai.', 'criteria' => 'Phân biệt được port dịch vụ, rule firewall và rủi ro cấu hình.', 'deep_dive' => 'Phân tích mô hình defense-in-depth cho phòng lab.', 'advanced_exercise' => 'Đề xuất rule firewall tối thiểu cho mạng sinh viên.', 'refs' => 'OWASP Network Security Cheat Sheet'],
                    ['phase' => 'Dự án mạng cuối môn', 'topic' => 'Thiết kế, kiểm thử và báo cáo mạng nhỏ', 'learn' => 'Tổng hợp sơ đồ, địa chỉ IP, định tuyến, dịch vụ và checklist bảo mật thành một hồ sơ mạng.', 'outcome' => 'Hoàn thành mô hình mạng nhỏ có thể kiểm thử.', 'practice_title' => 'Network capstone', 'practice' => 'Thiết kế mạng cho lớp học/lab gồm nhiều nhóm máy, internet, DNS/DHCP và quy tắc bảo mật.', 'artifact' => 'Hồ sơ thiết kế mạng và file mô phỏng.', 'exercise' => 'Trình bày 5 lỗi mạng có thể xảy ra và cách kiểm tra.', 'criteria' => 'Có sơ đồ, subnet plan, kết quả ping/dịch vụ, capture mẫu và báo cáo rủi ro.', 'deep_dive' => 'Đánh giá khả năng mở rộng khi tăng số phòng hoặc số máy.', 'advanced_exercise' => 'Bổ sung phương án tách VLAN theo vai trò.', 'refs' => 'Cisco small network design examples'],
                ],
            ],
            'SKILL101' => [
                'focus' => 'giao tiếp, làm việc nhóm, quản lý thời gian, tư duy phản biện và trình bày trong môi trường học tập/dự án',
                'goal' => 'Sinh viên biết lập kế hoạch cá nhân, giao tiếp rõ ràng, phối hợp nhóm hiệu quả và trình bày kết quả học tập/dự án tự tin.',
                'completion' => 'Hoàn thành kế hoạch cá nhân, nhật ký teamwork, bài phản biện, slide trình bày và bản tự đánh giá năng lực mềm.',
                'final' => 'Thực hiện một bài trình bày nhóm hoặc cá nhân kèm portfolio minh chứng kỹ năng mềm đã rèn luyện.',
                'references' => ['Harvard ManageMentor communication resources', 'MindTools Time Management', 'Toastmasters Public Speaking Tips'],
                'modules' => [
                    ['phase' => 'Tự nhận thức và mục tiêu cá nhân', 'topic' => 'Điểm mạnh, điểm cần cải thiện và mục tiêu SMART', 'learn' => 'Nhận diện phong cách học/làm việc, đặt mục tiêu SMART và tiêu chí đo tiến bộ.', 'outcome' => 'Có kế hoạch phát triển cá nhân rõ ràng.', 'practice_title' => 'Personal skill audit', 'practice' => 'Tự đánh giá 5 kỹ năng mềm quan trọng và chọn 2 kỹ năng ưu tiên cải thiện.', 'artifact' => 'Bảng self-assessment và kế hoạch SMART.', 'exercise' => 'Viết mục tiêu SMART cho 4 tuần học tiếp theo.', 'criteria' => 'Mục tiêu đo được, có hạn chót và hành động cụ thể.', 'deep_dive' => 'Phân tích khoảng cách giữa tự đánh giá và phản hồi từ bạn học.', 'advanced_exercise' => 'Thu thập 3 phản hồi ẩn danh và cập nhật kế hoạch.', 'refs' => 'SMART goals guide'],
                    ['phase' => 'Quản lý thời gian và thói quen học tập', 'topic' => 'Ưu tiên, lịch học và chống trì hoãn', 'learn' => 'Dùng ma trận ưu tiên, time blocking và review tuần để kiểm soát công việc.', 'outcome' => 'Tạo lịch học/thực hành phù hợp và theo dõi được tiến độ.', 'practice_title' => 'Weekly planning', 'practice' => 'Lập kế hoạch tuần cho môn học, bài tập, nghỉ ngơi và review cuối tuần.', 'artifact' => 'Lịch tuần có ưu tiên và buffer.', 'exercise' => 'Theo dõi thời gian thực tế trong 5 ngày và so sánh với kế hoạch.', 'criteria' => 'Nhận diện được nguyên nhân lệch kế hoạch và cách điều chỉnh.', 'deep_dive' => 'Phân tích thói quen gây mất tập trung trong môi trường số.', 'advanced_exercise' => 'Thiết kế hệ thống nhắc việc cá nhân 2 tuần.', 'refs' => 'MindTools time management'],
                    ['phase' => 'Giao tiếp rõ ràng', 'topic' => 'Lắng nghe chủ động, đặt câu hỏi và phản hồi', 'learn' => 'Thực hành lắng nghe, tóm tắt ý, đặt câu hỏi mở và phản hồi không gây phòng thủ.', 'outcome' => 'Giao tiếp mạch lạc trong trao đổi học tập/nhóm.', 'practice_title' => 'Communication drill', 'practice' => 'Thực hiện một cuộc trao đổi nhóm và ghi lại cách đặt câu hỏi, tóm tắt, phản hồi.', 'artifact' => 'Biên bản giao tiếp có điểm tốt và điểm cần sửa.', 'exercise' => 'Viết lại 5 câu phản hồi tiêu cực thành phản hồi xây dựng.', 'criteria' => 'Thông điệp rõ mục đích, tôn trọng người nghe và có hành động tiếp theo.', 'deep_dive' => 'Phân tích rào cản giao tiếp khi làm việc online.', 'advanced_exercise' => 'Tạo checklist họp nhóm hiệu quả.', 'refs' => 'Active listening resources'],
                    ['phase' => 'Làm việc nhóm và xử lý xung đột', 'topic' => 'Vai trò nhóm, phân công, accountability và conflict resolution', 'learn' => 'Thiết lập kỳ vọng nhóm, phân vai, theo dõi cam kết và xử lý bất đồng dựa trên vấn đề.', 'outcome' => 'Tham gia nhóm có trách nhiệm và hỗ trợ tiến độ chung.', 'practice_title' => 'Team charter', 'practice' => 'Tạo team charter cho dự án nhỏ gồm mục tiêu, vai trò, quy tắc họp và cách xử lý trễ hạn.', 'artifact' => 'Team charter và bảng phân công.', 'exercise' => 'Mô phỏng một tình huống thành viên trễ deadline và đề xuất cách trao đổi.', 'criteria' => 'Giải pháp tập trung vào dữ kiện, trách nhiệm và hành động tiếp theo.', 'deep_dive' => 'Phân tích khác biệt giữa xung đột nhiệm vụ và xung đột cá nhân.', 'advanced_exercise' => 'Tạo retro board sau một sprint nhỏ.', 'refs' => 'Team charter templates'],
                    ['phase' => 'Tư duy phản biện và giải quyết vấn đề', 'topic' => 'Phân tích nguyên nhân, lập luận và ra quyết định', 'learn' => 'Dùng 5 Whys, evidence-based reasoning và so sánh phương án để ra quyết định.', 'outcome' => 'Trình bày được lập luận có bằng chứng và phản biện hợp lý.', 'practice_title' => 'Problem analysis', 'practice' => 'Chọn một vấn đề học tập/nhóm, phân tích nguyên nhân và đề xuất 3 phương án.', 'artifact' => 'Bảng phân tích vấn đề và quyết định.', 'exercise' => 'Viết phản biện ngắn cho một đề xuất chưa đủ bằng chứng.', 'criteria' => 'Có dữ kiện, giả định, tiêu chí lựa chọn và rủi ro.', 'deep_dive' => 'Nhận diện thiên kiến phổ biến trong quyết định nhóm.', 'advanced_exercise' => 'Tạo decision matrix có trọng số.', 'refs' => 'Critical thinking guides'],
                    ['phase' => 'Trình bày và portfolio cuối môn', 'topic' => 'Storyline, slide, thuyết trình và tự đánh giá', 'learn' => 'Xây dựng thông điệp chính, thiết kế slide gọn, luyện nói và xử lý câu hỏi.', 'outcome' => 'Trình bày tự tin và có portfolio minh chứng kỹ năng.', 'practice_title' => 'Final presentation', 'practice' => 'Chuẩn bị bài trình bày 5-7 phút về quá trình cải thiện kỹ năng mềm.', 'artifact' => 'Slide, script nói và portfolio minh chứng.', 'exercise' => 'Tập trình bày, nhận phản hồi và cải tiến ít nhất 2 vòng.', 'criteria' => 'Thông điệp rõ, slide dễ đọc, nói đúng thời lượng và trả lời câu hỏi phù hợp.', 'deep_dive' => 'Phân tích cách kể câu chuyện từ dữ liệu tự đánh giá.', 'advanced_exercise' => 'Quay video thuyết trình và tự chấm theo rubric.', 'refs' => 'Toastmasters public speaking tips'],
                ],
            ],
        ];
    }

    private function templateNeedsContent(int $templateId): bool
    {
        $counts = $this->fetchOne(
            'SELECT COUNT(DISTINCT p.id) AS phase_count, COUNT(t.id) AS task_count
             FROM roadmap_template_phases p
             LEFT JOIN roadmap_template_tasks t ON t.phase_id = p.id
             WHERE p.template_id = :template_id',
            ['template_id' => $templateId]
        ) ?: ['phase_count' => 0, 'task_count' => 0];

        return (int) $counts['phase_count'] === 0 || (int) $counts['task_count'] === 0;
    }

    private function uniqueTemplateCode(string $baseCode, int $subjectId): string
    {
        $existing = $this->fetchOne('SELECT id FROM roadmap_templates WHERE template_code = :code LIMIT 1', ['code' => $baseCode]);

        return $existing ? "{$baseCode}-S{$subjectId}" : $baseCode;
    }

    private function slugCode(string $value): string
    {
        $code = strtoupper(preg_replace('/[^A-Z0-9]+/i', '-', $value) ?? 'SUBJECT');
        $code = trim($code, '-');

        return $code !== '' ? $code : 'SUBJECT';
    }

    private function fetchOne(string $sql, array $params = []): ?array
    {
        $statement = $this->db->prepare($sql);
        $statement->execute($params);
        $row = $statement->fetch(PDO::FETCH_ASSOC);

        return $row ?: null;
    }

    private function fetchAll(string $sql, array $params = []): array
    {
        $statement = $this->db->prepare($sql);
        $statement->execute($params);

        return $statement->fetchAll(PDO::FETCH_ASSOC);
    }
}
