import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { adminApi } from '../../api/client';
import { formatMoney, formatDate } from '../../utils/format';
import EmptyState from '../../components/EmptyState';
import { TableSkeleton } from '../../components/Skeleton';
import PageHeader from '../../components/admin/PageHeader';

export default function AbandonedCheckouts() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .get('/abandoned-checkouts')
      .then((res) => setRecords(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        kicker="Sotuv"
        title="Tugallanmagan buyurtmalar"
        description="Checkout bosqichida to'xtab qolgan mijozlar — qayta bog'lanish uchun."
      />

      {loading ? (
        <div className="tbl-frame">
          <TableSkeleton rows={6} cols={6} />
        </div>
      ) : records.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={ShoppingCart}
            title="Maʼlumot yoʼq"
            description="Hozircha hech qanday tugallanmagan buyurtma yoʼq."
          />
        </div>
      ) : (
        <div className="tbl-frame">
          <table className="tbl">
            <thead>
              <tr>
                <th>Ism</th>
                <th>Telefon</th>
                <th>Mahsulot</th>
                <th>Summa</th>
                <th>Manba</th>
                <th>Sana</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium text-ink">{r.name || '—'}</td>
                  <td>
                    <a href={`tel:${r.phone}`} className="link font-mono text-xs text-ink-2 figures">
                      {r.phone}
                    </a>
                  </td>
                  <td>{r.product?.name || '—'}</td>
                  <td className="figures text-ink">{r.amount ? formatMoney(r.amount) : '—'}</td>
                  <td>
                    <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3">
                      {r.utmSource || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-[11px] text-ink-3 figures whitespace-nowrap">
                      {formatDate(r.createdAt)}
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
