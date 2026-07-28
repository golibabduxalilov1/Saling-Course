import { useEffect, useState } from 'react';
import { BadgePercent, CircleX, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/client';
import { formatDate } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import { TableSkeleton } from '../../components/Skeleton';
import ConfirmModal from '../../components/admin/ConfirmModal';

const empty = { code: '', discountType: 'PERCENT', value: '', expiresAt: '', usageLimit: '', minOrderAmount: '' };

export default function PromoCodes() {
  const [promoCodes, setPromoCodes] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    adminApi
      .get('/promo-codes')
      .then((res) => setPromoCodes(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      await adminApi.post('/promo-codes', {
        ...form,
        value: Number(form.value),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        expiresAt: form.expiresAt || null,
      });
      setForm(empty);
      toast.success('Promo-kod yaratildi');
      load();
    } catch (err) {
      const message = err.response?.data?.error || 'Xatolik yuz berdi';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (promo) => {
    try {
      await adminApi.put(`/promo-codes/${promo.id}`, { isActive: !promo.isActive });
      toast.success('Promo-kod holati yangilandi');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Yangilashda xatolik');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.delete(`/promo-codes/${deleteTarget.id}`);
      toast.success("Promo-kod o'chirildi");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Promo-kodni o'chirishda xatolik");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <BadgePercent size={22} className="text-navy-900" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-ink">Promo-kodlar</h1>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="form-label" htmlFor="pc-code">
            Kod<span className="required">*</span>
          </label>
          <input
            id="pc-code"
            className="input-field"
            placeholder="masalan SALE20"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="form-label" htmlFor="pc-type">
            Chegirma turi
          </label>
          <select
            id="pc-type"
            className="input-field"
            value={form.discountType}
            onChange={(e) => setForm({ ...form, discountType: e.target.value })}
          >
            <option value="PERCENT">Foizli chegirma</option>
            <option value="FIXED">Aniq summa</option>
          </select>
        </div>
        <div>
          <label className="form-label" htmlFor="pc-value">
            Miqdori<span className="required">*</span>
          </label>
          <input
            id="pc-value"
            className="input-field"
            type="number"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="form-label" htmlFor="pc-expires">
            Amal qilish muddati
          </label>
          <input
            id="pc-expires"
            className="input-field"
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
          />
        </div>
        <div>
          <label className="form-label" htmlFor="pc-limit">
            Foydalanish limiti
          </label>
          <input
            id="pc-limit"
            className="input-field"
            type="number"
            value={form.usageLimit}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
          />
        </div>
        <div>
          <label className="form-label" htmlFor="pc-min">
            Minimal buyurtma summasi
          </label>
          <input
            id="pc-min"
            className="input-field"
            type="number"
            value={form.minOrderAmount}
            onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
          />
        </div>
        {error && (
          <p className="form-error sm:col-span-3">
            <CircleX size={14} aria-hidden="true" />
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary sm:col-span-3" disabled={submitting}>
          <Plus size={16} aria-hidden="true" />
          {submitting ? 'Yaratilmoqda...' : 'Promo-kod yaratish'}
        </button>
      </form>

      {loading ? (
        <div className="table-wrap">
          <TableSkeleton rows={5} cols={6} />
        </div>
      ) : promoCodes.length === 0 ? (
        <div className="card">
          <EmptyState icon={BadgePercent} title="Promo-kod yo'q" description="Hozircha hech qanday promo-kod yaratilmagan." />
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kod</th>
                <th>Chegirma</th>
                <th>Foydalanilgan</th>
                <th>Muddati</th>
                <th>Faol</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.map((p) => (
                <tr key={p.id}>
                  <td className="font-semibold text-ink">{p.code}</td>
                  <td>{p.discountType === 'PERCENT' ? `${p.value}%` : `${p.value} so'm`}</td>
                  <td>
                    {p.usedCount}
                    {p.usageLimit ? ` / ${p.usageLimit}` : ''}
                  </td>
                  <td className="text-ink-muted">{p.expiresAt ? formatDate(p.expiresAt) : 'Cheklanmagan'}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleActive(p)}
                      className={`badge ${p.isActive ? 'badge-green' : 'badge-neutral'}`}
                    >
                      {p.isActive ? 'Faol' : 'Nofaol'}
                    </button>
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(p)}
                      className="btn-icon hover:text-danger!"
                      aria-label="O'chirish"
                      title="O'chirish"
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Promo-kodni o'chirishni tasdiqlaysizmi?"
        description={deleteTarget ? `"${deleteTarget.code}" promo-kodi butunlay o'chiriladi.` : ''}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
