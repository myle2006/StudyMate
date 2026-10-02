<?php

class StudentSubjectController extends Controller
{
    private StudentSubject $studentSubject;
    private SubjectClass $subjectClass;

    public function __construct()
    {
        $this->studentSubject = new StudentSubject();
        $this->subjectClass = new SubjectClass();
    }

    public function mySubjects(): void
    {
        $subjects = $this->studentSubject->getMySubjects($this->currentUserId(), [
            'keyword' => trim((string) ($_GET['keyword'] ?? '')),
            'status' => trim((string) ($_GET['status'] ?? '')),
        ]);

        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách môn học của tôi thành công.',
            'data' => $subjects,
        ]);
    }

    public function mySubjectDetail(string|int $subjectId): void
    {
        $subjectId = (int) $subjectId;
        $errors = StudentSubjectValidation::validateSubjectId($subjectId);

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        if (! $this->studentSubject->subjectExists($subjectId)) {
            $this->json([
                'success' => false,
                'message' => 'Không tìm thấy môn học.',
                'errors' => [],
            ], 404);
            return;
        }

        $subject = $this->studentSubject->findMySubject($this->currentUserId(), $subjectId);

        if ($subject === null) {
            $this->forbidden();
            return;
        }

        $this->json([
            'success' => true,
            'message' => 'Lấy chi tiết môn học của tôi thành công.',
            'data' => $subject,
        ]);
    }

    public function index(string|int $subjectId): void
    {
        $subjectId = (int) $subjectId;
        if (! $this->validSubject($subjectId)) {
            return;
        }

        $students = $this->studentSubject->getAssignedStudents($subjectId, [
            'keyword' => trim((string) ($_GET['keyword'] ?? '')),
            'class_id' => trim((string) ($_GET['class_id'] ?? '')),
        ]);

        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách sinh viên trong môn học thành công.',
            'data' => $students,
        ]);
    }

    public function classes(string|int $subjectId): void
    {
        $subjectId = (int) $subjectId;
        if (! $this->validSubject($subjectId)) {
            return;
        }

        $this->subjectClass->ensureDefaultForSubject($subjectId, $this->currentUserId());
        $classes = $this->subjectClass->getForSubject($subjectId);

        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách lớp thành công.',
            'data' => $classes,
        ]);
    }

    public function storeClass(string|int $subjectId): void
    {
        $subjectId = (int) $subjectId;
        if (! $this->validSubject($subjectId)) {
            return;
        }

        $input = $this->input();
        $classCode = strtoupper(trim((string) ($input['class_code'] ?? '')));
        $className = trim((string) ($input['class_name'] ?? ''));
        $errors = [];

        if ($classCode === '') {
            $errors['class_code'] = 'Mã lớp là bắt buộc.';
        } elseif (strlen($classCode) > 50) {
            $errors['class_code'] = 'Mã lớp không được vượt quá 50 ký tự.';
        } elseif ($this->subjectClass->codeExists($subjectId, $classCode)) {
            $errors['class_code'] = 'Mã lớp đã tồn tại trong môn học này.';
        }

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        $classId = $this->subjectClass->create($subjectId, $classCode, $className, $this->currentUserId());

        $this->json([
            'success' => true,
            'message' => 'Tạo lớp thành công.',
            'data' => $this->subjectClass->findById($classId),
        ], 201);
    }

    public function availableStudents(string|int $subjectId): void
    {
        $subjectId = (int) $subjectId;
        if (! $this->validSubject($subjectId)) {
            return;
        }

        $students = $this->studentSubject->getAvailableStudents($subjectId, [
            'keyword' => trim((string) ($_GET['keyword'] ?? '')),
        ]);

        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách sinh viên có thể gán thành công.',
            'data' => $students,
        ]);
    }

    public function store(string|int $subjectId): void
    {
        $subjectId = (int) $subjectId;
        if (! $this->validSubject($subjectId)) {
            return;
        }

        $data = $this->input();
        $errors = StudentSubjectValidation::validateAssign($data);

        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        $studentId = (int) $data['student_id'];
        $classId = (int) $data['class_id'];

        if (! $this->subjectClass->belongsToSubject($classId, $subjectId)) {
            $this->validationFailed(['class_id' => 'Lớp không thuộc môn học này hoặc đã bị khóa.']);
            return;
        }

        if (! $this->studentSubject->studentExists($studentId)) {
            $this->validationFailed(['student_id' => 'Sinh viên không tồn tại hoặc không ở trạng thái active.']);
            return;
        }

        $currentUser = $this->currentUser();
        $result = $this->studentSubject->assignStudent($subjectId, $studentId, (int) ($currentUser['id'] ?? 0), $classId);

        if ($result['duplicate']) {
            $activeClass = trim((string) ($result['active_class_code'] ?? ''));
            $classMessage = $activeClass !== '' ? ' Sinh viên hiện đang ở lớp ' . $activeClass . '.' : '';
            $this->json([
                'success' => false,
                'message' => 'Sinh viên đã được gán active vào môn học này.' . $classMessage,
                'errors' => ['student_id' => 'Mỗi sinh viên chỉ được active ở một lớp trong cùng một môn học.'],
            ], 409);
            return;
        }

        $assignment = $this->studentSubject->findActiveAssignment($subjectId, $studentId, $classId);

        $this->json([
            'success' => true,
            'message' => $result['reactivated']
                ? 'Gán lại sinh viên vào môn học thành công.'
                : 'Gán sinh viên vào môn học thành công.',
            'data' => $assignment,
        ], 201);
    }

    public function destroy(string|int $subjectId, string|int $studentId): void
    {
        $subjectId = (int) $subjectId;
        $studentId = (int) $studentId;

        if (! $this->validSubject($subjectId)) {
            return;
        }

        $errors = StudentSubjectValidation::validateStudentId($studentId);
        if ($errors !== []) {
            $this->validationFailed($errors);
            return;
        }

        $classId = isset($_GET['class_id']) && ctype_digit((string) $_GET['class_id']) ? (int) $_GET['class_id'] : null;
        if (! $this->studentSubject->removeStudent($subjectId, $studentId, $classId)) {
            $this->json([
                'success' => false,
                'message' => 'Không tìm thấy sinh viên đang được gán trong môn học này.',
                'errors' => [],
            ], 404);
            return;
        }

        $this->json([
            'success' => true,
            'message' => 'Xóa sinh viên khỏi môn học thành công.',
        ]);
    }

    private function validSubject(int $subjectId): bool
    {
        $errors = StudentSubjectValidation::validateSubjectId($subjectId);

        if ($errors !== []) {
            $this->validationFailed($errors);
            return false;
        }

        if (! $this->studentSubject->subjectExists($subjectId)) {
            $this->json([
                'success' => false,
                'message' => 'Không tìm thấy môn học.',
                'errors' => [],
            ], 404);
            return false;
        }

        return true;
    }

    private function validationFailed(array $errors): void
    {
        $this->json([
            'success' => false,
            'message' => 'Dữ liệu không hợp lệ.',
            'errors' => $errors,
        ], 422);
    }

    private function forbidden(): void
    {
        $this->json([
            'success' => false,
            'message' => 'Bạn không có quyền xem môn học này.',
            'errors' => [],
        ], 403);
    }

    private function currentUserId(): int
    {
        $user = $this->currentUser();

        return (int) ($user['id'] ?? 0);
    }
}
