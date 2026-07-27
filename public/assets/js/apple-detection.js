const { useEffect, useMemo, useState } = React;

const config = window.STUDYMATE_APPLE_DETECTION || {};
const basePath = window.STUDYMATE_BASE_PATH || "";

function appUrl(path) {
  return `${basePath}${path}`;
}

const CLASS_META = {
  apple_good: { label: "Táo tốt", tone: "emerald", hint: "Có thể sử dụng hoặc bảo quản tiếp." },
  apple_bruised: { label: "Táo bị dập", tone: "amber", hint: "Nên dùng sớm sau khi kiểm tra phần bị ảnh hưởng." },
  apple_rotten: { label: "Táo bị thối", tone: "rose", hint: "Không nên sử dụng." },
  apple_moldy: { label: "Táo bị mốc", tone: "violet", hint: "Nên loại bỏ và tách khỏi các quả còn lại." },
  uncertain: { label: "Không phát hiện", tone: "slate", hint: "Hãy thử ảnh rõ hơn, đủ sáng hơn." },
};

function formatConfidence(value) {
  return `${((Number(value) || 0) * 100).toFixed(1)}%`;
}

function labelFor(item) {
  return item?.label_vi || CLASS_META[item?.class || item?.label]?.label || item?.label || item?.class || "Không xác định";
}

function conditionTone(item) {
  return CLASS_META[item?.class || item?.label]?.tone || "slate";
}

function toneTextClass(item) {
  const tone = conditionTone(item);
  const classes = {
    emerald: "text-emerald-600 dark:text-emerald-300",
    amber: "text-amber-600 dark:text-amber-300",
    rose: "text-rose-600 dark:text-rose-300",
    violet: "text-violet-600 dark:text-violet-300",
    slate: "text-slate-600 dark:text-slate-300",
  };

  return classes[tone] || classes.slate;
}

function boxText(item) {
  const box = item?.bounding_box || [];
  if (!box.length) return "--";
  return `[${box.map((value) => Number(value || 0).toFixed(0)).join(", ")}]`;
}

function dataImage(prediction) {
  if (!prediction?.annotated_image_base64) return "";
  return `data:${prediction.annotated_image_mime || "image/jpeg"};base64,${prediction.annotated_image_base64}`;
}

function boxStyle(item, imageSize) {
  const box = item?.bounding_box || [];
  if (box.length < 4 || !imageSize.width || !imageSize.height) return null;

  const [x1, y1, x2, y2] = box.map((value) => Number(value) || 0);

  return {
    left: `${Math.max(0, Math.min(100, (x1 / imageSize.width) * 100))}%`,
    top: `${Math.max(0, Math.min(100, (y1 / imageSize.height) * 100))}%`,
    width: `${Math.max(0, Math.min(100, ((x2 - x1) / imageSize.width) * 100))}%`,
    height: `${Math.max(0, Math.min(100, ((y2 - y1) / imageSize.height) * 100))}%`,
  };
}

function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [health, setHealth] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [annotatedSize, setAnnotatedSize] = useState({ width: 0, height: 0 });

  const prediction = result?.data;
  const detections = prediction?.detections || prediction?.items || [];
  const summary = prediction?.summary || {};
  const annotatedImageUrl = dataImage(prediction);

  const healthState = useMemo(() => {
    if (health === null) return { label: "Đang kiểm tra model", ready: false };
    if (health.success && health.data?.model_loaded) return { label: "Model sẵn sàng", ready: true };
    return { label: "Cần chạy AI service", ready: false };
  }, [health]);

  async function loadHealth() {
    try {
      const response = await fetch(config.healthUrl);
      setHealth(await response.json());
    } catch {
      setHealth({ success: false });
    }
  }

  useEffect(() => {
    loadHealth();
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setResult(null);
    setError("");
    setAnnotatedSize({ width: 0, height: 0 });

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(selectedFile ? URL.createObjectURL(selectedFile) : "");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setError("Vui lòng chọn một ảnh táo trước khi nhận diện.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    setLoading(true);
    setError("");

    try {
      const response = await fetch(config.predictUrl, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        const serviceError = data.errors?.service || data.message || "Không thể nhận diện ảnh.";
        throw new Error(serviceError);
      }

      setResult(data);
      setAnnotatedSize({ width: 0, height: 0 });
      await loadHealth();
    } catch (err) {
      setError(err.message || "Có lỗi xảy ra khi nhận diện ảnh.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <a href={config.homeUrl || "/"} className="flex items-center gap-3">
            <span className="grid h-9 w-11 shrink-0 place-items-center rounded-[8px] bg-white">
              <span className="text-lg font-black leading-none tracking-normal text-[#444496]">PLT</span>
            </span>
            <span>
              <span className="block text-base font-extrabold leading-5">PLT Solutions</span>
              <span className="block text-xs font-semibold leading-5 text-slate-500 dark:text-slate-400">Nhận diện táo</span>
            </span>
          </a>

          <nav className="flex flex-wrap items-center gap-2">
            <a
              href={config.homeUrl || appUrl("/")}
              className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-emerald-300"
            >
              Trang chủ
            </a>
            <a
              href={appUrl("/apple-detection")}
              aria-current="page"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm"
            >
              Nhận diện táo
            </a>
            <a
              href={appUrl("/login")}
              className="rounded-full px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-emerald-300"
            >
              Đăng nhập
            </a>
          </nav>

          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-full px-4 py-2 text-sm font-extrabold ${
                healthState.ready
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300"
              }`}
            >
              {healthState.label}
            </span>
            <button
              type="button"
              onClick={loadHealth}
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
            >
              Kiểm tra lại
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8">
        <section className="space-y-6">
          <div>
            <p className="text-sm font-extrabold uppercase text-emerald-600 dark:text-emerald-300">Apple Quality Detection</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
              Upload ảnh để AI nhận diện và đánh giá quả táo
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-300">
              Hệ thống dùng model YOLO từ thư mục AI service để phát hiện nhiều quả táo trong một ảnh, phân loại tình trạng và trả về ảnh đã vẽ bounding box.
            </p>
          </div>

          {!healthState.ready && (
            <div className="rounded-[8px] border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-200">
              <p className="font-extrabold">FastAPI model chưa sẵn sàng.</p>
              <p className="mt-2">Chạy lệnh sau trước khi nhận diện:</p>
              <code className="mt-3 block break-words rounded-[8px] bg-white p-3 text-xs font-bold text-slate-800 dark:bg-slate-950 dark:text-slate-100">
                {config.fastApiHelp}
              </code>
            </div>
          )}

          <form onSubmit={handleSubmit} className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-[8px] border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center transition hover:border-emerald-400 hover:bg-emerald-50 dark:border-white/15 dark:bg-slate-900 dark:hover:bg-emerald-400/10">
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={handleFileChange} />
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                {file ? file.name : "Chọn ảnh táo"}
              </span>
              <span className="mt-2 text-sm font-semibold text-slate-500 dark:text-slate-400">Hỗ trợ JPG, PNG, WEBP dưới 8MB</span>
            </label>

            {previewUrl && (
              <img src={previewUrl} alt="Ảnh táo đã chọn" className="mt-4 aspect-[4/3] w-full rounded-[8px] object-cover" />
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-5 w-full rounded-full bg-emerald-600 px-6 py-4 text-base font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang nhận diện..." : "Nhận diện táo"}
            </button>

            {error && (
              <p className="mt-4 rounded-[8px] border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-200">
                {error}
              </p>
            )}
          </form>
        </section>

        <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-slate-900/70">
          {!prediction && (
            <div className="flex min-h-[560px] flex-col items-center justify-center rounded-[8px] bg-slate-50 px-6 text-center dark:bg-slate-950">
              <div className="grid h-24 w-24 place-items-center rounded-full bg-red-500 text-5xl font-black text-white shadow-lg">A</div>
              <h2 className="mt-6 text-2xl font-extrabold">Kết quả sẽ hiển thị tại đây</h2>
              <p className="mt-3 max-w-md leading-7 text-slate-600 dark:text-slate-300">
                Sau khi upload ảnh, bạn sẽ thấy tổng số quả táo, tình trạng từng quả, confidence và ảnh output có bounding box.
              </p>
            </div>
          )}

          {prediction && (
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-extrabold uppercase text-emerald-600 dark:text-emerald-300">Kết quả nhận diện</p>
                  <h2 className="mt-2 text-3xl font-extrabold">{prediction.total_count || detections.length || 0} quả táo được phát hiện</h2>
                </div>
                <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-extrabold text-white dark:bg-white dark:text-slate-950">
                  {formatConfidence(prediction.confidence)}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                {[
                  ["Tốt", summary.good || 0, "bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"],
                  ["Dập", summary.bruised || 0, "bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"],
                  ["Thối", summary.rotten || 0, "bg-rose-50 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300"],
                  ["Mốc", summary.moldy || 0, "bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300"],
                ].map(([label, value, className]) => (
                  <div key={label} className={`rounded-[8px] p-4 ${className}`}>
                    <p className="text-sm font-bold">{label}</p>
                    <p className="mt-2 text-3xl font-extrabold">{value}</p>
                  </div>
                ))}
              </div>

              <p className="mt-5 rounded-[8px] border border-emerald-200 bg-emerald-50 p-4 leading-7 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                {prediction.overall_recommendation || prediction.message}
              </p>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                {previewUrl && (
                  <figure>
                    <img src={previewUrl} alt="Ảnh gốc" className="aspect-[4/3] w-full rounded-[8px] object-cover" />
                    <figcaption className="mt-2 text-center text-sm font-bold text-slate-500 dark:text-slate-400">Ảnh gốc</figcaption>
                  </figure>
                )}
                {annotatedImageUrl && (
                  <figure>
                    <div className="relative overflow-visible rounded-[8px] bg-slate-100 dark:bg-slate-950">
                      <img
                        src={annotatedImageUrl}
                        alt="Ảnh đã vẽ bounding box"
                        className="block w-full rounded-[8px]"
                        onLoad={(event) => {
                          setAnnotatedSize({
                            width: event.currentTarget.naturalWidth,
                            height: event.currentTarget.naturalHeight,
                          });
                        }}
                      />

                      {annotatedSize.width > 0 &&
                        detections.map((item) => {
                          const style = boxStyle(item, annotatedSize);
                          if (!style) return null;

                          return (
                            <button
                              key={`box-${item.id}-${item.class}-${item.confidence}`}
                              type="button"
                              style={style}
                              className="group absolute z-10 rounded-[8px] border-2 border-white/90 bg-emerald-400/10 shadow-[0_0_0_2px_rgba(16,185,129,0.7)] outline-none transition hover:z-30 hover:bg-emerald-400/20 focus:z-30 focus:bg-emerald-400/20 focus:ring-4 focus:ring-emerald-300/40"
                              aria-label={`${labelFor(item)} ${formatConfidence(item.confidence)}`}
                            >
                              <span className="absolute left-1 top-1 rounded-full bg-emerald-600 px-2 py-0.5 text-[11px] font-extrabold text-white">
                                #{item.id}
                              </span>
                              <span className="pointer-events-none absolute left-1/2 top-full z-40 mt-2 hidden w-64 -translate-x-1/2 rounded-[8px] border border-slate-200 bg-white p-3 text-left text-xs text-slate-700 shadow-2xl group-hover:block group-focus:block dark:border-white/10 dark:bg-slate-950 dark:text-slate-200">
                                <span className={`block text-sm font-extrabold ${toneTextClass(item)}`}>
                                  #{item.id} · {labelFor(item)}
                                </span>
                                <span className="mt-2 block font-bold">Confidence: {formatConfidence(item.confidence)}</span>
                                <span className="mt-1 block font-bold">Bounding box: {boxText(item)}</span>
                                <span className="mt-2 block leading-5">{item.recommendation || CLASS_META[item.class]?.hint || "Không có khuyến nghị."}</span>
                              </span>
                            </button>
                          );
                        })}
                    </div>
                    <figcaption className="mt-2 text-center text-sm font-bold text-slate-500 dark:text-slate-400">Ảnh AI đã vẽ bounding box</figcaption>
                  </figure>
                )}
              </div>

              <div className="mt-5 space-y-3">
                {detections.length === 0 && (
                  <p className="rounded-[8px] bg-slate-100 p-4 text-sm font-bold text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
                    Model chưa phát hiện quả táo nào vượt ngưỡng confidence.
                  </p>
                )}

                {detections.map((item) => (
                  <article key={`${item.id}-${item.class}-${item.confidence}`} className="grid gap-4 rounded-[8px] border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_120px_130px] dark:border-white/10 dark:bg-white/[0.04]">
                    <div>
                      <p className={`text-sm font-extrabold ${toneTextClass(item)}`}>
                        #{item.id} · {labelFor(item)}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        {item.recommendation || CLASS_META[item.class]?.hint || "Không có khuyến nghị."}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Confidence</p>
                      <p className="mt-1 text-lg font-extrabold">{formatConfidence(item.confidence)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Bounding box</p>
                      <code className="mt-1 block text-xs font-bold text-slate-700 dark:text-slate-200">{boxText(item)}</code>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("apple-detection-root")).render(<App />);
