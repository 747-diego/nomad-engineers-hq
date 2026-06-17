"use client";

import { createContext, useContext, useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { setToastHandler } from "@/lib/toast-bus";

type Toast = { id: number; message: string };
type ToastContextValue = (message: string) => void;

const ToastContext = createContext<ToastContextValue | null>(null);

// Bottom-center, cream on black, 3s auto-dismiss (spec §10).
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3000);
  }, []);

  // Let non-React code (e.g. the mutation error handler) raise toasts.
  useEffect(() => {
    setToastHandler(toast);
    return () => setToastHandler(null);
  }, [toast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[200] flex flex-col items-center gap-2 md:bottom-8">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="border border-nomad-green bg-nomad-black px-4 py-2.5 font-mono text-xs text-nomad-cream shadow-xl"
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
