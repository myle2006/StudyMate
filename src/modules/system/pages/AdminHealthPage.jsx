import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { Alert, Button, Card, LoadingState, PageHeader } from "../../../components/ui";
import { getAdminHealth } from "../services/healthService";

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN");
}

export default function AdminHealthPage() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadHealth() {
    setLoading(true);
    setError("");
    try {
      const response = await getAdminHealth();
      setPayload(response.data);
    } catch (err) {
      setError(err.message || "Không thể kiểm tra hệ thống.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHealth();
  }, []);

  const checks = payload?.checks || [];
  const failedCount = Number(payload?.failed_count || 0);

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="System Health"
          title="Kiểm tra hệ thống"
          description={`Kiểm tra migration quan trọng, quyền ghi upload và trạng thái cấu hình nền. Cập nhật: ${formatDateTime(payload?.generated_at)}`}
          actions={
            <Button type="button" variant="secondary" onClick={loadHealth} disabled={loading}>
              <RefreshCw className="h-4 w-4" />
              Kiểm tra lại
            </Button>
          }
        />

        <Alert tone="error">{error}</Alert>

        {loading ? (
          <LoadingState label="Đang kiểm tra hệ thống..." />
        ) : (
          <>
            <Card className={`p-5 ${failedCount > 0 ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
              <div className="flex items-center gap-3">
                {failedCount > 0 ? (
                  <AlertTriangle className="h-7 w-7 text-amber-600" />
                ) : (
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                )}
                <div>
                  <p className="text-lg font-black text-slate-950">
                    {failedCount > 0 ? `${failedCount} hạng mục cần xử lý` : "Hệ thống sẵn sàng"}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-600">
                    {failedCount > 0 ? "Hãy chạy migration hoặc cấp quyền ghi theo thông báo bên dưới." : "Các bảng/cột và thư mục upload quan trọng đều đạt."}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="divide-y divide-slate-100">
                {checks.map((check) => (
                  <div key={check.key} className="grid gap-3 p-4 md:grid-cols-[220px_120px_minmax(0,1fr)] md:items-center">
                    <p className="font-black text-slate-950">{check.label}</p>
                    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-black ${check.status === "ok" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {check.status === "ok" ? "OK" : "Cần xử lý"}
                    </span>
                    <p className="text-sm font-semibold text-slate-600">{check.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
