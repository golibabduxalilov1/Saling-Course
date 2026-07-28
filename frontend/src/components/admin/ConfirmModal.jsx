import { useEffect, useRef } from 'react';
import { Trash2, X } from 'lucide-react';

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
      className="fixed inset-0 z-[900] flex items-center justify-center p-4 bg-[var(--color-navy-950)]/50"
      onClick={onCancel}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        className="card w-full max-w-sm p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="confirm-modal-title" className="text-lg font-bold text-[var(--color-ink)]">
            {title}
          </h2>
          <button type="button" onClick={onCancel} className="btn-icon -mt-1 -mr-1" aria-label="Yopish">
            <X size={18} />
          </button>
        </div>
        {description && <p className="text-sm text-[var(--color-ink-muted)]">{description}</p>}
        <div className="flex justify-end gap-2 mt-2">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={danger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {danger && <Trash2 size={16} aria-hidden="true" />}
            {loading ? 'Bajarilmoqda...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
