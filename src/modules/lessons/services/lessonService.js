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
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
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

export function getAdminLessons(params = {}) {
  return request(`/admin/lessons${buildQuery(params)}`);
}

export function getAdminLessonById(id) {
  return request(`/admin/lessons/${id}`);
}

export function createLesson(formData) {
  return request("/admin/lessons", {
    method: "POST",
    body: formData instanceof FormData ? formData : JSON.stringify(formData),
  });
}

export function updateLesson(id, formData) {
  if (formData instanceof FormData) {
    formData.set("_method", "PUT");
  }

  return request(`/admin/lessons/${id}`, {
    method: formData instanceof FormData ? "POST" : "PUT",
    body: formData instanceof FormData ? formData : JSON.stringify(formData),
  });
}

export function deleteLesson(id) {
  return request(`/admin/lessons/${id}`, { method: "DELETE" });
}

export function getStudentLessons(params = {}) {
  return request(`/student/lessons${buildQuery(params)}`);
}

export function getStudentLessonById(id) {
  return request(`/student/lessons/${id}`);
}

export function completeLesson(id) {
  return request(`/student/lessons/${id}/complete`, { method: "PUT" });
}
