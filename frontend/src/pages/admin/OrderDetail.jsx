import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Mail, MapPin, Package, Phone, Save, Send, StickyNote, User } from 'lucide-react';
import { adminApi } from '../../api/client';
import { formatMoney, formatDate } from '../../utils/format';
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from './Orders';
import { useToast } from '../../context/ToastContext';

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
      <div className="flex flex-col gap-6 max-w-3xl">
        <div className="h-8 w-64 rounded bg-border-soft/70 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-5 h-40 animate-pulse" />
          <div className="card p-5 h-40 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link to="/admin/orders" className="btn-icon" aria-label="Orqaga" title="Orqaga">
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <h1 className="text-2xl font-bold text-ink">Buyurtma {order.orderNumber}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-5 flex flex-col gap-2 text-sm">
          <h2 className="font-bold mb-1 text-ink flex items-center gap-2">
            <User size={16} aria-hidden="true" className="text-ink-muted" />
            Mijoz
          </h2>
          <div className="text-ink">
            <span className="text-ink-muted">Ism: </span>
            {order.customerName} {order.customerLastName}
          </div>
          <div className="text-ink flex items-center gap-1.5">
            <Phone size={14} aria-hidden="true" className="text-ink-muted shrink-0" />
            {order.phone}
          </div>
          {order.telegramUsername && (
            <div className="text-ink flex items-center gap-1.5">
              <Send size={14} aria-hidden="true" className="text-ink-muted shrink-0" />
              {order.telegramUsername}
            </div>
          )}
          {order.email && (
            <div className="text-ink flex items-center gap-1.5">
              <Mail size={14} aria-hidden="true" className="text-ink-muted shrink-0" />
              {order.email}
            </div>
          )}
          {order.region && (
            <div className="text-ink flex items-center gap-1.5">
              <MapPin size={14} aria-hidden="true" className="text-ink-muted shrink-0" />
              {order.region}
            </div>
          )}
          {order.address && (
            <div className="text-ink">
              <span className="text-ink-muted">Manzil: </span>
              {order.address}
            </div>
          )}
          <div className="text-ink">
            <span className="text-ink-muted">Manba: </span>
            {order.utmSource || order.source || '—'} {order.utmCampaign ? `/ ${order.utmCampaign}` : ''}
          </div>
          <div className="text-ink flex items-center gap-1.5">
            <CalendarDays size={14} aria-hidden="true" className="text-ink-muted shrink-0" />
            {formatDate(order.createdAt)}
          </div>
          {order.comment && (
            <div className="text-ink">
              <span className="text-ink-muted">Mijoz izohi: </span>
              {order.comment}
            </div>
          )}
        </div>

        <div className="card p-5 flex flex-col gap-2 text-sm">
          <h2 className="font-bold mb-1 text-ink flex items-center gap-2">
            <Package size={16} aria-hidden="true" className="text-ink-muted" />
            Mahsulotlar
          </h2>
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between border-b border-border-soft pb-1">
              <div>
                <div className="font-medium text-ink">{item.product.name}</div>
                {item.tariff && <div className="text-xs text-ink-muted">{item.tariff.name}</div>}
              </div>
              <div className="text-ink">{formatMoney(item.price * item.quantity)}</div>
            </div>
          ))}
          <div className="flex justify-between text-ink-muted pt-1">
            <span>Mahsulotlar summasi</span>
            <span>{formatMoney(order.subtotal)}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-success">
              <span>Chegirma</span>
              <span>-{formatMoney(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base text-ink">
            <span>Jami</span>
            <span>{formatMoney(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="card p-5 flex flex-col gap-4">
        <h2 className="font-bold text-ink">Holatni boshqarish</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label" htmlFor="od-order-status">
              Buyurtma holati
            </label>
            <select
              id="od-order-status"
              className="input-field"
              value={form.orderStatus}
              onChange={(e) => setForm({ ...form, orderStatus: e.target.value })}
            >
              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label" htmlFor="od-payment-status">
              To'lov holati
            </label>
            <select
              id="od-payment-status"
              className="input-field"
              value={form.paymentStatus}
              onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
            >
              {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label" htmlFor="od-paid-amount">
              To'langan summa
            </label>
            <input
              id="od-paid-amount"
              className="input-field"
              type="number"
              value={form.paidAmount}
              onChange={(e) => setForm({ ...form, paidAmount: e.target.value })}
            />
          </div>
        </div>
        <div>
          <label className="form-label flex items-center gap-1.5" htmlFor="od-note">
            <StickyNote size={14} aria-hidden="true" className="text-ink-muted" />
            Ichki izoh (faqat operatorlar uchun)
          </label>
          <textarea
            id="od-note"
            className="input-field"
            rows={3}
            value={form.internalNote}
            onChange={(e) => setForm({ ...form, internalNote: e.target.value })}
          />
        </div>
        <button type="submit" className="btn-primary self-start" disabled={saving}>
          <Save size={16} aria-hidden="true" />
          {saving ? 'Saqlanmoqda...' : 'Saqlash'}
        </button>
      </form>
    </div>
  );
}
