import { useEffect, useState } from 'react';
import { BadgePercent, CircleAlert, Loader2, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/client';
import { formatDate } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import { TableSkeleton } from '../../components/Skeleton';
import ConfirmModal from '../../components/admin/ConfirmModal';
import PageHeader from '../../components/admin/PageHeader';

const empty = { code: '', discountType: 'PERCENT', value: '', expiresAt: '', usageLimit: '', minOrderAmount: '' };

// Foydalanish limiti global cheklov: faqat musbat butun son yoki bo'sh
// (cheklanmagan) qiymat qabul qilinadi.
function parseUsageLimit(raw) {
  const trimmed = String(raw ?? '').trim();
  if (trimmed === '') return { value: null };
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return { error: "Foydalanish limiti musbat butun son yoki bo'sh bo'lishi kerak" };
  }
  return { value: parsed };
}

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

    const usageLimit = parseUsageLimit(form.usageLimit);
    if (usageLimit.error) {
      setError(usageLimit.error);
      toast.error(usageLimit.error);
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.post('/promo-codes', {
        ...form,
        value: Number(form.value),
        usageLimit: usageLimit.value,
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
    <div>
      <PageHeader
        kicker="Sotuv"
        title="Promo-kodlar"
        description="Chegirma kodlarini yarating va faolligini boshqaring."
      />

      <form onSubmit={handleSubmit} className="panel mb-8" noValidate>
        <h2 className="px-5 py-4 border-b border-line font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">
          Yangi promo-kod
        </h2>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <div>
            <label className="field-label" htmlFor="pc-code">
              Kod<span className="req">*</span>
            </label>
            <input
              id="pc-code"
              className={`field font-mono uppercase ${error ? 'field-invalid' : ''}`}
              placeholder="SALE20"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              aria-invalid={!!error}
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="pc-type">
              Chegirma turi
            </label>
            <select
              id="pc-type"
              className="field pick"
              value={form.discountType}
              onChange={(e) => setForm({ ...form, discountType: e.target.value })}
            >
              <option value="PERCENT">Foizli chegirma</option>
              <option value="FIXED">Aniq summa</option>
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="pc-value">
              Miqdori<span className="req">*</span>
            </label>
            <input
              id="pc-value"
              type="number"
              className="field figures"
              placeholder={form.discountType === 'PERCENT' ? '20' : '50000'}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="pc-expires">
              Amal qilish muddati <span className="optional">(ixtiyoriy)</span>
            </label>
            <input
              id="pc-expires"
              type="date"
              className="field figures"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="pc-limit">
              Foydalanish limiti <span className="optional">(ixtiyoriy)</span>
            </label>
            <input
              id="pc-limit"
              type="number"
              min="1"
              step="1"
              className="field figures"
              placeholder="Cheklanmagan"
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="pc-min">
              Minimal summa <span className="optional">(ixtiyoriy)</span>
            </label>
            <input
              id="pc-min"
              type="number"
              className="field figures"
              value={form.minOrderAmount}
              onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
            />
          </div>

          {error && (
            <p className="field-error sm:col-span-2 xl:col-span-3" role="alert">
              <CircleAlert size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
        </div>

        <div className="px-5 py-4 border-t border-line">
          <button type="submit" className="btn btn-accent" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={15} className="motion-spin" aria-hidden="true" />
                Yaratilmoqda
              </>
            ) : (
              <>
                <Plus size={15} aria-hidden="true" />
                Promo-kod yaratish
              </>
            )}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="tbl-frame">
          <TableSkeleton rows={5} cols={6} />
        </div>
      ) : promoCodes.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={BadgePercent}
            title="Promo-kod yoʼq"
            description="Yuqoridagi shakl orqali birinchi promo-kodni yarating."
          />
        </div>
      ) : (
        <div className="tbl-frame">
          <table className="tbl">
            <thead>
              <tr>
                <th>Kod</th>
                <th>Chegirma</th>
                <th>Foydalanilgan</th>
                <th>Muddati</th>
                <th>Holat</th>
                <th className="text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {promoCodes.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="font-mono text-sm font-medium uppercase text-ink">{p.code}</span>
                  </td>
                  <td className="figures text-ink">
                    {p.discountType === 'PERCENT' ? `${p.value}%` : `${p.value} soʼm`}
                  </td>
                  <td className="figures">
                    {p.usedCount}
                    {p.usageLimit ? ` / ${p.usageLimit}` : ''}
                  </td>
                  <td>
                    <span className="font-mono text-[11px] text-ink-3 figures whitespace-nowrap">
                      {p.expiresAt ? formatDate(p.expiresAt) : 'Cheklanmagan'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleActive(p)}
                      className={`tag ${p.isActive ? 'tag-positive' : 'tag-neutral'}`}
                      aria-label={`${p.code} — ${p.isActive ? 'nofaol qilish' : 'faollashtirish'}`}
                    >
                      {p.isActive ? 'Faol' : 'Nofaol'}
                    </button>
                  </td>
                  <td>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(p)}
                        className="icon-btn icon-btn-critical"
                        aria-label={`${p.code} — o'chirish`}
                        title="O'chirish"
                      >
                        <Trash2 size={15} aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Promo-kodni oʼchirasizmi?"
        description={deleteTarget ? `"${deleteTarget.code}" promo-kodi butunlay oʼchiriladi.` : ''}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
