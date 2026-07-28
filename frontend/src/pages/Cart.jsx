import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../utils/format';
import EmptyState from '../components/EmptyState';

export default function Cart() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Savat bo'sh"
          description="Katalogdan mahsulot tanlab savatga qo'shing."
          action={
            <Link to="/katalog" className="btn-primary mt-1">
              Katalogga o'tish
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-h2 text-2xl text-ink mb-6">Savat</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.key} className="card p-4 flex items-center gap-4">
              <div className="w-16 h-16 bg-ivory rounded-lg overflow-hidden shrink-0">
                {item.productImage ? (
                  <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-border-soft font-bold">
                    {item.productName?.[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link
                  to={`/mahsulot/${item.productSlug}`}
                  className="font-semibold text-ink hover:text-gold-600 transition-colors line-clamp-1"
                >
                  {item.productName}
                </Link>
                {item.tariffName && <p className="text-xs text-ink-muted">Tarif: {item.tariffName}</p>}
                <p className="font-bold text-ink mt-1 tabular-nums">{formatMoney(item.unitPrice)}</p>
              </div>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateQuantity(item.key, Number(e.target.value))}
                aria-label={`${item.productName} miqdori`}
                className="input-field w-16 text-center tabular-nums"
              />
              <button
                onClick={() => removeItem(item.key)}
                className="btn-icon hover:text-danger! shrink-0"
                aria-label={`${item.productName} ni savatdan o'chirish`}
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-80 shrink-0">
          <div className="card p-5 flex flex-col gap-3 sticky top-20">
            <h3 className="font-bold text-ink">Buyurtma xulosasi</h3>
            <div className="flex justify-between text-sm">
              <span className="text-ink-muted">Jami</span>
              <span className="font-bold text-lg text-ink tabular-nums">{formatMoney(subtotal)}</span>
            </div>
            <button className="btn-accent w-full" onClick={() => navigate('/checkout')}>
              Buyurtmani rasmiylashtirish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
