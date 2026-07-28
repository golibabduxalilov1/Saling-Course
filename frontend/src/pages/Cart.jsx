import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../utils/format';
import EmptyState from '../components/EmptyState';

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="shell py-20 md:py-28">
        <span className="t-kicker t-kicker-accent">Savat</span>
        <h1 className="t-display text-[40px] md:text-[56px] text-ink mt-6 mb-12">Savat</h1>
        <div className="panel">
          <EmptyState
            icon={ShoppingBag}
            title="Savat boʼsh"
            description="Katalogdan mahsulot tanlab savatga qoʼshing."
            action={
              <Link to="/katalog" className="btn btn-solid">
                Katalogga oʼtish
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="shell py-14 md:py-20">
      <span className="t-kicker t-kicker-accent">Savat</span>
      <div className="mt-6 flex items-baseline gap-4 flex-wrap">
        <h1 className="t-display text-[40px] md:text-[56px] text-ink">Savat</h1>
        <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3 figures">
          {items.length} ta pozitsiya
        </span>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* ── Line items ─────────────────────────────────────────────────── */}
        <div className="lg:col-span-8">
          <div className="hidden sm:grid grid-cols-12 gap-4 border-t border-ink pt-4 pb-3 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
            <span className="col-span-6">Mahsulot</span>
            <span className="col-span-2 text-right">Narx</span>
            <span className="col-span-3 text-center">Miqdor</span>
            <span className="col-span-1" />
          </div>

          <ul className="border-t border-line sm:border-t-0">
            {items.map((item, i) => (
              <li
                key={item.key}
                className={`motion-rise seq-${Math.min(i + 1, 8)} grid grid-cols-12 gap-4 items-center py-5 border-b border-line`}
              >
                <div className="col-span-12 sm:col-span-6 flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 shrink-0 rounded-md border border-line bg-veil overflow-hidden flex items-center justify-center">
                    {item.productImage ? (
                      <img src={item.productImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-display text-lg font-semibold text-ink-3">
                        {item.productName?.[0]}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link
                      to={`/mahsulot/${item.productSlug}`}
                      className="link t-heading text-[15px] text-ink line-clamp-2"
                    >
                      {item.productName}
                    </Link>
                    {item.tariffName && (
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
                        Tarif · {item.tariffName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="col-span-5 sm:col-span-2 sm:text-right">
                  <span className="sm:hidden font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3 block mb-1">
                    Narx
                  </span>
                  <span className="text-[15px] font-medium text-ink figures whitespace-nowrap">
                    {formatMoney(item.unitPrice)}
                  </span>
                </div>

                <div className="col-span-5 sm:col-span-3 flex sm:justify-center">
                  <div className="inline-flex items-center border border-line rounded-md">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-11 h-11 flex items-center justify-center text-ink-3 hover:text-ink hover:bg-veil disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150 cursor-pointer rounded-l-md"
                      aria-label={`${item.productName} miqdorini kamaytirish`}
                    >
                      <Minus size={14} aria-hidden="true" />
                    </button>
                    <span
                      className="w-10 text-center text-sm font-medium text-ink figures"
                      aria-live="polite"
                      aria-label={`Miqdor: ${item.quantity}`}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="w-11 h-11 flex items-center justify-center text-ink-3 hover:text-ink hover:bg-veil transition-colors duration-150 cursor-pointer rounded-r-md"
                      aria-label={`${item.productName} miqdorini oshirish`}
                    >
                      <Plus size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="icon-btn icon-btn-critical"
                    aria-label={`${item.productName} ni savatdan oʼchirish`}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <Link
            to="/katalog"
            className="link mt-8 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3 hover:text-accent"
          >
            Xaridni davom ettirish
            <ArrowRight size={13} aria-hidden="true" />
          </Link>
        </div>

        {/* ── Summary ────────────────────────────────────────────────────── */}
        <aside className="lg:col-span-4 lg:sticky lg:top-28">
          <div className="panel p-6 md:p-8">
            <h2 className="t-kicker">Buyurtma xulosasi</h2>

            <dl className="mt-6 pt-6 border-t border-line flex flex-col gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-3">Mahsulotlar</dt>
                <dd className="text-ink figures">{formatMoney(subtotal)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-3">Yetkazib berish</dt>
                <dd className="text-ink-3">Raqamli</dd>
              </div>
            </dl>

            <div className="mt-6 pt-6 border-t border-ink flex items-baseline justify-between gap-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">Jami</span>
              <span className="t-display text-[28px] text-ink figures">{formatMoney(subtotal)}</span>
            </div>

            <button type="button" className="btn btn-lg btn-accent w-full mt-8" onClick={() => navigate('/checkout')}>
              Rasmiylashtirish
              <ArrowRight size={17} aria-hidden="true" />
            </button>

            <p className="mt-4 text-xs leading-relaxed text-ink-3 text-center">
              Buyurtma bergandan soʼng operator siz bilan bogʼlanadi.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
