import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { api } from '../api/client';
import { formatMoney } from '../utils/format';

const STEPS = [
  { k: 'Qabul qilindi', d: 'Buyurtmangiz tizimga tushdi.' },
  { k: 'Bogʼlanamiz', d: 'Operator siz bilan aloqaga chiqadi.' },
  { k: 'Kirish ochiladi', d: "To'lov tasdiqlangach materiallar ochiladi." },
];

export default function OrderSuccess() {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api
      .get(`/orders/${orderNumber}`)
      .then((res) => setOrder(res.data))
      .catch(() => {});
  }, [orderNumber]);

  return (
    <div className="shell py-20 md:py-28">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-7">
          <span className="motion-pop inline-flex items-center justify-center w-12 h-12 rounded-md bg-positive-tint border border-positive/25 text-positive">
            <Check size={22} strokeWidth={2.25} aria-hidden="true" />
          </span>

          <h1 className="motion-rise seq-1 t-display text-[40px] md:text-[56px] text-ink mt-8">
            Buyurtmangiz
            <br />
            qabul qilindi
          </h1>

          <div className="motion-rise seq-2 mt-8 flex items-baseline gap-3 flex-wrap">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">Buyurtma raqami</span>
            <span className="font-mono text-lg font-medium text-ink figures">{orderNumber}</span>
          </div>

          <ol className="motion-rise seq-3 mt-12 border-t border-ink">
            {STEPS.map((s, i) => (
              <li key={s.k} className="flex items-start gap-5 py-5 border-b border-line">
                <span className="t-index pt-1 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="block t-heading text-[15px] text-ink">{s.k}</span>
                  <span className="block mt-1 text-sm text-ink-3 leading-relaxed">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>

          <Link to="/katalog" className="btn btn-lg btn-solid mt-10">
            Katalogga qaytish
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>

        {order && (
          <aside className="motion-rise seq-4 lg:col-span-5">
            <div className="panel p-6 md:p-8">
              <h2 className="t-kicker">Buyurtma maʼlumotlari</h2>
              <dl className="mt-6 pt-6 border-t border-line flex flex-col">
                <div className="flex justify-between gap-4 py-3 border-b border-line">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">Mijoz</dt>
                  <dd className="text-sm text-ink text-right">{order.customerName}</dd>
                </div>
                <div className="flex justify-between gap-4 py-3 border-b border-line">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">Telefon</dt>
                  <dd className="text-sm text-ink text-right figures">{order.phone}</dd>
                </div>
              </dl>

              <div className="mt-6 pt-6 border-t border-ink flex items-baseline justify-between gap-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">Jami summa</span>
                <span className="t-display text-[28px] text-ink figures">{formatMoney(order.totalAmount)}</span>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
