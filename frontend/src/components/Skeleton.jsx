export function Skeleton({ className = '' }) {
  return <div className={`shimmer rounded-xs ${className}`} aria-hidden="true" />;
}

export function TableSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div role="status" aria-label="Yuklanmoqda">
      <div className="flex gap-4 px-4 py-3 border-b border-ink">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} className="h-2.5 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-4 border-b border-line last:border-b-0">
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className="h-3.5 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="panel overflow-hidden" role="status" aria-label="Yuklanmoqda">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-5 flex flex-col gap-3">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="border-t border-line pt-4 mt-2">
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
    </div>
  );
}
