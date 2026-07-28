import { PlayCircle, Star } from 'lucide-react';

export default function ReviewList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return <p className="text-ink-muted text-sm">Hozircha sharhlar mavjud emas.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {reviews.map((review) => (
        <div key={review.id} className="card p-5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ivory border border-border-soft flex items-center justify-center font-bold text-ink-muted overflow-hidden shrink-0">
              {review.customerImage ? (
                <img src={review.customerImage} alt={review.customerName} className="w-full h-full object-cover" />
              ) : (
                review.customerName?.[0]
              )}
            </div>
            <div>
              <div className="font-semibold text-sm text-ink">{review.customerName}</div>
              <div className="flex items-center gap-0.5" aria-label={`${review.rating} / 5 yulduz`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className={i < review.rating ? 'fill-gold-500 text-gold-500' : 'text-border-soft'}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          </div>
          {review.textContent && <p className="text-sm text-ink-muted">{review.textContent}</p>}
          {review.videoUrl && (
            <a
              href={review.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-navy-900 font-semibold hover:text-gold-600 transition-colors"
            >
              <PlayCircle size={14} aria-hidden="true" />
              Video sharhni ko'rish
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
