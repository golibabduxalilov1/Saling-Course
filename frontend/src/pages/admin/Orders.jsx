import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Search, ShoppingBag, SlidersHorizontal } from 'lucide-react';
import { adminApi } from '../../api/client';
import { formatMoney, formatDate } from '../../utils/format';
import { OrderStatusBadge, PaymentStatusBadge } from '../../components/admin/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { TableSkeleton } from '../../components/Skeleton';

const ORDER_STATUS_LABELS = {
  NEW: 'Yangi',
  AWAITING_PAYMENT: "To'lov kutilmoqda",
  CHECKING_PAYMENT: "To'lov tekshirilmoqda",
  PAID: "To'landi",
  PREPARING: 'Tayyorlanmoqda',
  ACCESS_GRANTED: 'Kirish berildi',
  SHIPPED: 'Yetkazishga topshirildi',
  DELIVERED: 'Yetkazib berildi',
  COMPLETED: 'Yakunlandi',
  CANCELLED: 'Bekor qilindi',
  REFUNDED: 'Pul qaytarildi',
};

const PAYMENT_STATUS_LABELS = {
  PENDING: 'Kutilmoqda',
  CHECKING: 'Tekshirilmoqda',
  PAID: "To'landi",
  FAILED: 'Muvaffaqiyatsiz',
  REFUNDED: 'Qaytarildi',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', orderStatus: '', paymentStatus: '' });

  const load = () => {
    setLoading(true);
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.orderStatus) params.orderStatus = filters.orderStatus;
    if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
    adminApi.get('/orders', { params }).then((res) => setOrders(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.orderStatus, filters.paymentStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load();
  };

  const exportCsv = () => {
    window.open('/api/admin/orders/export', '_blank');
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-ink">Buyurtmalar</h1>
        <button onClick={exportCsv} className="btn-secondary">
          <Download size={16} aria-hidden="true" />
          Excel/CSV eksport
        </button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
              aria-hidden="true"
            />
            <input
              className="input-field w-56 pl-9"
              placeholder="Raqam, telefon yoki ism bo'yicha qidirish"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <button type="submit" className="btn-secondary">
            Qidirish
          </button>
        </form>
        <div className="flex items-center gap-2 text-ink-muted">
          <SlidersHorizontal size={16} aria-hidden="true" />
          <span className="text-sm hidden sm:inline">Filtrlar</span>
        </div>
        <select
          className="input-field w-52"
          value={filters.orderStatus}
          onChange={(e) => setFilters({ ...filters, orderStatus: e.target.value })}
        >
          <option value="">Barcha holatlar</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="input-field w-48"
          value={filters.paymentStatus}
          onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
        >
          <option value="">Barcha to'lovlar</option>
          {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="table-wrap">
          <TableSkeleton rows={6} cols={7} />
        </div>
      ) : orders.length === 0 ? (
        <div className="card">
          <EmptyState icon={ShoppingBag} title="Buyurtma topilmadi" description="Filtrlarga mos buyurtma topilmadi." />
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Raqami</th>
                <th>Mijoz</th>
                <th>Summa</th>
                <th>To'lov</th>
                <th>Holati</th>
                <th>Manba</th>
                <th>Sana</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link to={`/admin/orders/${o.id}`} className="font-semibold text-navy-900 hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td>
                    <div className="font-medium text-ink">{o.customerName}</div>
                    <div className="text-xs text-ink-muted">{o.phone}</div>
                  </td>
                  <td>{formatMoney(o.totalAmount)}</td>
                  <td>
                    <PaymentStatusBadge status={o.paymentStatus} />
                  </td>
                  <td>
                    <OrderStatusBadge status={o.orderStatus} />
                  </td>
                  <td className="text-ink-muted">{o.utmSource || o.source || '—'}</td>
                  <td className="text-ink-muted">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS };
