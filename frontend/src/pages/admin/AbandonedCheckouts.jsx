import { useEffect, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { adminApi } from '../../api/client';
import { formatMoney, formatDate } from '../../utils/format';
import EmptyState from '../../components/EmptyState';
import { TableSkeleton } from '../../components/Skeleton';

export default function AbandonedCheckouts() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get('/abandoned-checkouts').then((res) => setRecords(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <ShoppingCart size={22} className="text-navy-900" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-ink">Tugallanmagan buyurtmalar</h1>
      </div>
      {loading ? (
        <div className="table-wrap">
          <TableSkeleton rows={6} cols={6} />
        </div>
      ) : records.length === 0 ? (
        <div className="card">
          <EmptyState icon={ShoppingCart} title="Ma'lumot yo'q" description="Hozircha hech qanday tugallanmagan buyurtma yo'q." />
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
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
                  <td>{r.phone}</td>
                  <td>{r.product?.name || '—'}</td>
                  <td>{r.amount ? formatMoney(r.amount) : '—'}</td>
                  <td className="text-ink-muted">{r.utmSource || '—'}</td>
                  <td className="text-ink-muted">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
