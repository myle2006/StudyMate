import React, { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Alert, Button, Field, Input, Select } from "../../../components/ui";
import { downloadReportCsv } from "../services/reportService";

export default function ReportExportCard({
  title,
  description,
  endpoint,
  filename,
  icon: Icon,
  subjects = [],
  students = [],
  filters = [],
  statusOptions = [],
}) {
  const [values, setValues] = useState({});
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const visibleFilters = useMemo(() => new Set(filters), [filters]);

  function updateValue(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleExport() {
    setExporting(true);
    setError("");

    try {
      await downloadReportCsv(endpoint, values, filename);
    } catch (err) {
      setError(err.message || "Không thể xuất báo cáo.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-lg font-black text-slate-950">{title}</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">{description}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {visibleFilters.has("date") && (
          <>
            <Field label="Từ ngày">
              <Input type="date" value={values.start_date || ""} onChange={(event) => updateValue("start_date", event.target.value)} />
            </Field>
            <Field label="Đến ngày">
              <Input type="date" value={values.end_date || ""} onChange={(event) => updateValue("end_date", event.target.value)} />
            </Field>
          </>
        )}

        {visibleFilters.has("subject") && (
          <Field label="Môn học">
            <Select value={values.subject_id || ""} onChange={(event) => updateValue("subject_id", event.target.value)}>
              <option value="">Tất cả môn học</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.subject_code} - {subject.subject_name}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {visibleFilters.has("student") && (
          <Field label="Sinh viên">
            <Select value={values.student_id || ""} onChange={(event) => updateValue("student_id", event.target.value)}>
              <option value="">Tất cả sinh viên</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.student_code} - {student.full_name}
                </option>
              ))}
            </Select>
          </Field>
        )}

        {visibleFilters.has("status") && statusOptions.length > 0 && (
          <Field label="Trạng thái">
            <Select value={values.status || ""} onChange={(event) => updateValue("status", event.target.value)}>
              <option value="">Tất cả trạng thái</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </div>

      <Alert tone="error" className="mt-4">{error}</Alert>

      <Button type="button" onClick={handleExport} disabled={exporting} className="mt-5 w-full">
        <Download className="h-4 w-4" />
        {exporting ? "Đang xuất..." : "Xuất CSV"}
      </Button>
    </article>
  );
}
