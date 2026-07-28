import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { adminApi } from '../../api/client';
import { formatMoney, formatDate } from '../../utils/format';
import EmptyState from '../../components/EmptyState';
import { TableSkeleton } from '../../components/Skeleton';
import PageHeader from '../../components/admin/PageHeader';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .get('/customers')
      .then((res) => setCustomers(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        kicker="Mijozlar"
        title="Mijozlar bazasi"
        description="Buyurtma bergan barcha mijozlar va ularning xarid tarixi."
      />

      {loading ? (
        <div className="tbl-frame">
          <TableSkeleton rows={6} cols={7} />
        </div>
      ) : customers.length === 0 ? (
        <div className="panel">
          <EmptyState icon={Users} title="Mijoz yoʼq" description="Hozircha hech qanday mijoz mavjud emas." />
        </div>
      ) : (
        <div className="tbl-frame">
          <table className="tbl">
            <thead>
              <tr>
                <th>Ism</th>
                <th>Telefon</th>
                <th>Buyurtmalar</th>
                <th>Toʼlangan</th>
                <th>Jami xarid</th>
                <th>Manba</th>
                <th>Oxirgi buyurtma</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.phone}>
                  <td className="font-medium text-ink">{c.name}</td>
                  <td>
                    <a href={`tel:${c.phone}`} className="link font-mono text-xs text-ink-2 figures">
                      {c.phone}
                    </a>
                  </td>
                  <td className="figures">{c.ordersCount}</td>
                  <td className="figures">{c.paidOrdersCount}</td>
                  <td className="figures text-ink">{formatMoney(c.totalSpent)}</td>
                  <td>
                    <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3">
                      {c.lastSource || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-[11px] text-ink-3 figures whitespace-nowrap">
                      {formatDate(c.lastOrderAt)}
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
