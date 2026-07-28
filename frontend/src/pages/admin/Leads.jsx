import { useEffect, useState } from 'react';
import { Phone, Send, UserPlus } from 'lucide-react';
import { adminApi } from '../../api/client';
import { formatDate } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import { TableSkeleton } from '../../components/Skeleton';

const LEAD_STATUS_LABELS = {
  NEW: 'Yangi',
  CONTACTED: "Bog'lanildi",
  CONVERTED: 'Xaridorga aylandi',
  REJECTED: 'Rad etildi',
};

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    adminApi.get('/leads').then((res) => setLeads(res.data)).finally(() => setLoading(false));
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
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <UserPlus size={22} className="text-navy-900" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-ink">Bepul material so'raganlar</h1>
      </div>
      {loading ? (
        <div className="table-wrap">
          <TableSkeleton rows={6} cols={7} />
        </div>
      ) : leads.length === 0 ? (
        <div className="card">
          <EmptyState icon={UserPlus} title="So'rov yo'q" description="Hozircha hech qanday bepul material so'rovi yo'q." />
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
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
                    <span className="flex items-center gap-1.5">
                      <Phone size={14} aria-hidden="true" className="text-ink-muted shrink-0" />
                      {l.phone}
                    </span>
                  </td>
                  <td>
                    {l.telegramUsername ? (
                      <span className="flex items-center gap-1.5">
                        <Send size={14} aria-hidden="true" className="text-ink-muted shrink-0" />
                        {l.telegramUsername}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{l.product?.name || '—'}</td>
                  <td className="text-ink-muted">{l.utmSource || l.source || '—'}</td>
                  <td className="text-ink-muted">{formatDate(l.createdAt)}</td>
                  <td>
                    <select
                      className="input-field text-sm py-1"
                      value={l.status || 'NEW'}
                      onChange={(e) => updateStatus(l.id, e.target.value)}
                    >
                      {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
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
