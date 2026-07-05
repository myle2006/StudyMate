import React from "react";
import Button from "./Button";

export function Modal({ open, title, description, children, onClose, footer }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-950">{title}</h2>
            {description && <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-xl font-bold text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            ×
          </button>
        </div>
        {children && <div className="mt-5">{children}</div>}
        {footer && <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title = "Xác nhận thao tác",
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  danger = false,
  loading = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal
      open={open}
      title={title}
      description={description}
      onClose={onCancel}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type="button" variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={loading}>
            {loading ? "Đang xử lý..." : confirmLabel}
          </Button>
        </>
      }
    />
  );
}
