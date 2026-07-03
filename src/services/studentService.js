const API_BASE_URL =
  window.STUDYMATE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || "/api";

function getToken() {
  return localStorage.getItem("token") || "";
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

export function getStudents(params = {}) {
  return request(`/admin/students${buildQuery(params)}`);
}

export function getStudentById(id) {
  return request(`/admin/students/${id}`);
}

export function createStudent(data) {
  return request("/admin/students", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateStudent(id, data) {
  return request(`/admin/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteStudent(id) {
  return request(`/admin/students/${id}`, {
    method: "DELETE",
  });
}

export function disableStudent(id) {
  return request(`/admin/students/${id}/disable`, {
    method: "PUT",
  });
}

export function enableStudent(id) {
  return request(`/admin/students/${id}/enable`, {
    method: "PUT",
  });
}

export function lockStudent(id) {
  return request(`/admin/students/${id}/lock`, {
    method: "PUT",
  });
}

export function resetStudentPassword(id, data = {}) {
  return request(`/admin/students/${id}/reset-password`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function importStudents(file) {
  const formData = new FormData();
  formData.append("file", file);

  return request("/admin/students/import", {
    method: "POST",
    body: formData,
  });
}

export async function downloadImportTemplate() {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/admin/students/import/template`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error("Không thể tải file mẫu import.");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "students_import_template.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
