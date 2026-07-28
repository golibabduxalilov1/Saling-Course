import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { adminApi } from '../../api/client';
import { formatMoney, formatDate } from '../../utils/format';
import EmptyState from '../../components/EmptyState';
import { TableSkeleton } from '../../components/Skeleton';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get('/customers').then((res) => setCustomers(res.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Users size={22} className="text-navy-900" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-ink">Mijozlar</h1>
      </div>
      {loading ? (
        <div className="table-wrap">
          <TableSkeleton rows={6} cols={7} />
        </div>
      ) : customers.length === 0 ? (
        <div className="card">
          <EmptyState icon={Users} title="Mijoz yo'q" description="Hozircha hech qanday mijoz mavjud emas." />
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ism</th>
                <th>Telefon</th>
                <th>Buyurtmalar</th>
                <th>To'langan</th>
                <th>Jami xarid</th>
                <th>Manba</th>
                <th>Oxirgi buyurtma</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.phone}>
                  <td className="font-medium text-ink">{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.ordersCount}</td>
                  <td>{c.paidOrdersCount}</td>
                  <td>{formatMoney(c.totalSpent)}</td>
                  <td className="text-ink-muted">{c.lastSource || '—'}</td>
                  <td className="text-ink-muted">{formatDate(c.lastOrderAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
