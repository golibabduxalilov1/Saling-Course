import { useEffect, useState } from 'react';
import { CircleAlert, Loader2, Plus, Tags, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import { TableSkeleton } from '../../components/Skeleton';
import ConfirmModal from '../../components/admin/ConfirmModal';
import PageHeader from '../../components/admin/PageHeader';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    adminApi
      .get('/categories')
      .then((res) => setCategories(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || submitting) return;
    setError('');
    setSubmitting(true);
    try {
      await adminApi.post('/categories', { name });
      setName('');
      toast.success('Kategoriya yaratildi');
      load();
    } catch (err) {
      const message = err.response?.data?.error || 'Xatolik yuz berdi';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.delete(`/categories/${deleteTarget.id}`);
      toast.success("Kategoriya o'chirildi");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Kategoriyani o'chirishda xatolik");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        kicker="Katalog"
        title="Kategoriyalar"
        description="Mahsulotlarni guruhlash uchun kategoriyalar."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        <form onSubmit={handleSubmit} className="lg:col-span-4 panel p-6" noValidate>
          <h2 className="t-kicker">Yangi kategoriya</h2>

          <div className="mt-6 pt-6 border-t border-line">
            <label className="field-label" htmlFor="cat-name">
              Kategoriya nomi<span className="req">*</span>
            </label>
            <input
              id="cat-name"
              className={`field ${error ? 'field-invalid' : ''}`}
              placeholder="Masalan: Marketing"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? 'cat-error' : undefined}
              required
            />
            {error && (
              <p className="field-error" id="cat-error" role="alert">
                <CircleAlert size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}

            <button type="submit" className="btn btn-accent w-full mt-5" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={15} className="motion-spin" aria-hidden="true" />
                  Qoʼshilmoqda
                </>
              ) : (
                <>
                  <Plus size={16} aria-hidden="true" />
                  Qoʼshish
                </>
              )}
            </button>
          </div>
        </form>

        <div className="lg:col-span-8">
          {loading ? (
            <div className="tbl-frame">
              <TableSkeleton rows={4} cols={3} />
            </div>
          ) : categories.length === 0 ? (
            <div className="panel">
              <EmptyState
                icon={Tags}
                title="Kategoriya yoʼq"
                description="Chapdagi shakl orqali birinchi kategoriyani qoʼshing."
              />
            </div>
          ) : (
            <div className="tbl-frame">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Nomi</th>
                    <th>Mahsulotlar</th>
                    <th className="text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((c) => (
                    <tr key={c.id}>
                      <td className="font-medium text-ink">{c.name}</td>
                      <td className="figures">{c._count?.products ?? 0}</td>
                      <td>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(c)}
                            className="icon-btn icon-btn-critical"
                            aria-label={`${c.name} — o'chirish`}
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
        </div>
      </div>

      <ConfirmModal
        open={!!deleteTarget}
        title="Kategoriyani oʼchirasizmi?"
        description={deleteTarget ? `"${deleteTarget.name}" kategoriyasi butunlay oʼchiriladi.` : ''}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
