import { buildRoadmapVisualModel, canCompleteRoadmapNode } from "./roadmapVisualUtils.js";

export function getStudyActionLabel(item) {
  if (!item) return "Tiếp tục học";
  if (item.assignment_id && item.assignment_submission_status !== "graded") return "Làm quiz xác nhận";
  if (item.status === "in_progress") return "Tiếp tục học";
  if (item.status === "not_completed") return "Học lại nội dung này";
  return "Bắt đầu học";
}

export function getStudentFacingStatus(nodeOrItem) {
  const status = nodeOrItem?.rawStatus || nodeOrItem?.status || "not_started";
  const locked = Boolean(nodeOrItem?.locked);
  const hasQuiz = Boolean(nodeOrItem?.item?.assignment_id || nodeOrItem?.assignment_id);
  const quizDone = (nodeOrItem?.item?.assignment_submission_status || nodeOrItem?.assignment_submission_status) === "graded";

  if (status === "completed") return "Hoàn thành";
  if (locked) return "Cần hoàn thành bài trước";
  if (status === "in_progress" && hasQuiz && !quizDone) return "Chờ làm quiz";
  if (status === "in_progress") return "Đang học";
  if (status === "not_completed") return "Chưa đạt yêu cầu";
  if (status === "rescheduled") return "Đã dời lịch";
  return "Có thể học";
}

export function findNextStudyNode(items = [], options = {}) {
  const visual = buildRoadmapVisualModel(items, options);
  const nodes = visual.lessonNodes || [];

  const inProgress = nodes.find((node) => node.rawStatus === "in_progress" && !node.locked);
  if (inProgress) return { visual, node: inProgress };

  const quizPending = nodes.find((node) => (
    !node.locked
    && node.rawStatus !== "completed"
    && node.item.assignment_id
    && node.item.assignment_submission_status !== "graded"
    && canCompleteRoadmapNode(node, nodes)
  ));
  if (quizPending) return { visual, node: quizPending };

  const nextUnlocked = nodes.find((node) => (
    !node.locked
    && node.rawStatus !== "completed"
    && canCompleteRoadmapNode(node, nodes)
  ));
  if (nextUnlocked) return { visual, node: nextUnlocked };

  const nextIncomplete = nodes.find((node) => node.rawStatus !== "completed");
  if (nextIncomplete) return { visual, node: nextIncomplete };

  return { visual, node: null };
}
