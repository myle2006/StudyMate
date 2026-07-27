import React from "react";
import { Search } from "lucide-react";
import { Card, Input, Select } from "../../../components/ui";

export default function StudentSubjectFilter({ filters, onChange }) {
  return (
    <Card className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_220px]">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={filters.keyword}
          onChange={(event) => onChange("keyword", event.target.value)}
          placeholder="Tìm theo tên hoặc mã môn học"
          className="mt-0 pl-11"
        />
      </div>
      <Select value={filters.status} onChange={(event) => onChange("status", event.target.value)} className="mt-0">
        <option value="">Tất cả trạng thái</option>
        <option value="studying">Đang học</option>
        <option value="paused">Tạm dừng</option>
        <option value="completed">Hoàn thành</option>
      </Select>
    </Card>
  );
}
