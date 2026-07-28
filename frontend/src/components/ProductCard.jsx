import { Link } from 'react-router-dom';
import { ArrowRight, ImageOff } from 'lucide-react';
import { formatMoney } from '../utils/format';

const TYPE_LABELS = {
  COURSE: 'Onlayn kurs',
  VIDEO_COURSE: 'Videokurs',
  WEBINAR: 'Jonli webinar',
  MASTERCLASS: 'Master-klass',
  CONSULTATION: 'Konsultatsiya',
  EBOOK: 'Elektron kitob',
  PDF_GUIDE: 'PDF qo‘llanma',
  AUDIO: 'Audio material',
};

export default function ProductCard({ product }) {
  const hasDiscount = product.discountPrice && Number(product.discountPrice) < Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(100 - (Number(product.discountPrice) / Number(product.price)) * 100)
    : 0;

  return (
    <Link
      to={`/mahsulot/${product.slug}`}
      className="panel panel-lift group flex flex-col h-full overflow-hidden"
    >
      <div className="relative aspect-[4/3] bg-veil border-b border-line overflow-hidden">
        {product.mainImage ? (
          <img
            src={product.mainImage}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-ink-3">
            <ImageOff size={22} strokeWidth={1.5} aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-[0.12em]">Rasm yoʼq</span>
          </div>
        )}

        {hasDiscount && (
          <span className="absolute top-3 right-3 tag tag-solid figures">−{discountPercent}%</span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <span className="t-kicker">{TYPE_LABELS[product.type] || product.type}</span>
          {product.isBestseller && <span className="tag tag-accent">Bestseller</span>}
          {product.isNew && <span className="tag tag-neutral">Yangi</span>}
        </div>

        <h3 className="t-heading text-[17px] text-ink line-clamp-2">{product.name}</h3>

        {product.shortDescription && (
          <p className="mt-2 text-sm leading-relaxed text-ink-3 line-clamp-2">{product.shortDescription}</p>
        )}

        <div className="mt-auto pt-5">
          <div className="border-t border-line pt-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              {hasDiscount && (
                <p className="font-mono text-[11px] text-ink-3 line-through figures mb-1">
                  {formatMoney(product.price)}
                </p>
              )}
              <p className="font-display text-xl font-semibold tracking-[-0.03em] text-ink figures">
                {formatMoney(hasDiscount ? product.discountPrice : product.price)}
              </p>
            </div>
            <span
              className="shrink-0 w-9 h-9 flex items-center justify-center border border-line rounded-md text-ink-3 transition-colors duration-150 group-hover:bg-ink group-hover:border-ink group-hover:text-canvas"
              aria-hidden="true"
            >
              <ArrowRight size={15} strokeWidth={2} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export { TYPE_LABELS };
