<?php

class HomeController extends Controller
{
    public function index(): void
    {
        $model = new HomeModel();

        $this->view('home.index', [
            'title' => 'StudyMate AI - Trợ lý học tập cá nhân hóa',
            'description' => 'StudyMate AI giúp cá nhân hóa lộ trình học, tóm tắt tài liệu, tạo quiz, flashcard và theo dõi tiến độ học tập.',
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
            'description' => 'StudyMate AI - trợ lý học tập cá nhân tích hợp AI.',
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
