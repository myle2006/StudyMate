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

export function generateAIRoadmap(data) {
  return request("/student/roadmaps/generate-ai", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getAIRoadmapStatus() {
  return request("/student/roadmaps/ai-status");
}

export function createRoadmap(data) {
  return request("/student/roadmaps", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getRoadmaps(params = {}) {
  return request(`/student/roadmaps${buildQuery(params)}`);
}

export function getRoadmapById(id) {
  return request(`/student/roadmaps/${id}`);
}

export function getRoadmapProgress(id) {
  return request(`/student/roadmaps/${id}/progress`);
}

export function updateRoadmap(id, data) {
  return request(`/student/roadmaps/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteRoadmap(id) {
  return request(`/student/roadmaps/${id}`, {
    method: "DELETE",
  });
}

export function updateRoadmapItemStatus(id, status) {
  return request(`/student/roadmap-items/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export function updateRoadmapItemResult(id, data) {
  return request(`/student/roadmap-items/${id}/result`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function rescheduleRoadmapItem(id, data) {
  return request(`/student/roadmap-items/${id}/schedule`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
