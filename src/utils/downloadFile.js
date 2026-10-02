const API_BASE_URL =
  window.STUDYMATE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "/api";

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("auth_token") || "";
}

function protectedEndpoint(filePath) {
  const value = String(filePath || "").trim();
  if (!value) return "";

  const match = value.match(/\/(?:api\/files|uploads)\/(assignments|submissions|lessons)\/([^/?#]+)/);
  if (!match) return value;

  return `${API_BASE_URL}/files/${match[1]}/${match[2]}`;
}

function filenameFromDisposition(header, fallback) {
  const match = String(header || "").match(/filename="?([^"]+)"?/i);
  return match?.[1] || fallback || "download";
}

export async function downloadProtectedFile(filePath, fallbackName = "download") {
  const endpoint = protectedEndpoint(filePath);
  const token = getToken();
  const response = await fetch(endpoint, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("Không thể tải file hoặc bạn không có quyền truy cập.");
  }

  const blob = await response.blob();
  const filename = filenameFromDisposition(response.headers.get("Content-Disposition"), fallbackName);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
