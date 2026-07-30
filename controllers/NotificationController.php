<?php

class NotificationController extends Controller
{
    private NotificationService $notifications;

    public function __construct()
    {
        $this->notifications = new NotificationService();
    }

    public function index(): void
    {
        $user = $this->currentUser() ?? [];

        $this->json([
            'success' => true,
            'message' => 'Lấy danh sách thông báo thành công.',
            'data' => $this->notifications->listForUser($user, [
                'status' => trim((string) ($_GET['status'] ?? '')),
            ]),
            'unread_count' => $this->notifications->unreadCount($user),
        ]);
    }

    public function unreadCount(): void
    {
        $this->json([
            'success' => true,
            'message' => 'Lấy số thông báo chưa đọc thành công.',
            'data' => [
                'unread_count' => $this->notifications->unreadCount($this->currentUser() ?? []),
            ],
        ]);
    }

    public function markRead(): void
    {
        $key = trim((string) ($this->input()['notification_key'] ?? ''));

        if ($key === '') {
            $this->json([
                'success' => false,
                'message' => 'Thiếu mã thông báo.',
                'errors' => ['notification_key' => 'Mã thông báo là bắt buộc.'],
            ], 422);
            return;
        }

        $this->notifications->markRead((int) (($this->currentUser() ?? [])['id'] ?? 0), $key);

        $this->json([
            'success' => true,
            'message' => 'Đã đánh dấu thông báo là đã đọc.',
        ]);
    }

    public function markAllRead(): void
    {
        $count = $this->notifications->markAllRead($this->currentUser() ?? []);

        $this->json([
            'success' => true,
            'message' => 'Đã đánh dấu tất cả thông báo là đã đọc.',
            'data' => ['marked_count' => $count],
        ]);
    }
}
