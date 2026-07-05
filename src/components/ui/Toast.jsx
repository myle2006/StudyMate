import React, { createContext, useContext, useMemo, useState } from "react";
import { cn } from "./utils";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function pushToast(message, tone = "info") {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3500);
  }

  const value = useMemo(
    () => ({
      success: (message) => pushToast(message, "success"),
      error: (message) => pushToast(message, "error"),
      info: (message) => pushToast(message, "info"),
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[120] grid w-[calc(100%-2rem)] max-w-sm gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "rounded-xl border bg-white px-4 py-3 text-sm font-bold shadow-lg shadow-slate-950/10",
              toast.tone === "success" && "border-emerald-200 text-emerald-800",
              toast.tone === "error" && "border-rose-200 text-rose-800",
              toast.tone === "info" && "border-blue-200 text-blue-800"
            )}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    return {
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }

  return context;
}
