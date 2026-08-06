<?php

class HomeController extends Controller
{
    public function index(): void
    {
        $model = new HomeModel();

        $this->view('home.index', [
            'title' => 'StudyMate - Dashboard học tập cá nhân cho sinh viên',
            'description' => 'StudyMate giúp quản lý môn học, bài tập, lịch học, lộ trình, thông báo deadline, bài học và báo cáo học tập.',
            'pageData' => $model->getLandingPageData(),
        ]);
    }

    public function login(): void
    {
        $this->reactApp('Đăng nhập - StudyMate AI');
    }

    public function register(): void
    {
        $this->reactApp('Đăng ký - StudyMate AI');
    }

    public function preview(): void
    {
        $this->reactApp('Dùng thử nhanh - StudyMate AI');
    }

    public function dashboard(): void
    {
        $this->reactApp('Dashboard - StudyMate AI');
    }

    public function subjects(): void
    {
        $this->reactApp('Môn học - StudyMate AI');
    }

    public function admin(): void
    {
        $this->reactApp('Quản trị - StudyMate AI');
    }

    public function reactApp(string $title = 'StudyMate AI'): void
    {
        $this->view('react.app', [
            'title' => $title,
            'description' => 'StudyMate - nền tảng quản lý học tập cá nhân cho sinh viên.',
        ], '');
    }

    private function comingSoon(string $heading, string $message): void
    {
        $this->view('pages.coming-soon', [
            'title' => $heading . ' - StudyMate AI',
            'description' => $message,
            'heading' => $heading,
            'message' => $message,
        ]);
    }
}
