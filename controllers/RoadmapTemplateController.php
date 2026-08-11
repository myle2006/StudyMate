<?php

class RoadmapTemplateController extends Controller
{
    private RoadmapTemplate $templates;

    public function __construct()
    {
        $this->templates = new RoadmapTemplate();
    }

    public function studentIndex(): void
    {
        $subjectId = isset($_GET['subject_id']) ? (int) $_GET['subject_id'] : null;

        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách lộ trình mẫu thành công.',
            'data' => $this->templates->getForAssignedSubjects($this->currentUserId(), $subjectId),
        ]);
    }

    public function adminIndex(): void
    {
        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách lộ trình mẫu cho admin thành công.',
            'data' => $this->templates->getAll([
                'subject_id' => $_GET['subject_id'] ?? '',
                'status' => $_GET['status'] ?? 'active',
            ]),
        ]);
    }

    private function currentUserId(): int
    {
        $user = $this->currentUser();

        return (int) ($user['id'] ?? 0);
    }
}
