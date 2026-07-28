export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="motion-reveal flex flex-col items-center text-center px-6 py-20">
      {Icon && (
        <div className="w-12 h-12 mb-6 flex items-center justify-center border border-line rounded-md text-ink-3">
          <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
        </div>
      )}
      <p className="t-heading text-lg text-ink">{title}</p>
      {description && <p className="mt-2 text-sm text-ink-3 max-w-xs leading-relaxed">{description}</p>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
