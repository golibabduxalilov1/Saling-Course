import { useEffect, useState } from 'react';
import { CircleX, Plus, Tags, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import { TableSkeleton } from '../../components/Skeleton';
import ConfirmModal from '../../components/admin/ConfirmModal';

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
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-ink">Kategoriyalar</h1>

      <form onSubmit={handleSubmit} className="card p-5 flex flex-col sm:flex-row gap-3 sm:items-start max-w-lg">
        <div className="flex-1 w-full">
          <label className="form-label" htmlFor="cat-name">
            Kategoriya nomi
          </label>
          <input
            id="cat-name"
            className="input-field"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {error && (
            <p className="form-error">
              <CircleX size={14} aria-hidden="true" />
              {error}
            </p>
          )}
        </div>
        <button type="submit" className="btn-primary shrink-0" disabled={submitting}>
          <Plus size={16} aria-hidden="true" />
          {submitting ? "Qo'shilmoqda..." : "Qo'shish"}
        </button>
      </form>

      {loading ? (
        <div className="table-wrap">
          <TableSkeleton rows={4} cols={3} />
        </div>
      ) : categories.length === 0 ? (
        <div className="card">
          <EmptyState icon={Tags} title="Kategoriya yo'q" description="Hozircha hech qanday kategoriya qo'shilmagan." />
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nomi</th>
                <th>Mahsulotlar soni</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium text-ink">{c.name}</td>
                  <td>{c._count?.products ?? 0}</td>
                  <td className="text-right">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(c)}
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
        title="Kategoriyani o'chirishni tasdiqlaysizmi?"
        description={deleteTarget ? `"${deleteTarget.name}" kategoriyasi butunlay o'chiriladi.` : ''}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
