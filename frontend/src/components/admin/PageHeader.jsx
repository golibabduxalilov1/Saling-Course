/**
 * Shared admin page masthead — keeps every admin route on the same
 * kicker / title / action rhythm so no screen drifts stylistically.
 */
export default function PageHeader({ kicker, title, description, actions }) {
  return (
    <header className="mb-8 md:mb-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 pb-6 border-b border-ink">
        <div className="min-w-0">
          {kicker && <span className="t-kicker t-kicker-accent">{kicker}</span>}
          <h1 className="t-title text-[28px] md:text-[34px] text-ink mt-3">{title}</h1>
          {description && <p className="mt-2 text-sm text-ink-3 leading-relaxed max-w-xl">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
