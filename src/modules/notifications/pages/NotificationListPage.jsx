import React, { useEffect, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, Badge, Button, Card, EmptyState, LoadingState, PageHeader } from "../../../components/ui";
import { getNotifications, markAllNotificationsRead, markNotificationRead } from "../services/notificationService";

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(String(value).replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationListPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  async function loadNotifications() {
    setLoading(true);
    setError("");

    try {
      const response = await getNotifications();
      setNotifications(response.data || []);
    } catch (err) {
      setError(err.message || "Không thể tải thông báo.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  async function handleRead(notification) {
    if (notification.read) return;

    try {
      await markNotificationRead(notification.key);
      setNotifications((current) => current.map((item) => item.key === notification.key ? { ...item, read: true } : item));
      window.dispatchEvent(new Event("studymate-notifications-changed"));
    } catch (err) {
      setError(err.message || "Không thể đánh dấu đã đọc.");
    }
  }

  async function handleReadAll() {
    setMarkingAll(true);
    setError("");

    try {
      await markAllNotificationsRead();
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      window.dispatchEvent(new Event("studymate-notifications-changed"));
    } catch (err) {
      setError(err.message || "Không thể đánh dấu tất cả đã đọc.");
    } finally {
      setMarkingAll(false);
    }
  }

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <PageHeader
          eyebrow="Notifications"
          title="Thông báo"
          description={`${unreadCount} thông báo chưa đọc. Hệ thống nhắc deadline bài tập, lịch học hôm nay và lộ trình bị trễ.`}
          actions={
            <Button type="button" variant="secondary" onClick={handleReadAll} disabled={markingAll || notifications.length === 0}>
              <CheckCheck className="h-4 w-4" />
              {markingAll ? "Đang xử lý..." : "Đánh dấu tất cả đã đọc"}
            </Button>
          }
        />

        <Alert tone="error">{error}</Alert>

        {loading ? (
          <LoadingState label="Đang tải thông báo..." />
        ) : notifications.length === 0 ? (
          <EmptyState title="Chưa có thông báo" description="Khi có deadline, lịch học hoặc lộ trình cần chú ý, thông báo sẽ hiển thị tại đây." />
        ) : (
          <Card className="overflow-hidden">
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <article key={notification.key} className={`p-5 ${notification.read ? "bg-white" : "bg-blue-50/50"}`}>
                  <div className="flex items-start gap-4">
                    <span className={`mt-1 grid h-10 w-10 shrink-0 place-items-center rounded-lg ${notification.read ? "bg-slate-100 text-slate-500" : "bg-blue-600 text-white"}`}>
                      <Bell className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-base font-black text-slate-950">{notification.title}</h2>
                        <Badge tone={notification.tone || "slate"}>{notification.read ? "Đã đọc" : "Chưa đọc"}</Badge>
                      </div>
                      <p className="mt-1 text-sm font-bold text-slate-700">{notification.message}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-500">{notification.meta}</p>
                      <p className="mt-1 text-xs font-bold text-slate-400">{formatDateTime(notification.occurred_at)}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {notification.link && (
                          <Button as={Link} to={notification.link} size="sm" variant="secondary" onClick={() => handleRead(notification)}>
                            Mở chi tiết
                          </Button>
                        )}
                        {!notification.read && (
                          <Button type="button" size="sm" variant="ghost" onClick={() => handleRead(notification)}>
                            Đánh dấu đã đọc
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
