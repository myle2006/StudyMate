export const GAME_CONFIG = {
  openingMinute: 17 * 60,
  warningThresholdMinutes: 15,
  msPerGameMinute: 1000,
  walkInArrivalAfterMinutes: 2,
  preorderArrivalBeforeMinutes: 15,
};

export const FLOWERS = [
  { id: "tulip", name: "Tulip hồng", salePrice: 4, symbol: "♧", color: "#d87891", group: "Hoa chính" },
  { id: "rose", name: "Hồng phấn", salePrice: 3, symbol: "✿", color: "#e8a2a8", group: "Hoa chính" },
  { id: "baby", name: "Baby trắng", salePrice: 2, symbol: "❀", color: "#eadfc5", group: "Hoa điểm" },
  { id: "carnation", name: "Cẩm chướng hồng", salePrice: 3, symbol: "✿", color: "#cf789a", group: "Hoa chính" },
  { id: "daisy", name: "Cúc vàng", salePrice: 3, symbol: "✹", color: "#e9b94e", group: "Hoa chính" },
  { id: "leaf", name: "Lá bạc", salePrice: 1, symbol: "❧", color: "#6f9487", group: "Lá phụ" },
  { id: "sunflower", name: "Hướng dương", salePrice: 5, symbol: "☀", color: "#e7ad35", group: "Hoa chính" },
  { id: "lavender", name: "Lavender tím", salePrice: 2, symbol: "♨", color: "#8d78b5", group: "Hoa điểm" },
  { id: "orchid", name: "Lan hồ điệp", salePrice: 6, symbol: "❀", color: "#d9a6cf", group: "Hoa chính" },
  { id: "hydrangea", name: "Cẩm tú cầu xanh", salePrice: 5, symbol: "✤", color: "#82a9bf", group: "Hoa chính" },
  { id: "lily", name: "Ly trắng", salePrice: 4, symbol: "⚜", color: "#f0e7d4", group: "Hoa chính" },
  { id: "eucalyptus", name: "Bạch đàn", salePrice: 2, symbol: "❧", color: "#75998d", group: "Lá phụ" },
  { id: "peony", name: "Mẫu đơn hồng", salePrice: 7, symbol: "✺", color: "#d9829c", group: "Hoa chính" },
  { id: "chamomile", name: "Cúc tana", salePrice: 2, symbol: "❉", color: "#f2d46f", group: "Hoa điểm" },
];

export const WRAPS = [
  { id: "cream", name: "Giấy kem", price: 2 },
  { id: "pink", name: "Giấy hồng", price: 3 },
  { id: "kraft", name: "Giấy kraft", price: 1 },
];

export const CARDS = [
  { id: "plain", name: "Thiệp trơn", price: 1 },
  { id: "floral", name: "Thiệp viền hoa", price: 3 },
];

export const ORDER_STATES = {
  DRAFT: "draft",
  WAITING: "waiting",
  CONFIRMED: "confirmed",
  PREPARED: "prepared",
  DELIVERED: "delivered",
  CLOSED: "closed",
};

export const STATE_LABELS = {
  draft: "Đang phối",
  waiting: "Chờ khách duyệt",
  confirmed: "Đã chốt",
  prepared: "Đã chuẩn bị",
  delivered: "Đã giao",
  closed: "Chưa hoàn thành",
};

const zeroes = () => FLOWERS.map(() => 0);
const fitFlowerValues = (values = []) => FLOWERS.map((_, index) => Number.isFinite(values[index]) ? values[index] : 0);

export function money(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} phiếu`;
}

export function formatTime(minutes) {
  const safe = Math.max(0, Math.floor(minutes));
  return `${String(Math.floor(safe / 60) % 24).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export function orderTotal(order) {
  return order.quantities.reduce((sum, quantity, index) => sum + quantity * FLOWERS[index].salePrice, 0)
    + WRAPS[order.wrap].price + CARDS[order.cardStyle].price;
}

function orderCode(day, sequence) {
  return day === 1 ? `TH-${String(sequence).padStart(2, "0")}` : `TH-${day}-${String(sequence).padStart(2, "0")}`;
}

export function createOrders(day) {
  const templates = [
    {
      name: "Sinh nhật mẹ", source: "preorder", dueMinute: 17 * 60 + 30, budget: 29,
      preferred: 0, alternate: 1, message: "Chúc mừng sinh nhật mẹ!",
      brief: "Tông hồng nhẹ. Ưu tiên tulip hồng, có thể đổi sang hồng phấn.",
      quantities: [5, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], wrap: 1, cardStyle: 1,
      customer: { name: "Mai", emoji: "👩🏻", tone: "coral", greeting: "Chào tiệm, mình đến lấy hoa sinh nhật tặng mẹ.", feedback: "Bó hoa rất dịu dàng, mẹ mình chắc chắn sẽ thích!" },
    },
    {
      name: "Kỷ niệm ngày cưới", source: "walkin", dueMinute: 18 * 60, budget: 25,
      preferred: 0, alternate: 3, approvalRequired: true, message: "Chúc mình luôn vui bên nhau!",
      brief: "Tông hồng. Ưu tiên tulip hồng. Khách cần duyệt nếu đổi sang cẩm chướng hồng.",
      quantities: [4, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], wrap: 0, cardStyle: 0,
      customer: { name: "Minh", emoji: "🧑🏻", tone: "blue", greeting: "Mình cần một bó hoa kỷ niệm ngày cưới tối nay.", feedback: "Cảm ơn tiệm đã tư vấn loại hoa thay thế rất hợp ý." },
    },
    {
      name: "Cảm ơn cô giáo", source: "preorder", dueMinute: 18 * 60 + 30, budget: 20,
      preferred: 4, avoid: 2, message: "Em cảm ơn cô!",
      brief: "Tông vàng ấm, chọn cúc vàng làm hoa chính. Khách yêu cầu tránh baby trắng.",
      quantities: [0, 0, 0, 0, 5, 2, 0, 0, 0, 0, 0, 0, 0, 0], wrap: 0, cardStyle: 0,
      customer: { name: "An", emoji: "👧🏻", tone: "gold", greeting: "Em muốn đặt bó hoa cảm ơn cô giáo ạ.", feedback: "Hoa xinh và tông vàng ấm đúng như em mong muốn!" },
    },
  ];

  return templates.map((template, index) => ({
    ...template,
    id: orderCode(day, index + 1),
    state: ORDER_STATES.DRAFT,
    approved: false,
    reserved: zeroes(),
    allocated: zeroes(),
    finalPrice: null,
    late: false,
    revenueRecorded: false,
    visible: template.source === "preorder",
    arrived: false,
    customerPhase: "pending",
    arrivedAt: null,
    feedback: null,
  }));
}

export function createMarket(day) {
  return [
    { id: `retail-tulip-${day}`, flower: 0, size: 1, buyPrice: 4, remaining: 6, count: 0, stall: "Sạp Cô Lan", fresh: "Dùng trong ngày" },
    { id: `baby-bundle-${day}`, flower: 2, size: 3, buyPrice: 5, remaining: 3, count: 0, stall: "Sạp Cô Lan", fresh: "Tươi thêm 2 ngày" },
    { id: `tulip-bundle-${day}`, flower: 0, size: 5, buyPrice: 18, remaining: 4, count: 0, stall: "Sạp Nhà Vườn", fresh: "Tươi thêm 2 ngày" },
    { id: `daisy-bundle-${day}`, flower: 4, size: 3, buyPrice: 6, remaining: 3, count: 0, stall: "Sạp Nhà Vườn", fresh: "Tươi thêm 2 ngày" },
    { id: `sunflower-bundle-${day}`, flower: 6, size: 3, buyPrice: 9, remaining: 3, count: 0, stall: "Sạp Nắng Mai", fresh: "Tươi thêm 3 ngày" },
    { id: `lavender-bundle-${day}`, flower: 7, size: 5, buyPrice: 7, remaining: 4, count: 0, stall: "Sạp Nắng Mai", fresh: "Thơm lâu 4 ngày" },
    { id: `orchid-retail-${day}`, flower: 8, size: 1, buyPrice: 5, remaining: 5, count: 0, stall: "Nhà Lan Đà Lạt", fresh: "Tươi thêm 4 ngày" },
    { id: `hydrangea-retail-${day}`, flower: 9, size: 1, buyPrice: 4, remaining: 5, count: 0, stall: "Nhà Lan Đà Lạt", fresh: "Tươi thêm 2 ngày" },
    { id: `lily-bundle-${day}`, flower: 10, size: 3, buyPrice: 8, remaining: 3, count: 0, stall: "Vườn Hoa Mây", fresh: "Nụ nở trong 2 ngày" },
    { id: `eucalyptus-bundle-${day}`, flower: 11, size: 5, buyPrice: 5, remaining: 4, count: 0, stall: "Vườn Hoa Mây", fresh: "Tươi thêm 5 ngày" },
    { id: `peony-retail-${day}`, flower: 12, size: 1, buyPrice: 6, remaining: 4, count: 0, stall: "Góc Hoa Nhập", fresh: "Dùng trong 2 ngày" },
    { id: `chamomile-bundle-${day}`, flower: 13, size: 5, buyPrice: 6, remaining: 4, count: 0, stall: "Góc Hoa Nhập", fresh: "Tươi thêm 3 ngày" },
  ];
}

export const JOB_TEMPLATES = [
  { key: "wholesale-morning", type: "wholesale", stall: "Sạp Cô Lan", name: "Soạn đơn buổi sáng cho cô Lan", task: "Kéo đúng loại và số lượng hoa tươi vào khay.", prompt: "Cô cần giao 5 cành Tulip hồng và 3 cành Baby trắng. Con chọn hoa còn tươi, soạn đủ vào khay giúp cô nhé!", reward: 3, unit: "đơn", difficulty: "Cơ bản", levels: [
    { title: "Đơn đầu tiên", instruction: "Soạn 5 Tulip hồng tươi và 3 Baby trắng tươi.", mode: "count", tokens: [["tulip-fresh", "♧", "Tulip hồng", "Tươi"], ["baby-fresh", "❀", "Baby trắng", "Tươi"], ["tulip-wilted", "♧", "Tulip hồng", "Héo"]], solution: { "tulip-fresh": 5, "baby-fresh": 3 } },
    { title: "Đơn phối hai màu", instruction: "Soạn 4 Hồng phấn, 2 Cúc vàng và 2 Lá bạc; tất cả phải tươi.", mode: "count", tokens: [["rose-fresh", "✿", "Hồng phấn", "Tươi"], ["daisy-fresh", "✹", "Cúc vàng", "Tươi"], ["leaf-fresh", "❧", "Lá bạc", "Tươi"], ["tulip-damaged", "♧", "Tulip hồng", "Dập"]], solution: { "rose-fresh": 4, "daisy-fresh": 2, "leaf-fresh": 2 } },
    { title: "Đơn nhiều loại", instruction: "Soạn 3 Tulip, 3 Baby, 2 Lavender và 2 Bạch đàn còn tươi.", mode: "count", tokens: [["tulip-fresh", "♧", "Tulip hồng", "Tươi"], ["baby-fresh", "❀", "Baby trắng", "Tươi"], ["lavender-fresh", "♨", "Lavender tím", "Tươi"], ["eucalyptus-fresh", "❧", "Bạch đàn", "Tươi"], ["baby-wilted", "❀", "Baby trắng", "Héo"]], solution: { "tulip-fresh": 3, "baby-fresh": 3, "lavender-fresh": 2, "eucalyptus-fresh": 2 } },
  ] },
  { key: "sorting", type: "sorting", stall: "Sạp Nắng Mai", name: "Phân loại hoa mới nhập", task: "Kéo từng cành vào đúng khay chất lượng.", prompt: "Quan sát tình trạng từng cành rồi phân loại vào khay đạt hoặc khay loại.", reward: 2, unit: "lô", difficulty: "Cơ bản", levels: [
    { title: "Nhận biết hoa dập", instruction: "Kéo từng cành vào đúng khay.", mode: "sort", zones: [["good", "Khay hoa đạt"], ["reject", "Khay loại"]], tokens: [["tulip", "♧", "Tulip hồng", "Tươi"], ["daisy", "✹", "Cúc vàng", "Tươi"], ["orchid", "❀", "Lan hồ điệp", "Bị dập"]], solution: { tulip: "good", daisy: "good", orchid: "reject" } },
    { title: "Phân loại độ nở", instruction: "Hoa nở vừa vào khay bán hôm nay; nụ vào khay dưỡng; hoa héo vào khay loại.", mode: "sort", zones: [["today", "Bán hôm nay"], ["care", "Khay dưỡng"], ["reject", "Khay loại"]], tokens: [["rose-bloom", "✿", "Hồng phấn", "Nở vừa"], ["lily-bud", "⚜", "Ly trắng", "Còn nụ"], ["baby-wilted", "❀", "Baby trắng", "Héo"]], solution: { "rose-bloom": "today", "lily-bud": "care", "baby-wilted": "reject" } },
    { title: "Phân loại theo đơn", instruction: "Tách hoa theo ba đơn màu: hồng, vàng và trắng.", mode: "sort", zones: [["pink", "Đơn màu hồng"], ["yellow", "Đơn màu vàng"], ["white", "Đơn màu trắng"]], tokens: [["tulip-pink", "♧", "Tulip", "Hồng"], ["rose-pink", "✿", "Hồng phấn", "Hồng"], ["daisy-yellow", "✹", "Cúc", "Vàng"], ["sunflower-yellow", "☀", "Hướng dương", "Vàng"], ["baby-white", "❀", "Baby", "Trắng"]], solution: { "tulip-pink": "pink", "rose-pink": "pink", "daisy-yellow": "yellow", "sunflower-yellow": "yellow", "baby-white": "white" } },
  ] },
  { key: "sample-wrap", type: "sample-wrap", stall: "Góc Hoa Nhập", name: "Gói bó mẫu cho sạp", task: "Kéo hoa, giấy và nơ vào đúng vị trí của bó mẫu.", prompt: "Quan sát mẫu rồi chọn đúng hoa, giấy gói và nơ cho từng cấp.", reward: 3, unit: "bó", difficulty: "Cơ bản", levels: [
    { title: "Bó mẫu cơ bản", instruction: "Mẫu: 3 Mẫu đơn · giấy kem · nơ hồng.", mode: "slots", zones: [["flower", "Hoa chính"], ["paper", "Giấy gói"], ["ribbon", "Nơ"]], tokens: [["peony-3", "✺", "3 Mẫu đơn", "Hoa"], ["peony-4", "✺", "4 Mẫu đơn", "Hoa"], ["paper-cream", "▱", "Giấy kem", "Giấy"], ["paper-pink", "▱", "Giấy hồng", "Giấy"], ["ribbon-pink", "∞", "Nơ hồng", "Nơ"], ["ribbon-cream", "∞", "Nơ kem", "Nơ"]], solution: { flower: "peony-3", paper: "paper-cream", ribbon: "ribbon-pink" } },
    { title: "Bó sinh nhật", instruction: "Mẫu: 5 Tulip hồng · giấy kraft · nơ kem.", mode: "slots", zones: [["flower", "Hoa chính"], ["paper", "Giấy gói"], ["ribbon", "Nơ"]], tokens: [["tulip-5", "♧", "5 Tulip", "Hoa"], ["rose-5", "✿", "5 Hồng phấn", "Hoa"], ["paper-kraft", "▱", "Giấy kraft", "Giấy"], ["paper-pink", "▱", "Giấy hồng", "Giấy"], ["ribbon-cream", "∞", "Nơ kem", "Nơ"], ["ribbon-pink", "∞", "Nơ hồng", "Nơ"]], solution: { flower: "tulip-5", paper: "paper-kraft", ribbon: "ribbon-cream" } },
    { title: "Bó cao cấp", instruction: "Mẫu: 3 Lan hồ điệp · giấy hồng · nơ trắng.", mode: "slots", zones: [["flower", "Hoa chính"], ["paper", "Giấy gói"], ["ribbon", "Nơ"]], tokens: [["orchid-3", "❀", "3 Lan hồ điệp", "Hoa"], ["hydrangea-3", "✤", "3 Cẩm tú cầu", "Hoa"], ["paper-pink", "▱", "Giấy hồng", "Giấy"], ["paper-cream", "▱", "Giấy kem", "Giấy"], ["ribbon-white", "∞", "Nơ trắng", "Nơ"], ["ribbon-gold", "∞", "Nơ vàng", "Nơ"]], solution: { flower: "orchid-3", paper: "paper-pink", ribbon: "ribbon-white" } },
  ] },
  { key: "delivery", type: "delivery", stall: "Ban quản lý chợ", name: "Giao hàng nhiều địa điểm", task: "Kéo các điểm giao vào đúng thứ tự lộ trình.", prompt: "Ưu tiên đơn gấp và sắp xếp lộ trình giao hợp lý.", reward: 3, unit: "lượt", difficulty: "Khó", minReputation: 3, urgent: true, levels: [
    { title: "Hai điểm giao", instruction: "Baby của Cô Lan có nhãn GẤP. Hãy xếp điểm giao trước và sau.", mode: "slots", zones: [["first", "Giao trước"], ["second", "Giao sau"]], tokens: [["lan", "①", "Sạp Cô Lan", "Đơn gấp"], ["garden", "②", "Sạp Nhà Vườn", "Đơn thường"]], solution: { first: "lan", second: "garden" } },
    { title: "Ba điểm giao", instruction: "Giao đơn gấp trước, sau đó đi từ khu A sang B.", mode: "slots", zones: [["first", "Điểm 1"], ["second", "Điểm 2"], ["third", "Điểm 3"]], tokens: [["sun", "①", "Sạp Nắng Mai", "GẤP"], ["lan", "②", "Sạp Cô Lan", "Khu A"], ["cloud", "③", "Vườn Hoa Mây", "Khu B"]], solution: { first: "sun", second: "lan", third: "cloud" } },
    { title: "Chuyến giao lớn", instruction: "Ưu tiên GẤP, rồi giao hai đơn cùng khu trước khi sang khu xa.", mode: "slots", zones: [["first", "Điểm 1"], ["second", "Điểm 2"], ["third", "Điểm 3"], ["fourth", "Điểm 4"]], tokens: [["import", "①", "Góc Hoa Nhập", "GẤP"], ["lan", "②", "Sạp Cô Lan", "Khu A"], ["garden", "③", "Sạp Nhà Vườn", "Khu A"], ["cloud", "④", "Vườn Hoa Mây", "Khu C"]], solution: { first: "import", second: "lan", third: "garden", fourth: "cloud" } },
  ] },
  { key: "stock-count", type: "stock-count", stall: "Sạp Nhà Vườn", name: "Ghi nhớ và kiểm đếm hàng", task: "Kéo kết quả đối chiếu đúng vào phiếu kiểm hàng.", prompt: "Ghi nhớ số trên phiếu, so với hàng thực tế rồi chọn kết quả.", reward: 3, unit: "lô", difficulty: "Khó", minReputation: 3, levels: [
    { title: "Một loại hoa", instruction: "Phiếu: 10 Tulip. Thực tế: 8 Tulip và 2 Hồng phấn.", mode: "slots", zones: [["result", "Phiếu kết quả"]], tokens: [["short2-mix2", "✓", "Thiếu 2 Tulip, lẫn 2 Hồng", "Đối chiếu"], ["enough", "?", "Đủ 10 Tulip", "Đối chiếu"], ["extra2", "+", "Dư 2 cành", "Đối chiếu"]], solution: { result: "short2-mix2" } },
    { title: "Hai loại hoa", instruction: "Phiếu: 6 Baby, 4 Cúc. Thực tế: 5 Baby, 5 Cúc.", mode: "slots", zones: [["result", "Phiếu kết quả"]], tokens: [["baby-short-daisy-extra", "✓", "Thiếu 1 Baby, dư 1 Cúc", "Đối chiếu"], ["all-enough", "?", "Đủ cả hai loại", "Đối chiếu"], ["daisy-short", "−", "Thiếu 1 Cúc", "Đối chiếu"]], solution: { result: "baby-short-daisy-extra" } },
    { title: "Lô hàng lớn", instruction: "Phiếu: 8 Hồng, 5 Lá bạc. Thực tế: 7 Hồng, 5 Lá bạc và 1 Tulip.", mode: "slots", zones: [["result", "Phiếu kết quả"]], tokens: [["rose-short-mixed", "✓", "Thiếu 1 Hồng, lẫn 1 Tulip", "Đối chiếu"], ["rose-short", "−", "Chỉ thiếu 1 Hồng", "Đối chiếu"], ["enough", "?", "Đủ theo phiếu", "Đối chiếu"]], solution: { result: "rose-short-mixed" } },
  ] },
  { key: "shelf", type: "shelf", stall: "Nhà Lan Đà Lạt", name: "Xếp bình hoa lên kệ", task: "Bình cao ở dưới, hai bình cùng màu không cạnh nhau.", prompt: "Có bình xanh cao, hồng thấp, xanh thấp. Chọn thứ tự từ dưới lên.", reward: 3, unit: "kệ", options: [["bluehigh-pink-bluelow", "Xanh cao → Hồng thấp → Xanh thấp"], ["pink-bluehigh-bluelow", "Hồng thấp → Xanh cao → Xanh thấp"]], validAnswers: ["bluehigh-pink-bluelow"], error: "Bình cao phải ở dưới và hai bình xanh không được đặt cạnh nhau." },
  { key: "weigh", type: "weigh", stall: "Vườn Hoa Mây", name: "Cân nguyên liệu trang trí", task: "Chọn tối đa 2 túi đủ 300 g.", prompt: "Có các túi 100 g, 150 g và 200 g. Chọn tối đa 2 túi được 300 g.", reward: 1, unit: "gói", options: [["100+200", "100 g + 200 g"], ["150", "150 g"], ["150+200", "150 g + 200 g"]], validAnswers: ["100+200"], error: "Tổ hợp chưa đủ đúng 300 g trong giới hạn 2 túi." },
  { key: "water", type: "water", stall: "Sạp Cô Lan", name: "Thay nước cho xô hoa", task: "Đong đúng nước và dung dịch dưỡng.", prompt: "Nhãn xô: 3 lít nước + 1 ca dung dịch 100 ml.", reward: 1, unit: "xô", options: [["3l-100", "3 lít + 100 ml dưỡng"], ["2l-100", "2 lít + 100 ml dưỡng"], ["3l-200", "3 lít + 200 ml dưỡng"]], validAnswers: ["3l-100"], error: "Lượng nước hoặc dung dịch chưa đúng nhãn xô." },
  { key: "change", type: "change", stall: "Quầy thu phiếu", name: "Trả phiếu thừa", task: "Tính và trả đúng tiền thừa bằng phiếu có sẵn.", prompt: "Khách đưa 10 phiếu cho món 6 phiếu. Có mệnh giá 1, 2 và 5.", reward: 1, unit: "lượt", options: [["2+2", "2 + 2 phiếu"], ["2+1", "2 + 1 phiếu"], ["5", "5 phiếu"]], validAnswers: ["2+2"], error: "Còn thiếu 2 phiếu tiền thừa." },
  { key: "price-label", type: "price-label", stall: "Sạp Nhà Vườn", name: "Sửa nhãn giá", task: "Sửa đúng giá và đơn vị bán.", prompt: "Bảng giá ghi tulip bó 5 cành giá 18 phiếu. Nhãn nào đúng?", reward: 2, unit: "kệ", options: [["18-bundle", "18 phiếu/bó 5 cành"], ["18-stem", "18 phiếu/cành"], ["4-bundle", "4 phiếu/bó"]], validAnswers: ["18-bundle"], error: "Nhãn còn sai số phiếu hoặc đơn vị cành/bó." },
  { key: "truck", type: "truck", stall: "Kho vận chợ", name: "Xếp thùng lên xe", task: "Thùng nặng ở dưới; đơn giao trước dễ lấy.", prompt: "A nặng giao sau, B nhẹ giao trước. Chọn cách xếp.", reward: 4, unit: "chuyến", options: [["a-bottom-b-door", "A ở dưới · B gần cửa"], ["b-bottom-a-door", "B ở dưới · A gần cửa"]], validAnswers: ["a-bottom-b-door"], error: "Thùng nặng phải ở dưới và kiện giao trước phải gần cửa." },
  { key: "ribbon", type: "ribbon", stall: "Quầy phụ liệu", name: "Cắt ruy băng", task: "Chọn đúng màu, chiều dài và cuộn còn đủ.", prompt: "Cần 3 m ruy băng hồng. Cuộn H còn 4 m; cuộn K còn 2 m.", reward: 3, unit: "phiếu yêu cầu", options: [["pink-h-3", "Hồng · cuộn H · 3 m"], ["pink-k-3", "Hồng · cuộn K · 3 m"], ["blue-h-3", "Xanh · cuộn H · 3 m"]], validAnswers: ["pink-h-3"], error: "Màu, độ dài hoặc lượng còn lại của cuộn chưa phù hợp." },
  { key: "substitute", type: "substitute", stall: "Bàn tư vấn", name: "Tìm hoa thay thế", task: "Chọn hoa hồng, còn hàng, khách chấp nhận và không quá 4 phiếu/cành.", prompt: "Tulip hết. Khách chấp nhận hoa tông hồng, tối đa 4 phiếu/cành.", reward: 2, unit: "khách", options: [["rose", "Hồng phấn · 3 phiếu/cành"], ["carnation", "Cẩm chướng hồng · 3 phiếu/cành"], ["peony", "Mẫu đơn hồng · 7 phiếu/cành"]], validAnswers: ["rose", "carnation"], error: "Hoa thay thế phải còn hàng, đúng tông hồng, được chấp nhận và không quá 4 phiếu/cành." },
];

export function createJobs(day, round = 1) {
  const shiftKeys = ["wholesale-morning", "sorting", "sample-wrap", "delivery", "stock-count"];
  return shiftKeys.map((key) => JOB_TEMPLATES.find((job) => job.key === key)).map((job, index) => ({
    ...job,
    difficulty: job.difficulty || "Vừa",
    id: `VL-${day}-${round}-${String(index + 1).padStart(2, "0")}`,
    completed: false,
  }));
}

export function createInitialState() {
  return {
    day: 1,
    cash: 8,
    dayStartCash: 8,
    inventory: [2, 10, 8, 7, 6, 10, 3, 5, 2, 3, 3, 8, 2, 6],
    orders: createOrders(1),
    market: createMarket(1),
    jobs: createJobs(1),
    jobRound: 1,
    jobEarnings: 0,
    reputation: 0,
    opened: false,
    dayClosed: false,
    clockMinute: GAME_CONFIG.openingMinute,
    expenses: 0,
    revenue: 0,
    summaries: [],
    feedbacks: [],
    notice: "",
    noticeKind: "info",
  };
}

export function preorderNeeds(orders) {
  return orders.filter((order) => order.source === "preorder").reduce((needs, order) => {
    order.quantities.forEach((quantity, index) => { needs[index] += quantity; });
    return needs;
  }, zeroes());
}

export function shortages(state) {
  return preorderNeeds(state.orders).map((need, index) => Math.max(0, need - state.inventory[index]));
}

export function heldTotals(orders) {
  return orders.reduce((held, order) => {
    order.reserved.forEach((quantity, index) => { held[index] += quantity; });
    order.allocated.forEach((quantity, index) => {
      if (order.state === ORDER_STATES.CONFIRMED) held[index] += quantity;
    });
    return held;
  }, zeroes());
}

export function warningFor(order, clockMinute, threshold = GAME_CONFIG.warningThresholdMinutes) {
  if (!order.visible || [ORDER_STATES.DELIVERED, ORDER_STATES.CLOSED].includes(order.state)) return null;
  if (order.source === "walkin") return { kind: "waiting", label: "Khách đang chờ" };
  const remaining = order.dueMinute - clockMinute;
  if (remaining < 0) return { kind: "late", label: "Quá giờ giao", remaining };
  if (remaining <= threshold) return { kind: "soon", label: "Sắp đến giờ giao", remaining };
  return null;
}

function validateOrder(order, inventory) {
  const total = orderTotal(order);
  if (total > order.budget) return `Vượt ngân sách ${money(total - order.budget)}.`;
  const usable = inventory.map((quantity, index) => quantity + order.reserved[index]);
  const shortIndex = order.quantities.findIndex((quantity, index) => quantity > usable[index]);
  if (shortIndex >= 0) {
    const substituteHint = shortIndex === order.preferred && order.alternate !== undefined
      ? ` Hãy dùng “Đổi hoa chính” sang ${FLOWERS[order.alternate].name.toLowerCase()}.`
      : "";
    return `${FLOWERS[shortIndex].name} chỉ còn ${usable[shortIndex]} cành dùng được cho đơn này.${substituteHint}`;
  }
  if (order.avoid !== undefined && order.quantities[order.avoid] > 0) return `Hãy bỏ ${FLOWERS[order.avoid].name.toLowerCase()} theo yêu cầu khách.`;
  const hasMain = order.quantities[order.preferred] > 0 || (order.alternate !== undefined && order.quantities[order.alternate] > 0);
  if (!hasMain) return "Hãy chọn hoa chính hợp lệ theo yêu cầu khách.";
  return "";
}

function updateOrder(state, orderId, updater) {
  return { ...state, orders: state.orders.map((order) => order.id === orderId ? updater(order) : order) };
}

function notice(state, text, kind = "info") {
  return { ...state, notice: text, noticeKind: kind };
}

export function buildSummary(state, closedOrders, inventory) {
  const visibleOrders = closedOrders.filter((order) => order.visible);
  return {
    day: state.day,
    delivered: visibleOrders.filter((order) => order.state === ORDER_STATES.DELIVERED).length,
    late: visibleOrders.filter((order) => order.state === ORDER_STATES.DELIVERED && order.late).length,
    unfinished: visibleOrders.filter((order) => order.state === ORDER_STATES.CLOSED).length,
    revenue: state.revenue,
    expenses: state.expenses,
    cash: state.cash,
    dayStartCash: state.dayStartCash,
    jobEarnings: state.jobEarnings,
    balanceCheck: state.dayStartCash + state.jobEarnings + state.revenue - state.expenses,
    inventory: [...inventory],
    feedbacks: [...state.feedbacks],
    averageRating: state.feedbacks.length ? state.feedbacks.reduce((sum, item) => sum + item.rating, 0) / state.feedbacks.length : 0,
    orders: visibleOrders.map((order) => ({ id: order.id, name: order.name, state: order.state, price: order.finalPrice, late: order.late })),
  };
}

export function flowershopReducer(state, action) {
  switch (action.type) {
    case "SYNC_FLOWER_CATALOG": {
      if (state.cash > 999 || state.market.some((offer) => offer.buyPrice > 999)) {
        return { ...createInitialState(), notice: "Đã bắt đầu phiên Phiếu Chợ mới.", noticeKind: "success" };
      }
      const currentOffers = new Map(state.market.map((offer) => [offer.id, offer]));
      return {
        ...state,
        dayStartCash: Number.isFinite(state.dayStartCash) ? state.dayStartCash : state.cash,
        jobs: state.jobs?.length ? state.jobs : createJobs(state.day, state.jobRound || 1),
        jobRound: state.jobRound || 1,
        jobEarnings: state.jobEarnings || 0,
        reputation: state.reputation || 0,
        inventory: fitFlowerValues(state.inventory),
        orders: state.orders.map((order) => ({
          ...order,
          quantities: fitFlowerValues(order.quantities),
          reserved: fitFlowerValues(order.reserved),
          allocated: fitFlowerValues(order.allocated),
        })),
        market: createMarket(state.day).map((offer) => currentOffers.has(offer.id) ? { ...offer, ...currentOffers.get(offer.id) } : offer),
      };
    }
    case "CLEAR_NOTICE": return { ...state, notice: "", noticeKind: "info" };
    case "SET_NOTICE": return notice(state, action.text, action.kind || "info");
    case "SUBMIT_JOB": {
      if (state.opened || state.dayClosed) return notice(state, "Bảng việc làm chỉ mở trước giờ bán.", "error");
      const job = state.jobs.find((item) => item.id === action.jobId);
      if (!job) return notice(state, "Mã việc không còn trong bảng hiện tại.", "error");
      if (job.completed) return notice(state, `${job.id} đã nhận thưởng trước đó.`, "info");
      if ((job.minReputation || 0) > (state.reputation || 0)) return notice(state, `Cần ${job.minReputation} uy tín để mở việc này.`, "warning");
      if (action.answer?.levelsComplete) {
        // The interactive board validates every level before submitting the job.
      } else if (job.type === "wholesale") {
        const tray = action.answer || {};
        const babyMissing = Math.max(0, 3 - (tray.babyFresh || 0));
        const tulipMissing = Math.max(0, 5 - (tray.tulipFresh || 0) - (tray.tulipWilted || 0));
        if (babyMissing) return notice(state, `Khay còn thiếu ${babyMissing} cành Baby trắng. Con kiểm tra lại nhé!`, "error");
        if (tulipMissing) return notice(state, `Khay còn thiếu ${tulipMissing} cành Tulip hồng. Con kiểm tra lại nhé!`, "error");
        if (tray.tulipWilted) return notice(state, `Có ${tray.tulipWilted} cành Tulip bị héo. Hãy đổi sang cành tươi.`, "error");
        if (tray.tulipFresh !== 5 || tray.babyFresh !== 3) return notice(state, "Số hoa trong khay chưa đúng yêu cầu. Con lấy hoa thừa ra rồi kiểm tra lại nhé!", "error");
      } else if (!job.validAnswers.includes(action.answer)) return notice(state, job.error, "error");
      return notice({
        ...state,
        cash: state.cash + job.reward,
        jobEarnings: state.jobEarnings + job.reward,
        reputation: (state.reputation || 0) + 1,
        jobs: state.jobs.map((item) => item.id === job.id ? { ...item, completed: true, submittedAnswer: action.answer } : item),
      }, job.type === "wholesale" ? "Đủ hoa rồi, cảm ơn con! Con nhận được 3 Phiếu Chợ." : `Hoàn thành ${job.name}. Đã nhận ${money(job.reward)} thưởng việc làm.`, "success");
    }
    case "REFRESH_JOBS": {
      if (state.opened || state.dayClosed) return state;
      const nextRound = state.jobRound + 1;
      return notice({ ...state, jobRound: nextRound, jobs: createJobs(state.day, nextRound) }, `Đã nhận bảng việc làm lượt ${nextRound}.`, "success");
    }
    case "CART_CHANGE": {
      if (state.opened || state.dayClosed) return state;
      return {
        ...state,
        notice: "",
        market: state.market.map((offer) => offer.id === action.offerId
          ? { ...offer, count: Math.max(0, Math.min(offer.remaining, offer.count + action.change)) }
          : offer),
      };
    }
    case "PURCHASE": {
      if (state.opened || state.dayClosed) return state;
      const cost = state.market.reduce((sum, offer) => sum + offer.count * offer.buyPrice, 0);
      const invalidStock = state.market.some((offer) => offer.count > offer.remaining);
      if (!cost) return notice(state, "Giỏ hàng đang trống.", "error");
      if (invalidStock) return notice(state, "Số lượng mua vượt hàng còn ở sạp. Phiếu, kho và hàng sạp giữ nguyên.", "error");
      if (cost > state.cash) return notice(state, `Giỏ hàng còn thiếu ${money(cost - state.cash)}. Phiếu, kho và hàng sạp giữ nguyên.`, "error");
      const inventory = [...state.inventory];
      state.market.forEach((offer) => { inventory[offer.flower] += offer.count * offer.size; });
      return {
        ...state,
        cash: state.cash - cost,
        expenses: state.expenses + cost,
        inventory,
        market: state.market.map((offer) => ({ ...offer, remaining: offer.remaining - offer.count, count: 0 })),
        notice: `Đã nhập hoa vào kho. Còn ${money(state.cash - cost)}.`,
        noticeKind: "success",
      };
    }
    case "OPEN_SHOP": {
      if (state.opened || state.dayClosed) return state;
      const missing = shortages(state);
      if (missing.some(Boolean)) return notice(state, "Kho còn thiếu hoa cho đơn hẹn. Hãy đi chợ trước khi mở cửa.", "error");
      const inventory = [...state.inventory];
      const orders = state.orders.map((order) => {
        if (order.source !== "preorder") return order;
        order.quantities.forEach((quantity, index) => { inventory[index] -= quantity; });
        return { ...order, reserved: [...order.quantities] };
      });
      return { ...state, opened: true, inventory, orders, notice: "Tiệm đã mở. Hoa cho đơn đặt trước đã được giữ riêng.", noticeKind: "success" };
    }
    case "ARRIVE_NEXT_CUSTOMER": {
      if (!state.opened || state.dayClosed) return state;
      const next = state.orders.find((order) => order.source === "walkin" && !order.arrived)
        || state.orders.find((order) => !order.arrived);
      if (!next) return notice(state, "Hôm nay không còn khách mới.", "info");
      return notice(updateOrder(state, next.id, (order) => ({
        ...order, visible: true, arrived: true, customerPhase: "entering", arrivedAt: state.clockMinute,
      })), `${next.customer.name} đang bước vào tiệm và muốn đặt hoa.`, "info");
    }
    case "CUSTOMER_WAITING": {
      return updateOrder(state, action.orderId, (order) => order.customerPhase === "entering" ? { ...order, customerPhase: "waiting" } : order);
    }
    case "CUSTOMER_LEAVING": {
      return updateOrder(state, action.orderId, (order) => order.customerPhase === "feedback" ? { ...order, customerPhase: "leaving" } : order);
    }
    case "CUSTOMER_GONE": {
      return updateOrder(state, action.orderId, (order) => order.customerPhase === "leaving" ? { ...order, customerPhase: "gone" } : order);
    }
    case "ADD_WALKIN": {
      if (!state.opened || state.dayClosed) return state;
      const target = state.orders.find((order) => order.source === "walkin");
      if (!target || target.visible) return state;
      const available = state.inventory[target.preferred];
      return notice(updateOrder(state, target.id, (order) => ({ ...order, visible: true })),
        `Khách ghé tiệm cần ${target.quantities[target.preferred]} cành ${FLOWERS[target.preferred].name.toLowerCase()}; hiện chỉ còn ${available} cành khả dụng.`,
        available < target.quantities[target.preferred] ? "warning" : "info");
    }
    case "EDIT_QUANTITY": {
      const order = state.orders.find((item) => item.id === action.orderId);
      if (!order || ![ORDER_STATES.DRAFT, ORDER_STATES.WAITING].includes(order.state) || state.dayClosed) return state;
      const max = state.inventory[action.flowerIndex] + order.reserved[action.flowerIndex];
      return updateOrder({ ...state, notice: "" }, action.orderId, (item) => ({
        ...item,
        state: ORDER_STATES.DRAFT,
        approved: false,
        quantities: item.quantities.map((quantity, index) => index === action.flowerIndex ? Math.max(0, Math.min(max, quantity + action.change)) : quantity),
      }));
    }
    case "SET_OPTION": {
      const order = state.orders.find((item) => item.id === action.orderId);
      if (!order || ![ORDER_STATES.DRAFT, ORDER_STATES.WAITING].includes(order.state) || state.dayClosed) return state;
      return updateOrder({ ...state, notice: "" }, action.orderId, (item) => ({ ...item, [action.key]: action.value, state: ORDER_STATES.DRAFT, approved: false }));
    }
    case "SWAP_MAIN": {
      const order = state.orders.find((item) => item.id === action.orderId);
      if (!order || order.alternate === undefined || ![ORDER_STATES.DRAFT, ORDER_STATES.WAITING].includes(order.state) || state.dayClosed) return state;
      const quantity = order.quantities[order.preferred];
      const max = state.inventory[order.alternate] + order.reserved[order.alternate];
      if (!quantity || quantity > max) return notice(state, `${FLOWERS[order.alternate].name} chỉ còn ${max} cành dùng được.`, "error");
      return notice(updateOrder(state, action.orderId, (item) => ({
        ...item, state: ORDER_STATES.DRAFT, approved: false,
        quantities: item.quantities.map((value, index) => index === item.preferred ? 0 : index === item.alternate ? value + quantity : value),
      })), `Đã đổi hoa chính sang ${FLOWERS[order.alternate].name.toLowerCase()}.`, "info");
    }
    case "CONFIRM_ORDER": {
      const order = state.orders.find((item) => item.id === action.orderId);
      if (!order || order.state !== ORDER_STATES.DRAFT || state.dayClosed) return state;
      const problem = validateOrder(order, state.inventory);
      if (problem) return notice(state, problem, "error");
      if (order.approvalRequired && order.quantities[order.alternate] > 0 && !order.approved) {
        return notice(updateOrder(state, order.id, (item) => ({ ...item, state: ORDER_STATES.WAITING })), "Phương án thay thế đang chờ khách duyệt.", "warning");
      }
      const inventory = [...state.inventory];
      order.reserved.forEach((quantity, index) => { inventory[index] += quantity; });
      order.quantities.forEach((quantity, index) => { inventory[index] -= quantity; });
      return notice({
        ...state, inventory,
        orders: state.orders.map((item) => item.id === order.id ? { ...item, state: ORDER_STATES.CONFIRMED, reserved: zeroes(), allocated: [...item.quantities], finalPrice: orderTotal(item) } : item),
      }, "Đã chốt đơn và giữ nguyên liệu cho bó hoa.", "success");
    }
    case "APPROVE_ORDER": {
      const order = state.orders.find((item) => item.id === action.orderId);
      if (!order || order.state !== ORDER_STATES.WAITING || state.dayClosed) return state;
      const problem = validateOrder({ ...order, approved: true }, state.inventory);
      if (problem) return notice(state, problem, "error");
      const inventory = [...state.inventory];
      order.reserved.forEach((quantity, index) => { inventory[index] += quantity; });
      order.quantities.forEach((quantity, index) => { inventory[index] -= quantity; });
      return notice({
        ...state,
        inventory,
        orders: state.orders.map((item) => item.id === order.id ? {
          ...item,
          state: ORDER_STATES.CONFIRMED,
          approved: true,
          reserved: zeroes(),
          allocated: [...item.quantities],
          finalPrice: orderTotal(item),
        } : item),
      }, "Khách đã đồng ý hoa thay thế. Đơn đã được chốt và nguyên liệu đã được giữ.", "success");
    }
    case "PREPARE_ORDER": {
      const order = state.orders.find((item) => item.id === action.orderId);
      if (!order || order.state !== ORDER_STATES.CONFIRMED || state.dayClosed) return state;
      return notice(updateOrder(state, order.id, (item) => ({ ...item, state: ORDER_STATES.PREPARED })), "Bó hoa đã chuẩn bị xong.", "success");
    }
    case "DELIVER_ORDER": {
      const order = state.orders.find((item) => item.id === action.orderId);
      if (!order || order.state !== ORDER_STATES.PREPARED || order.revenueRecorded || state.dayClosed) return state;
      const price = order.finalPrice ?? orderTotal(order);
      const waitMinutes = Math.max(0, state.clockMinute - (order.arrivedAt ?? state.clockMinute));
      const late = order.source === "preorder" ? state.clockMinute > order.dueMinute : waitMinutes > 30;
      const rating = late ? 3 : waitMinutes > 15 ? 4 : 5;
      const comment = rating === 5 ? order.customer.feedback
        : rating === 4 ? "Bó hoa đẹp và đúng ý, nếu nhanh hơn một chút sẽ hoàn hảo."
          : "Hoa ổn nhưng mình đã phải chờ khá lâu. Mong tiệm phục vụ nhanh hơn lần sau.";
      const feedback = { orderId: order.id, customer: order.customer.name, emoji: order.customer.emoji, rating, comment };
      return notice({
        ...state,
        cash: state.cash + price,
        revenue: state.revenue + price,
        feedbacks: [...state.feedbacks, feedback],
        orders: state.orders.map((item) => item.id === order.id ? {
          ...item, state: ORDER_STATES.DELIVERED, revenueRecorded: true, late, feedback, customerPhase: "feedback",
        } : item),
      }, `Đã bàn giao và nhận ${money(price)} từ khách.`, "success");
    }
    case "TICK": {
      if (!state.opened || state.dayClosed) return state;
      const clockMinute = state.clockMinute + (action.minutes || 1);
      const orders = state.orders.map((order) => {
        if (order.arrived) return order;
        const shouldArrive = order.source === "walkin"
          ? clockMinute >= GAME_CONFIG.openingMinute + GAME_CONFIG.walkInArrivalAfterMinutes
          : clockMinute >= order.dueMinute - GAME_CONFIG.preorderArrivalBeforeMinutes;
        return shouldArrive ? { ...order, visible: true, arrived: true, customerPhase: "entering", arrivedAt: clockMinute } : order;
      });
      return { ...state, clockMinute, orders };
    }
    case "CLOSE_DAY": {
      if (!state.opened || state.dayClosed) return state;
      const inventory = [...state.inventory];
      const orders = state.orders.map((order) => {
        if (!order.visible || order.state === ORDER_STATES.DELIVERED) return { ...order, customerPhase: "gone" };
        if ([ORDER_STATES.DRAFT, ORDER_STATES.WAITING].includes(order.state)) {
          order.reserved.forEach((quantity, index) => { inventory[index] += quantity; });
        }
        if (order.state === ORDER_STATES.CONFIRMED) {
          order.allocated.forEach((quantity, index) => { inventory[index] += quantity; });
        }
        return { ...order, state: ORDER_STATES.CLOSED, reserved: zeroes(), allocated: zeroes(), customerPhase: "gone" };
      });
      const summary = buildSummary(state, orders, inventory);
      return { ...state, inventory, orders, dayClosed: true, summaries: [...state.summaries, summary], notice: `Đã kết thúc ngày ${state.day}.`, noticeKind: "success" };
    }
    case "NEXT_DAY": {
      if (!state.dayClosed) return state;
      const nextDay = state.day + 1;
      return {
        ...state,
        day: nextDay,
        dayStartCash: state.cash,
        orders: createOrders(nextDay),
        market: createMarket(nextDay),
        jobs: createJobs(nextDay),
        jobRound: 1,
        jobEarnings: 0,
        reputation: state.reputation || 0,
        opened: false,
        dayClosed: false,
        clockMinute: GAME_CONFIG.openingMinute,
        expenses: 0,
        revenue: 0,
        feedbacks: [],
        notice: `Ngày ${nextDay} đã bắt đầu. Hàng ở chợ và đơn hàng đã được làm mới.`,
        noticeKind: "success",
      };
    }
    default: return state;
  }
}
