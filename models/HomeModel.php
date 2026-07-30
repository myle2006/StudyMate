<?php

class HomeModel extends Model
{
    public function getLandingPageData(): array
    {
        return [
            'navItems' => [
                ['label' => 'Tính năng', 'href' => '#features'],
                ['label' => 'Quy trình', 'href' => '#workflow'],
                ['label' => 'Vai trò', 'href' => '#roles'],
                ['label' => 'Bắt đầu', 'href' => '#start'],
            ],
            'features' => [
                [
                    'title' => 'Dashboard học tập',
                    'text' => 'Sinh viên xem nhanh môn học, lịch hôm nay, bài sắp hạn, bài chưa nộp, điểm mới và tiến độ lộ trình.',
                    'accent' => 'blue',
                    'metric' => '1 màn hình',
                ],
                [
                    'title' => 'Môn học và phân công',
                    'text' => 'Admin quản lý môn học, gán sinh viên theo môn và theo dõi số lượng sinh viên trong từng lớp.',
                    'accent' => 'emerald',
                    'metric' => 'Theo lớp',
                ],
                [
                    'title' => 'Bài tập và bài nộp',
                    'text' => 'Giao deadline, nhận file bài làm, kiểm tra trạng thái nộp muộn và chấm điểm kèm feedback.',
                    'accent' => 'amber',
                    'metric' => 'Có deadline',
                ],
                [
                    'title' => 'Lộ trình và lịch học',
                    'text' => 'Sinh viên tạo mục tiêu, sinh lộ trình học, quản lý lịch học và cập nhật tiến độ từng bước.',
                    'accent' => 'violet',
                    'metric' => '% tiến độ',
                ],
                [
                    'title' => 'Thông báo deadline',
                    'text' => 'Nhắc bài tập sắp hết hạn, lịch học hôm nay và roadmap bị trễ, có badge số thông báo chưa đọc.',
                    'accent' => 'rose',
                    'metric' => 'Badge live',
                ],
                [
                    'title' => 'Bài học và tài liệu',
                    'text' => 'Admin tạo bài học theo môn, upload tài liệu, thêm video/link; sinh viên xem và đánh dấu đã học.',
                    'accent' => 'cyan',
                    'metric' => 'File + link',
                ],
            ],
            'stats' => [
                ['2', 'vai trò chính'],
                ['CSV', 'xuất báo cáo'],
                ['JWT', 'bảo vệ API'],
            ],
            'roleCards' => [
                [
                    'title' => 'Dành cho sinh viên',
                    'items' => ['Trang cá nhân', 'Môn học của tôi', 'Bài tập và điểm', 'Lịch học', 'Lộ trình', 'Bài học'],
                    'cta' => 'Đăng nhập sinh viên',
                    'href' => '/login',
                ],
                [
                    'title' => 'Dành cho admin',
                    'items' => ['Dashboard hệ thống', 'Quản lý sinh viên', 'Quản lý môn học', 'Giao bài tập', 'Tạo bài học', 'Xuất báo cáo'],
                    'cta' => 'Vào trang quản trị',
                    'href' => '/login',
                ],
            ],
        ];
    }
}
