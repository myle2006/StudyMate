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

export function getSubmissions() {
  return request("/student/submissions");
}

export function getSubmissionById(id) {
  return request(`/student/submissions/${id}`);
}

export function getStudentGrades() {
  return request("/student/grades");
}

export function getStudentGradeBySubmissionId(id) {
  return request(`/student/submissions/${id}/grade`);
}

export function getSubmissionForAssignment(assignmentId) {
  return request(`/student/assignments/${assignmentId}/submission`);
}

export function submitAssignment(assignmentId, formData) {
  return request(`/student/assignments/${assignmentId}/submit`, {
    method: "POST",
    body: formData instanceof FormData ? formData : JSON.stringify(formData),
  });
}

export function updateSubmission(id, formData) {
  if (formData instanceof FormData) {
    formData.set("_method", "PUT");
  }

  return request(`/student/submissions/${id}`, {
    method: formData instanceof FormData ? "POST" : "PUT",
    body: formData instanceof FormData ? formData : JSON.stringify(formData),
  });
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

export function getAdminAssignmentSubmissions(assignmentId, params = {}) {
  return request(`/admin/assignments/${assignmentId}/submissions${buildQuery(params)}`);
}

export function getAdminSubmissionById(id) {
  return request(`/admin/submissions/${id}`);
}

export function gradeSubmission(id, data) {
  return request(`/admin/submissions/${id}/grade`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
