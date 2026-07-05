const API_BASE_URL =
  window.STUDYMATE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "/api";

function getToken() {
  return localStorage.getItem("token") || localStorage.getItem("auth_token") || "";
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
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

export function getStudySchedules(params = {}) {
  return request(`/study-schedules${buildQuery(params)}`);
}

export function getStudyScheduleById(id) {
  return request(`/study-schedules/${id}`);
}

export function createStudySchedule(data) {
  return request("/study-schedules", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateStudySchedule(id, data) {
  return request(`/study-schedules/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteStudySchedule(id) {
  return request(`/study-schedules/${id}`, {
    method: "DELETE",
  });
}
