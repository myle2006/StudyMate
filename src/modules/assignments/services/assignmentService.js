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

export function getAssignments(params = {}) {
  return request(`/admin/assignments${buildQuery(params)}`);
}

export function getAssignmentById(id) {
  return request(`/admin/assignments/${id}`);
}

export function createAssignment(formData) {
  return request("/admin/assignments", {
    method: "POST",
    body: formData instanceof FormData ? formData : JSON.stringify(formData),
  });
}

export function updateAssignment(id, formData) {
  if (formData instanceof FormData) {
    formData.set("_method", "PUT");
  }

  return request(`/admin/assignments/${id}`, {
    method: formData instanceof FormData ? "POST" : "PUT",
    body: formData instanceof FormData ? formData : JSON.stringify(formData),
  });
}

export function deleteAssignment(id) {
  return request(`/admin/assignments/${id}`, {
    method: "DELETE",
  });
}

export function getStudentAssignments(params = {}) {
  return request(`/student/assignments${buildQuery(params)}`);
}

export function getStudentAssignmentById(id) {
  return request(`/student/assignments/${id}`);
}
