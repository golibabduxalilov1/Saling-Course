import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { adminApi } from '../../api/client';
import { formatMoney, formatDate } from '../../utils/format';
import {
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
  OrderStatusBadge,
  PaymentStatusBadge,
} from '../../components/admin/StatusBadge';
import { Skeleton } from '../../components/Skeleton';
import { useToast } from '../../context/ToastContext';

function Row({ label, children }) {
  if (!children) return null;
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-line last:border-b-0">
      <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3 shrink-0 pt-0.5">{label}</dt>
      <dd className="text-sm text-ink text-right min-w-0 break-words">{children}</dd>
    </div>
  );
}

function Card({ title, children, className = '' }) {
  return (
    <section className={`panel flex flex-col ${className}`}>
      <h2 className="px-5 py-4 border-b border-line font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">
        {title}
      </h2>
      <div className="p-5">{children}</div>
    </section>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({ orderStatus: '', paymentStatus: '', paidAmount: '', internalNote: '' });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = () => {
    adminApi.get(`/orders/${id}`).then((res) => {
      setOrder(res.data);
      setForm({
        orderStatus: res.data.orderStatus,
        paymentStatus: res.data.paymentStatus,
        paidAmount: res.data.paidAmount,
        internalNote: res.data.internalNote || '',
      });
    });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await adminApi.patch(`/orders/${id}`, {
        orderStatus: form.orderStatus,
        paymentStatus: form.paymentStatus,
        paidAmount: form.paidAmount === '' ? undefined : Number(form.paidAmount),
        internalNote: form.internalNote,
      });
      toast.success('Buyurtma yangilandi');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  if (!order) {
    return (
      <div className="max-w-5xl">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-72 mt-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <Link
        to="/admin/orders"
        className="link inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3 hover:text-accent"
      >
        <ArrowLeft size={13} aria-hidden="true" />
        Buyurtmalar
      </Link>

      <header className="mt-6 mb-10 pb-6 border-b border-ink">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="t-kicker t-kicker-accent">Buyurtma</span>
            <h1 className="text-[30px] md:text-[36px] font-mono font-medium text-ink mt-3 figures">
              {order.orderNumber}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.orderStatus} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Mijoz">
          <dl>
            <Row label="Ism">
              {order.customerName} {order.customerLastName}
            </Row>
            <Row label="Telefon">
              <span className="figures">{order.phone}</span>
            </Row>
            <Row label="Telegram">{order.telegramUsername}</Row>
            <Row label="Manba">
              {order.utmSource || order.source || '—'}
              {order.utmCampaign ? ` / ${order.utmCampaign}` : ''}
            </Row>
            <Row label="Sana">
              <span className="figures">{formatDate(order.createdAt)}</span>
            </Row>
            <Row label="Izoh">{order.comment}</Row>
          </dl>
        </Card>

        <Card title="Mahsulotlar">
          <ul className="flex flex-col">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-3 border-b border-line">
                <div className="min-w-0">
                  <p className="text-sm text-ink">{item.product.name}</p>
                  {item.tariff && (
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
                      {item.tariff.name}
                    </p>
                  )}
                </div>
                <span className="shrink-0 text-sm text-ink figures">
                  {formatMoney(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-3">Mahsulotlar summasi</dt>
              <dd className="text-ink figures">{formatMoney(order.subtotal)}</dd>
            </div>
            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between gap-4 text-positive">
                <dt>Chegirma</dt>
                <dd className="figures">−{formatMoney(order.discountAmount)}</dd>
              </div>
            )}
          </dl>

          <div className="mt-4 pt-4 border-t border-ink flex items-baseline justify-between gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">Jami</span>
            <span className="t-display text-2xl text-ink figures">{formatMoney(order.totalAmount)}</span>
          </div>
        </Card>
      </div>

      <form onSubmit={handleSave} className="panel mt-6">
        <h2 className="px-5 py-4 border-b border-line font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">
          Holatni boshqarish
        </h2>

        <div className="p-5 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="field-label" htmlFor="od-order-status">
                Buyurtma holati
              </label>
              <select
                id="od-order-status"
                className="field pick"
                value={form.orderStatus}
                onChange={(e) => setForm({ ...form, orderStatus: e.target.value })}
              >
                {Object.entries(ORDER_STATUS_META).map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="od-payment-status">
                Toʼlov holati
              </label>
              <select
                id="od-payment-status"
                className="field pick"
                value={form.paymentStatus}
                onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
              >
                {Object.entries(PAYMENT_STATUS_META).map(([value, meta]) => (
                  <option key={value} value={value}>
                    {meta.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="od-paid-amount">
                Toʼlangan summa
              </label>
              <input
                id="od-paid-amount"
                type="number"
                className="field figures"
                value={form.paidAmount}
                onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="field-label" htmlFor="od-note">
              Ichki izoh <span className="optional">(faqat operatorlar uchun)</span>
            </label>
            <textarea
              id="od-note"
              className="field"
              rows={3}
              placeholder="Operator uchun eslatma"
              value={form.internalNote}
              onChange={(e) => setForm({ ...form, internalNote: e.target.value })}
            />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-line">
          <button type="submit" className="btn btn-accent" disabled={saving}>
            {saving ? (
              <>
                <Loader2 size={15} className="motion-spin" aria-hidden="true" />
                Saqlanmoqda
              </>
            ) : (
              <>
                <Save size={15} aria-hidden="true" />
                Saqlash
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
