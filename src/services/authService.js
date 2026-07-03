const API_BASE_URL =
  window.STUDYMATE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || "/api";

function getStoredToken() {
  return localStorage.getItem("token") || "";
}

async function request(endpoint, options = {}) {
  const token = options.token ?? getStoredToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({
    success: false,
    message: "Không thể đọc phản hồi từ máy chủ.",
  }));

  if (!response.ok || payload.success === false) {
    const error = new Error(payload.message || "Có lỗi xảy ra khi gọi API.");
    error.status = response.status;
    error.errors = payload.errors || {};
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function register(data) {
  return request("/register", {
    method: "POST",
    body: JSON.stringify(data),
    token: "",
  });
}

export function login(data) {
  return request("/login", {
    method: "POST",
    body: JSON.stringify(data),
    token: "",
  });
}

export function getMe(token = getStoredToken()) {
  return request("/me", { token });
}

export function logout() {
  return request("/logout", {
    method: "POST",
  });
}
