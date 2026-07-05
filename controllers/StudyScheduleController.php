<?php

class StudyScheduleController extends Controller
{
    private StudySchedule $schedule;

    public function __construct()
    {
        $this->schedule = new StudySchedule();
    }

    public function index(): void
    {
        $userId = $this->currentUserId();
        $schedules = $this->schedule->getAllForUser($userId, [
            'view' => $_GET['view'] ?? '',
            'date' => $_GET['date'] ?? '',
            'subject_id' => $_GET['subject_id'] ?? '',
            'status' => $_GET['status'] ?? '',
            'schedule_type' => $_GET['schedule_type'] ?? '',
        ]);

        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách lịch học thành công.',
            'data' => $schedules,
        ]);
    }

    public function show(string|int $id): void
    {
        $schedule = $this->schedule->findForUser((int) $id, $this->currentUserId());

        if ($schedule === null) {
            $this->notFound();
            return;
        }

        $this->json([
            'success' => true,
            'message' => 'Lấy chi tiết lịch học thành công.',
            'data' => $schedule,
        ]);
    }

    public function store(): void
    {
        $userId = $this->currentUserId();
        $data = $this->normalizeData($this->input());
        $data['user_id'] = $userId;
        $errors = $this->validateData($data);

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        if ($this->schedule->hasTimeConflict($userId, $data['study_date'], $data['start_time'], $data['end_time'])) {
            $this->timeConflict();
            return;
        }

        $scheduleId = $this->schedule->create($data);

        $this->json([
            'success' => true,
            'message' => 'Thêm lịch học thành công.',
            'data' => $this->schedule->findForUser($scheduleId, $userId),
        ], 201);
    }

    public function update(string|int $id): void
    {
        $scheduleId = (int) $id;
        $userId = $this->currentUserId();
        $existingSchedule = $this->schedule->findForUser($scheduleId, $userId);

        if ($existingSchedule === null) {
            $this->notFound();
            return;
        }

        $data = $this->normalizeData($this->input(), $existingSchedule);
        $data['user_id'] = $userId;
        $errors = $this->validateData($data);

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        if ($this->schedule->hasTimeConflict($userId, $data['study_date'], $data['start_time'], $data['end_time'], $scheduleId)) {
            $this->timeConflict();
            return;
        }

        $this->schedule->update($scheduleId, $userId, $data);

        $this->json([
            'success' => true,
            'message' => 'Cập nhật lịch học thành công.',
            'data' => $this->schedule->findForUser($scheduleId, $userId),
        ]);
    }

    public function destroy(string|int $id): void
    {
        $scheduleId = (int) $id;
        $userId = $this->currentUserId();

        if ($this->schedule->findForUser($scheduleId, $userId) === null) {
            $this->notFound();
            return;
        }

        $this->schedule->deleteForUser($scheduleId, $userId);

        $this->json([
            'success' => true,
            'message' => 'Xóa lịch học thành công.',
        ]);
    }

    private function normalizeData(array $input, ?array $current = null): array
    {
        return [
            'subject_id' => trim((string) ($input['subject_id'] ?? $current['subject_id'] ?? '')),
            'title' => trim((string) ($input['title'] ?? $current['title'] ?? '')),
            'description' => trim((string) ($input['description'] ?? $current['description'] ?? '')),
            'study_date' => trim((string) ($input['study_date'] ?? $current['study_date'] ?? '')),
            'start_time' => trim((string) ($input['start_time'] ?? $current['start_time'] ?? '')),
            'end_time' => trim((string) ($input['end_time'] ?? $current['end_time'] ?? '')),
            'location' => trim((string) ($input['location'] ?? $current['location'] ?? '')),
            'schedule_type' => trim((string) ($input['schedule_type'] ?? $current['schedule_type'] ?? 'self_study')),
            'status' => trim((string) ($input['status'] ?? $current['status'] ?? 'upcoming')),
        ];
    }

    private function validateData(array $data): array
    {
        $errors = StudyScheduleValidation::validate($data);

        if (! isset($errors['subject_id']) && ! $this->schedule->subjectExists((int) $data['subject_id'])) {
            $errors['subject_id'] = 'Môn học không tồn tại hoặc đã bị xóa.';
        }

        return $errors;
    }

    private function currentUserId(): int
    {
        $user = $this->currentUser();

        return (int) ($user['id'] ?? 0);
    }

    private function validationFailed(array $errors): void
    {
        $this->json([
            'success' => false,
            'message' => 'Dữ liệu không hợp lệ.',
            'errors' => $errors,
        ], 422);
    }

    private function timeConflict(): void
    {
        $this->json([
            'success' => false,
            'message' => 'Thời gian học bị trùng với lịch học đã tồn tại.',
            'errors' => [
                'time' => 'Bạn đã có lịch học trong khoảng thời gian này.',
            ],
        ], 422);
    }

    private function notFound(): void
    {
        $this->json([
            'success' => false,
            'message' => 'Không tìm thấy lịch học hoặc bạn không có quyền truy cập.',
            'errors' => [],
        ], 404);
    }
}
