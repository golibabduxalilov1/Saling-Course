import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CircleCheck } from 'lucide-react';
import { api } from '../api/client';
import { formatMoney } from '../utils/format';

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
    <div className="container-page py-16 flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
        <CircleCheck size={36} aria-hidden="true" />
      </div>
      <h1 className="text-h2 text-2xl text-ink">Buyurtmangiz qabul qilindi!</h1>
      <p className="text-ink-muted max-w-md">
        Buyurtma raqami: <strong className="text-ink">{orderNumber}</strong>. Tez orada operatorimiz siz bilan
        bog'lanib to'lovni qabul qiladi.
      </p>
      {order && (
        <div className="card p-5 text-left w-full max-w-sm flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-ink-muted">Mijoz</span>
            <span className="font-medium text-ink">{order.customerName}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-ink-muted">Telefon</span>
            <span className="font-medium text-ink">{order.phone}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-border-soft">
            <span className="text-ink-muted">Jami summa</span>
            <span className="font-bold text-ink tabular-nums">{formatMoney(order.totalAmount)}</span>
          </div>
        </div>
      )}
      <Link to="/katalog" className="btn-accent mt-2">
        Katalogga qaytish
      </Link>
    </div>
  );
}
