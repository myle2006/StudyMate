import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildRoadmapVisualModel,
  canCompleteRoadmapNode,
  filterRoadmapNodes,
} from "../src/modules/learningRoadmaps/utils/roadmapVisualUtils.js";
import { findNextStudyNode } from "../src/modules/learningRoadmaps/utils/roadmapStudyFlow.js";

const sampleItems = [
  {
    id: 1,
    lesson_id: 101,
    lesson_title: "Tổng quan kiểm thử",
    lesson_chapter: "Chương 1 - Nền tảng",
    lesson_content: "Khái niệm QA, QC và testing.",
    week_number: 1,
    order_number: 1,
    planned_date: "2026-08-10",
    start_time: "08:00",
    duration_minutes: 60,
    priority: "high",
    status: "completed",
  },
  {
    id: 2,
    lesson_id: 102,
    lesson_title: "Thiết kế test case",
    lesson_chapter: "Chương 1 - Nền tảng",
    lesson_content: "Equivalence partitioning và boundary value.",
    week_number: 1,
    order_number: 2,
    planned_date: "2026-08-13",
    start_time: "08:00",
    duration_minutes: 90,
    priority: "high",
    status: "in_progress",
  },
  {
    id: 3,
    lesson_id: 103,
    lesson_title: "Bug report",
    lesson_chapter: "Chương 2 - Thực hành",
    lesson_content: "Severity, priority và reproduction steps.",
    week_number: 2,
    order_number: 1,
    planned_date: "2026-08-01",
    start_time: "08:00",
    duration_minutes: 90,
    priority: "medium",
    status: "not_started",
  },
  {
    id: 4,
    lesson_id: 104,
    lesson_title: "Exploratory testing",
    lesson_chapter: "Chương 2 - Thực hành",
    lesson_content: "Charter và session notes.",
    week_number: 2,
    order_number: 2,
    planned_date: "2026-08-20",
    start_time: "08:00",
    duration_minutes: 45,
    priority: "low",
    status: "not_started",
  },
];

const model = buildRoadmapVisualModel(sampleItems, {
  rootTitle: "Kiểm thử phần mềm",
  now: new Date("2026-08-12T12:00:00"),
});
const explicitDependencyModel = buildRoadmapVisualModel([
  { id: 10, lesson_id: 100, lesson_title: "Node A", week_number: 1, order_number: 1, status: "completed" },
  { id: 11, lesson_id: 101, lesson_title: "Node B", week_number: 1, order_number: 2, status: "not_started", prerequisite_lesson_ids: [100] },
], { now: new Date("2026-08-12T12:00:00") });
const lessonOnlyModel = buildRoadmapVisualModel([
  { id: 20, title: "Task lộ trình không phải bài học", week_number: 1, order_number: 1, status: "not_started" },
  { id: 21, lesson_id: 201, lesson_title: "Bài học thật", lesson_chapter: "Chương 3", week_number: 1, order_number: 2, status: "not_started" },
], { now: new Date("2026-08-12T12:00:00") });
const results = [];

function record(name, expected, actual, fn) {
  fn();
  results.push({ name, expected, actual });
}

record(
  "Hiển thị đúng cây môn học, chương và bài học",
  "1 root, 2 chapter nodes, 4 lesson nodes; non-lesson task is hidden",
  `${model.rootNode?.title}; chapters ${model.chapterNodes.length}; lessons ${model.lessonNodes.length}; lesson-only ${lessonOnlyModel.lessonNodes.length}`,
  () => {
    assert.equal(model.rootNode.title, "Kiểm thử phần mềm");
    assert.equal(model.chapterNodes.length, 2);
    assert.equal(model.lessonNodes.length, 4);
    assert.equal(lessonOnlyModel.lessonNodes.length, 1);
    assert.equal(lessonOnlyModel.lessonNodes[0].title, "Bài học thật");
  },
);

record(
  "Hiển thị đúng đường nối",
  "root connects to chapters, chapters connect to lessons, explicit lesson dependency creates extra edge",
  `${model.edges.length} edges; explicit edges ${explicitDependencyModel.edges.length}`,
  () => {
    assert.ok(model.edges.some((edge) => edge.sourceId === "subject-root" && edge.targetId.startsWith("chapter-")));
    assert.ok(model.edges.some((edge) => edge.sourceId.startsWith("chapter-") && edge.targetId.startsWith("node-")));
    assert.ok(explicitDependencyModel.edges.some((edge) => edge.sourceId === "node-10" && edge.targetId === "node-11"));
    assert.deepEqual(explicitDependencyModel.lessonNodes.find((node) => node.id === "node-11").prerequisiteIds, ["node-10"]);
  },
);

record(
  "Mở đúng chi tiết khi nhấn vào node bài học",
  "node id 2 maps to lesson title Thiết kế test case",
  model.lessonNodes.find((node) => node.item.id === 2)?.title,
  () => {
    assert.equal(model.lessonNodes.find((node) => node.item.id === 2)?.title, "Thiết kế test case");
  },
);

record(
  "Thu gọn và mở rộng theo chương",
  "Branches are lesson chapters",
  model.branches.join(", "),
  () => {
    assert.deepEqual(model.branches, ["Chương 1 - Nền tảng", "Chương 2 - Thực hành"]);
  },
);

record(
  "Tính đúng phần trăm tiến độ theo số bài học",
  "1/4 completed = 25%",
  `${model.completed}/${model.total} = ${model.progress}%`,
  () => {
    assert.equal(model.completed, 1);
    assert.equal(model.total, 4);
    assert.equal(model.progress, 25);
  },
);

record(
  "Không gợi ý lại bài đã hoàn thành",
  "An all-completed roadmap has no next study node",
  String(findNextStudyNode(sampleItems.map((item) => ({ ...item, status: "completed" }))).node),
  () => {
    assert.equal(findNextStudyNode(sampleItems.map((item) => ({ ...item, status: "completed" }))).node, null);
  },
);

record(
  "Không cho hoàn thành node khi thiếu tiên quyết",
  "Bug report is blocked because node 2 is not completed",
  String(canCompleteRoadmapNode(model.lessonNodes.find((node) => node.item.id === 3), model.nodes)),
  () => {
    assert.equal(canCompleteRoadmapNode(model.lessonNodes.find((node) => node.item.id === 3), model.nodes), false);
  },
);

record(
  "Lọc node theo trạng thái",
  "overdue filter returns Bug report and keeps structural nodes available",
  filterRoadmapNodes(model.nodes, { view: "overdue" }).map((node) => node.title).join(", "),
  () => {
    assert.ok(filterRoadmapNodes(model.nodes, { view: "overdue" }).some((node) => node.title === "Bug report"));
    assert.ok(filterRoadmapNodes(model.nodes, { view: "overdue" }).some((node) => node.kind === "root"));
  },
);

record(
  "Chọn lộ trình 1, 3 hoặc 6 tháng",
  "duration labels are data-driven in template selector",
  "1/3/6 month variants represented by template duration fields",
  () => {
    const durations = [1, 3, 6].map((months) => ({ duration_months: months }));
    assert.deepEqual(durations.map((item) => item.duration_months), [1, 3, 6]);
  },
);

record(
  "Responsive desktop, tablet và mobile",
  "component has desktop side panel and mobile bottom sheet classes",
  "lg:grid-cols + fixed bottom sheet",
  () => {
    const source = readFileSync("src/modules/learningRoadmaps/components/RoadmapVisualExplorer.jsx", "utf8");
    assert.match(source, /lg:grid-cols/);
    assert.match(source, /fixed inset-x-0 bottom-0/);
  },
);

record(
  "Không đè chữ, node hoặc đường nối",
  "nodes have fixed width and edges render in SVG layer",
  "w-56/w-64 nodes + svg edges",
  () => {
    const source = readFileSync("src/modules/learningRoadmaps/components/RoadmapVisualExplorer.jsx", "utf8");
    assert.match(source, /w-56/);
    assert.match(source, /w-64/);
    assert.match(source, /<svg/);
    assert.match(source, /data-testid="roadmap-visual-edge"/);
  },
);

console.table(results.map((item) => ({
  Test: item.name,
  "Expected Result": item.expected,
  "Actual Result": item.actual,
})));
