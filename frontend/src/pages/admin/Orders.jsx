import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Loader2, Search, ShoppingBag } from 'lucide-react';
import { adminApi } from '../../api/client';
import { formatMoney, formatDate } from '../../utils/format';
import {
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
  OrderStatusBadge,
  PaymentStatusBadge,
} from '../../components/admin/StatusBadge';
import EmptyState from '../../components/EmptyState';
import { TableSkeleton } from '../../components/Skeleton';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/admin/PageHeader';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState({ search: '', orderStatus: '', paymentStatus: '' });
  const toast = useToast();

  const load = () => {
    setLoading(true);
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.orderStatus) params.orderStatus = filters.orderStatus;
    if (filters.paymentStatus) params.paymentStatus = filters.paymentStatus;
    adminApi
      .get('/orders', { params })
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.orderStatus, filters.paymentStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    load();
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const res = await adminApi.get('/orders/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `buyurtmalar-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Eksport qilishda xatolik yuz berdi');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <PageHeader
        kicker="Sotuv"
        title="Buyurtmalar"
        description="Barcha buyurtmalarni holat va to'lov bo'yicha filtrlang."
        actions={
          <button type="button" onClick={exportCsv} className="btn btn-outline" disabled={exporting}>
            {exporting ? (
              <>
                <Loader2 size={15} className="motion-spin" aria-hidden="true" />
                Eksport
              </>
            ) : (
              <>
                <Download size={15} aria-hidden="true" />
                CSV eksport
              </>
            )}
          </button>
        }
      />

      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <div className="panel p-5 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <form onSubmit={handleSearchSubmit} className="md:col-span-5" role="search">
            <label className="field-label" htmlFor="ord-search">
              Qidirish
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="ord-search"
                  type="search"
                  className="field pl-9"
                  placeholder="Raqam, telefon yoki ism"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-solid shrink-0">
                Qidirish
              </button>
            </div>
          </form>

          <div className="md:col-span-4">
            <label className="field-label" htmlFor="ord-status">
              Buyurtma holati
            </label>
            <select
              id="ord-status"
              className="field pick"
              value={filters.orderStatus}
              onChange={(e) => setFilters({ ...filters, orderStatus: e.target.value })}
            >
              <option value="">Barcha holatlar</option>
              {Object.entries(ORDER_STATUS_META).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="field-label" htmlFor="ord-payment">
              Toʼlov holati
            </label>
            <select
              id="ord-payment"
              className="field pick"
              value={filters.paymentStatus}
              onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
            >
              <option value="">Barcha toʼlovlar</option>
              {Object.entries(PAYMENT_STATUS_META).map(([value, meta]) => (
                <option key={value} value={value}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="tbl-frame">
          <TableSkeleton rows={6} cols={7} />
        </div>
      ) : orders.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={ShoppingBag}
            title="Buyurtma topilmadi"
            description="Tanlangan filtrlarga mos buyurtma yoʼq."
          />
        </div>
      ) : (
        <div className="tbl-frame">
          <table className="tbl">
            <thead>
              <tr>
                <th>Raqami</th>
                <th>Mijoz</th>
                <th>Summa</th>
                <th>Toʼlov</th>
                <th>Holati</th>
                <th>Manba</th>
                <th>Sana</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link to={`/admin/orders/${o.id}`} className="link font-mono text-xs font-medium text-ink figures">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td>
                    <span className="block text-sm font-medium text-ink">{o.customerName}</span>
                    <span className="block font-mono text-[11px] text-ink-3 figures mt-0.5">{o.phone}</span>
                  </td>
                  <td className="figures text-ink">{formatMoney(o.totalAmount)}</td>
                  <td>
                    <PaymentStatusBadge status={o.paymentStatus} />
                  </td>
                  <td>
                    <OrderStatusBadge status={o.orderStatus} />
                  </td>
                  <td>
                    <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3">
                      {o.utmSource || o.source || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-[11px] text-ink-3 figures whitespace-nowrap">
                      {formatDate(o.createdAt)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
