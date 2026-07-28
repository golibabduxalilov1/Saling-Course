import { useEffect, useState } from 'react';
import { CircleCheck, MessageSquare, Star, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/client';
import { formatDate } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    adminApi
      .get('/reviews')
      .then((res) => setReviews(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const toggleApprove = async (review) => {
    try {
      await adminApi.patch(`/reviews/${review.id}`, { isApproved: !review.isApproved });
      toast.success(review.isApproved ? 'Tasdiq bekor qilindi' : 'Sharh tasdiqlandi');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Yangilashda xatolik');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.delete(`/reviews/${deleteTarget.id}`);
      toast.success("Sharh o'chirildi");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Sharhni o'chirishda xatolik");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <MessageSquare size={22} className="text-navy-900" aria-hidden="true" />
        <h1 className="text-2xl font-bold text-ink">Sharhlar</h1>
      </div>
      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-4 h-24 animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="card">
          <EmptyState icon={MessageSquare} title="Sharh yo'q" description="Hozircha hech qanday sharh qoldirilmagan." />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-4 flex items-start justify-between gap-4">
              <div>
                <div className="font-semibold text-sm text-ink flex items-center gap-1.5">
                  {r.customerName}
                  <span className="flex items-center text-gold-500 ml-1">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={13} fill="currentColor" aria-hidden="true" />
                    ))}
                  </span>
                </div>
                <div className="text-xs text-ink-muted mb-1">
                  {r.product?.name} · {formatDate(r.createdAt)}
                </div>
                {r.textContent && <p className="text-sm text-ink-muted">{r.textContent}</p>}
              </div>
              <div className="flex flex-col gap-2 items-end shrink-0">
                <button
                  type="button"
                  onClick={() => toggleApprove(r)}
                  className={`badge ${r.isApproved ? 'badge-green' : 'badge-neutral'}`}
                >
                  <CircleCheck size={12} aria-hidden="true" />
                  {r.isApproved ? 'Tasdiqlangan' : 'Tasdiqlash'}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(r)}
                  className="btn-icon hover:text-danger!"
                  aria-label="O'chirish"
                  title="O'chirish"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Sharhni o'chirishni tasdiqlaysizmi?"
        description={deleteTarget ? `"${deleteTarget.customerName}" tomonidan qoldirilgan sharh o'chiriladi.` : ''}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
