"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, Info } from "lucide-react";

interface ToastMessage {
  id: number;
  text: string;
  kind: "success" | "info";
}

const ToastContext = createContext<(text: string, kind?: "success" | "info") => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const idRef = useRef(0);

  const push = useCallback((text: string, kind: "success" | "info" = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev.slice(-2), { id, text, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex flex-col items-center gap-2 px-4 md:bottom-8">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-scale-in flex items-center gap-2 rounded-full border border-linen bg-ink px-4 py-2.5 text-sm font-medium text-white shadow-lift"
          >
            {t.kind === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-rose-soft" />
            ) : (
              <Info className="h-4 w-4 text-rose-soft" />
            )}
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
