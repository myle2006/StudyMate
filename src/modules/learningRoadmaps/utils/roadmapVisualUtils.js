export const ROADMAP_NODE_TYPES = {
  required: { label: "Bắt buộc", tone: "blue" },
  recommended: { label: "Khuyến nghị", tone: "amber" },
  optional: { label: "Tùy chọn", tone: "yellow" },
};

export const ROADMAP_NODE_STATUS = {
  not_started: { label: "Chưa học", tone: "slate" },
  in_progress: { label: "Đang học", tone: "blue" },
  completed: { label: "Hoàn thành", tone: "green" },
  overdue: { label: "Quá hạn", tone: "rose" },
  locked: { label: "Bị khóa", tone: "slate" },
  rescheduled: { label: "Dời lịch", tone: "blue" },
  not_completed: { label: "Cần xử lý", tone: "rose" },
};

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function toDateTime(date, time = "23:59") {
  if (!date) return null;
  const value = new Date(`${date}T${time || "23:59"}`);
  return Number.isNaN(value.getTime()) ? null : value;
}

function isLessonNodeItem(item) {
  return Boolean(item?.lesson_id || item?.lesson_title || item?.lesson_content);
}

export function inferNodeType(item) {
  if (item.allow_skip || item.is_required === false || item.is_required === 0 || item.is_required === "0") return "optional";
  if (item.priority === "low") return "optional";
  if (item.priority === "medium") return "recommended";
  return "required";
}

export function isItemOverdue(item, now = new Date()) {
  if (["completed", "not_completed"].includes(item.status)) return false;
  const dueAt = toDateTime(item.planned_date, item.start_time);
  return Boolean(dueAt && dueAt.getTime() < now.getTime());
}

function makeNodeId(item, index) {
  return `node-${item.id || `${item.week_number || 1}-${item.order_number || index + 1}`}`;
}

function getPrerequisiteIds(orderedItems, item, index) {
  const explicitItemIds = item.prerequisite_item_ids || item.prerequisites;
  if (Array.isArray(explicitItemIds)) {
    return explicitItemIds.map((value) => `node-${value}`);
  }

  if (Array.isArray(item.prerequisite_lesson_ids)) {
    return item.prerequisite_lesson_ids
      .map((lessonId) => orderedItems.findIndex((candidate) => String(candidate.lesson_id || "") === String(lessonId)))
      .filter((itemIndex) => itemIndex >= 0)
      .map((itemIndex) => makeNodeId(orderedItems[itemIndex], itemIndex));
  }

  if (index === 0) return [];

  const previousRequired = orderedItems
    .slice(0, index)
    .reverse()
    .find((candidate) => inferNodeType(candidate) !== "optional");

  return previousRequired ? [makeNodeId(previousRequired, orderedItems.indexOf(previousRequired))] : [];
}

function groupByChapter(lessonNodes) {
  const chapters = [];
  const chapterMap = new Map();

  lessonNodes.forEach((node) => {
    if (!chapterMap.has(node.branch)) {
      const chapter = {
        id: `chapter-${chapterMap.size + 1}`,
        kind: "chapter",
        item: {},
        index: chapterMap.size + 1,
        title: node.branch,
        description: "",
        type: "required",
        branch: node.branch,
        contentType: "Chương",
        prerequisiteIds: [],
        locked: false,
        overdue: false,
        allowSkip: false,
        status: "not_started",
        rawStatus: "not_started",
        x: 320,
        y: 0,
        lessonCount: 0,
      };
      chapterMap.set(node.branch, chapter);
      chapters.push(chapter);
    }

    chapterMap.get(node.branch).lessonCount += 1;
  });

  return chapters;
}

export function buildRoadmapVisualModel(items = [], options = {}) {
  const now = options.now || new Date();
  const orderedItems = items
    .filter(isLessonNodeItem)
    .map((item, index) => ({
      ...item,
      _index: index,
      _week: Math.max(1, toNumber(item.week_number, index + 1)),
      _order: Math.max(1, toNumber(item.order_number, index + 1)),
    }))
    .sort((left, right) => left._week - right._week || left._order - right._order || left._index - right._index);

  const statusById = new Map();
  orderedItems.forEach((item, index) => {
    statusById.set(makeNodeId(item, index), item.status || "not_started");
  });

  const lessonNodes = orderedItems.map((item, index) => {
    const type = inferNodeType(item);
    const prerequisiteIds = getPrerequisiteIds(orderedItems, item, index);
    const prerequisiteIncomplete = prerequisiteIds.some((id) => statusById.get(id) !== "completed");
    const locked = type !== "optional" && item.status !== "completed" && prerequisiteIncomplete;
    const overdue = isItemOverdue(item, now);
    const branch = item.lesson_chapter || item.chapter || item.branch_label || "Chương 1";

    return {
      id: makeNodeId(item, index),
      kind: "lesson",
      item,
      index: index + 1,
      title: item.lesson_title || item.title || `Bài học ${index + 1}`,
      description: item.lesson_content || item.description || "",
      type,
      branch,
      contentType: "Bài học",
      week: item._week,
      order: item._order,
      phaseKey: options.phaseByItemId?.get?.(item.id) || "",
      prerequisiteIds,
      locked,
      overdue,
      allowSkip: type === "optional" || item.allow_skip === true || item.allow_skip === 1 || item.allow_skip === "1",
      status: locked ? "locked" : overdue ? "overdue" : item.status || "not_started",
      rawStatus: item.status || "not_started",
      x: 640,
      y: 0,
    };
  });

  const chapterNodes = groupByChapter(lessonNodes);
  const chapterByBranch = new Map(chapterNodes.map((chapter) => [chapter.branch, chapter]));
  const lessonsByBranch = new Map();
  lessonNodes.forEach((node) => {
    const current = lessonsByBranch.get(node.branch) || [];
    current.push(node);
    lessonsByBranch.set(node.branch, current);
  });

  const rowSpacing = 132;
  const chapterGap = 96;
  let cursorY = 0;
  chapterNodes.forEach((chapter) => {
    const lessons = lessonsByBranch.get(chapter.branch) || [];
    lessons.forEach((lesson, lessonIndex) => {
      lesson.x = 680;
      lesson.y = cursorY + lessonIndex * rowSpacing;
    });

    const firstY = lessons[0]?.y ?? cursorY;
    const lastY = lessons[lessons.length - 1]?.y ?? firstY;
    chapter.x = 340;
    chapter.y = Math.round((firstY + lastY) / 2);
    cursorY = lastY + rowSpacing + chapterGap;
  });

  const canvasMiddleY = chapterNodes.length
    ? Math.round((chapterNodes[0].y + chapterNodes[chapterNodes.length - 1].y) / 2)
    : 0;
  const rootNode = {
    id: "subject-root",
    kind: "root",
    item: {},
    index: 0,
    title: options.rootTitle || "Môn học",
    description: options.rootDescription || "",
    type: "required",
    branch: "",
    contentType: "Môn học",
    prerequisiteIds: [],
    locked: false,
    overdue: false,
    allowSkip: false,
    status: "not_started",
    rawStatus: "not_started",
    x: 0,
    y: canvasMiddleY,
    lessonCount: lessonNodes.length,
  };

  const nodes = lessonNodes.length ? [rootNode, ...chapterNodes, ...lessonNodes] : [];
  const edges = [];

  chapterNodes.forEach((chapter) => {
    edges.push({
      id: `${rootNode.id}-${chapter.id}`,
      sourceId: rootNode.id,
      targetId: chapter.id,
      optional: false,
      structural: true,
    });
  });

  lessonNodes.forEach((lesson) => {
    const chapter = chapterByBranch.get(lesson.branch);
    if (chapter) {
      edges.push({
        id: `${chapter.id}-${lesson.id}`,
        sourceId: chapter.id,
        targetId: lesson.id,
        optional: lesson.type === "optional",
        structural: true,
      });
    }

    lesson.prerequisiteIds.forEach((sourceId) => {
      if (lessonNodes.some((candidate) => candidate.id === sourceId)) {
        edges.push({
          id: `${sourceId}-${lesson.id}`,
          sourceId,
          targetId: lesson.id,
          optional: lesson.type === "optional",
          structural: false,
        });
      }
    });
  });

  const completed = lessonNodes.filter((node) => node.rawStatus === "completed").length;
  const progress = lessonNodes.length ? Math.round((completed / lessonNodes.length) * 100) : 0;

  return {
    nodes,
    lessonNodes,
    chapterNodes,
    rootNode: lessonNodes.length ? rootNode : null,
    edges,
    branches: chapterNodes.map((chapter) => chapter.branch),
    progress,
    completed,
    total: lessonNodes.length,
  };
}

export function canCompleteRoadmapNode(node, nodes = []) {
  if (!node || node.kind !== "lesson" || node.rawStatus === "completed") return true;
  if (node.allowSkip) return true;

  const nodeById = new Map(nodes.map((item) => [item.id, item]));
  return node.prerequisiteIds.every((id) => nodeById.get(id)?.rawStatus === "completed");
}

export function filterRoadmapNodes(nodes = [], filters = {}) {
  const keyword = String(filters.keyword || "").trim().toLowerCase();
  const status = String(filters.status || "");
  const type = String(filters.type || "");
  const view = String(filters.view || "all");

  return nodes.filter((node) => {
    if (node.kind !== "lesson") return true;

    if (keyword) {
      const text = [
        node.title,
        node.description,
        node.item.lesson_chapter,
        node.item.assignment_title,
      ].filter(Boolean).join(" ").toLowerCase();
      if (!text.includes(keyword)) return false;
    }

    if (status === "overdue" && !node.overdue) return false;
    if (status && status !== "overdue" && node.status !== status && node.rawStatus !== status) return false;
    if (type && node.type !== type) return false;
    if (view === "current" && node.status !== "in_progress") return false;
    if (view === "incomplete" && node.rawStatus === "completed") return false;
    if (view === "overdue" && !node.overdue) return false;

    return true;
  });
}
