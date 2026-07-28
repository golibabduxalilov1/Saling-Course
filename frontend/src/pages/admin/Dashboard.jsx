import { useEffect, useState } from 'react';
import {
  BadgeCheck,
  Banknote,
  Clock,
  Eye,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  UserPlus,
  Wallet,
} from 'lucide-react';
import { adminApi } from '../../api/client';
import { formatMoney } from '../../utils/format';
import { TableSkeleton } from '../../components/Skeleton';

const RANGES = [
  { value: 'today', label: 'Bugun' },
  { value: 'yesterday', label: 'Kecha' },
  { value: '7d', label: 'Oxirgi 7 kun' },
  { value: '30d', label: 'Oxirgi 30 kun' },
];

function StatCard({ icon: Icon, label, value, tone = 'navy', note }) {
  const toneClasses = {
    navy: 'bg-navy-950 text-white',
    gold: 'bg-gold-500 text-navy-950',
    emerald: 'bg-emerald-500 text-white',
    ivory: 'bg-ivory text-ink-muted border border-border-soft',
  };
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${toneClasses[tone]}`}>
        <Icon size={18} aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm text-ink-muted">{label}</p>
        <p className="text-2xl font-bold mt-1 text-ink">{value}</p>
        {note && <p className="text-xs text-ink-muted mt-1">{note}</p>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [range, setRange] = useState('30d');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminApi.get('/dashboard', { params: { range } }).then((res) => setStats(res.data));
  }, [range]);

  if (!stats) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="card p-5 flex flex-col gap-3">
              <div className="w-10 h-10 rounded-lg bg-border-soft/70 animate-pulse" />
              <div className="h-4 w-24 rounded bg-border-soft/70 animate-pulse" />
              <div className="h-6 w-16 rounded bg-border-soft/70 animate-pulse" />
            </div>
          ))}
        </div>
        <div className="card">
          <TableSkeleton rows={5} cols={3} />
        </div>
      </div>
    );
  }

  const funnelSteps = [
    { label: "Sahifa ko'rishlar", value: stats.funnel.pageViews },
    { label: 'Mahsulot ko\'rishlar', value: stats.funnel.productViews },
    { label: "Savatga qo'shish", value: stats.funnel.addToCart },
    { label: 'Checkout boshlangan', value: stats.funnel.checkoutStart },
    { label: 'Xarid qilingan', value: stats.funnel.purchases },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={22} className="text-navy-900" aria-hidden="true" />
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
        </div>
        <select className="input-field w-48" value={range} onChange={(e) => setRange(e.target.value)}>
          {RANGES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={ShoppingBag} label="Buyurtmalar" value={stats.totalOrders} tone="navy" />
        <StatCard icon={BadgeCheck} label="To'langan buyurtmalar" value={stats.paidOrders} tone="emerald" />
        <StatCard icon={Clock} label="To'lov kutilmoqda" value={stats.pendingPayment} tone="gold" />
        <StatCard icon={ShoppingCart} label="Tugallanmagan buyurtmalar" value={stats.abandonedCheckouts} tone="ivory" />
        <StatCard icon={Wallet} label="Jami tushum" value={formatMoney(stats.revenue)} tone="navy" />
        <StatCard icon={TrendingUp} label="O'rtacha buyurtma summasi" value={formatMoney(stats.averageOrderValue)} tone="emerald" />
        <StatCard icon={UserPlus} label="Yangi leadlar" value={stats.newLeads} tone="gold" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h2 className="font-bold mb-4 text-ink">Sotuv voronkasi</h2>
          <div className="flex flex-col gap-3">
            {funnelSteps.map((step) => (
              <div key={step.label} className="flex items-center gap-3">
                <span className="text-sm text-ink-muted w-40 shrink-0">{step.label}</span>
                <div className="flex-1 bg-border-soft/60 rounded h-3 overflow-hidden">
                  <div
                    className="bg-navy-900 h-full"
                    style={{
                      width: `${Math.min(100, (step.value / (funnelSteps[0].value || 1)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-semibold w-10 text-right text-ink">{step.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-bold mb-4 text-ink">Eng ko'p sotilgan mahsulotlar</h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-ink-muted text-sm">Ma'lumot yo'q</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.topProducts.map((p) => (
                <div key={p.productId} className="flex justify-between text-sm">
                  <span className="line-clamp-1 text-ink">{p.name}</span>
                  <span className="font-semibold text-ink">{p.orders} buyurtma</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="font-bold mb-4 text-ink flex items-center gap-2">
            <Eye size={16} aria-hidden="true" className="text-ink-muted" />
            Eng ko'p ko'rilgan mahsulotlar
          </h2>
          {stats.mostViewedProducts.length === 0 ? (
            <p className="text-ink-muted text-sm">Ma'lumot yo'q</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.mostViewedProducts.map((p) => (
                <div key={p.productId} className="flex justify-between text-sm">
                  <span className="line-clamp-1 text-ink">{p.name}</span>
                  <span className="font-semibold text-ink">{p.views} ko'rish</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5 lg:col-span-2">
          <h2 className="font-bold mb-4 text-ink flex items-center gap-2">
            <Banknote size={16} aria-hidden="true" className="text-ink-muted" />
            Reklama manbalari
          </h2>
          {stats.sourceBreakdown.length === 0 ? (
            <p className="text-ink-muted text-sm">Ma'lumot yo'q</p>
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
      </div>
    </div>
  );
}
