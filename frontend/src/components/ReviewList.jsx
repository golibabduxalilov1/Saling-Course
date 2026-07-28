import { PlayCircle, Star } from 'lucide-react';

function Stars({ rating }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Reyting: ${rating} / 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          strokeWidth={1.5}
          className={i < rating ? 'fill-ink text-ink' : 'fill-none text-line-2'}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3 py-8 border-t border-line">
        Hozircha sharhlar mavjud emas
      </p>
    );
  }

  return (
    <ul className="border-t border-ink">
      {reviews.map((review, i) => (
        <li
          key={review.id}
          className={`motion-rise seq-${Math.min(i + 1, 8)} grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 py-8 border-b border-line`}
        >
          <div className="md:col-span-3 flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-md border border-line bg-veil overflow-hidden flex items-center justify-center font-display text-sm font-semibold text-ink-2">
              {review.customerImage ? (
                <img src={review.customerImage} alt="" className="w-full h-full object-cover" />
              ) : (
                review.customerName?.[0]
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{review.customerName}</p>
              <div className="mt-1">
                <Stars rating={review.rating} />
              </div>
            </div>
          </div>

          <div className="md:col-span-9">
            {review.textContent && (
              <p className="text-[15px] leading-relaxed text-ink-2">{review.textContent}</p>
            )}
            {review.videoUrl && (
              <a
                href={review.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="link mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3 hover:text-accent"
              >
                <PlayCircle size={13} aria-hidden="true" />
                Video sharh
              </a>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
