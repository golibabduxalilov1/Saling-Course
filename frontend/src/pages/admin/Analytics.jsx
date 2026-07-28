import { useEffect, useState } from 'react';
import { adminApi } from '../../api/client';
import { formatMoney } from '../../utils/format';
import { Skeleton, TableSkeleton } from '../../components/Skeleton';
import PageHeader from '../../components/admin/PageHeader';

const RANGES = [
  { value: 'today', label: 'Bugun' },
  { value: '7d', label: 'Oxirgi 7 kun' },
  { value: '30d', label: 'Oxirgi 30 kun' },
];

function pct(part, whole) {
  if (!whole) return '0%';
  return `${((part / whole) * 100).toFixed(1)}%`;
}

function Card({ title, hint, children }) {
  return (
    <section className="panel flex flex-col">
      <div className="px-5 py-4 border-b border-line">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">{title}</h2>
        {hint && <p className="mt-1.5 text-xs leading-relaxed text-ink-3">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
}

function BreakdownTable({ rows, keyField, labelHeading, emptyLabel }) {
  if (!rows || rows.length === 0) {
    return (
      <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3 py-10 text-center">{emptyLabel}</p>
    );
  }
  return (
    <div className="tbl-frame border-0 rounded-none">
      <table className="tbl">
        <thead>
          <tr>
            <th>{labelHeading}</th>
            <th>Buyurtmalar</th>
            <th>Tushum</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[keyField]}>
              <td className="text-ink">{r[keyField]}</td>
              <td className="figures">{r.orders}</td>
              <td className="figures">{formatMoney(r.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Analytics() {
  const [range, setRange] = useState('30d');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStats(null);
    adminApi.get('/analytics', { params: { range } }).then((res) => {
      if (!cancelled) setStats(res.data);
    });
    return () => {
      cancelled = true;
    };
  }, [range]);

  const rangePicker = (
    <>
      <label htmlFor="an-range" className="sr-only">
        Davr
      </label>
      <select id="an-range" className="field pick w-52" value={range} onChange={(e) => setRange(e.target.value)}>
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
        <PageHeader kicker="Umumiy" title="Analitika" actions={rangePicker} />
        <div className="panel">
          <TableSkeleton rows={5} cols={3} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const { funnel } = stats;

  const funnelRows = [
    { label: "Sahifa ko'rishlar", value: funnel.pageViews, conv: null },
    { label: "Mahsulot ko'rishlar", value: funnel.productViews, conv: pct(funnel.productViews, funnel.pageViews) },
    { label: "Savatga qo'shish", value: funnel.addToCart, conv: pct(funnel.addToCart, funnel.productViews) },
    { label: 'Checkout boshlangan', value: funnel.checkoutStart, conv: pct(funnel.checkoutStart, funnel.addToCart) },
    { label: 'Xarid qilingan', value: funnel.purchases, conv: pct(funnel.purchases, funnel.checkoutStart), strong: true },
  ];

  return (
    <div>
      <PageHeader
        kicker="Umumiy"
        title="Analitika"
        description="Sotuv voronkasi va marketing manbalari bo'yicha kesim."
        actions={rangePicker}
      />

      <Card
        title="Sotuv voronkasi"
        hint="Saytga kirildi → mahsulot ko'rildi → savatga qo'shildi → checkout boshlandi → xarid qilindi."
      >
        <div className="tbl-frame border-0 rounded-none">
          <table className="tbl">
            <thead>
              <tr>
                <th>Bosqich</th>
                <th>Soni</th>
                <th>Konversiya</th>
              </tr>
            </thead>
            <tbody>
              {funnelRows.map((row, i) => (
                <tr key={row.label}>
                  <td className={row.strong ? 'font-medium text-ink' : 'text-ink'}>
                    <span className="flex items-center gap-3">
                      <span className="t-index">{String(i + 1).padStart(2, '0')}</span>
                      {row.label}
                    </span>
                  </td>
                  <td className={`figures ${row.strong ? 'font-medium text-ink' : ''}`}>{row.value}</td>
                  <td className={`figures ${row.strong ? 'font-medium text-accent' : ''}`}>{row.conv || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card title="Reklama manbalari">
          <BreakdownTable
            rows={stats.sourceBreakdown}
            keyField="source"
            labelHeading="Manba"
            emptyLabel="Maʼlumot yoʼq"
          />
        </Card>

        <Card title="Kampaniyalar">
          <BreakdownTable
            rows={stats.campaignBreakdown}
            keyField="campaign"
            labelHeading="Kampaniya"
            emptyLabel="Maʼlumot yoʼq"
          />
        </Card>

        <Card title="Eng ko'p sotilgan mahsulotlar">
          {stats.topProducts.length === 0 ? (
            <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3 py-10 text-center">
              Maʼlumot yoʼq
            </p>
          ) : (
            <ol className="p-5 flex flex-col">
              {stats.topProducts.map((p, i) => (
                <li
                  key={p.productId}
                  className="flex items-center gap-4 py-3 border-b border-line last:border-b-0 first:pt-0 last:pb-0"
                >
                  <span className="t-index shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <span className="flex-1 min-w-0 text-sm text-ink truncate">{p.name}</span>
                  <span className="shrink-0 font-mono text-xs text-ink-2 figures">{p.orders}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>
      </div>
    </div>
  );
}
