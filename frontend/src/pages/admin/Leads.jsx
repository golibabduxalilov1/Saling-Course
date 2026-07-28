import { useEffect, useState } from 'react';
import { UserPlus } from 'lucide-react';
import { adminApi } from '../../api/client';
import { formatDate } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import { TableSkeleton } from '../../components/Skeleton';
import { LEAD_STATUS_META, LeadStatusBadge } from '../../components/admin/StatusBadge';
import PageHeader from '../../components/admin/PageHeader';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    adminApi
      .get('/leads')
      .then((res) => setLeads(res.data))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      await adminApi.patch(`/leads/${id}`, { status });
      toast.success('Holat yangilandi');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Yangilashda xatolik');
    }
  };

  return (
    <div>
      <PageHeader
        kicker="Mijozlar"
        title="Bepul soʼrovlar"
        description="Bepul material so'ragan foydalanuvchilar va ularning holati."
      />

      {loading ? (
        <div className="tbl-frame">
          <TableSkeleton rows={6} cols={7} />
        </div>
      ) : leads.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={UserPlus}
            title="Soʼrov yoʼq"
            description="Hozircha hech qanday bepul material soʼrovi yoʼq."
          />
        </div>
      ) : (
        <div className="tbl-frame">
          <table className="tbl">
            <thead>
              <tr>
                <th>Ism</th>
                <th>Telefon</th>
                <th>Telegram</th>
                <th>Mahsulot</th>
                <th>Manba</th>
                <th>Sana</th>
                <th>Holat</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td className="font-medium text-ink">{l.name}</td>
                  <td>
                    <a href={`tel:${l.phone}`} className="link font-mono text-xs text-ink-2 figures">
                      {l.phone}
                    </a>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-ink-2">{l.telegramUsername || '—'}</span>
                  </td>
                  <td>{l.product?.name || '—'}</td>
                  <td>
                    <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink-3">
                      {l.utmSource || l.source || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-[11px] text-ink-3 figures whitespace-nowrap">
                      {formatDate(l.createdAt)}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <LeadStatusBadge status={l.status || 'NEW'} />
                      <label className="sr-only" htmlFor={`lead-status-${l.id}`}>
                        {l.name} holati
                      </label>
                      <select
                        id={`lead-status-${l.id}`}
                        className="field pick w-44 min-h-[36px] py-1.5 text-sm"
                        value={l.status || 'NEW'}
                        onChange={(e) => updateStatus(l.id, e.target.value)}
                      >
                        {Object.entries(LEAD_STATUS_META).map(([value, meta]) => (
                          <option key={value} value={value}>
                            {meta.label}
                          </option>
                        ))}
                      </select>
                    </div>
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
