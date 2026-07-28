import { useEffect, useState } from 'react';
import { ChartNoAxesCombined } from 'lucide-react';
import { adminApi } from '../../api/client';
import { formatMoney } from '../../utils/format';
import { TableSkeleton } from '../../components/Skeleton';

const RANGES = [
  { value: 'today', label: 'Bugun' },
  { value: '7d', label: 'Oxirgi 7 kun' },
  { value: '30d', label: 'Oxirgi 30 kun' },
];

function pct(part, whole) {
  if (!whole) return '0%';
  return `${((part / whole) * 100).toFixed(1)}%`;
}

export default function Analytics() {
  const [range, setRange] = useState('30d');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminApi.get('/analytics', { params: { range } }).then((res) => setStats(res.data));
  }, [range]);

  if (!stats) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-ink">Analitika</h1>
        <div className="card">
          <TableSkeleton rows={5} cols={3} />
        </div>
      </div>
    );
  }

  const { funnel } = stats;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <ChartNoAxesCombined size={22} className="text-navy-900" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-ink">Analitika</h1>
        </div>
        <select className="input-field w-48" value={range} onChange={(e) => setRange(e.target.value)}>
          {RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="card p-5">
        <h2 className="font-bold mb-2 text-ink">Sotuv voronkasi</h2>
        <p className="text-xs text-ink-muted mb-3">
          Reklama ko'rildi → saytga kirildi → mahsulot ko'rildi → sotib olish bosildi → buyurtma yaratildi → to'lov
          qilindi
        </p>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Bosqich</th>
                <th>Soni</th>
                <th>Konversiya</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Sahifa ko'rishlar</td>
                <td>{funnel.pageViews}</td>
                <td>—</td>
              </tr>
              <tr>
                <td>Mahsulot ko'rishlar</td>
                <td>{funnel.productViews}</td>
                <td>{pct(funnel.productViews, funnel.pageViews)}</td>
              </tr>
              <tr>
                <td>Savatga qo'shish</td>
                <td>{funnel.addToCart}</td>
                <td>{pct(funnel.addToCart, funnel.productViews)}</td>
              </tr>
              <tr>
                <td>Checkout boshlangan</td>
                <td>{funnel.checkoutStart}</td>
                <td>{pct(funnel.checkoutStart, funnel.addToCart)}</td>
              </tr>
              <tr>
                <td className="font-semibold text-ink">Xarid qilingan (checkout konversiyasi)</td>
                <td className="font-semibold text-ink">{funnel.purchases}</td>
                <td className="font-semibold text-ink">{pct(funnel.purchases, funnel.checkoutStart)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="card p-5">
          <h2 className="font-bold mb-4 text-ink">Reklama manbalari bo'yicha</h2>
          {stats.sourceBreakdown.length === 0 ? (
            <p className="text-sm text-ink-muted text-center py-4">Ma'lumot yo'q</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Manba</th>
                    <th>Buyurtmalar</th>
                    <th>Tushum</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.sourceBreakdown.map((s) => (
                    <tr key={s.source}>
                      <td>{s.source}</td>
                      <td>{s.orders}</td>
                      <td>{formatMoney(s.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-bold mb-4 text-ink">Kampaniyalar bo'yicha</h2>
          {stats.campaignBreakdown.length === 0 ? (
            <p className="text-sm text-ink-muted text-center py-4">Ma'lumot yo'q</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Kampaniya</th>
                    <th>Buyurtmalar</th>
                    <th>Tushum</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.campaignBreakdown.map((c) => (
                    <tr key={c.campaign}>
                      <td>{c.campaign}</td>
                      <td>{c.orders}</td>
                      <td>{formatMoney(c.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-bold mb-4 text-ink">Eng ko'p sotilgan mahsulotlar</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-ink-muted text-center py-4">Ma'lumot yo'q</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mahsulot</th>
                    <th>Buyurtmalar</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topProducts.map((p) => (
                    <tr key={p.productId}>
                      <td>{p.name}</td>
                      <td>{p.orders}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
