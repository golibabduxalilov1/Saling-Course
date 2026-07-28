export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-14 px-4">
      {Icon && (
        <div className="w-12 h-12 rounded-full bg-[var(--color-ivory)] border border-[var(--color-border-soft)] flex items-center justify-center text-[var(--color-ink-muted)]">
          <Icon size={22} aria-hidden="true" />
        </div>
      )}
      <p className="font-semibold text-[var(--color-ink)]">{title}</p>
      {description && <p className="text-sm text-[var(--color-ink-muted)] max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
