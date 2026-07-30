<?php

class ReportController extends Controller
{
    private ReportService $reports;

    public function __construct()
    {
        $this->reports = new ReportService();
    }

    public function studentsExport(): void
    {
        $this->download($this->reports->students($_GET));
    }

    public function subjectsExport(): void
    {
        $this->download($this->reports->subjects($_GET));
    }

    public function studentSubjectsExport(): void
    {
        $this->download($this->reports->studentSubjects($_GET));
    }

    public function assignmentsExport(): void
    {
        $this->download($this->reports->assignments($_GET));
    }

    public function submissionsExport(): void
    {
        $this->download($this->reports->submissions($_GET));
    }

    public function gradesExport(): void
    {
        $this->download($this->reports->grades($_GET));
    }

    public function progressExport(): void
    {
        $this->download($this->reports->progress($_GET));
    }

    private function download(array $report): void
    {
        $filename = (string) ($report['filename'] ?? 'report.csv');
        $headers = is_array($report['headers'] ?? null) ? $report['headers'] : [];
        $rows = is_array($report['rows'] ?? null) ? $report['rows'] : [];

        while (ob_get_level() > 0) {
            ob_end_clean();
        }

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

        $output = fopen('php://output', 'wb');
        fwrite($output, "\xEF\xBB\xBF");
        fputcsv($output, $headers);

        foreach ($rows as $row) {
            fputcsv($output, array_map(static fn (mixed $value): string => (string) ($value ?? ''), $row));
        }

        fclose($output);
    }
}
