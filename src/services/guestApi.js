const GUEST_STATE_KEY = "studymate_guest_api_state";

function today(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function dateTime(offset = 0, time = "23:59:00") {
  return `${today(offset)} ${time}`;
}

const guestUser = {
  id: 9001,
  role: "student",
  full_name: "Khách dùng thử",
  email: "guest@studymate.local",
  student_code: "GUEST001",
  is_guest: true,
};

const initialState = {
  subjects: [
    {
      id: 1,
      subject_id: 1,
      subject_code: "SWT301",
      subject_name: "Kiểm thử phần mềm",
      teacher: "ThS. Nguyễn Minh Anh",
      credits: 3,
      status: "studying",
      color: "#2563EB",
      assigned_at: dateTime(-12, "08:00:00"),
      created_at: dateTime(-30, "08:00:00"),
      updated_at: dateTime(-2, "09:30:00"),
      description: "Thực hành viết test case, phân loại lỗi, báo cáo defect và theo dõi chất lượng phần mềm.",
    },
    {
      id: 2,
      subject_id: 2,
      subject_code: "SAD201",
      subject_name: "Phân tích thiết kế hệ thống",
      teacher: "ThS. Trần Bảo Long",
      credits: 3,
      status: "studying",
      color: "#059669",
      assigned_at: dateTime(-10, "10:00:00"),
      created_at: dateTime(-28, "08:00:00"),
      updated_at: dateTime(-1, "14:20:00"),
      description: "Mô hình hóa use case, activity diagram, sequence diagram và đặc tả yêu cầu hệ thống.",
    },
    {
      id: 3,
      subject_id: 3,
      subject_code: "WEB101",
      subject_name: "Nhập môn phát triển web",
      teacher: "CN. Lê Mai Chi",
      credits: 2,
      status: "completed",
      color: "#7C3AED",
      assigned_at: dateTime(-20, "13:00:00"),
      created_at: dateTime(-45, "08:00:00"),
      updated_at: dateTime(-5, "16:15:00"),
      description: "HTML, CSS, responsive layout và các thao tác nền tảng để xây dựng giao diện web.",
    },
  ],
  assignments: [
    {
      id: 1,
      subject_id: 1,
      subject_code: "SWT301",
      subject_name: "Kiểm thử phần mềm",
      title: "Nộp bản phân tích yêu cầu kiểm thử",
      description: "Viết test objective, phạm vi kiểm thử và 5 test case cho chức năng đăng nhập.",
      status: "open",
      submission_status: "not_submitted",
      submission_id: null,
      deadline: dateTime(0, "23:59:00"),
      updated_at: dateTime(-1, "08:00:00"),
      attachment_path: "",
    },
    {
      id: 2,
      subject_id: 2,
      subject_code: "SAD201",
      subject_name: "Phân tích thiết kế hệ thống",
      title: "Ôn tập use case diagram",
      description: "Hoàn thiện use case diagram và mô tả main flow cho một quy trình học tập.",
      status: "open",
      submission_status: "graded",
      submission_id: 101,
      deadline: dateTime(2, "09:00:00"),
      updated_at: dateTime(-2, "11:30:00"),
      attachment_path: "",
    },
    {
      id: 3,
      subject_id: 3,
      subject_code: "WEB101",
      subject_name: "Nhập môn phát triển web",
      title: "Quiz HTML/CSS cơ bản",
      description: "Làm quiz về selector, box model và responsive breakpoint.",
      status: "closed",
      submission_status: "submitted",
      submission_id: 102,
      deadline: dateTime(-2, "20:00:00"),
      updated_at: dateTime(-3, "18:00:00"),
      attachment_path: "",
    },
  ],
  submissions: [
    {
      id: 101,
      assignment_id: 2,
      assignment_title: "Ôn tập use case diagram",
      subject_code: "SAD201",
      subject_name: "Phân tích thiết kế hệ thống",
      status: "graded",
      score: 8.5,
      feedback: "Bài làm rõ actor chính, nên bổ sung thêm alternate flow cho trường hợp lỗi.",
      submitted_at: dateTime(-1, "21:15:00"),
      graded_at: dateTime(0, "08:10:00"),
      content: "Đã hoàn thiện use case diagram và mô tả luồng chính.",
      file_path: "",
    },
    {
      id: 102,
      assignment_id: 3,
      assignment_title: "Quiz HTML/CSS cơ bản",
      subject_code: "WEB101",
      subject_name: "Nhập môn phát triển web",
      status: "submitted",
      score: null,
      feedback: "",
      submitted_at: dateTime(-3, "19:30:00"),
      graded_at: null,
      content: "Hoàn thành quiz và ghi chú lại phần breakpoint.",
      file_path: "",
    },
  ],
  lessons: [
    {
      id: 1,
      subject_id: 1,
      subject_code: "SWT301",
      subject_name: "Kiểm thử phần mềm",
      title: "Checklist viết test case",
      content: "Xem cấu trúc test case, dữ liệu kiểm thử, expected result và cách ghi chú lỗi phát sinh.",
      duration_minutes: 18,
      progress_status: "completed",
      completed_at: dateTime(-1, "20:00:00"),
      material_path: "",
      video_url: "https://example.com/video-test-case",
      external_url: "https://example.com/checklist-test-case",
    },
    {
      id: 2,
      subject_id: 1,
      subject_code: "SWT301",
      subject_name: "Kiểm thử phần mềm",
      title: "Phân loại lỗi theo mức độ",
      content: "Nhận diện severity, priority và cách ghi defect rõ ràng để người xử lý hiểu đúng vấn đề.",
      duration_minutes: 12,
      progress_status: "not_started",
      completed_at: null,
      material_path: "",
      video_url: "",
      external_url: "https://example.com/defect-priority",
    },
    {
      id: 3,
      subject_id: 2,
      subject_code: "SAD201",
      subject_name: "Phân tích thiết kế hệ thống",
      title: "Mẫu use case đặc tả",
      content: "Thử đọc actor, pre-condition, main flow, alternate flow và post-condition.",
      duration_minutes: 20,
      progress_status: "not_started",
      completed_at: null,
      material_path: "",
      video_url: "",
      external_url: "",
    },
  ],
  notifications: [
    {
      key: "deadline-assignment-1",
      title: "Bài phân tích yêu cầu sắp hết hạn",
      message: "Còn vài giờ để hoàn tất bản nộp cho SWT301.",
      meta: "Bài tập · SWT301",
      tone: "rose",
      read: false,
      occurred_at: dateTime(0, "08:00:00"),
      link: "/student/assignments/1",
    },
    {
      key: "new-lesson-sad201",
      title: "Có tài liệu mới trong môn SAD201",
      message: "Giảng viên vừa thêm bài học về use case đặc tả.",
      meta: "Bài học · SAD201",
      tone: "blue",
      read: true,
      occurred_at: dateTime(-1, "10:30:00"),
      link: "/student/lessons/3",
    },
    {
      key: "roadmap-progress-1",
      title: "Lộ trình tuần này còn 2 bước",
      message: "Hoàn thành checklist để giữ tiến độ trên 70%.",
      meta: "Lộ trình · SWT301",
      tone: "amber",
      read: false,
      occurred_at: dateTime(-1, "18:00:00"),
      link: "/student/roadmaps/1",
    },
  ],
  schedules: [
    {
      id: 1,
      subject_id: 1,
      subject_code: "SWT301",
      subject_name: "Kiểm thử phần mềm",
      title: "Thực hành viết test case",
      study_date: today(0),
      start_time: "08:00",
      end_time: "10:00",
      location: "Phòng B204",
      schedule_type: "class",
      status: "scheduled",
    },
    {
      id: 2,
      subject_id: 2,
      subject_code: "SAD201",
      subject_name: "Phân tích thiết kế hệ thống",
      title: "Ôn use case diagram",
      study_date: today(1),
      start_time: "19:30",
      end_time: "20:30",
      location: "Tự học",
      schedule_type: "self_study",
      status: "scheduled",
    },
  ],
  goals: [
    {
      id: 1,
      subject_id: 1,
      subject_code: "SWT301",
      subject_name: "Kiểm thử phần mềm",
      title: "Nắm vững test case trong 2 tuần",
      goal_description: "Biết phân tích yêu cầu, viết test case rõ ràng và tự rà soát expected result.",
      current_level: "intermediate",
      study_time_per_day: 1,
      start_date: today(-2),
      end_date: today(12),
      status: "active",
    },
  ],
  roadmaps: [
    {
      id: 1,
      subject_id: 1,
      learning_goal_id: 1,
      subject_code: "SWT301",
      subject_name: "Kiểm thử phần mềm",
      title: "Lộ trình 2 tuần viết test case",
      overview: "Tập trung từ phân tích yêu cầu đến viết, review và cải thiện test case.",
      goal: "Hoàn thành 15 test case chất lượng cho chức năng đăng nhập và nộp bài.",
      current_level: "intermediate",
      study_time_per_day: 1,
      available_weekdays: [1, 2, 4, 6],
      preferred_start_time: "19:30",
      session_duration_minutes: 60,
      reminder_minutes_before: 15,
      start_date: today(-2),
      end_date: today(12),
      status: "active",
      progress_percent: 40,
      item_count: 3,
      items: [
        {
          id: 1001,
          roadmap_id: 1,
          week_number: 1,
          order_number: 1,
          title: "Đọc tài liệu tổng quan",
          description: "Nắm các khái niệm test objective, test condition và test case.",
          expected_result: "Ghi chú được 5 khái niệm chính.",
          suggested_task: "Tóm tắt checklist trước khi viết test.",
          planned_date: today(-1),
          start_time: "19:30",
          duration_minutes: 60,
          priority: "medium",
          status: "completed",
          completion_percent: 100,
          actual_study_minutes: 60,
        },
        {
          id: 1002,
          roadmap_id: 1,
          week_number: 1,
          order_number: 2,
          title: "Luyện 5 test case đăng nhập",
          description: "Viết test case cho đăng nhập thành công, sai mật khẩu, bỏ trống email, email sai định dạng và tài khoản khóa.",
          expected_result: "Có ít nhất 5 test case đủ input và expected result.",
          suggested_task: "Tự review tên test case và dữ liệu đầu vào.",
          planned_date: today(0),
          start_time: "20:00",
          duration_minutes: 60,
          priority: "high",
          status: "in_progress",
          completion_percent: 40,
          actual_study_minutes: 25,
        },
        {
          id: 1003,
          roadmap_id: 1,
          week_number: 1,
          order_number: 3,
          title: "Tự đánh giá và ghi chú feedback",
          description: "Đánh dấu điểm còn vướng để hỏi giảng viên.",
          expected_result: "Có danh sách câu hỏi và phần cần cải thiện.",
          suggested_task: "So sánh với checklist đã học.",
          planned_date: today(2),
          start_time: "19:30",
          duration_minutes: 45,
          priority: "medium",
          status: "not_started",
          completion_percent: 0,
          actual_study_minutes: 0,
        },
      ],
    },
  ],
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readState() {
  try {
    const saved = sessionStorage.getItem(GUEST_STATE_KEY);
    return saved ? { ...clone(initialState), ...JSON.parse(saved) } : clone(initialState);
  } catch {
    return clone(initialState);
  }
}

function writeState(state) {
  sessionStorage.setItem(GUEST_STATE_KEY, JSON.stringify(state));
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function ok(data, message = "Thành công.") {
  return jsonResponse({ success: true, message, data });
}

function notFound(message = "Không tìm thấy dữ liệu mẫu.") {
  return jsonResponse({ success: false, message }, 404);
}

function calculateRoadmapProgress(roadmap) {
  const total = roadmap.items.length || 1;
  const completed = roadmap.items.filter((item) => item.status === "completed").length;
  return Math.round((completed / total) * 100);
}

function roadmapSummary(roadmap) {
  const totalItems = roadmap.items.length;
  const completedItems = roadmap.items.filter((item) => item.status === "completed").length;
  const actualMinutes = roadmap.items.reduce((total, item) => total + Number(item.actual_study_minutes || 0), 0);

  return {
    total_items: totalItems,
    completed_items: completedItems,
    not_completed_items: roadmap.items.filter((item) => item.status === "not_completed").length,
    actual_study_minutes: actualMinutes,
    remaining_minutes: roadmap.items.reduce((total, item) => item.status === "completed" ? total : total + Number(item.duration_minutes || 0), 0),
    goal_achievement_percent: calculateRoadmapProgress(roadmap),
    overall_percent: calculateRoadmapProgress(roadmap),
    daily: roadmap.items.map((item) => ({
      planned_date: item.planned_date,
      total_items: 1,
      completed_items: item.status === "completed" ? 1 : 0,
      progress_percent: item.status === "completed" ? 100 : Number(item.completion_percent || 0),
    })),
    weekly: [
      {
        week_key: "guest-week-1",
        week_start: today(-2),
        week_end: today(4),
        total_items: totalItems,
        completed_items: completedItems,
        progress_percent: calculateRoadmapProgress(roadmap),
      },
    ],
  };
}

function dashboardData(state) {
  const unreadCount = state.notifications.filter((item) => !item.read).length;
  const submittedCount = state.assignments.filter((item) => item.submission_id).length;
  const missingCount = state.assignments.filter((item) => !item.submission_id && item.status === "open").length;
  const roadmap = state.roadmaps[0];
  const summary = roadmapSummary(roadmap);

  return {
    summary: {
      assigned_subject_count: state.subjects.length,
      today_schedule_count: state.schedules.filter((item) => item.study_date === today(0)).length,
      upcoming_assignment_count: state.assignments.filter((item) => item.status === "open").length,
      missing_submission_count: missingCount,
      submitted_assignment_count: submittedCount,
      roadmap_progress_percent: summary.overall_percent,
      active_roadmap_count: state.roadmaps.filter((item) => item.status === "active").length,
      unread_notification_count: unreadCount,
    },
    assignment_overview: { overdue_missing_count: 0 },
    today_schedules: state.schedules.filter((item) => item.study_date === today(0)),
    upcoming_schedules: state.schedules,
    upcoming_assignments: state.assignments.filter((item) => item.status === "open"),
    latest_grade: state.submissions.find((item) => item.score !== null) || null,
    roadmap_progress: {
      ...summary,
      roadmaps: state.roadmaps.map((item) => ({
        id: item.id,
        subject_code: item.subject_code,
        subject_name: item.subject_name,
        title: item.title,
        status: item.status,
        progress_percent: calculateRoadmapProgress(item),
      })),
    },
  };
}

function endpointFromUrl(input) {
  const raw = typeof input === "string" ? input : input?.url || "";
  const url = new URL(raw, window.location.origin);
  const apiBase = window.STUDYMATE_API_BASE_URL || "/api";
  const apiPath = new URL(apiBase, window.location.origin).pathname;

  if (!url.pathname.startsWith(apiPath)) return "";
  return `${url.pathname.slice(apiPath.length) || "/"}${url.search}`;
}

function pathOnly(endpoint) {
  return endpoint.split("?")[0];
}

function matches(path, pattern) {
  return path.match(pattern);
}

export function isGuestApiActive() {
  return Boolean(sessionStorage.getItem("studymate_guest_preview"));
}

export function clearGuestApiState() {
  sessionStorage.removeItem(GUEST_STATE_KEY);
}

export function createGuestUser() {
  return clone(guestUser);
}

export async function handleGuestApiRequest(input, options = {}) {
  if (!isGuestApiActive()) return null;

  const endpoint = endpointFromUrl(input);
  if (!endpoint) return null;

  const method = String(options.method || "GET").toUpperCase();
  const path = pathOnly(endpoint);
  const state = readState();

  if (path === "/me") return ok(createGuestUser());
  if (path === "/student/dashboard") return ok(dashboardData(state));
  if (path === "/notifications/unread-count") return ok({ unread_count: state.notifications.filter((item) => !item.read).length });
  if (path === "/notifications" && method === "GET") return ok(state.notifications);
  if (path === "/notifications/read" && method !== "GET") {
    const body = options.body ? JSON.parse(options.body) : {};
    state.notifications = state.notifications.map((item) => item.key === body.notification_key ? { ...item, read: true } : item);
    writeState(state);
    return ok({ unread_count: state.notifications.filter((item) => !item.read).length });
  }
  if (path === "/notifications/read-all" && method !== "GET") {
    state.notifications = state.notifications.map((item) => ({ ...item, read: true }));
    writeState(state);
    return ok({ unread_count: 0 });
  }
  const notificationReadMatch = matches(path, /^\/notifications\/([^/]+)\/read$/);
  if (notificationReadMatch && method !== "GET") {
    state.notifications = state.notifications.map((item) => item.key === decodeURIComponent(notificationReadMatch[1]) ? { ...item, read: true } : item);
    writeState(state);
    return ok({ unread_count: state.notifications.filter((item) => !item.read).length });
  }

  if (path === "/student/my-subjects" || path === "/subjects") return ok(state.subjects);
  const subjectMatch = matches(path, /^\/student\/my-subjects\/(\d+)$/);
  if (subjectMatch) return ok(state.subjects.find((item) => item.id === Number(subjectMatch[1])) || null);

  if (path === "/student/assignments") return ok(state.assignments);
  const assignmentMatch = matches(path, /^\/student\/assignments\/(\d+)$/);
  if (assignmentMatch) return ok(state.assignments.find((item) => item.id === Number(assignmentMatch[1])) || null);
  const assignmentSubmissionMatch = matches(path, /^\/student\/assignments\/(\d+)\/submission$/);
  if (assignmentSubmissionMatch) {
    const assignmentId = Number(assignmentSubmissionMatch[1]);
    return ok(state.submissions.find((item) => item.assignment_id === assignmentId) || null);
  }
  const submitAssignmentMatch = matches(path, /^\/student\/assignments\/(\d+)\/submit$/);
  if (submitAssignmentMatch && method !== "GET") {
    const assignmentId = Number(submitAssignmentMatch[1]);
    const assignment = state.assignments.find((item) => item.id === assignmentId);
    if (!assignment) return notFound();
    const submission = {
      id: Math.max(0, ...state.submissions.map((item) => item.id)) + 1,
      assignment_id: assignmentId,
      assignment_title: assignment.title,
      subject_code: assignment.subject_code,
      subject_name: assignment.subject_name,
      status: "submitted",
      score: null,
      feedback: "",
      submitted_at: dateTime(0, "21:00:00"),
      graded_at: null,
      content: "Bài nộp mẫu từ tài khoản khách.",
      file_path: "",
    };
    state.submissions.push(submission);
    state.assignments = state.assignments.map((item) => item.id === assignmentId ? { ...item, submission_id: submission.id, submission_status: "submitted" } : item);
    writeState(state);
    return ok(submission, "Nộp bài thành công.");
  }
  const submissionMatch = matches(path, /^\/student\/submissions\/(\d+)$/);
  if (submissionMatch) return ok(state.submissions.find((item) => item.id === Number(submissionMatch[1])) || null);
  const gradeMatch = matches(path, /^\/student\/submissions\/(\d+)\/grade$/);
  if (gradeMatch) return ok(state.submissions.find((item) => item.id === Number(gradeMatch[1])) || null);
  if (path === "/student/grades") return ok(state.submissions);

  if (path === "/student/lessons") return ok(state.lessons);
  const lessonMatch = matches(path, /^\/student\/lessons\/(\d+)$/);
  if (lessonMatch && method === "GET") return ok(state.lessons.find((item) => item.id === Number(lessonMatch[1])) || null);
  const lessonCompleteMatch = matches(path, /^\/student\/lessons\/(\d+)\/complete$/);
  if (lessonCompleteMatch && method !== "GET") {
    const id = Number(lessonCompleteMatch[1]);
    state.lessons = state.lessons.map((item) => item.id === id ? { ...item, progress_status: "completed", completed_at: dateTime(0, "21:15:00") } : item);
    writeState(state);
    return ok(state.lessons.find((item) => item.id === id));
  }

  if (path === "/student/schedules") return ok(state.schedules);
  const scheduleMatch = matches(path, /^\/student\/schedules\/(\d+)$/);
  if (scheduleMatch) return ok(state.schedules.find((item) => item.id === Number(scheduleMatch[1])) || null);

  if (path === "/student/learning-goals") return ok(state.goals);
  const goalMatch = matches(path, /^\/student\/learning-goals\/(\d+)$/);
  if (goalMatch && method === "DELETE") {
    state.goals = state.goals.filter((item) => item.id !== Number(goalMatch[1]));
    writeState(state);
    return ok(null, "Xóa mục tiêu học tập thành công.");
  }
  if (goalMatch) return ok(state.goals.find((item) => item.id === Number(goalMatch[1])) || null);

  if (path === "/student/roadmaps") return ok(state.roadmaps.map((roadmap) => ({ ...roadmap, item_count: roadmap.items.length, progress_percent: calculateRoadmapProgress(roadmap) })));
  const roadmapMatch = matches(path, /^\/student\/roadmaps\/(\d+)$/);
  if (roadmapMatch) {
    const roadmap = state.roadmaps.find((item) => item.id === Number(roadmapMatch[1]));
    if (!roadmap) return notFound();
    if (method === "DELETE") {
      state.roadmaps = state.roadmaps.filter((item) => item.id !== roadmap.id);
      writeState(state);
      return ok(null, "Xóa lộ trình học thành công.");
    }
    return ok({ ...roadmap, progress_percent: calculateRoadmapProgress(roadmap) });
  }
  const roadmapProgressMatch = matches(path, /^\/student\/roadmaps\/(\d+)\/progress$/);
  if (roadmapProgressMatch) {
    const roadmap = state.roadmaps.find((item) => item.id === Number(roadmapProgressMatch[1]));
    return roadmap ? ok(roadmapSummary(roadmap)) : notFound();
  }
  const roadmapItemStatusMatch = matches(path, /^\/student\/roadmap-items\/(\d+)\/status$/);
  if (roadmapItemStatusMatch && method !== "GET") {
    const id = Number(roadmapItemStatusMatch[1]);
    const body = options.body ? JSON.parse(options.body) : {};
    let updatedRoadmap = null;
    let updatedItem = null;
    state.roadmaps = state.roadmaps.map((roadmap) => {
      let changed = false;
      const items = roadmap.items.map((item) => {
        if (item.id !== id) return item;
        changed = true;
        updatedItem = { ...item, status: body.status || "in_progress", completion_percent: body.status === "completed" ? 100 : item.completion_percent };
        return updatedItem;
      });
      if (changed) updatedRoadmap = { ...roadmap, items, progress_percent: calculateRoadmapProgress({ ...roadmap, items }) };
      return updatedRoadmap && updatedRoadmap.id === roadmap.id ? updatedRoadmap : roadmap;
    });
    writeState(state);
    return ok({ item: updatedItem, progress_percent: updatedRoadmap?.progress_percent || 0, summary: updatedRoadmap ? roadmapSummary(updatedRoadmap) : null });
  }
  const roadmapItemResultMatch = matches(path, /^\/student\/roadmap-items\/(\d+)\/result$/);
  if (roadmapItemResultMatch && method !== "GET") {
    const id = Number(roadmapItemResultMatch[1]);
    const body = options.body ? JSON.parse(options.body) : {};
    let updatedRoadmap = null;
    let updatedItem = null;
    state.roadmaps = state.roadmaps.map((roadmap) => {
      let changed = false;
      const items = roadmap.items.map((item) => {
        if (item.id !== id) return item;
        changed = true;
        updatedItem = {
          ...item,
          ...body,
          status: body.status || item.status,
          completion_percent: Number(body.completion_percent ?? item.completion_percent ?? 0),
          actual_study_minutes: Number(body.actual_study_minutes ?? item.actual_study_minutes ?? 0),
        };
        return updatedItem;
      });
      if (changed) updatedRoadmap = { ...roadmap, items, progress_percent: calculateRoadmapProgress({ ...roadmap, items }) };
      return updatedRoadmap && updatedRoadmap.id === roadmap.id ? updatedRoadmap : roadmap;
    });
    writeState(state);
    return ok({ item: updatedItem, progress_percent: updatedRoadmap?.progress_percent || 0, summary: updatedRoadmap ? roadmapSummary(updatedRoadmap) : null });
  }
  const roadmapItemScheduleMatch = matches(path, /^\/student\/roadmap-items\/(\d+)\/schedule$/);
  if (roadmapItemScheduleMatch && method !== "GET") {
    const id = Number(roadmapItemScheduleMatch[1]);
    const body = options.body ? JSON.parse(options.body) : {};
    let updatedRoadmap = null;
    let updatedItem = null;
    state.roadmaps = state.roadmaps.map((roadmap) => {
      let changed = false;
      const items = roadmap.items.map((item) => {
        if (item.id !== id) return item;
        changed = true;
        updatedItem = {
          ...item,
          planned_date: body.planned_date || item.planned_date,
          start_time: body.start_time || item.start_time,
          duration_minutes: Number(body.duration_minutes || item.duration_minutes || 60),
          status: "rescheduled",
        };
        return updatedItem;
      });
      if (changed) updatedRoadmap = { ...roadmap, items, progress_percent: calculateRoadmapProgress({ ...roadmap, items }) };
      return updatedRoadmap && updatedRoadmap.id === roadmap.id ? updatedRoadmap : roadmap;
    });
    writeState(state);
    return ok({ item: updatedItem, summary: updatedRoadmap ? roadmapSummary(updatedRoadmap) : null });
  }

  return ok(null);
}
