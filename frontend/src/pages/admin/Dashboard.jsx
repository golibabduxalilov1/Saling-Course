import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../../api/client';
import { formatMoney } from '../../utils/format';
import { Skeleton } from '../../components/Skeleton';
import PageHeader from '../../components/admin/PageHeader';
import { BarRows, Delta, FunnelChart, TrendChart } from '../../components/admin/Charts';

const RANGES = [
  { value: 'today', label: 'Bugun' },
  { value: 'yesterday', label: 'Kecha' },
  { value: '7d', label: 'Oxirgi 7 kun' },
  { value: '30d', label: 'Oxirgi 30 kun' },
];

/* The trend chart plots one metric at a time — two scales on one axis would lie. */
const METRICS = [
  { value: 'revenue', label: 'Tushum' },
  { value: 'orders', label: 'Buyurtmalar' },
  { value: 'pageViews', label: "Ko'rishlar" },
];

/* Stat tile — value carries the weight, label stays a quiet mono caption. */
function Stat({ label, value, hint, delta }) {
  return (
    <div className="bg-panel p-5 flex flex-col">
      <span className="font-mono text-[10px] uppercase tracking-widest text-ink-3">{label}</span>
      <span className="t-display text-[28px] text-ink figures mt-3 break-words">{value}</span>
      <span className="mt-1.5 flex items-center gap-2 min-h-4">
        {delta}
        {hint && <span className="text-xs text-ink-3">{hint}</span>}
      </span>
    </div>
  );
}

function Card({ title, hint, actions, children }) {
  return (
    <section className="panel flex flex-col">
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-line">
        <div className="min-w-0">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-ink-2">{title}</h2>
          {hint && <p className="mt-1 text-xs text-ink-3">{hint}</p>}
        </div>
        {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
      </div>
      <div className="p-5 flex-1">{children}</div>
    </section>
  );
}

export default function Dashboard() {
  const [range, setRange] = useState('30d');
  const [metric, setMetric] = useState('revenue');
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

  const activeMetric = METRICS.find((m) => m.value === metric) || METRICS[0];

  const points = useMemo(
    () =>
      (stats?.timeseries || []).map((row) => ({
        key: row.date,
        label: row.label,
        fullLabel:
          stats.interval === 'hour'
            ? row.label
            : new Date(row.date).toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long' }),
        value: row[metric] || 0,
        row,
      })),
    [stats, metric]
  );

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
        <Skeleton className="h-85 w-full rounded-lg mt-6" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const prev = stats.previous || {};

  const funnelSteps = [
    { label: "Sahifa ko'rishlar", value: stats.funnel.pageViews },
    { label: "Mahsulot ko'rishlar", value: stats.funnel.productViews },
    { label: "Savatga qo'shish", value: stats.funnel.addToCart },
    { label: 'Checkout boshlangan', value: stats.funnel.checkoutStart },
    { label: 'Xarid qilingan', value: stats.funnel.purchases, strong: true },
  ];

  const sourceRows = [...stats.sourceBreakdown]
    .sort((a, b) => b.orders - a.orders)
    .map((s) => ({
      key: s.source,
      label: s.source,
      value: s.orders,
      hint: formatMoney(s.revenue),
    }));

  return (
    <div>
      <PageHeader
        kicker="Umumiy"
        title="Dashboard"
        description="Tanlangan davr bo'yicha sotuv va marketing ko'rsatkichlari. Foizlar oldingi shu uzunlikdagi davr bilan solishtiriladi."
        actions={rangePicker}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line rounded-lg overflow-hidden">
        <Stat
          label="Buyurtmalar"
          value={stats.totalOrders}
          delta={<Delta current={stats.totalOrders} previous={prev.totalOrders} />}
        />
        <Stat
          label="To'langan"
          value={stats.paidOrders}
          delta={<Delta current={stats.paidOrders} previous={prev.paidOrders} />}
        />
        <Stat label="To'lov kutilmoqda" value={stats.pendingPayment} />
        <Stat label="Tugallanmagan" value={stats.abandonedCheckouts} />
        <Stat
          label="Jami tushum"
          value={formatMoney(stats.revenue)}
          delta={<Delta current={stats.revenue} previous={prev.revenue} />}
        />
        <Stat
          label="O'rtacha summa"
          value={formatMoney(stats.averageOrderValue)}
          delta={<Delta current={stats.averageOrderValue} previous={prev.averageOrderValue} />}
        />
        <Stat
          label="Yangi leadlar"
          value={stats.newLeads}
          delta={<Delta current={stats.newLeads} previous={prev.newLeads} />}
        />
        <Stat
          label="Konversiya"
          value={`${((stats.funnel.purchases / (stats.funnel.checkoutStart || 1)) * 100).toFixed(1)}%`}
          hint="Checkout → xarid"
        />
      </div>

      <div className="mt-6">
        <Card
          title="Dinamika"
          hint={`${activeMetric.label} — ${stats.interval === 'hour' ? 'soatlar' : 'kunlar'} kesimida`}
          actions={METRICS.map((m) => (
            <button
              key={m.value}
              type="button"
              aria-pressed={metric === m.value}
              onClick={() => setMetric(m.value)}
              className={`tag ${metric === m.value ? 'tag-solid' : 'tag-neutral'}`}
            >
              {m.label}
            </button>
          ))}
        >
          <TrendChart
            points={points}
            height={280}
            tooltipRows={(p) => [
              { label: 'Tushum', value: formatMoney(p.row.revenue) },
              { label: 'Buyurtmalar', value: p.row.orders.toLocaleString('ru-RU') },
              { label: "Ko'rishlar", value: p.row.pageViews.toLocaleString('ru-RU') },
            ]}
          />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Card title="Sotuv voronkasi" hint="Bosqichlar orasidagi foiz — o'tish darajasi">
          <FunnelChart steps={funnelSteps} />
        </Card>

        <Card title="Reklama manbalari" hint="Buyurtmalar soni; pastda — tushum">
          <BarRows
            rows={sourceRows}
            formatValue={(v) => v.toLocaleString('ru-RU')}
            emptyLabel="Maʼlumot yoʼq"
            indexed={false}
          />
        </Card>

        <Card title="Eng ko'p sotilgan mahsulotlar">
          <BarRows
            rows={(stats.topProducts || []).map((p) => ({
              key: p.productId,
              label: p.name,
              value: p.orders,
            }))}
            formatValue={(v) => `${v.toLocaleString('ru-RU')} buyurtma`}
            emptyLabel="Maʼlumot yoʼq"
          />
        </Card>

        <Card title="Eng ko'p ko'rilgan mahsulotlar">
          <BarRows
            rows={(stats.mostViewedProducts || []).map((p) => ({
              key: p.productId,
              label: p.name,
              value: p.views,
            }))}
            formatValue={(v) => `${v.toLocaleString('ru-RU')} ko'rish`}
            emptyLabel="Maʼlumot yoʼq"
          />
        </Card>
      </div>
    </div>
  );
}
