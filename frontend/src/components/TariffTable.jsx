import { Check } from 'lucide-react';
import { formatMoney } from '../utils/format';

// The hairline grid is built from `gap-px` over a line-coloured background, so
// an unused column would show up as an empty grey block — the track count has
// to match the number of tariffs exactly.
const COLUMNS = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
};

export default function TariffTable({ tariffs, onBuyNow, onAddToCart }) {
  if (!tariffs || tariffs.length === 0) return null;

  const columns = COLUMNS[Math.min(tariffs.length, 3)] || 'md:grid-cols-3';

  return (
    <div
      className={`grid grid-cols-1 ${columns} gap-px bg-line border border-line rounded-lg overflow-hidden`}
    >
      {tariffs.map((tariff, idx) => {
        const hasDiscount = tariff.discountPrice && Number(tariff.discountPrice) < Number(tariff.price);
        const featured = idx === 1 && tariffs.length > 1;

        return (
          <div
            key={tariff.id}
            className={`motion-rise seq-${Math.min(idx + 1, 8)} flex flex-col p-6 md:p-8 ${
              featured ? 'bg-obsidian text-white' : 'bg-panel'
            }`}
          >
            <div className="flex items-center justify-between gap-3 mb-6">
              <span className={`t-index ${featured ? 'text-white/50' : ''}`}>
                {String(idx + 1).padStart(2, '0')}
              </span>
              {featured && <span className="tag tag-accent">Tavsiya</span>}
            </div>

            <h4
              className={`t-heading text-xl ${featured ? 'text-white' : 'text-ink'}`}
            >
              {tariff.name}
            </h4>

            <div className="mt-5">
              {hasDiscount && (
                <p className={`font-mono text-xs line-through figures mb-1 ${featured ? 'text-white/45' : 'text-ink-3'}`}>
                  {formatMoney(tariff.price)}
                </p>
              )}
              <p
                className={`t-display text-[32px] figures ${featured ? 'text-white' : 'text-ink'}`}
              >
                {formatMoney(hasDiscount ? tariff.discountPrice : tariff.price)}
              </p>
            </div>

            {tariff.accessDurationDays && (
              <p className={`mt-3 font-mono text-[11px] uppercase tracking-[0.1em] ${featured ? 'text-white/55' : 'text-ink-3'}`}>
                Kirish · {tariff.accessDurationDays} kun
              </p>
            )}

            {(tariff.features || []).length > 0 && (
              <ul
                className={`mt-8 pt-6 border-t flex flex-col gap-3 flex-1 ${
                  featured ? 'border-white/15' : 'border-line'
                }`}
              >
                {tariff.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
                    <Check
                      size={15}
                      strokeWidth={2.25}
                      className={`mt-0.5 shrink-0 ${featured ? 'text-white' : 'text-accent'}`}
                      aria-hidden="true"
                    />
                    <span className={featured ? 'text-white/85' : 'text-ink-2'}>{f}</span>
                  </li>
                ))}
              </ul>
            )}

            {tariff.bonuses && (
              <p className={`mt-5 text-sm leading-relaxed ${featured ? 'text-white/60' : 'text-ink-3'}`}>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] mr-2">Bonus</span>
                {tariff.bonuses}
              </p>
            )}

            <div className="mt-8 flex flex-col gap-2">
              <button
                type="button"
                className={`btn w-full ${featured ? 'btn-accent' : 'btn-solid'}`}
                onClick={() => onBuyNow(tariff)}
              >
                Tarifni tanlash
              </button>
              <button
                type="button"
                className={`btn btn-sm w-full ${
                  featured
                    ? 'bg-transparent text-white/80 border-white/25 hover:bg-white/10 hover:text-white'
                    : 'btn-quiet'
                }`}
                onClick={() => onAddToCart(tariff)}
              >
                Savatga qoʼshish
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
