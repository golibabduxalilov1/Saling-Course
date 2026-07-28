import { Check } from 'lucide-react';
import { formatMoney } from '../utils/format';

export default function TariffTable({ tariffs, onBuyNow, onAddToCart }) {
  if (!tariffs || tariffs.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
      {tariffs.map((tariff, idx) => {
        const hasDiscount = tariff.discountPrice && Number(tariff.discountPrice) < Number(tariff.price);
        const highlighted = idx === 1 && tariffs.length > 1;
        return (
          <div
            key={tariff.id}
            className={`card p-6 flex flex-col gap-3 relative ${
              highlighted ? 'border-2 border-gold-500 shadow-lg md:-translate-y-2' : ''
            }`}
          >
            {highlighted && (
              <span className="badge badge-gold self-start absolute -top-3 left-6">Tavsiya etiladi</span>
            )}
            <h4 className="font-bold text-lg text-ink mt-1">{tariff.name}</h4>
            <div className="flex items-baseline gap-2">
              {hasDiscount ? (
                <>
                  <span className="font-extrabold text-2xl text-ink tabular-nums">
                    {formatMoney(tariff.discountPrice)}
                  </span>
                  <span className="text-sm text-ink-muted line-through tabular-nums">{formatMoney(tariff.price)}</span>
                </>
              ) : (
                <span className="font-extrabold text-2xl text-ink tabular-nums">{formatMoney(tariff.price)}</span>
              )}
            </div>
            {tariff.accessDurationDays && (
              <p className="text-xs text-ink-muted">Kirish muddati: {tariff.accessDurationDays} kun</p>
            )}
            <ul className="text-sm text-ink flex flex-col gap-2 flex-1 mt-1">
              {(tariff.features || []).map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check size={16} className="text-emerald-500 mt-0.5 shrink-0" aria-hidden="true" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {tariff.bonuses && <p className="text-xs text-ink-muted italic">Bonus: {tariff.bonuses}</p>}
            <div className="flex flex-col gap-2 mt-3">
              <button
                type="button"
                className={highlighted ? 'btn-accent w-full' : 'btn-primary w-full'}
                onClick={() => onBuyNow(tariff)}
              >
                Tarifni tanlash
              </button>
              <button type="button" className="btn-secondary w-full text-sm" onClick={() => onAddToCart(tariff)}>
                Savatga qo'shish
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
