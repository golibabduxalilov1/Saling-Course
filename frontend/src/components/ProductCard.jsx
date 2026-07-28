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
  TEMPLATE: 'Shablon',
  FILE_BUNDLE: 'Fayllar to‘plami',
  SUBSCRIPTION: 'Obuna',
  SERVICE: 'Xizmat',
  PHYSICAL: 'Jismoniy mahsulot',
  BUNDLE: 'Paket',
};

export default function ProductCard({ product }) {
  const hasDiscount = product.discountPrice && Number(product.discountPrice) < Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(100 - (Number(product.discountPrice) / Number(product.price)) * 100)
    : 0;

  return (
    <Link
      to={`/mahsulot/${product.slug}`}
      className="card card-hover overflow-hidden flex flex-col group"
    >
      <div className="aspect-video bg-ivory relative overflow-hidden">
        {product.mainImage ? (
          <img
            src={product.mainImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1.5 bg-linear-to-br from-navy-900 to-navy-700 text-white/50">
            <ImageOff size={28} strokeWidth={1.5} aria-hidden="true" />
            <span className="text-xs font-medium text-white/40">Rasm mavjud emas</span>
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1.5">
          {product.isBestseller && <span className="badge badge-gold">Bestseller</span>}
          {product.isNew && <span className="badge badge-blue">Yangi</span>}
          {hasDiscount && <span className="badge badge-red">-{discountPercent}%</span>}
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-xs text-ink-muted font-medium">{TYPE_LABELS[product.type] || product.type}</span>
        <h3 className="font-semibold leading-snug line-clamp-2 text-ink">{product.name}</h3>
        {product.shortDescription && (
          <p className="text-sm text-ink-muted line-clamp-2 flex-1">{product.shortDescription}</p>
        )}
        <div className="flex items-center justify-between gap-2 mt-1">
          <div className="flex items-baseline gap-2">
            {hasDiscount ? (
              <>
                <span className="font-bold text-lg text-ink tabular-nums">{formatMoney(product.discountPrice)}</span>
                <span className="text-sm text-ink-muted line-through tabular-nums">{formatMoney(product.price)}</span>
              </>
            ) : (
              <span className="font-bold text-lg text-ink tabular-nums">{formatMoney(product.price)}</span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-navy-900 group-hover:text-gold-600 transition-colors shrink-0">
            Batafsil
            <ArrowRight size={15} aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export { TYPE_LABELS };
