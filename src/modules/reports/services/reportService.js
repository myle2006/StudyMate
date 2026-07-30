const API_BASE_URL =
  window.STUDYMATE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "/api";

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("auth_token") || "";
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

function filenameFromHeaders(headers, fallback) {
  const disposition = headers.get("Content-Disposition") || headers.get("content-disposition") || "";
  const match = disposition.match(/filename="?([^"]+)"?/i);

  return match?.[1] || fallback;
}

export async function downloadReportCsv(endpoint, filters = {}, fallbackFilename = "report.csv") {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}${buildQuery(filters)}`, {
    headers: {
      Accept: "text/csv",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let message = "Không thể xuất báo cáo.";

    try {
      const payload = JSON.parse(text);
      message = payload.message || message;
    } catch {
      message = text || message;
    }

    throw new Error(message);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filenameFromHeaders(response.headers, fallbackFilename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
