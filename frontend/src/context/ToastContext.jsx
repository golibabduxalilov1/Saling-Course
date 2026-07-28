import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { CircleCheck, CircleX, X } from 'lucide-react';

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
        className="fixed bottom-4 right-4 z-[1000] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm"
        aria-live="polite"
        role="status"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="card flex items-start gap-3 p-4 shadow-lg animate-in"
            style={{ borderColor: t.type === 'error' ? '#e3c9c3' : '#c9e3d6' }}
          >
            {t.type === 'error' ? (
              <CircleX size={20} className="text-[var(--color-danger)] shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <CircleCheck size={20} className="text-[var(--color-success)] shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <p className="text-sm text-[var(--color-ink)] flex-1">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] shrink-0"
              aria-label="Yopish"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast ToastProvider ichida ishlatilishi kerak');
  return ctx;
}
