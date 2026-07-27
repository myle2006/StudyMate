import React from "react";
import { Search } from "lucide-react";
import { Card, Input, Select } from "../../../components/ui";

export default function AssignmentFilter({ filters, subjects, onChange }) {
  return (
    <Card className="grid gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_260px_200px]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          name="keyword"
          value={filters.keyword}
          onChange={(event) => onChange("keyword", event.target.value)}
          placeholder="Tìm theo tiêu đề, tên môn hoặc mã môn"
          className="mt-0 pl-11"
        />
      </div>
      <Select name="subject_id" value={filters.subject_id} onChange={(event) => onChange("subject_id", event.target.value)} className="mt-0">
        <option value="">Tất cả môn học</option>
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.subject_code} - {subject.subject_name}
          </option>
        ))}
      </Select>
      <Select name="status" value={filters.status} onChange={(event) => onChange("status", event.target.value)} className="mt-0">
        <option value="">Tất cả trạng thái</option>
        <option value="open">Đang mở</option>
        <option value="closed">Đã đóng</option>
        <option value="draft">Nháp</option>
      </Select>
    </Card>
  );
}
