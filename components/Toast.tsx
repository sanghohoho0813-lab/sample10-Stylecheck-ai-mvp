"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CircleCheck, Info } from "lucide-react";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastMessage {
  id: number;
  text: string;
  kind: "success" | "info";
  action?: ToastAction;
}

type PushToast = (text: string, kind?: "success" | "info", action?: ToastAction) => void;

const ToastContext = createContext<PushToast>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback<PushToast>(
    (text, kind = "success", action) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-2), { id, text, kind, action }]);
      // Actionable toasts (e.g. 되돌리기) stay a little longer so they can be reached
      setTimeout(() => dismiss(id), action ? 5000 : 2600);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 flex flex-col items-center gap-2 px-4 md:bottom-8"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex max-w-full animate-scale-in items-center gap-2.5 rounded-full bg-ink py-2.5 pl-4 pr-2.5 text-body-sm font-medium text-white shadow-overlay"
          >
            {t.kind === "success" ? (
              <CircleCheck className="h-4 w-4 shrink-0 text-rose-soft" />
            ) : (
              <Info className="h-4 w-4 shrink-0 text-rose-soft" />
            )}
            <span className="min-w-0">{t.text}</span>
            {t.action ? (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick();
                  dismiss(t.id);
                }}
                className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-meta font-semibold text-white transition-colors hover:bg-white/25"
              >
                {t.action.label}
              </button>
            ) : (
              <span className="w-1.5" />
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
