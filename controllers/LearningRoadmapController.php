<?php

class LearningRoadmapController extends Controller
{
    private LearningRoadmap $roadmap;
    private LearningRoadmapItem $item;
    private LearningGoal $learningGoal;

    public function __construct()
    {
        $this->roadmap = new LearningRoadmap();
        $this->item = new LearningRoadmapItem();
        $this->learningGoal = new LearningGoal();
    }

    public function store(): void
    {
        $studentId = $this->currentUserId();
        $input = $this->input();
        $data = $this->normalizeRoadmapData($input);
        $data['user_id'] = $studentId;
        $data['items'] = $input['items'] ?? [];

        $errors = $this->validateContext($data, $studentId, true, true);
        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        $data['items'] = LearningRoadmapValidation::normalizeItems($data['items']);
        $conflicts = $this->roadmap->findScheduleConflicts($studentId, $data, $data['items']);
        if ($conflicts !== []) {
            $this->scheduleConflict($conflicts);
            return;
        }

        $roadmapId = $this->roadmap->createWithItems($data, $data['items']);

        $this->json([
            'success' => true,
            'message' => 'Chấp nhận lộ trình học thành công. Các nhiệm vụ đã được thêm vào lịch học cá nhân.',
            'data' => $this->roadmapWithItems($roadmapId, $studentId),
        ], 201);
    }

    public function index(): void
    {
        $roadmaps = $this->roadmap->getForStudent($this->currentUserId(), [
            'keyword' => trim((string) ($_GET['keyword'] ?? '')),
            'status' => trim((string) ($_GET['status'] ?? '')),
        ]);

        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách lộ trình học thành công.',
            'data' => $roadmaps,
        ]);
    }

    public function show(string|int $id): void
    {
        $roadmap = $this->roadmapWithItems((int) $id, $this->currentUserId());

        if ($roadmap === null) {
            $this->notFound();
            return;
        }

        $this->json([
            'success' => true,
            'message' => 'Lấy chi tiết lộ trình học thành công.',
            'data' => $roadmap,
        ]);
    }

    public function progress(string|int $id): void
    {
        $studentId = $this->currentUserId();
        $roadmapId = (int) $id;
        $roadmap = $this->roadmap->findForStudent($roadmapId, $studentId);

        if ($roadmap === null) {
            $this->notFound();
            return;
        }

        $this->roadmap->recalculateProgress($roadmapId);

        $this->json([
            'success' => true,
            'message' => 'Lấy tiến độ lộ trình học thành công.',
            'data' => [
                ...$this->roadmap->getProgressSummary($roadmapId),
                'roadmap_status' => $roadmap['status'],
            ],
        ]);
    }

    public function update(string|int $id): void
    {
        $studentId = $this->currentUserId();
        $roadmapId = (int) $id;
        $current = $this->roadmap->findForStudent($roadmapId, $studentId);

        if ($current === null) {
            $this->notFound();
            return;
        }

        $input = $this->input();
        $data = $this->normalizeRoadmapData($input, $current);
        $data['user_id'] = $studentId;
        $items = array_key_exists('items', $input) ? ($input['items'] ?? []) : null;
        if (is_array($items)) {
            $data['items'] = $items;
        }

        $errors = $this->validateContext($data, $studentId, is_array($items), true);
        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        $normalizedItems = is_array($items) ? LearningRoadmapValidation::normalizeItems($items) : null;
        if ($normalizedItems !== null) {
            $conflicts = $this->roadmap->findScheduleConflicts($studentId, ['id' => $roadmapId, ...$data], $normalizedItems);
            if ($conflicts !== []) {
                $this->scheduleConflict($conflicts);
                return;
            }
        }

        $this->roadmap->updateWithItems($roadmapId, $studentId, $data, $normalizedItems);

        $this->json([
            'success' => true,
            'message' => 'Cập nhật lộ trình học thành công.',
            'data' => $this->roadmapWithItems($roadmapId, $studentId),
        ]);
    }

    public function destroy(string|int $id): void
    {
        if (! $this->roadmap->delete((int) $id, $this->currentUserId())) {
            $this->notFound();
            return;
        }

        $this->json([
            'success' => true,
            'message' => 'Xóa lộ trình học thành công.',
        ]);
    }

    public function updateItemStatus(string|int $id): void
    {
        $studentId = $this->currentUserId();
        $item = $this->item->findForStudent((int) $id, $studentId);

        if ($item === null) {
            $this->json([
                'success' => false,
                'message' => 'Không tìm thấy bước học hoặc bạn không có quyền cập nhật.',
                'errors' => [],
            ], 404);
            return;
        }

        $data = $this->input();
        $errors = LearningRoadmapValidation::validateItemStatus($data);
        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        $this->item->updateStatus((int) $id, $studentId, trim((string) $data['status']));
        $progress = $this->roadmap->recalculateProgress((int) $item['roadmap_id']);
        $summary = $this->roadmap->getProgressSummary((int) $item['roadmap_id']);

        $this->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái bước học thành công.',
            'data' => [
                'item' => $this->item->findForStudent((int) $id, $studentId),
                'progress_percent' => $progress,
                'total_items' => $summary['total_items'],
                'completed_items' => $summary['completed_items'],
                'is_completed' => $summary['is_completed'],
                'roadmap_status_suggestion' => $summary['is_completed'] ? 'completed' : null,
                'summary' => $summary,
            ],
        ]);
    }

    public function updateItemResult(string|int $id): void
    {
        $studentId = $this->currentUserId();
        $item = $this->item->findForStudent((int) $id, $studentId);

        if ($item === null) {
            $this->itemNotFound();
            return;
        }

        $data = $this->normalizeItemResultData($this->input());
        $errors = $this->validateItemResult($data);
        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        if ((float) $data['completion_percent'] >= 100) {
            $data['status'] = 'completed';
            $data['completion_percent'] = 100;
        }

        $this->item->updateResult((int) $id, $studentId, $data);
        $progress = $this->roadmap->recalculateProgress((int) $item['roadmap_id']);
        $summary = $this->roadmap->getProgressSummary((int) $item['roadmap_id']);

        $this->json([
            'success' => true,
            'message' => 'Cập nhật kết quả học tập thành công.',
            'data' => [
                'item' => $this->item->findForStudent((int) $id, $studentId),
                'progress_percent' => $progress,
                'summary' => $summary,
            ],
        ]);
    }

    public function rescheduleItem(string|int $id): void
    {
        $studentId = $this->currentUserId();
        $item = $this->item->findForStudent((int) $id, $studentId);

        if ($item === null) {
            $this->itemNotFound();
            return;
        }

        $data = $this->normalizeItemScheduleData($this->input(), $item);
        $errors = $this->validateItemSchedule($data);
        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        $schedule = new StudySchedule();
        $endTime = $this->addMinutesToTime($data['start_time'], (int) $data['duration_minutes']);
        $scheduleId = ! empty($item['schedule_id']) ? (int) $item['schedule_id'] : null;
        if ($schedule->hasTimeConflict($studentId, $data['planned_date'], $data['start_time'], $endTime, $scheduleId)) {
            $this->scheduleConflict([[
                'item_id' => (int) $id,
                'title' => $item['title'],
                'planned_date' => $data['planned_date'],
                'start_time' => $data['start_time'],
                'end_time' => $endTime,
                'reason' => 'Trùng với lịch học đã có.',
                'suggestions' => $schedule->suggestAvailableSlots($studentId, $data['planned_date'], (int) $data['duration_minutes'], $data['start_time'], $scheduleId),
            ]]);
            return;
        }

        $this->item->updateSchedule((int) $id, $studentId, $data);

        $scheduleData = [
            'user_id' => $studentId,
            'subject_id' => (int) $item['subject_id'],
            'title' => $item['title'],
            'description' => $item['description'] ?? '',
            'study_date' => $data['planned_date'],
            'start_time' => $data['start_time'],
            'end_time' => $endTime,
            'location' => '',
            'schedule_type' => 'self_study',
            'status' => 'upcoming',
            'roadmap_id' => (int) $item['roadmap_id'],
            'roadmap_item_id' => (int) $id,
            'reminder_minutes_before' => (int) ($item['reminder_minutes_before'] ?? 15),
        ];

        if ($scheduleId !== null && $schedule->findForUser($scheduleId, $studentId) !== null) {
            $schedule->update($scheduleId, $studentId, $scheduleData);
        } else {
            $newScheduleId = $schedule->create($scheduleData);
            $this->item->updateScheduleId((int) $id, $newScheduleId);
        }

        $this->json([
            'success' => true,
            'message' => 'Dời lịch nhiệm vụ học thành công.',
            'data' => [
                'item' => $this->item->findForStudent((int) $id, $studentId),
                'summary' => $this->roadmap->getProgressSummary((int) $item['roadmap_id']),
            ],
        ]);
    }

    private function normalizeRoadmapData(array $input, ?array $current = null): array
    {
        $availableWeekdays = $input['available_weekdays'] ?? $current['available_weekdays'] ?? [];
        $preferredStartTime = LearningRoadmapValidation::normalizeTime((string) ($input['preferred_start_time'] ?? $current['preferred_start_time'] ?? '08:00'));

        return [
            'subject_id' => trim((string) ($input['subject_id'] ?? $current['subject_id'] ?? '')),
            'learning_goal_id' => trim((string) ($input['learning_goal_id'] ?? $current['learning_goal_id'] ?? '')),
            'title' => trim((string) ($input['title'] ?? $current['title'] ?? '')),
            'overview' => trim((string) ($input['overview'] ?? $current['overview'] ?? '')),
            'goal' => trim((string) ($input['goal'] ?? $current['goal'] ?? '')),
            'current_level' => trim((string) ($input['current_level'] ?? $current['current_level'] ?? 'beginner')),
            'study_time_per_day' => trim((string) ($input['study_time_per_day'] ?? $current['study_time_per_day'] ?? '')),
            'available_weekdays' => LearningRoadmapValidation::normalizeWeekdays($availableWeekdays),
            'preferred_start_time' => $preferredStartTime,
            'session_duration_minutes' => trim((string) ($input['session_duration_minutes'] ?? $current['session_duration_minutes'] ?? '60')),
            'max_daily_minutes' => trim((string) ($input['max_daily_minutes'] ?? $current['max_daily_minutes'] ?? '')),
            'max_weekly_minutes' => trim((string) ($input['max_weekly_minutes'] ?? $current['max_weekly_minutes'] ?? '')),
            'reminder_minutes_before' => trim((string) ($input['reminder_minutes_before'] ?? $current['reminder_minutes_before'] ?? '15')),
            'start_date' => trim((string) ($input['start_date'] ?? $current['start_date'] ?? '')),
            'end_date' => trim((string) ($input['end_date'] ?? $current['end_date'] ?? '')),
            'generated_by_ai' => filter_var($input['generated_by_ai'] ?? $current['generated_by_ai'] ?? false, FILTER_VALIDATE_BOOLEAN),
            'ai_prompt' => trim((string) ($input['ai_prompt'] ?? $current['ai_prompt'] ?? '')),
            'ai_raw_response' => trim((string) ($input['ai_raw_response'] ?? $current['ai_raw_response'] ?? '')),
            'status' => trim((string) ($input['status'] ?? $current['status'] ?? 'active')),
            'progress_percent' => $current['progress_percent'] ?? 0,
        ];
    }

    private function mergeLearningGoalData(array &$data, int $studentId): void
    {
        if ($data['learning_goal_id'] === '') {
            return;
        }

        $goal = $this->learningGoal->findForStudent((int) $data['learning_goal_id'], $studentId);
        if ($goal === null) {
            return;
        }

        $data['subject_id'] = $data['subject_id'] !== '' ? $data['subject_id'] : (string) $goal['subject_id'];
        $data['goal'] = $data['goal'] !== '' ? $data['goal'] : (string) $goal['goal_description'];
        $data['current_level'] = $data['current_level'] !== '' ? $data['current_level'] : (string) $goal['current_level'];
        $data['study_time_per_day'] = $data['study_time_per_day'] !== '' ? $data['study_time_per_day'] : (string) $goal['study_time_per_day'];
        $data['start_date'] = $data['start_date'] !== '' ? $data['start_date'] : (string) $goal['start_date'];
        $data['end_date'] = $data['end_date'] !== '' ? $data['end_date'] : (string) $goal['end_date'];
    }

    private function validateContext(array &$data, int $studentId, bool $requireItems, bool $forSave): array
    {
        $errors = $forSave
            ? LearningRoadmapValidation::validateSave($data, $requireItems)
            : LearningRoadmapValidation::validateGenerate($data);

        if (! isset($errors['subject_id']) && $this->roadmap->findAssignedSubject((int) $data['subject_id'], $studentId) === null) {
            $errors['subject_id'] = 'Môn học không tồn tại hoặc bạn chưa được gán vào môn học này.';
        }

        if ($data['learning_goal_id'] !== '') {
            $goal = $this->learningGoal->findForStudent((int) $data['learning_goal_id'], $studentId);
            if ($goal === null) {
                $errors['learning_goal_id'] = 'Mục tiêu học tập không tồn tại hoặc không thuộc tài khoản của bạn.';
            } elseif (! isset($errors['subject_id']) && (int) $goal['subject_id'] !== (int) $data['subject_id']) {
                $errors['learning_goal_id'] = 'Mục tiêu học tập không thuộc môn học đã chọn.';
            }
        }

        if (! isset($errors['start_date'])) {
            $data['start_date'] = LearningRoadmapValidation::normalizeDate($data['start_date']);
        }

        if (! isset($errors['end_date'])) {
            $data['end_date'] = LearningRoadmapValidation::normalizeDate($data['end_date']);
        }

        return $errors;
    }

    private function roadmapWithItems(int $roadmapId, int $studentId): ?array
    {
        $roadmap = $this->roadmap->findForStudent($roadmapId, $studentId);
        if ($roadmap === null) {
            return null;
        }

        $roadmap['items'] = $this->item->getForRoadmap($roadmapId, $studentId);

        return $roadmap;
    }

    private function normalizeItemResultData(array $input): array
    {
        return [
            'status' => trim((string) ($input['status'] ?? 'in_progress')),
            'completion_percent' => min(100, max(0, (float) ($input['completion_percent'] ?? 0))),
            'learned_content' => trim((string) ($input['learned_content'] ?? '')),
            'unfinished_content' => trim((string) ($input['unfinished_content'] ?? '')),
            'note' => trim((string) ($input['note'] ?? '')),
            'self_assessment' => trim((string) ($input['self_assessment'] ?? '')),
            'actual_study_minutes' => trim((string) ($input['actual_study_minutes'] ?? '')),
        ];
    }

    private function validateItemResult(array $data): array
    {
        $errors = LearningRoadmapValidation::validateItemStatus($data);

        if (! is_numeric($data['completion_percent']) || (float) $data['completion_percent'] < 0 || (float) $data['completion_percent'] > 100) {
            $errors['completion_percent'] = 'Tỷ lệ hoàn thành phải từ 0 đến 100.';
        }

        if ($data['self_assessment'] !== '' && (! ctype_digit($data['self_assessment']) || (int) $data['self_assessment'] < 1 || (int) $data['self_assessment'] > 5)) {
            $errors['self_assessment'] = 'Mức độ hiểu bài phải từ 1 đến 5.';
        }

        if ($data['actual_study_minutes'] !== '' && (! ctype_digit($data['actual_study_minutes']) || (int) $data['actual_study_minutes'] < 0)) {
            $errors['actual_study_minutes'] = 'Tổng thời gian đã học không hợp lệ.';
        }

        return $errors;
    }

    private function normalizeItemScheduleData(array $input, array $current): array
    {
        return [
            'planned_date' => trim((string) ($input['planned_date'] ?? $current['planned_date'] ?? '')),
            'start_time' => LearningRoadmapValidation::normalizeTime((string) ($input['start_time'] ?? $current['start_time'] ?? '')),
            'duration_minutes' => max(15, (int) ($input['duration_minutes'] ?? $current['duration_minutes'] ?? 60)),
            'status' => trim((string) ($input['status'] ?? 'rescheduled')),
        ];
    }

    private function validateItemSchedule(array $data): array
    {
        $errors = [];
        try {
            new DateTimeImmutable($data['planned_date']);
        } catch (Throwable) {
            $errors['planned_date'] = 'Ngày học không hợp lệ.';
        }

        if ($data['start_time'] === '') {
            $errors['start_time'] = 'Giờ bắt đầu không hợp lệ.';
        }

        if ((int) $data['duration_minutes'] < 15) {
            $errors['duration_minutes'] = 'Thời lượng học phải từ 15 phút trở lên.';
        }

        if (! in_array($data['status'], ['not_started', 'in_progress', 'rescheduled'], true)) {
            $errors['status'] = 'Trạng thái sau khi dời lịch không hợp lệ.';
        }

        return $errors;
    }

    private function addMinutesToTime(string $time, int $minutes): string
    {
        return $this->minutesToTime($this->timeToMinutes($time) + max(0, $minutes));
    }

    private function timeToMinutes(string $time): int
    {
        [$hour, $minute] = array_map('intval', array_slice(explode(':', $time), 0, 2));

        return ($hour * 60) + $minute;
    }

    private function minutesToTime(int $minutes): string
    {
        $minutes = max(0, min(23 * 60 + 59, $minutes));

        return sprintf('%02d:%02d', intdiv($minutes, 60), $minutes % 60);
    }

    private function currentUserId(): int
    {
        $user = $this->currentUser();

        return (int) ($user['id'] ?? 0);
    }

    private function notFound(): void
    {
        $this->json([
            'success' => false,
            'message' => 'Không tìm thấy lộ trình học hoặc bạn không có quyền truy cập.',
            'errors' => [],
        ], 404);
    }

    private function itemNotFound(): void
    {
        $this->json([
            'success' => false,
            'message' => 'Không tìm thấy nhiệm vụ học hoặc bạn không có quyền cập nhật.',
            'errors' => [],
        ], 404);
    }

    private function scheduleConflict(array $conflicts): void
    {
        $this->json([
            'success' => false,
            'message' => 'Một số nhiệm vụ bị trùng lịch học. Vui lòng chọn khung giờ gợi ý hoặc chỉnh lại lộ trình.',
            'errors' => [
                'schedule_conflicts' => $conflicts,
            ],
        ], 409);
    }

    private function validationFailed(array $errors): void
    {
        $this->json([
            'success' => false,
            'message' => 'Dữ liệu không hợp lệ.',
            'errors' => $errors,
        ], 422);
    }
}
