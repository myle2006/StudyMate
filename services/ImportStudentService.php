<?php

class ImportStudentService
{
    private Student $student;
    private Role $role;

    public function __construct()
    {
        $this->student = new Student();
        $this->role = new Role();
    }

    public function import(string $filePath, string $extension): array
    {
        $rows = $this->readRows($filePath, $extension);
        $studentRole = $this->role->findByName('student');

        if ($studentRole === null) {
            return [
                'summary' => [
                    'total_rows' => 0,
                    'success_count' => 0,
                    'failed_count' => 1,
                ],
                'errors' => [
                    [
                        'row' => 0,
                        'email' => '',
                        'student_code' => '',
                        'message' => 'Vai trò sinh viên chưa được cấu hình.',
                    ],
                ],
            ];
        }

        $successCount = 0;
        $errors = [];
        $seenEmails = [];
        $seenStudentCodes = [];

        foreach ($rows as $index => $row) {
            $rowNumber = $index + 2;
            $data = $this->normalizeRow($row);
            $rowErrors = $this->validateRow($data, $seenEmails, $seenStudentCodes);

            if ($rowErrors !== []) {
                $errors[] = [
                    'row' => $rowNumber,
                    'email' => $data['email'],
                    'student_code' => $data['student_code'],
                    'message' => implode(' ', $rowErrors),
                ];
                continue;
            }

            $seenEmails[] = strtolower($data['email']);
            $seenStudentCodes[] = strtolower($data['student_code']);

            $password = $data['password'] !== '' ? $data['password'] : $data['student_code'];
            $this->student->create([
                'role_id' => (int) $studentRole['id'],
                'full_name' => $data['full_name'],
                'email' => $data['email'],
                'password' => password_hash($password, PASSWORD_DEFAULT),
                'phone' => $data['phone'],
                'student_code' => $data['student_code'],
                'status' => $data['status'] ?: 'active',
            ]);

            $successCount++;
        }

        return [
            'summary' => [
                'total_rows' => count($rows),
                'success_count' => $successCount,
                'failed_count' => count($errors),
            ],
            'errors' => $errors,
        ];
    }

    private function readRows(string $filePath, string $extension): array
    {
        if ($extension === 'csv') {
            return $this->readCsv($filePath);
        }

        if ($extension === 'xlsx' && class_exists('ZipArchive')) {
            return $this->readXlsx($filePath);
        }

        throw new RuntimeException(
            $extension === 'xls'
                ? 'File XLS cần cài thư viện phpoffice/phpspreadsheet để xử lý.'
                : 'Định dạng file import chưa được hỗ trợ trên máy chủ này.'
        );
    }

    private function readCsv(string $filePath): array
    {
        $handle = fopen($filePath, 'rb');
        if ($handle === false) {
            throw new RuntimeException('Không thể đọc file import.');
        }

        $header = null;
        $rows = [];

        while (($line = fgetcsv($handle)) !== false) {
            if ($header === null) {
                $header = $this->normalizeHeader($line);
                continue;
            }

            if ($this->isEmptyLine($line)) {
                continue;
            }

            $rows[] = $this->combineRow($header, $line);
        }

        fclose($handle);

        return $rows;
    }

    private function readXlsx(string $filePath): array
    {
        $zip = new ZipArchive();
        if ($zip->open($filePath) !== true) {
            throw new RuntimeException('Không thể đọc file XLSX.');
        }

        $sharedStrings = $this->readXlsxSharedStrings($zip);
        $sheetXml = $zip->getFromName('xl/worksheets/sheet1.xml');
        $zip->close();

        if ($sheetXml === false) {
            throw new RuntimeException('File XLSX không có sheet dữ liệu đầu tiên.');
        }

        $xml = simplexml_load_string($sheetXml);
        if ($xml === false) {
            throw new RuntimeException('File XLSX không hợp lệ.');
        }

        $header = null;
        $rows = [];

        foreach ($xml->sheetData->row as $row) {
            $values = [];
            foreach ($row->c as $cell) {
                $value = (string) ($cell->v ?? '');
                $type = (string) ($cell['t'] ?? '');
                $values[] = $type === 's' ? ($sharedStrings[(int) $value] ?? '') : $value;
            }

            if ($header === null) {
                $header = $this->normalizeHeader($values);
                continue;
            }

            if ($this->isEmptyLine($values)) {
                continue;
            }

            $rows[] = $this->combineRow($header, $values);
        }

        return $rows;
    }

    private function readXlsxSharedStrings(ZipArchive $zip): array
    {
        $xmlContent = $zip->getFromName('xl/sharedStrings.xml');
        if ($xmlContent === false) {
            return [];
        }

        $xml = simplexml_load_string($xmlContent);
        if ($xml === false) {
            return [];
        }

        $strings = [];
        foreach ($xml->si as $item) {
            if (isset($item->t)) {
                $strings[] = (string) $item->t;
                continue;
            }

            $text = '';
            foreach ($item->r as $run) {
                $text .= (string) ($run->t ?? '');
            }
            $strings[] = $text;
        }

        return $strings;
    }

    private function normalizeHeader(array $header): array
    {
        return array_map(
            static function ($column): string {
                $column = preg_replace('/^\xEF\xBB\xBF/', '', (string) $column);

                return strtolower(trim($column ?? ''));
            },
            $header
        );
    }

    private function combineRow(array $header, array $line): array
    {
        $row = [];
        foreach ($header as $index => $column) {
            $row[$column] = trim((string) ($line[$index] ?? ''));
        }

        return $row;
    }

    private function normalizeRow(array $row): array
    {
        return [
            'full_name' => trim((string) ($row['full_name'] ?? '')),
            'email' => strtolower(trim((string) ($row['email'] ?? ''))),
            'phone' => trim((string) ($row['phone'] ?? '')),
            'student_code' => trim((string) ($row['student_code'] ?? '')),
            'password' => (string) ($row['password'] ?? ''),
            'status' => trim((string) ($row['status'] ?? 'active')) ?: 'active',
        ];
    }

    private function validateRow(array $data, array $seenEmails, array $seenStudentCodes): array
    {
        $errors = [];
        $nameLength = $this->textLength($data['full_name']);

        if ($data['full_name'] === '') {
            $errors[] = 'Họ tên là bắt buộc.';
        } elseif ($nameLength < 3) {
            $errors[] = 'Họ tên phải có ít nhất 3 ký tự.';
        } elseif ($nameLength > 150) {
            $errors[] = 'Họ tên không được vượt quá 150 ký tự.';
        }

        if ($data['email'] === '') {
            $errors[] = 'Email là bắt buộc.';
        } elseif (! filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Email không đúng định dạng.';
        } elseif (in_array(strtolower($data['email']), $seenEmails, true)) {
            $errors[] = 'Email bị trùng trong file import.';
        } elseif ($this->student->isEmailExists($data['email'])) {
            $errors[] = 'Email đã tồn tại trong hệ thống.';
        }

        if ($data['phone'] !== '' && ! preg_match('/^(0|\+84)?[0-9]{8,11}$/', $data['phone'])) {
            $errors[] = 'Số điện thoại không hợp lệ.';
        }

        if ($data['student_code'] === '') {
            $errors[] = 'Mã sinh viên là bắt buộc.';
        } elseif ($this->textLength($data['student_code']) > 50) {
            $errors[] = 'Mã sinh viên không được vượt quá 50 ký tự.';
        } elseif (in_array(strtolower($data['student_code']), $seenStudentCodes, true)) {
            $errors[] = 'Mã sinh viên bị trùng trong file import.';
        } elseif ($this->student->isStudentCodeExists($data['student_code'])) {
            $errors[] = 'Mã sinh viên đã tồn tại trong hệ thống.';
        }

        if ($data['password'] !== '' && strlen($data['password']) < 6) {
            $errors[] = 'Mật khẩu phải có ít nhất 6 ký tự.';
        }

        if (! in_array($data['status'], ['active', 'inactive', 'locked'], true)) {
            $errors[] = 'Trạng thái không hợp lệ.';
        }

        return $errors;
    }

    private function isEmptyLine(array $line): bool
    {
        foreach ($line as $value) {
            if (trim((string) $value) !== '') {
                return false;
            }
        }

        return true;
    }

    private function textLength(string $value): int
    {
        return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
    }
}
