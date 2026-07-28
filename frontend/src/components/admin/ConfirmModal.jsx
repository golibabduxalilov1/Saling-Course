import { useEffect, useRef } from 'react';
import { Loader2, TriangleAlert, X } from 'lucide-react';

export default function ConfirmModal({
  open,
  title = "O'chirishni tasdiqlaysizmi?",
  description,
  confirmLabel = "O'chirish",
  cancelLabel = 'Bekor qilish',
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="motion-reveal fixed inset-0 z-[900] bg-obsidian/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={onCancel}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby={description ? 'confirm-desc' : undefined}
        className="motion-pop bg-panel w-full sm:max-w-md rounded-t-2xl sm:rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <span
              className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-md border ${
                danger ? 'bg-critical-tint border-critical/25 text-critical' : 'bg-veil border-line text-ink-2'
              }`}
            >
              <TriangleAlert size={18} strokeWidth={2} aria-hidden="true" />
            </span>
            <button type="button" onClick={onCancel} className="icon-btn -mt-2 -mr-2" aria-label="Yopish">
              <X size={17} aria-hidden="true" />
            </button>
          </div>

          <h2 id="confirm-title" className="t-heading text-xl text-ink mt-5">
            {title}
          </h2>
          {description && (
            <p id="confirm-desc" className="mt-3 text-sm leading-relaxed text-ink-3">
              {description}
            </p>
          )}
        </div>

        <div className="border-t border-line p-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button type="button" className="btn btn-quiet" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={danger ? 'btn btn-critical' : 'btn btn-solid'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <Loader2 size={15} className="motion-spin" aria-hidden="true" />}
            {loading ? 'Bajarilmoqda' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
