<?php

class AssignmentQuizQuestion extends Model
{
    private static bool $schemaReady = false;

    public function ensureSchema(): void
    {
        if (self::$schemaReady) {
            return;
        }

        $path = BASE_PATH . '/database/migrations/create_assignment_quiz_questions_table.sql';
        $sql = file_exists($path) ? file_get_contents($path) : false;
        if ($sql !== false) {
            foreach (array_filter(array_map('trim', explode(';', $sql))) as $statement) {
                if ($statement !== '') {
                    $this->db()->exec($statement);
                }
            }
        }

        self::$schemaReady = true;
    }

    public function getForAssignment(int $assignmentId, bool $includeAnswers = false): array
    {
        $this->ensureSchema();

        $statement = $this->db()->prepare(
            'SELECT id, assignment_id, question_type, question_text,
                    option_a, option_b, option_c, option_d,
                    correct_answer, points, explanation, order_number
             FROM assignment_quiz_questions
             WHERE assignment_id = :assignment_id
             ORDER BY order_number ASC, id ASC'
        );
        $statement->execute(['assignment_id' => $assignmentId]);
        $questions = $statement->fetchAll();

        if ($includeAnswers) {
            return $questions;
        }

        return array_map(static function (array $question): array {
            unset($question['correct_answer'], $question['explanation']);
            return $question;
        }, $questions);
    }

    public function countForAssignment(int $assignmentId): int
    {
        $this->ensureSchema();

        $statement = $this->db()->prepare(
            'SELECT COUNT(*) FROM assignment_quiz_questions WHERE assignment_id = :assignment_id'
        );
        $statement->execute(['assignment_id' => $assignmentId]);

        return (int) $statement->fetchColumn();
    }

    public function replaceForAssignment(int $assignmentId, array $questions): int
    {
        $this->ensureSchema();
        $db = $this->db();
        $db->beginTransaction();

        try {
            $delete = $db->prepare('DELETE FROM assignment_quiz_questions WHERE assignment_id = :assignment_id');
            $delete->execute(['assignment_id' => $assignmentId]);

            $insert = $db->prepare(
                'INSERT INTO assignment_quiz_questions
                    (assignment_id, question_type, question_text, option_a, option_b, option_c, option_d,
                     correct_answer, points, explanation, order_number)
                 VALUES
                    (:assignment_id, :question_type, :question_text, :option_a, :option_b, :option_c, :option_d,
                     :correct_answer, :points, :explanation, :order_number)'
            );

            foreach ($questions as $index => $question) {
                $insert->execute([
                    'assignment_id' => $assignmentId,
                    'question_type' => $question['question_type'],
                    'question_text' => $question['question_text'],
                    'option_a' => $question['option_a'] ?: null,
                    'option_b' => $question['option_b'] ?: null,
                    'option_c' => $question['option_c'] ?: null,
                    'option_d' => $question['option_d'] ?: null,
                    'correct_answer' => $question['correct_answer'] ?: null,
                    'points' => (float) $question['points'],
                    'explanation' => $question['explanation'] ?: null,
                    'order_number' => (int) ($question['order_number'] ?? $index + 1),
                ]);
            }

            $db->commit();
            return count($questions);
        } catch (Throwable $exception) {
            if ($db->inTransaction()) {
                $db->rollBack();
            }

            throw $exception;
        }
    }

    public function importCsv(int $assignmentId, string $csvPath): int
    {
        $questions = $this->parseCsv($csvPath);

        return $this->replaceForAssignment($assignmentId, $questions);
    }

    public function parseCsv(string $csvPath): array
    {
        if (! is_readable($csvPath)) {
            throw new RuntimeException('Không thể đọc file quiz CSV.');
        }

        $handle = fopen($csvPath, 'rb');
        if ($handle === false) {
            throw new RuntimeException('Không thể mở file quiz CSV.');
        }

        $headers = fgetcsv($handle);
        if ($headers === false) {
            fclose($handle);
            throw new RuntimeException('File quiz CSV đang trống.');
        }

        $headers = array_map([$this, 'normalizeHeader'], $headers);
        $questions = [];
        $line = 1;

        while (($row = fgetcsv($handle)) !== false) {
            $line++;
            if ($this->rowIsEmpty($row)) {
                continue;
            }

            $data = [];
            foreach ($headers as $index => $header) {
                $data[$header] = trim((string) ($row[$index] ?? ''));
            }

            $type = $this->normalizeQuestionType($data['question_type'] ?? 'single_choice');
            $questionText = trim((string) ($data['question'] ?? $data['question_text'] ?? ''));
            if ($questionText === '') {
                fclose($handle);
                throw new RuntimeException("Dòng {$line}: thiếu nội dung câu hỏi.");
            }

            $correctAnswer = strtoupper(trim((string) ($data['correct_answer'] ?? $data['answer'] ?? '')));
            if ($type === 'single_choice' && ! in_array($correctAnswer, ['A', 'B', 'C', 'D'], true)) {
                fclose($handle);
                throw new RuntimeException("Dòng {$line}: đáp án đúng phải là A, B, C hoặc D.");
            }

            $questions[] = [
                'question_type' => $type,
                'question_text' => $questionText,
                'option_a' => trim((string) ($data['option_a'] ?? '')),
                'option_b' => trim((string) ($data['option_b'] ?? '')),
                'option_c' => trim((string) ($data['option_c'] ?? '')),
                'option_d' => trim((string) ($data['option_d'] ?? '')),
                'correct_answer' => $type === 'single_choice' ? $correctAnswer : null,
                'points' => max(0.5, (float) ($data['points'] ?? 1)),
                'explanation' => trim((string) ($data['explanation'] ?? '')),
                'order_number' => count($questions) + 1,
            ];
        }

        fclose($handle);

        if ($questions === []) {
            throw new RuntimeException('File quiz CSV chưa có câu hỏi hợp lệ.');
        }

        return $questions;
    }

    public function grade(int $assignmentId, array $answers): array
    {
        $questions = $this->getForAssignment($assignmentId, true);
        $autoQuestions = array_values(array_filter(
            $questions,
            static fn (array $question): bool => $question['question_type'] === 'single_choice'
        ));

        $totalPoints = 0.0;
        $earnedPoints = 0.0;
        $details = [];

        foreach ($questions as $question) {
            $questionId = (int) $question['id'];
            $answer = strtoupper(trim((string) ($answers[$questionId] ?? $answers[(string) $questionId] ?? '')));
            $isAuto = $question['question_type'] === 'single_choice';
            $isCorrect = $isAuto && $answer !== '' && $answer === strtoupper((string) $question['correct_answer']);

            if ($isAuto) {
                $points = (float) $question['points'];
                $totalPoints += $points;
                if ($isCorrect) {
                    $earnedPoints += $points;
                }
            }

            $details[] = [
                'question_id' => $questionId,
                'question_type' => $question['question_type'],
                'answer' => $answers[$questionId] ?? $answers[(string) $questionId] ?? '',
                'is_correct' => $isAuto ? $isCorrect : null,
                'correct_answer' => $isAuto ? $question['correct_answer'] : null,
                'explanation' => $question['explanation'] ?? null,
            ];
        }

        $score = $totalPoints > 0 ? round(($earnedPoints / $totalPoints) * 100, 2) : 0.0;

        return [
            'score' => $score,
            'passed' => $totalPoints > 0 && $score >= 70,
            'earned_points' => $earnedPoints,
            'total_points' => $totalPoints,
            'auto_question_count' => count($autoQuestions),
            'details' => $details,
        ];
    }

    private function normalizeHeader(string $header): string
    {
        $header = preg_replace('/^\xEF\xBB\xBF/', '', $header) ?? $header;
        $header = strtolower(trim($header));
        $header = str_replace([' ', '-', '.'], '_', $header);

        return match ($header) {
            'cau_hoi', 'noi_dung_cau_hoi' => 'question',
            'dap_an_dung' => 'correct_answer',
            'loai_cau_hoi' => 'question_type',
            default => $header,
        };
    }

    private function normalizeQuestionType(string $type): string
    {
        $type = strtolower(trim($type));

        return in_array($type, ['short_answer', 'tu_luan', 'text'], true) ? 'short_answer' : 'single_choice';
    }

    private function rowIsEmpty(array $row): bool
    {
        foreach ($row as $cell) {
            if (trim((string) $cell) !== '') {
                return false;
            }
        }

        return true;
    }
}
