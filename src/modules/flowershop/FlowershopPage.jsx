import React, { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";
import { Navigate, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { BriefcaseBusiness, Clock3, Flower2, PackageOpen, ShoppingBasket, Store, WalletCards } from "lucide-react";
import {
  CARDS, FLOWERS, GAME_CONFIG, ORDER_STATES, STATE_LABELS, WRAPS,
  createInitialState, createMarket, flowershopReducer, formatTime, heldTotals, money,
  orderTotal, preorderNeeds, shortages, warningFor,
} from "./flowershopGame";
import "./flowershop.css";

const GameContext = createContext(null);
const FLOWER_SHOP_LOGO_URL = `${window.STUDYMATE_BASE_PATH || ""}/public/assets/images/flowershop/flower-shop-logo.png`;
const FLOWER_ATLAS_URL = `${window.STUDYMATE_BASE_PATH || ""}/public/assets/images/flowershop/flower-states-atlas-v1.png`;
const FLOWER_ATLAS_CELLS = [
  ["tulip-wilted", 1, 0], ["tulip-damaged", 2, 0], ["tulip", 0, 0],
  ["baby-wilted", 0, 1], ["baby", 3, 0], ["rose", 1, 1], ["daisy", 2, 1], ["leaf", 3, 1],
  ["lavender", 0, 2], ["eucalyptus", 1, 2], ["orchid", 2, 2], ["lily", 3, 2],
  ["sunflower", 0, 3], ["peony", 1, 3], ["hydrangea", 2, 3], ["chamomile", 3, 3],
];

function TokenVisual({ token }) {
  const cell = FLOWER_ATLAS_CELLS.find(([prefix]) => token.id.startsWith(prefix));
  if (!cell) return <span className="fs-token-visual" aria-hidden="true">{token.icon}</span>;
  const [, column, row] = cell;
  return <span className="fs-token-visual fs-token-visual--flower" aria-hidden="true" style={{ backgroundImage: `url(${FLOWER_ATLAS_URL})`, backgroundPosition: `${column * 100 / 3}% ${row * 100 / 3}%` }} />;
}

function useGame() {
  return useContext(GameContext);
}

function Notice() {
  const { state } = useGame();
  if (!state.notice) return null;
  return <div className={`fs-notice fs-notice--${state.noticeKind}`} role="status">{state.notice}</div>;
}

function Clock({ compact = false }) {
  const { state, dispatch } = useGame();
  if (!state.opened) return <span className="fs-clock fs-clock--closed"><Clock3 size={16} /> Chưa mở cửa</span>;
  return (
    <div className={`fs-clock ${compact ? "fs-clock--compact" : ""}`} aria-label={`Giờ trong game ${formatTime(state.clockMinute)}`}>
      <Clock3 size={16} />
      <strong>{formatTime(state.clockMinute)}</strong>
      {!state.dayClosed && <button type="button" onClick={() => dispatch({ type: "TICK", minutes: 1 })}>+1 phút</button>}
      {!state.dayClosed && <button type="button" onClick={() => dispatch({ type: "TICK", minutes: 15 })}>+15 phút</button>}
    </div>
  );
}

function GameLayout({ children }) {
  const { state } = useGame();
  const links = [
    ["/flowershop/opening", "Mở tiệm", Store],
    ["/flowershop/market", "Chợ hoa", ShoppingBasket],
    ["/flowershop/jobs", "Việc làm", BriefcaseBusiness],
    ["/flowershop/desk", "Bàn phối", Flower2],
    ["/flowershop/inventory", "Kho hoa", PackageOpen],
    ["/flowershop/summary", "Tổng kết", WalletCards],
  ];
  return (
    <main className="flowershop-page">
      <section className="fs-app">
        <div className="fs-awning" aria-hidden="true">{Array.from({ length: 14 }, (_, index) => <i key={index} />)}</div>
        <header className="fs-header">
          <div className="fs-brand"><span className="fs-brand-logo"><img src={FLOWER_SHOP_LOGO_URL} alt="PLT Solutions" /></span><div><em>EST. 2026 · FLOWER & GIFT</em><strong>Tiệm Hoa Hẹn</strong><small>Hoa tươi cho những lời chưa nói · Ngày {state.day}</small></div></div>
          <div className="fs-header-meta"><span className="fs-cash">Phiếu đang có <strong>{money(state.cash)}</strong></span><Clock compact /></div>
        </header>
        <div className="fs-greenery" aria-hidden="true"><span>❧</span><i /><b>✿</b><i /><span>❧</span></div>
        <nav className="fs-nav" aria-label="Các khu vực trong tiệm">
          {links.map(([to, label, Icon], index) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? "active" : ""}>
              <small>{String(index + 1).padStart(2, "0")}</small><Icon size={18} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="fs-content"><Notice />{children}</div>
        <footer className="fs-shop-footer"><span>✿</span><p>Tiệm Hoa Hẹn · Mỗi bó hoa, một câu chuyện</p><span>✿</span></footer>
      </section>
    </main>
  );
}

function EntryRoute() {
  const { state } = useGame();
  if (state.dayClosed) return <Navigate to="summary" replace />;
  return <Navigate to={state.opened ? "desk" : "opening"} replace />;
}

function RequireOpen({ children, allowSummary = false }) {
  const { state } = useGame();
  if (!state.opened && !(allowSummary && state.dayClosed)) return <Navigate to="/flowershop/opening" replace />;
  return children;
}

function PageTitle({ eyebrow, title, description, aside }) {
  return <div className="fs-page-title"><div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{aside}</div>;
}

function OpeningPage() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const needs = preorderNeeds(state.orders);
  const missing = shortages(state);
  const preorders = state.orders.filter((order) => order.source === "preorder");

  function openShop() {
    if (state.opened) { navigate("/flowershop/desk"); return; }
    dispatch({ type: "OPEN_SHOP" });
  }

  useEffect(() => {
    if (state.opened && state.noticeKind === "success") navigate("/flowershop/desk");
  }, [state.opened, state.noticeKind, navigate]);

  return <>
    <PageTitle eyebrow={`Ngày ${state.day} · Trước giờ bán`} title="Chuẩn bị mở cửa" description="Đọc sổ hẹn, đối chiếu kho và nhập đủ nguyên liệu trước khi đón khách." aside={<Clock />} />
    <div className="fs-stat-band"><div><small>Phiếu đang có</small><strong>{money(state.cash)}</strong></div><span>{preorders.length} đơn đặt trước hôm nay</span></div>
    <div className="fs-grid fs-grid--opening">
      <section className="fs-card"><div className="fs-card-title"><h2>Sổ đơn đặt trước</h2><span>{preorders.length} đơn</span></div>
        {preorders.map((order) => <article className="fs-plan" key={order.id}>
          <div><strong>{order.id} · {order.name}</strong><time>{formatTime(order.dueMinute)}</time></div>
          <p>{order.brief}</p><small>{order.quantities.map((quantity, index) => quantity ? `${FLOWERS[index].name} ${quantity}` : "").filter(Boolean).join(" · ")}</small>
          <b>Khách có tối đa {money(order.budget)}</b>
        </article>)}
      </section>
      <section className="fs-card"><div className="fs-card-title"><h2>Kho và nhu cầu</h2><span>{state.opened ? "Đã giữ hoa" : "Cần kiểm tra"}</span></div>
        <div className="fs-needs">
          {FLOWERS.map((flower, index) => needs[index] > 0 && <div key={flower.id}><span style={{ color: flower.color }}>{flower.symbol}</span><div><strong>{flower.name}</strong><small>Cần {needs[index]} · Trong kho {state.inventory[index]}</small></div><b className={missing[index] ? "is-short" : "is-ready"}>{missing[index] ? `Thiếu ${missing[index]}` : "Đủ"}</b></div>)}
        </div>
        {!state.opened && <div className="fs-actions"><button type="button" className="fs-button fs-button--secondary" onClick={() => navigate("/flowershop/jobs")}>Đi làm thêm</button><button type="button" className="fs-button fs-button--secondary" onClick={() => navigate("/flowershop/market")}>Đi chợ hoa</button><button type="button" className="fs-button fs-button--primary" onClick={openShop}>Mở cửa tiệm</button></div>}
        {state.opened && <button type="button" className="fs-button fs-button--primary fs-button--block" onClick={() => navigate("/flowershop/desk")}>Vào bàn phối hoa</button>}
      </section>
    </div>
  </>;
}

function MarketPage() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  if (state.opened) return <Navigate to="/flowershop/desk" replace />;
  const cartCost = state.market.reduce((sum, offer) => sum + offer.count * offer.buyPrice, 0);
  const missing = shortages(state);
  const purchased = FLOWERS.map((_, flowerIndex) => state.market.reduce((sum, offer) => sum + (offer.flower === flowerIndex ? offer.count * offer.size : 0), 0));
  return <>
    <PageTitle eyebrow={`Ngày ${state.day} · Nhập hàng`} title="Chợ hoa đầu ngày" description="Giá nhập của chủ sạp tính bằng Phiếu Chợ. Giao dịch lỗi giữ nguyên phiếu, kho và hàng sạp." aside={<span className="fs-pill">Còn {money(state.cash)}</span>} />
    <div className="fs-grid fs-grid--market">
      <section className="fs-card"><div className="fs-card-title"><h2>Danh sách cần mua</h2></div>
        {FLOWERS.map((flower, index) => missing[index] > 0 && <div className="fs-market-need" key={flower.id}><strong>{flower.name}</strong><span>Sáng nay thiếu {missing[index]} cành</span><small>{Math.max(0, missing[index] - purchased[index]) ? `Sau giỏ còn thiếu ${Math.max(0, missing[index] - purchased[index])}` : "Giỏ hiện tại đã đủ"}</small></div>)}
        <button className="fs-text-button" type="button" onClick={() => navigate("/flowershop/opening")}>← Về màn hình mở tiệm</button>
      </section>
      <section className="fs-card"><div className="fs-card-title"><h2>Các sạp hoa</h2></div>
        {[...new Set(state.market.map((offer) => offer.stall))].map((stall) => <div className="fs-stall" key={stall}><h3>{stall}</h3>{state.market.filter((offer) => offer.stall === stall).map((offer) => <div className="fs-offer" key={offer.id}>
          <span className="fs-flower-icon" style={{ color: FLOWERS[offer.flower].color }}>{FLOWERS[offer.flower].symbol}</span>
          <div><strong>{FLOWERS[offer.flower].name}</strong><small>{money(offer.buyPrice)}/{offer.size === 1 ? "cành" : `bó ${offer.size} cành`} · Còn {offer.remaining}</small><em>{offer.fresh}</em></div>
          <div className="fs-stepper"><button disabled={!offer.count} onClick={() => dispatch({ type: "CART_CHANGE", offerId: offer.id, change: -1 })}>−</button><span>{offer.count}</span><button disabled={offer.count >= offer.remaining} onClick={() => dispatch({ type: "CART_CHANGE", offerId: offer.id, change: 1 })}>+</button></div>
        </div>)}</div>)}
      </section>
      <section className="fs-card fs-cart"><div className="fs-card-title"><h2>Giỏ đi chợ</h2><span>{state.market.reduce((sum, offer) => sum + offer.count, 0)} món</span></div>
        {state.market.some((offer) => offer.count) ? state.market.filter((offer) => offer.count).map((offer) => <div className="fs-cart-line" key={offer.id}><span>{FLOWERS[offer.flower].name}<small>{offer.count * offer.size} cành</small></span><strong>{money(offer.count * offer.buyPrice)}</strong></div>) : <p className="fs-empty">Chưa có hoa trong giỏ.</p>}
        <div className="fs-cart-total"><div><span>Phiếu đang có</span><strong>{money(state.cash)}</strong></div><div><span>Phiếu nhập hàng</span><strong>{money(cartCost)}</strong></div><div className={cartCost > state.cash ? "is-over" : "is-left"}><span>{cartCost > state.cash ? "Còn thiếu" : "Còn lại"}</span><strong>{money(Math.abs(state.cash - cartCost))}</strong></div></div>
        {cartCost > state.cash && <button type="button" className="fs-button fs-button--secondary fs-button--block" onClick={() => navigate("/flowershop/jobs")}>Đi làm thêm · thiếu {money(cartCost - state.cash)}</button>}
        <button type="button" className="fs-button fs-button--primary fs-button--block" disabled={!cartCost} onClick={() => dispatch({ type: "PURCHASE" })}>Xác nhận nhập hàng</button>
      </section>
    </div>
  </>;
}

function InteractiveJobBoard({ job, disabled, onFinish }) {
  const [levelIndex, setLevelIndex] = useState(0);
  const [placements, setPlacements] = useState({});
  const [selectedToken, setSelectedToken] = useState("");
  const [draggedToken, setDraggedToken] = useState("");
  const [feedback, setFeedback] = useState("");
  const level = job.levels[levelIndex];
  const tokens = level.tokens.map(([id, icon, label, detail]) => ({ id, icon, label, detail }));
  const zones = (level.zones || [["tray", "Khay hàng"]]).map(([id, label]) => ({ id, label }));

  function tokenById(id) { return tokens.find((token) => token.id === id); }
  function isPlaced(tokenId) {
    if (level.mode === "count") return false;
    if (level.mode === "sort") return Boolean(placements[tokenId]);
    return Object.values(placements).includes(tokenId);
  }
  function place(tokenId, zoneId) {
    if (!tokenId || disabled) return;
    setFeedback("");
    setPlacements((current) => {
      if (level.mode === "count") return { ...current, [tokenId]: (current[tokenId] || 0) + 1 };
      if (level.mode === "sort") return { ...current, [tokenId]: zoneId };
      const next = Object.fromEntries(Object.entries(current).filter(([, value]) => value !== tokenId));
      return { ...next, [zoneId]: tokenId };
    });
    setSelectedToken("");
    setDraggedToken("");
  }
  function remove(tokenId, zoneId) {
    if (disabled) return;
    setFeedback("");
    setPlacements((current) => {
      if (level.mode === "count") return { ...current, [tokenId]: Math.max(0, (current[tokenId] || 0) - 1) };
      if (level.mode === "sort") return Object.fromEntries(Object.entries(current).filter(([key]) => key !== tokenId));
      return Object.fromEntries(Object.entries(current).filter(([key, value]) => key !== zoneId && value !== tokenId));
    });
  }
  function dropOn(zoneId) { place(draggedToken || selectedToken, zoneId); }
  function resetLevel() { setPlacements({}); setSelectedToken(""); setDraggedToken(""); setFeedback(""); }
  function checkLevel() {
    if (level.mode === "count") {
      const unwanted = tokens.find((token) => !level.solution[token.id] && placements[token.id]);
      if (unwanted) {
        const quality = unwanted.detail.toLowerCase();
        setFeedback(`Có ${placements[unwanted.id]} ${unwanted.label} bị ${quality}. Hãy lấy ra khỏi khay.`);
        return;
      }
      const missing = tokens.find((token) => level.solution[token.id] && (placements[token.id] || 0) < level.solution[token.id]);
      if (missing) {
        const amount = level.solution[missing.id] - (placements[missing.id] || 0);
        setFeedback(`Khay còn thiếu ${amount} ${missing.label}. Con kiểm tra lại nhé!`);
        return;
      }
      const excess = tokens.find((token) => level.solution[token.id] && (placements[token.id] || 0) > level.solution[token.id]);
      if (excess) { setFeedback(`Khay đang thừa ${(placements[excess.id] || 0) - level.solution[excess.id]} ${excess.label}.`); return; }
    } else if (level.mode === "sort") {
      const unplaced = tokens.find((token) => !placements[token.id]);
      if (unplaced) { setFeedback(`Hãy phân loại ${unplaced.label} trước khi kiểm tra.`); return; }
      const wrong = tokens.find((token) => placements[token.id] !== level.solution[token.id]);
      if (wrong) { setFeedback(`${wrong.label} đang ở sai khay. Hãy quan sát ${wrong.detail.toLowerCase()} và thử lại.`); return; }
    } else {
      const emptyZone = zones.find((zone) => !placements[zone.id]);
      if (emptyZone) { setFeedback(`Vị trí “${emptyZone.label}” vẫn còn trống.`); return; }
      const wrongZone = zones.find((zone) => placements[zone.id] !== level.solution[zone.id]);
      if (wrongZone) { setFeedback(`Mục “${wrongZone.label}” chưa đúng yêu cầu của mẫu.`); return; }
    }
    if (levelIndex < job.levels.length - 1) {
      setLevelIndex((index) => index + 1);
      setPlacements({});
      setSelectedToken("");
      setFeedback(`Hoàn thành cấp ${levelIndex + 1}!`);
    } else {
      onFinish();
    }
  }
  function startDrag(event, tokenId) {
    setDraggedToken(tokenId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", tokenId);
  }

  return <div className="fs-drag-task">
    <div className="fs-level-head"><div><small>CẤP ĐỘ {levelIndex + 1}/{job.levels.length}</small><h3>{level.title}</h3></div><div className="fs-level-dots">{job.levels.map((_, index) => <i key={index} className={index <= levelIndex ? "active" : ""} />)}</div></div>
    <p className="fs-level-instruction">{level.instruction}</p>
    <div className="fs-drag-help">↕ Kéo thẻ vào vùng đích, hoặc nhấn thẻ rồi nhấn vùng đích.</div>
    <div className="fs-token-bank" onDragOver={(event) => event.preventDefault()} onDrop={() => draggedToken && remove(draggedToken)}>
      <strong>Vật phẩm</strong>
      <div>{tokens.filter((token) => !isPlaced(token.id)).map((token) => <button type="button" key={token.id} draggable={!disabled} onDragStart={(event) => startDrag(event, token.id)} onClick={() => !disabled && setSelectedToken(token.id)} className={selectedToken === token.id ? "selected" : ""}><TokenVisual token={token} /><b>{token.label}</b><small>{token.detail}</small>{level.mode === "count" && placements[token.id] > 0 && <em>Trong khay: {placements[token.id]}</em>}</button>)}</div>
    </div>
    <div className={`fs-drop-zones fs-drop-zones--${level.mode}`}>
      {zones.map((zone) => {
        const zoneTokens = level.mode === "count" ? tokens.filter((token) => placements[token.id]) : level.mode === "sort" ? tokens.filter((token) => placements[token.id] === zone.id) : tokens.filter((token) => placements[zone.id] === token.id);
        return <div key={zone.id} className={selectedToken ? "is-ready" : ""} onDragOver={(event) => event.preventDefault()} onDrop={() => dropOn(zone.id)} onClick={() => selectedToken && dropOn(zone.id)}><strong>{zone.label}</strong><div>{zoneTokens.length ? zoneTokens.flatMap((token) => level.mode === "count" ? Array.from({ length: placements[token.id] }, (_, index) => ({ token, key: `${token.id}-${index}` })) : [{ token, key: token.id }]).map(({ token, key }) => <button type="button" key={key} draggable={!disabled} onDragStart={(event) => startDrag(event, token.id)} onClick={(event) => { event.stopPropagation(); remove(token.id, zone.id); }}><TokenVisual token={token} /><b>{token.label}</b><small>{token.detail}</small><em>×</em></button>) : <p>Thả vào đây</p>}</div></div>;
      })}
    </div>
    {feedback && <div className={feedback.startsWith("Hoàn thành") ? "fs-level-feedback success" : "fs-level-feedback"}>{feedback}</div>}
    <div className="fs-level-actions"><button type="button" className="fs-button fs-button--secondary" disabled={disabled} onClick={resetLevel}>Làm lại cấp</button><button type="button" className="fs-button fs-button--primary" disabled={disabled} onClick={checkLevel}>{levelIndex === job.levels.length - 1 ? "Hoàn thành công việc" : "Kiểm tra cấp độ"}</button></div>
  </div>;
}

function JobsPage() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const jobs = state.jobs || [];
  const [activeId, setActiveId] = useState(jobs.find((job) => !job.completed)?.id || jobs[0]?.id);
  const [acceptedIds, setAcceptedIds] = useState([]);
  if (state.opened) return <Navigate to="/flowershop/desk" replace />;
  const active = jobs.find((job) => job.id === activeId) || jobs[0];
  const completed = jobs.filter((job) => job.completed).length;
  const accepted = active && acceptedIds.includes(active.id);
  const locked = active && (active.minReputation || 0) > (state.reputation || 0);
  function openJob(job) { setActiveId(job.id); }
  return <>
    <PageTitle eyebrow={`Ngày ${state.day} · Ca việc ${state.jobRound}`} title="Việc làm ở chợ" description="Mỗi ca có 3–5 việc khác nhau. Xem yêu cầu, độ khó và phần thưởng trước khi chủ động nhận việc." aside={<div className="fs-job-status"><span className="fs-pill">Uy tín {state.reputation || 0}</span><span className="fs-pill">Có {money(state.cash)}</span></div>} />
    <div className="fs-jobs-layout">
      <section className="fs-card fs-job-board"><div className="fs-card-title"><h2>Bảng việc làm</h2><span>{completed}/{jobs.length} xong</span></div>
        <div className="fs-job-list">{jobs.map((job) => <button type="button" key={job.id} onClick={() => openJob(job)} className={`${active?.id === job.id ? "active" : ""} ${job.completed ? "completed" : ""}`}>
          <span>{job.stall}{job.urgent ? " · Đơn gấp" : ""}</span><strong>{job.name}</strong><small>{job.task}</small><div className="fs-job-meta"><i>{job.difficulty}</i><b>{job.completed ? "Đã nhận thưởng" : `+${money(job.reward)}/${job.unit}`}</b>{(job.minReputation || 0) > (state.reputation || 0) && <em>🔒 Uy tín {job.minReputation}</em>}</div>
        </button>)}</div>
      </section>
      {active && <section className="fs-card fs-job-detail"><div className="fs-card-title"><h2>{active.name}</h2><span>{active.id}</span></div>
        <div className="fs-job-preview"><p className="fs-job-stall">{active.stall}</p>{active.urgent && <strong className="fs-urgent-tag">Đơn gấp · tự nguyện nhận</strong>}<span>Độ khó: <b>{active.difficulty}</b></span><span>Thưởng: <b>{money(active.reward)}</b></span></div>
        <div className="fs-job-prompt"><small>YÊU CẦU CÔNG VIỆC</small><p>{active.prompt}</p></div>
        {locked && <div className="fs-job-locked">Hoàn thành ba việc cơ bản để đạt {active.minReputation} uy tín và mở thử thách này.</div>}
        {!locked && !accepted && !active.completed && <button type="button" className="fs-button fs-button--primary fs-button--block" onClick={() => setAcceptedIds((ids) => [...ids, active.id])}>Nhận việc</button>}
        {(accepted || active.completed) && <InteractiveJobBoard key={active.id} job={active} disabled={active.completed} onFinish={() => dispatch({ type: "SUBMIT_JOB", jobId: active.id, answer: { levelsComplete: true } })} />}
        {(accepted || active.completed) && <div className="fs-job-reward"><span>Thưởng khi hoàn thành 3 cấp</span><strong>{money(active.reward)}</strong></div>}
      </section>}
    </div>
    <div className="fs-job-actions"><button type="button" className="fs-button fs-button--secondary" onClick={() => navigate("/flowershop/market")}>Quay lại chợ · giữ nguyên giỏ</button>{jobs.length > 0 && completed === jobs.length && <button type="button" className="fs-button fs-button--primary" onClick={() => { dispatch({ type: "REFRESH_JOBS" }); setAcceptedIds([]); setActiveId(""); }}>Nhận lượt việc mới</button>}</div>
  </>;
}

function OrderAlert({ order }) {
  const { state } = useGame();
  const warning = warningFor(order, state.clockMinute);
  if (!warning) return null;
  return <div className={`fs-order-alert fs-order-alert--${warning.kind}`}><span aria-hidden="true" /> <strong>{warning.label}</strong>{warning.remaining >= 0 && <small>Còn {warning.remaining} phút</small>}</div>;
}

function BloomShape({ flower, x, y, scale, rotation }) {
  const transform = `translate(${x} ${y}) rotate(${rotation}) scale(${scale})`;
  if (flower.id === "tulip") return <g transform={transform} className="fs-svg-bloom">
    <path d="M-15 1C-17-13-7-20 0-9C7-20 17-13 15 1C13 14 6 20 0 20C-7 20-14 14-15 1Z" fill={flower.color} />
    <path d="M-12-2C-5 3-2 7 0 15C3 7 7 2 12-3C6-5 3-8 0-12C-3-8-7-5-12-2Z" fill="#f5a6b7" opacity=".72" />
  </g>;
  if (flower.id === "baby") return <g transform={transform} className="fs-svg-bloom">
    {[[-10,-5],[-3,-12],[7,-8],[12,2],[3,7],[-8,7]].map(([cx, cy], index) => <g key={index}><circle cx={cx} cy={cy} r="5.5" fill="#fffdf4" stroke="#d8c7a7" strokeWidth="1.4" /><circle cx={cx} cy={cy} r="1.8" fill="#d8b56b" /></g>)}
  </g>;
  if (["leaf", "eucalyptus"].includes(flower.id)) return <g transform={transform} className="fs-svg-bloom">
    <path d="M0 18V-18" stroke="#557b69" strokeWidth="2" />
    <ellipse cx="-8" cy="-8" rx="11" ry="5" transform="rotate(28 -8 -8)" fill={`${flower.color}dd`} />
    <ellipse cx="9" cy="1" rx="12" ry="5" transform="rotate(-30 9 1)" fill={flower.color} />
    <ellipse cx="-7" cy="10" rx="10" ry="4.5" transform="rotate(25 -7 10)" fill={`${flower.color}aa`} />
  </g>;
  if (flower.id === "lavender") return <g transform={transform} className="fs-svg-bloom">
    <path d="M0 23V-21" stroke="#60785f" strokeWidth="2.5" />
    {[-16, -9, -2, 5].map((cy, index) => <g key={cy}>
      <ellipse cx={index % 2 ? -5 : -6} cy={cy} rx="4" ry="7" transform={`rotate(${-28 + index * 4})`} fill={flower.color} />
      <ellipse cx={index % 2 ? 6 : 5} cy={cy + 2} rx="4" ry="7" transform={`rotate(${28 - index * 4})`} fill={`${flower.color}dd`} />
    </g>)}
  </g>;
  if (flower.id === "hydrangea") return <g transform={transform} className="fs-svg-bloom">
    {[[-10,-8],[1,-12],[11,-5],[-12,4],[0,2],[12,7],[-5,13],[7,15]].map(([cx, cy], index) => <g key={`${cx}-${cy}`} transform={`translate(${cx} ${cy})`}>
      {[0,90,180,270].map((angle) => <ellipse key={angle} cy="-4" rx="3.5" ry="5.5" transform={`rotate(${angle})`} fill={index % 2 ? flower.color : `${flower.color}dd`} />)}
      <circle r="2" fill="#f5dfad" />
    </g>)}
  </g>;
  if (flower.id === "orchid") return <g transform={transform} className="fs-svg-bloom">
    <ellipse cy="-9" rx="8" ry="13" fill={`${flower.color}dd`} />
    <ellipse cx="-10" cy="1" rx="8" ry="13" transform="rotate(-58 -10 1)" fill={flower.color} />
    <ellipse cx="10" cy="1" rx="8" ry="13" transform="rotate(58 10 1)" fill={flower.color} />
    <path d="M-8 7Q0 20 8 7Q0 2-8 7" fill="#f2d3a8" />
    <circle cy="4" r="3" fill="#9e5b7f" />
  </g>;
  const isSunflower = flower.id === "sunflower";
  const isSmallDaisy = ["daisy", "chamomile"].includes(flower.id);
  const petals = isSunflower ? 12 : isSmallDaisy ? 10 : ["carnation", "peony"].includes(flower.id) ? 9 : 7;
  return <g transform={transform} className="fs-svg-bloom">
    {Array.from({ length: petals }, (_, index) => {
      const angle = index * 360 / petals;
      return <ellipse key={angle} cx="0" cy="-10" rx={isSunflower || isSmallDaisy ? 5 : 7} ry={isSunflower ? 14 : isSmallDaisy ? 12 : 10} transform={`rotate(${angle})`} fill={index % 2 ? flower.color : `${flower.color}dd`} stroke="#85445a22" />;
    })}
    <circle r={isSunflower ? 9 : isSmallDaisy ? 7 : 9} fill={isSunflower ? "#70482d" : isSmallDaisy ? "#9b6b2c" : flower.color} />
    {!isSunflower && !isSmallDaisy && <path d="M-6 1C-2-7 2 7 7-2" fill="none" stroke="#fff" strokeWidth="2" opacity=".45" />}
  </g>;
}

function Bouquet({ order }) {
  const blooms = [];
  order.quantities.forEach((quantity, flowerIndex) => {
    for (let index = 0; index < quantity; index += 1) blooms.push({ ...FLOWERS[flowerIndex], key: `${flowerIndex}-${index}` });
  });
  const positions = [
    [180,57,1.03,0],[139,75,.94,-12],[221,76,.96,11],[105,105,.88,-18],[254,106,.9,18],
    [173,101,.92,-5],[208,117,.9,8],[137,123,.84,-10],[92,143,.78,-17],[269,144,.8,16],
    [166,145,.82,-4],[226,150,.8,9],[118,161,.76,-12],[247,170,.74,13],[151,177,.72,-6],
    [204,180,.73,7],[83,177,.68,-15],[279,178,.69,15],
  ];
  const wrapId = WRAPS[order.wrap].id;
  const wrapColors = wrapId === "pink" ? ["#e9bdbd", "#bd7f88", "#f5d8d2"] : wrapId === "kraft" ? ["#cda276", "#946743", "#e1bc8d"] : ["#ead6b6", "#b79068", "#fff0d2"];
  return <div className={`fs-bouquet fs-bouquet--${wrapId}`} role="img" aria-label={`Bó hoa gồm ${blooms.length} cành`}>
    <svg viewBox="0 0 360 300" aria-hidden="true">
      <defs>
        <linearGradient id={`paper-${order.id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={wrapColors[2]} /><stop offset=".55" stopColor={wrapColors[0]} /><stop offset="1" stopColor={wrapColors[1]} /></linearGradient>
        <linearGradient id={`paper-light-${order.id}`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fff" stopOpacity=".65" /><stop offset="1" stopColor={wrapColors[0]} stopOpacity=".25" /></linearGradient>
        <filter id={`bouquet-shadow-${order.id}`}><feDropShadow dx="0" dy="7" stdDeviation="6" floodColor="#5b3d32" floodOpacity=".2" /></filter>
      </defs>
      <ellipse cx="183" cy="274" rx="91" ry="12" fill="#74594b" opacity=".13" />
      <g filter={`url(#bouquet-shadow-${order.id})`}>
        <path d="M58 104L178 151L302 101L251 223L181 274L105 221Z" fill={`url(#paper-${order.id})`} />
        <path d="M58 104L178 151L121 224L105 221Z" fill={wrapColors[1]} opacity=".75" />
        {blooms.slice(0, 18).map((flower, index) => {
          const [x, y] = positions[index];
          return <g key={`stem-${flower.key}`}><path d={`M181 248 Q${180 + (x - 180) * .18} 192 ${x} ${y + 10}`} fill="none" stroke={index % 2 ? "#52745b" : "#678865"} strokeWidth="3" strokeLinecap="round" /><ellipse cx={(x + 181) / 2 + (index % 2 ? 8 : -8)} cy={(y + 245) / 2} rx="12" ry="4.5" transform={`rotate(${index % 2 ? -34 : 34})`} fill={index % 2 ? "#78977a" : "#668b70"} /></g>;
        })}
        {blooms.slice(0, 18).map((flower, index) => {
          const [x, y, scale, rotation] = positions[index];
          return <BloomShape key={flower.key} flower={flower} x={x} y={y} scale={scale} rotation={rotation} />;
        })}
        <path d="M58 104L178 157L302 101L249 223L182 274L105 221Z" fill={`url(#paper-light-${order.id})`} opacity=".72" />
        <path d="M58 104L178 157L151 206L105 221Z" fill={wrapColors[0]} opacity=".88" />
        <path d="M302 101L178 157L211 207L249 223Z" fill={wrapColors[2]} opacity=".78" />
        <path d="M150 220Q181 234 214 219L204 240Q181 250 157 239Z" fill="#a14e5b" />
        <path d="M181 231C158 212 143 217 146 229C149 241 166 238 181 231C198 215 218 216 216 229C214 241 198 240 181 231Z" fill="#b85f6c" />
        <circle cx="181" cy="231" r="7" fill="#8e3f4c" />
        <g transform="translate(225 176) rotate(13)"><rect x="-19" y="-13" width="38" height="27" rx="3" fill="#fff9e8" stroke="#b18b77" /><path d="M-12-4H11M-12 2H7" stroke="#c19691" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="8" r="3" fill="#cf7182" /></g>
      </g>
    </svg>
    <div className="fs-bouquet-caption"><span>Mẫu phối trực tiếp</span><strong>{blooms.length} cành</strong><small>{WRAPS[order.wrap].name}</small></div>
  </div>;
}

function CustomerScene() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const inStore = state.orders.filter((order) => order.arrived && !["pending", "gone"].includes(order.customerPhase));
  const active = inStore.find((order) => ["feedback", "leaving"].includes(order.customerPhase)) || inStore[0];
  const waitMinutes = active ? Math.max(0, state.clockMinute - (active.arrivedAt ?? state.clockMinute)) : 0;
  const patience = Math.max(5, 100 - Math.min(95, waitMinutes * 2));
  const speech = !active ? "Cửa tiệm đang yên ắng. Mời vị khách tiếp theo vào nhé!"
    : active.customerPhase === "entering" ? `Leng keng! ${active.customer.name} vừa bước vào tiệm.`
      : active.customerPhase === "feedback" ? active.feedback?.comment
        : active.customerPhase === "leaving" ? "Cảm ơn Tiệm Hoa Hẹn, hẹn gặp lại nhé!"
          : active.state === ORDER_STATES.WAITING ? "Mình đang xem phương án hoa thay thế..."
            : active.state === ORDER_STATES.PREPARED ? "Bó hoa xong rồi phải không? Mình thanh toán nhé!"
              : active.state === ORDER_STATES.CONFIRMED ? "Mình sẽ chờ tiệm gói bó hoa này."
                : active.customer.greeting;

  return <section className="fs-shop-scene" aria-label="Khách hàng trong tiệm">
    <div className="fs-scene-sky"><span>TIỆM HOA HẸN</span><i /></div>
    <div className="fs-scene-shelf"><span>🌷</span><span>🌼</span><span>🌹</span></div>
    <div className="fs-scene-counter"><span>Quầy nhận hoa</span><i>✿</i></div>
    <div className="fs-scene-door"><i /> <span>OPEN</span></div>
    {active ? <div className={`fs-customer fs-customer--${active.customer.tone} fs-customer--${active.customerPhase}`}>
      <div className="fs-speech">
        {active.customerPhase === "feedback" && <div className="fs-stars" aria-label={`${active.feedback?.rating || 0} sao`}>{"★".repeat(active.feedback?.rating || 0)}{"☆".repeat(5 - (active.feedback?.rating || 0))}</div>}
        <strong>{active.customer.name}</strong><p>{speech}</p>
        {active.customerPhase === "waiting" && <div className={`fs-patience ${patience <= 30 ? "is-low" : ""}`}><span>Kiên nhẫn</span><i><b style={{ width: `${patience}%` }} /></i><em>{patience}%</em></div>}
      </div>
      <div className="fs-person"><span>{active.customer.emoji}</span><i /><b /></div>
      {["waiting", "entering"].includes(active.customerPhase) && <button type="button" onClick={() => navigate(`/flowershop/desk/${active.id}`)}>Nhận yêu cầu #{active.id}</button>}
      {active.customerPhase === "feedback" && <span className="fs-payment">+ {money(active.finalPrice)} ✓</span>}
    </div> : <div className="fs-scene-empty"><span>🌿</span><p>{speech}</p><button type="button" onClick={() => dispatch({ type: "ARRIVE_NEXT_CUSTOMER" })}>Mời khách tiếp theo</button></div>}
    {inStore.length > 1 && <div className="fs-scene-queue"><small>Đang ở tiệm</small>{inStore.map((order) => <button key={order.id} className={active?.id === order.id ? "active" : ""} onClick={() => navigate(`/flowershop/desk/${order.id}`)} title={order.customer.name}>{order.customer.emoji}</button>)}</div>}
    {state.feedbacks.length > 0 && <div className="fs-latest-rating"><span>{state.feedbacks.at(-1).emoji}</span><div><strong>Đánh giá mới · {state.feedbacks.at(-1).rating}/5 ★</strong><small>{state.feedbacks.at(-1).comment}</small></div></div>}
  </section>;
}

function DeskPage() {
  const { orderId } = useParams();
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const visibleOrders = state.orders.filter((order) => order.visible);
  const selected = orderId ? visibleOrders.find((order) => order.id === orderId) : visibleOrders[0];
  const staleId = Boolean(orderId && !selected);

  useEffect(() => {
    if (staleId) {
      dispatch({ type: "SET_NOTICE", text: `Mã đơn ${orderId} không thuộc ngày hiện tại. Đã quay về danh sách đơn.`, kind: "warning" });
      navigate("/flowershop/desk", { replace: true, state: { invalidOrder: orderId } });
    }
  }, [staleId, orderId, navigate, dispatch]);

  if (staleId) return null;
  if (!selected) return <div className="fs-empty">Chưa có đơn trong ngày.</div>;
  const editable = [ORDER_STATES.DRAFT, ORDER_STATES.WAITING].includes(selected.state) && !state.dayClosed;
  const total = selected.finalPrice ?? orderTotal(selected);
  const remaining = selected.budget - total;

  function nextAction() {
    const actions = {
      [ORDER_STATES.DRAFT]: "CONFIRM_ORDER", [ORDER_STATES.WAITING]: "APPROVE_ORDER",
      [ORDER_STATES.CONFIRMED]: "PREPARE_ORDER", [ORDER_STATES.PREPARED]: "DELIVER_ORDER",
    };
    if (actions[selected.state]) dispatch({ type: actions[selected.state], orderId: selected.id });
  }
  const buttonLabels = { draft: "Chốt đơn", waiting: "Khách đồng ý · Chốt đơn", confirmed: "Chuẩn bị hoa", prepared: "Bàn giao cho khách", delivered: "Đã bàn giao", closed: "Đơn đã đóng" };

  return <>
    <PageTitle eyebrow={`Ngày ${state.day} · Đang mở cửa`} title="Bàn phối hoa" description="Chọn đơn, phối bó theo yêu cầu rồi chuẩn bị và bàn giao cho khách." aside={<Clock />} />
    <CustomerScene />
    <div className="fs-desk">
      <aside className="fs-card fs-orders"><div className="fs-card-title"><h2>Đơn hàng</h2><span>{visibleOrders.length} đơn</span></div>
        <div className="fs-order-list">{visibleOrders.map((order) => <button key={order.id} type="button" className={selected.id === order.id ? "active" : ""} onClick={() => navigate(`/flowershop/desk/${order.id}`)}>
          <div><small>#{order.id}</small><time>{formatTime(order.dueMinute)}</time></div><strong>{order.name}</strong><span>{STATE_LABELS[order.state]}</span><OrderAlert order={order} />
        </button>)}</div>
        {state.orders.some((order) => !order.arrived) && <button type="button" className="fs-button fs-button--secondary fs-button--block" onClick={() => dispatch({ type: "ARRIVE_NEXT_CUSTOMER" })}>Mời khách tiếp theo vào tiệm</button>}
        <div className="fs-brief"><h3>Yêu cầu của khách</h3><p>{selected.brief}</p><small>Nhận lúc <b>{formatTime(selected.dueMinute)}</b> · Khách có tối đa <b>{money(selected.budget)}</b></small><blockquote>“{selected.message}”</blockquote></div>
      </aside>
      <section className="fs-card fs-compose"><div className="fs-card-title"><h2>Xem trước bó hoa</h2><span>#{selected.id}</span></div>
        <Bouquet order={selected} />
        <div className="fs-options"><label>Giấy gói<select value={selected.wrap} disabled={!editable} onChange={(event) => dispatch({ type: "SET_OPTION", orderId: selected.id, key: "wrap", value: Number(event.target.value) })}>{WRAPS.map((wrap, index) => <option value={index} key={wrap.id}>{wrap.name} · {money(wrap.price)}</option>)}</select></label><label>Mẫu thiệp<select value={selected.cardStyle} disabled={!editable} onChange={(event) => dispatch({ type: "SET_OPTION", orderId: selected.id, key: "cardStyle", value: Number(event.target.value) })}>{CARDS.map((card, index) => <option value={index} key={card.id}>{card.name} · {money(card.price)}</option>)}</select></label></div>
        <div className={`fs-budget ${remaining < 0 ? "is-over" : ""}`}><div><span>Giá bán bó hoa</span><strong>{money(total)}</strong></div><div className="fs-meter"><i style={{ width: `${Math.min(100, total / selected.budget * 100)}%` }} /></div><p>{remaining < 0 ? `Vượt giới hạn ${money(Math.abs(remaining))}` : remaining === 0 ? "Đúng bằng giới hạn của khách" : `Khách còn tối đa ${money(remaining)}`}</p></div>
        <button type="button" className="fs-button fs-button--primary fs-button--block" disabled={[ORDER_STATES.DELIVERED, ORDER_STATES.CLOSED].includes(selected.state) || state.dayClosed} onClick={nextAction}>{buttonLabels[selected.state]}</button>
      </section>
      <section className="fs-card fs-ingredients"><div className="fs-card-title"><h2>Chọn nguyên liệu</h2><span>Giá / cành</span></div>
        {FLOWERS.map((flower, index) => { const usable = state.inventory[index] + selected.reserved[index]; return <div className="fs-ingredient" key={flower.id}><span className="fs-flower-icon" style={{ color: flower.color }}>{flower.symbol}</span><div><strong>{flower.name}</strong><small>{flower.group} · {money(flower.salePrice)} · Dùng được {usable}{selected.reserved[index] ? ` (giữ ${selected.reserved[index]})` : ""}</small></div><div className="fs-stepper"><button disabled={!editable || selected.quantities[index] <= 0} onClick={() => dispatch({ type: "EDIT_QUANTITY", orderId: selected.id, flowerIndex: index, change: -1 })}>−</button><span>{selected.quantities[index]}</span><button disabled={!editable || selected.quantities[index] >= usable} onClick={() => dispatch({ type: "EDIT_QUANTITY", orderId: selected.id, flowerIndex: index, change: 1 })}>+</button></div></div>; })}
        {selected.alternate !== undefined && editable && <div className="fs-alternate"><span>Hoa thay thế: <strong>{FLOWERS[selected.alternate].name}</strong></span><button type="button" disabled={!selected.quantities[selected.preferred]} onClick={() => dispatch({ type: "SWAP_MAIN", orderId: selected.id })}>Đổi hoa chính</button></div>}
      </section>
    </div>
  </>;
}

function InventoryPage() {
  const { state } = useGame();
  const held = heldTotals(state.orders);
  return <>
    <PageTitle eyebrow={`Ngày ${state.day} · Đối chiếu kho`} title="Kho hoa" description="Lượng khả dụng có thể dùng cho khách mới; lượng đã giữ chỉ dành cho đơn tương ứng." aside={<Clock />} />
    <section className="fs-card fs-table-wrap"><table className="fs-table"><thead><tr><th>Loại hoa</th><th>Giá bán</th><th>Khả dụng</th><th>Đã giữ</th><th>Tổng đang quản lý</th></tr></thead><tbody>{FLOWERS.map((flower, index) => <tr key={flower.id}><td><span style={{ color: flower.color }}>{flower.symbol}</span> <strong>{flower.name}</strong></td><td>{money(flower.salePrice)}</td><td><b className="fs-available">{state.inventory[index]} cành</b></td><td><b className="fs-held">{held[index]} cành</b></td><td>{state.inventory[index] + held[index]} cành</td></tr>)}</tbody></table></section>
  </>;
}

function SummaryPage() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const visible = state.orders.filter((order) => order.visible);
  const delivered = visible.filter((order) => order.state === ORDER_STATES.DELIVERED);
  const unfinished = visible.filter((order) => ![ORDER_STATES.DELIVERED, ORDER_STATES.CLOSED].includes(order.state));
  const latest = state.dayClosed ? state.summaries[state.summaries.length - 1] : null;
  const metrics = latest || { delivered: delivered.length, late: delivered.filter((order) => order.late).length, unfinished: unfinished.length, revenue: state.revenue, expenses: state.expenses, cash: state.cash };
  const feedbacks = latest?.feedbacks || state.feedbacks;
  const averageRating = latest?.averageRating || (feedbacks.length ? feedbacks.reduce((sum, item) => sum + item.rating, 0) / feedbacks.length : 0);

  function closeDay() {
    if (unfinished.length && !window.confirm(`Còn ${unfinished.length} đơn chưa giao. Kết thúc ngày và ghi nhận là chưa hoàn thành?`)) return;
    dispatch({ type: "CLOSE_DAY" });
  }
  function nextDay() {
    dispatch({ type: "NEXT_DAY" });
    navigate("/flowershop/opening");
  }
  return <>
    <PageTitle eyebrow={`Ngày ${state.day} · Báo cáo cuối ngày`} title="Tổng kết ngày" description={state.dayClosed ? "Ngày đã đóng. Phiếu Chợ và tồn khả dụng sẽ được mang sang ngày tiếp theo." : "Đối chiếu Phiếu Chợ trước khi đóng ngày."} aside={<Clock />} />
    <div className="fs-metrics"><div><span>Đơn đã giao</span><strong>{metrics.delivered}</strong></div><div><span>Giao trễ</span><strong>{metrics.late}</strong></div><div><span>Chưa hoàn thành</span><strong>{metrics.unfinished}</strong></div><div><span>Đánh giá</span><strong>{averageRating ? `${averageRating.toFixed(1)} ★` : "—"}</strong></div><div><span>Số dư đầu ngày</span><strong>{money(metrics.dayStartCash ?? state.dayStartCash)}</strong></div><div><span>Phiếu từ việc làm</span><strong>+{money(metrics.jobEarnings ?? state.jobEarnings)}</strong></div><div><span>Phiếu từ đơn đã giao</span><strong>+{money(metrics.revenue)}</strong></div><div><span>Phiếu nhập hàng</span><strong>−{money(metrics.expenses)}</strong></div><div><span>Phiếu còn lại</span><strong>{money(metrics.cash)}</strong></div></div>
    <div className="fs-balance-check">Đối chiếu: {money(metrics.dayStartCash ?? state.dayStartCash)} + {money(metrics.jobEarnings ?? state.jobEarnings)} + {money(metrics.revenue)} − {money(metrics.expenses)} = <strong>{money(metrics.balanceCheck ?? state.cash)}</strong></div>
    <section className="fs-card fs-table-wrap"><table className="fs-table"><thead><tr><th>Đơn hàng</th><th>Giờ giao</th><th>Khách có tối đa</th><th>Giá chốt</th><th>Trạng thái</th></tr></thead><tbody>{visible.map((order) => <tr key={order.id}><td><strong>{order.id}</strong><small>{order.name}</small></td><td>{formatTime(order.dueMinute)}</td><td>{money(order.budget)}</td><td>{order.finalPrice ? money(order.finalPrice) : "—"}</td><td><span className={`fs-state fs-state--${order.state}`}>{STATE_LABELS[order.state]}{order.late ? " · Trễ" : ""}</span></td></tr>)}</tbody></table></section>
    {feedbacks.length > 0 && <section className="fs-feedbacks"><div className="fs-card-title"><h2>Khách nói gì về tiệm?</h2><span>{feedbacks.length} đánh giá</span></div><div>{feedbacks.map((item) => <article key={item.orderId}><span>{item.emoji}</span><div><strong>{item.customer} · {"★".repeat(item.rating)}{"☆".repeat(5 - item.rating)}</strong><p>{item.comment}</p><small>Đơn #{item.orderId}</small></div></article>)}</div></section>}
    {state.summaries.length > 0 && <details className="fs-history"><summary>Lịch sử tổng kết trong phiên ({state.summaries.length} ngày)</summary>{state.summaries.map((summary) => <div key={summary.day}><strong>Ngày {summary.day}</strong><span>{summary.delivered} đã giao · {summary.unfinished} chưa xong · Bán hoa {money(summary.revenue)} · Còn {money(summary.cash)}</span></div>)}</details>}
    <div className="fs-summary-actions">{!state.dayClosed ? <><button type="button" className="fs-button fs-button--secondary" onClick={() => navigate("/flowershop/desk")}>Về bàn phối</button><button type="button" className="fs-button fs-button--danger" onClick={closeDay}>Kết thúc ngày{unfinished.length ? ` (${unfinished.length} đơn chưa giao)` : ""}</button></> : <button type="button" className="fs-button fs-button--primary" onClick={nextDay}>Sang ngày tiếp theo</button>}</div>
  </>;
}

export default function FlowershopPage() {
  const [state, dispatch] = useReducer(flowershopReducer, undefined, createInitialState);
  const value = useMemo(() => ({ state, dispatch }), [state]);
  const customerPhaseKey = state.orders.map((order) => `${order.id}:${order.customerPhase}`).join("|");
  useEffect(() => {
    const arraysMatchCatalog = state.inventory.length === FLOWERS.length
      && state.orders.every((order) => order.quantities.length === FLOWERS.length && order.reserved.length === FLOWERS.length && order.allocated.length === FLOWERS.length);
    if (!arraysMatchCatalog || state.market.length !== createMarket(state.day).length || !state.jobs?.length) dispatch({ type: "SYNC_FLOWER_CATALOG" });
  }, [state.inventory.length, state.market.length, state.orders, state.jobs?.length]);
  useEffect(() => {
    if (!state.opened || state.dayClosed) return undefined;
    const timer = window.setInterval(() => dispatch({ type: "TICK", minutes: 1 }), GAME_CONFIG.msPerGameMinute);
    return () => window.clearInterval(timer);
  }, [state.opened, state.dayClosed]);
  useEffect(() => {
    const timers = [];
    state.orders.forEach((order) => {
      if (order.customerPhase === "entering") timers.push(window.setTimeout(() => dispatch({ type: "CUSTOMER_WAITING", orderId: order.id }), 950));
      if (order.customerPhase === "feedback") timers.push(window.setTimeout(() => dispatch({ type: "CUSTOMER_LEAVING", orderId: order.id }), 3600));
      if (order.customerPhase === "leaving") timers.push(window.setTimeout(() => dispatch({ type: "CUSTOMER_GONE", orderId: order.id }), 1400));
    });
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [customerPhaseKey]);
  return <GameContext.Provider value={value}><GameLayout><Routes>
    <Route index element={<EntryRoute />} />
    <Route path="opening" element={<OpeningPage />} />
    <Route path="market" element={<MarketPage />} />
    <Route path="jobs" element={<JobsPage />} />
    <Route path="desk" element={<RequireOpen><DeskPage /></RequireOpen>} />
    <Route path="desk/:orderId" element={<RequireOpen><DeskPage /></RequireOpen>} />
    <Route path="inventory" element={<InventoryPage />} />
    <Route path="summary" element={<RequireOpen allowSummary><SummaryPage /></RequireOpen>} />
    <Route path="*" element={<EntryRoute />} />
  </Routes></GameLayout></GameContext.Provider>;
}
