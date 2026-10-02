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

export function getAssignedStudents(subjectId, params = {}) {
  return request(`/admin/subjects/${subjectId}/students${buildQuery(params)}`);
}

export function getMySubjects(params = {}) {
  return request(`/student/my-subjects${buildQuery(params)}`);
}

export function getMySubjectById(subjectId) {
  return request(`/student/my-subjects/${subjectId}`);
}

export function getAvailableStudents(subjectId, params = {}) {
  return request(`/admin/subjects/${subjectId}/available-students${buildQuery(params)}`);
}

export function getSubjectClasses(subjectId) {
  return request(`/admin/subjects/${subjectId}/classes`);
}

export function createSubjectClass(subjectId, data) {
  return request(`/admin/subjects/${subjectId}/classes`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function assignStudentToSubject(subjectId, studentId, classId) {
  return request(`/admin/subjects/${subjectId}/students`, {
    method: "POST",
    body: JSON.stringify({ student_id: Number(studentId), class_id: Number(classId) }),
  });
}

export function removeStudentFromSubject(subjectId, studentId, classId) {
  const query = classId ? `?class_id=${encodeURIComponent(classId)}` : "";
  return request(`/admin/subjects/${subjectId}/students/${studentId}${query}`, {
    method: "DELETE",
  });
}
