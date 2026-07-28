import { useEffect, useState } from 'react';
import { adminApi } from '../../api/client';
import { formatMoney } from '../../utils/format';
import { Skeleton, TableSkeleton } from '../../components/Skeleton';
import PageHeader from '../../components/admin/PageHeader';

const RANGES = [
  { value: 'today', label: 'Bugun' },
  { value: 'yesterday', label: 'Kecha' },
  { value: '7d', label: 'Oxirgi 7 kun' },
  { value: '30d', label: 'Oxirgi 30 kun' },
];

/* Stat tile — value carries the weight, label stays a quiet mono caption. */
function Stat({ label, value, hint }) {
  return (
    <div className="bg-panel p-5 flex flex-col">
      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-3">{label}</span>
      <span className="t-display text-[28px] text-ink figures mt-3 break-words">{value}</span>
      {hint && <span className="mt-1 text-xs text-ink-3">{hint}</span>}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <section className="panel flex flex-col">
      <h2 className="px-5 py-4 border-b border-line font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">
        {title}
      </h2>
      <div className="p-5 flex-1">{children}</div>
    </section>
  );
}

function RankedList({ rows, valueSuffix }) {
  if (!rows || rows.length === 0) {
    return (
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3 py-6 text-center">
        Maʼlumot yoʼq
      </p>
    );
  }
  return (
    <ol className="flex flex-col">
      {rows.map((r, i) => (
        <li
          key={r.productId}
          className="flex items-center gap-4 py-3 border-b border-line last:border-b-0 last:pb-0 first:pt-0"
        >
          <span className="t-index shrink-0">{String(i + 1).padStart(2, '0')}</span>
          <span className="flex-1 min-w-0 text-sm text-ink truncate">{r.name}</span>
          <span className="shrink-0 font-mono text-xs text-ink-2 figures">
            {r.orders ?? r.views} {valueSuffix}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function Dashboard() {
  const [range, setRange] = useState('30d');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStats(null);
    adminApi.get('/dashboard', { params: { range } }).then((res) => {
      if (!cancelled) setStats(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [range]);

  const rangePicker = (
    <>
      <label htmlFor="dash-range" className="sr-only">
        Davr
      </label>
      <select
        id="dash-range"
        className="field pick w-52"
        value={range}
        onChange={(e) => setRange(e.target.value)}
      >
        {RANGES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </>
  );

  if (!stats) {
    return (
      <div>
        <PageHeader kicker="Umumiy" title="Dashboard" actions={rangePicker} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line rounded-lg overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-panel p-5 flex flex-col gap-3">
              <Skeleton className="h-2.5 w-20" />
              <Skeleton className="h-7 w-24" />
            </div>
          ))}
        </div>
        <div className="panel mt-6">
          <TableSkeleton rows={5} cols={3} />
        </div>
      </div>
    );
  }

  const funnelSteps = [
    { label: "Sahifa ko'rishlar", value: stats.funnel.pageViews },
    { label: "Mahsulot ko'rishlar", value: stats.funnel.productViews },
    { label: "Savatga qo'shish", value: stats.funnel.addToCart },
    { label: 'Checkout boshlangan', value: stats.funnel.checkoutStart },
    { label: 'Xarid qilingan', value: stats.funnel.purchases },
  ];
  const funnelTop = funnelSteps[0].value || 1;

  return (
    <div>
      <PageHeader
        kicker="Umumiy"
        title="Dashboard"
        description="Tanlangan davr bo'yicha sotuv va marketing ko'rsatkichlari."
        actions={rangePicker}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line rounded-lg overflow-hidden">
        <Stat label="Buyurtmalar" value={stats.totalOrders} />
        <Stat label="To'langan" value={stats.paidOrders} />
        <Stat label="To'lov kutilmoqda" value={stats.pendingPayment} />
        <Stat label="Tugallanmagan" value={stats.abandonedCheckouts} />
        <Stat label="Jami tushum" value={formatMoney(stats.revenue)} />
        <Stat label="O'rtacha summa" value={formatMoney(stats.averageOrderValue)} />
        <Stat label="Yangi leadlar" value={stats.newLeads} />
        <Stat
          label="Konversiya"
          value={`${((stats.funnel.purchases / (stats.funnel.checkoutStart || 1)) * 100).toFixed(1)}%`}
          hint="Checkout → xarid"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card title="Sotuv voronkasi">
          <ol className="flex flex-col gap-5">
            {funnelSteps.map((step, i) => {
              const pct = Math.min(100, (step.value / funnelTop) * 100);
              return (
                <li key={step.label}>
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <span className="flex items-baseline gap-3 min-w-0">
                      <span className="t-index shrink-0">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-sm text-ink-2 truncate">{step.label}</span>
                    </span>
                    <span className="shrink-0 font-mono text-xs font-medium text-ink figures">{step.value}</span>
                  </div>
                  <div className="h-1.5 bg-veil rounded-xs overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-xs transition-[width] duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ol>
        </Card>

        <Card title="Eng ko'p sotilgan mahsulotlar">
          <RankedList rows={stats.topProducts} valueSuffix="buyurtma" />
        </Card>

        <Card title="Eng ko'p ko'rilgan mahsulotlar">
          <RankedList rows={stats.mostViewedProducts} valueSuffix="ko'rish" />
        </Card>

        <Card title="Reklama manbalari">
          {stats.sourceBreakdown.length === 0 ? (
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3 py-6 text-center">
              Maʼlumot yoʼq
            </p>
          ) : (
            <div className="tbl-frame border-0 rounded-none">
              <table className="tbl">
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
                      <td className="text-ink">{s.source}</td>
                      <td className="figures">{s.orders}</td>
                      <td className="figures">{formatMoney(s.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
