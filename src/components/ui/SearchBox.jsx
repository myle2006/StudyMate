import React from "react";
import { Input } from "./FormControls";

export default function SearchBox({ value, onChange, placeholder = "Tìm kiếm..." }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
      <Input value={value} onChange={onChange} placeholder={placeholder} className="mt-0 pl-10" />
    </div>
  );
}
