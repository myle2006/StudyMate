<?php

class HomeModel extends Model
{
    public function getLandingPageData(): array
    {
        return [
            'navItems' => [
                ['label' => 'Tính năng', 'href' => '#features'],
                ['label' => 'Cách hoạt động', 'href' => '#process'],
                ['label' => 'Lợi ích', 'href' => '#benefits'],
                ['label' => 'Liên hệ', 'href' => '#contact'],
            ],
            'features' => [
                [
                    'title' => 'AI Study Assistant',
                    'text' => 'Hỏi đáp theo ngữ cảnh, giải thích từng bước và gợi ý cách học phù hợp với mục tiêu.',
                    'icon' => '✦',
                    'tone' => 'from-blue-500 to-indigo-500',
                ],
                [
                    'title' => 'Learning Roadmap',
                    'text' => 'Tự động chia nhỏ mục tiêu thành lộ trình học theo tuần, theo môn và theo năng lực hiện tại.',
                    'icon' => '⌁',
                    'tone' => 'from-violet-500 to-fuchsia-500',
                ],
                [
                    'title' => 'Document Summary',
                    'text' => 'Tóm tắt PDF, slide và ghi chú dài thành ý chính, thuật ngữ cần nhớ và checklist ôn tập.',
                    'icon' => '≡',
                    'tone' => 'from-cyan-500 to-blue-500',
                ],
                [
                    'title' => 'Quiz & Flashcard',
                    'text' => 'Biến tài liệu học thành câu hỏi luyện tập, flashcard và bài kiểm tra ngắn sau mỗi chủ đề.',
                    'icon' => '◇',
                    'tone' => 'from-emerald-500 to-teal-500',
                ],
                [
                    'title' => 'Progress Dashboard',
                    'text' => 'Theo dõi tiến độ, thời lượng học, điểm mạnh/yếu và các mốc quan trọng trong một dashboard gọn.',
                    'icon' => '▣',
                    'tone' => 'from-sky-500 to-indigo-500',
                ],
                [
                    'title' => 'Review Recommendation',
                    'text' => 'Nhắc ôn đúng lúc dựa trên lịch sử học, mức độ quên và các phần cần củng cố trước kỳ kiểm tra.',
                    'icon' => '↻',
                    'tone' => 'from-amber-400 to-pink-500',
                ],
            ],
            'steps' => [
                [
                    'title' => 'Tạo hồ sơ học tập',
                    'text' => 'Chọn môn học, trình độ, lịch rảnh và mục tiêu cần đạt.',
                ],
                [
                    'title' => 'Upload tài liệu/chọn mục tiêu',
                    'text' => 'Thêm PDF, ghi chú, slide hoặc chọn kỹ năng muốn cải thiện.',
                ],
                [
                    'title' => 'AI tạo lộ trình',
                    'text' => 'StudyMate AI đề xuất nội dung, quiz và phiên ôn tập theo nhịp học của bạn.',
                ],
                [
                    'title' => 'Theo dõi tiến độ',
                    'text' => 'Xem dashboard, nhận gợi ý ôn lại và điều chỉnh kế hoạch khi cần.',
                ],
            ],
            'stats' => [
                ['AI Tutor', '24/7'],
                ['Cá nhân hóa', '100%'],
                ['Theo dõi', 'tiến độ'],
            ],
            'benefits' => [
                'Tiết kiệm thời gian tự lên kế hoạch học.',
                'Ghi nhớ tốt hơn nhờ quiz, flashcard và lịch ôn thông minh.',
                'Hiểu rõ tiến độ thay vì học theo cảm giác mơ hồ.',
            ],
        ];
    }
}
