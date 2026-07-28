import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Check, CircleAlert, X } from 'lucide-react';

const ToastContext = createContext(null);
let idCounter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const push = useCallback(
    (message, type = 'success') => {
      const id = ++idCounter;
      setToasts((prev) => [...prev, { id, message, type }]);
      timers.current[id] = setTimeout(() => dismiss(id), 4000);
      return id;
    },
    [dismiss]
  );

  const toast = {
    success: (message) => push(message, 'success'),
    error: (message) => push(message, 'error'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="fixed bottom-5 right-5 left-5 sm:left-auto z-[1000] flex flex-col gap-2 sm:w-[360px] pointer-events-none"
        aria-live="polite"
        role="status"
      >
        {toasts.map((t) => {
          const isError = t.type === 'error';
          return (
            <div
              key={t.id}
              className="motion-pop pointer-events-auto flex items-start gap-3 bg-panel border border-line rounded-lg shadow-lg p-4 pl-3"
            >
              <span
                className={`w-1 self-stretch rounded-xs shrink-0 ${isError ? 'bg-critical' : 'bg-positive'}`}
                aria-hidden="true"
              />
              {isError ? (
                <CircleAlert size={17} strokeWidth={2} className="text-critical shrink-0 mt-px" aria-hidden="true" />
              ) : (
                <Check size={17} strokeWidth={2.25} className="text-positive shrink-0 mt-px" aria-hidden="true" />
              )}
              <p className="flex-1 text-sm leading-relaxed text-ink">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="shrink-0 -mt-1 -mr-1 w-8 h-8 flex items-center justify-center rounded-md text-ink-3 hover:bg-veil hover:text-ink transition-colors duration-150"
                aria-label="Bildirishnomani yopish"
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast ToastProvider ichida ishlatilishi kerak');
  return ctx;
}
