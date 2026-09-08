import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import Toast from "@/components/ui/Toast";
import { cn } from "@/utils/cn";

const ToastContext = createContext(null);
let listeners = [];
let memoryToasts = [];
let toastIdCounter = 0;

function notify() {
  listeners.forEach((l) => l([...memoryToasts]));
}

/**
 * useToast - Hook para disparar toasts
 * @returns {{ toast: function, dismiss: function, toasts: Array }}
 *   toast({ title, description, variant, duration })
 *   dismiss(id)
 */
export function useToast() {
  const [, setTick] = useState(0);
  const ref = useRef();
  ref.current = () => setTick((t) => t + 1);

  React.useEffect(() => {
    const listener = () => ref.current?.();
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const toast = useCallback((options = {}) => {
    const id = ++toastIdCounter;
    const entry = {
      id,
      title: options.title,
      description: options.description,
      variant: options.variant || "info",
      duration: options.duration ?? 4000,
      createdAt: Date.now(),
    };
    memoryToasts = [...memoryToasts, entry];
    notify();

    if (entry.duration > 0) {
      setTimeout(() => {
        memoryToasts = memoryToasts.map((t) =>
          t.id === id ? { ...t, isClosing: true } : t
        );
        notify();
        setTimeout(() => {
          memoryToasts = memoryToasts.filter((t) => t.id !== id);
          notify();
        }, 250);
      }, entry.duration);
    }
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    memoryToasts = memoryToasts.map((t) =>
      t.id === id ? { ...t, isClosing: true } : t
    );
    notify();
    setTimeout(() => {
      memoryToasts = memoryToasts.filter((t) => t.id !== id);
      notify();
    }, 250);
  }, []);

  return { toast, dismiss, toasts: memoryToasts };
}

/**
 * Toaster - Container para renderizar todos os toasts
 *   Deve ser colocado no root da aplicação (ex.: _app.js)
 */
export function Toaster({ className }) {
  const { toasts, dismiss } = useToast();

  return (
    <ToastContext.Provider value={{ toasts, dismiss }}>
      <div
        aria-live="polite"
        aria-atomic="true"
        className={cn(
          "pointer-events-none fixed inset-x-0 bottom-0 right-0 z-[100] p-4 sm:p-6 max-w-sm w-full sm:bottom-0 sm:right-0 sm:inset-x-auto",
          className
        )}
      >
        <div className="flex flex-col gap-3">
          {toasts.map((t) => (
            <Toast
              key={t.id}
              title={t.title}
              description={t.description}
              variant={t.variant}
              isClosing={t.isClosing}
              onClose={() => dismiss(t.id)}
            />
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export default Toaster;
