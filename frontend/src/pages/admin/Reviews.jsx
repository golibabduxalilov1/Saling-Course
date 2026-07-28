import { useEffect, useState } from 'react';
import { Check, MessageSquare, Star, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/client';
import { formatDate } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import { Skeleton } from '../../components/Skeleton';
import ConfirmModal from '../../components/admin/ConfirmModal';
import PageHeader from '../../components/admin/PageHeader';

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

  const pending = reviews.filter((r) => !r.isApproved).length;

  return (
    <div>
      <PageHeader
        kicker="Katalog"
        title="Sharhlar"
        description="Mijoz sharhlarini tasdiqlang — faqat tasdiqlanganlari saytda ko'rinadi."
        actions={pending > 0 && <span className="tag tag-caution figures">{pending} ta kutilmoqda</span>}
      />

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={MessageSquare}
            title="Sharh yoʼq"
            description="Hozircha hech qanday sharh qoldirilmagan."
          />
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {reviews.map((r) => (
            <li key={r.id} className="panel p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-medium text-ink">{r.customerName}</span>
                    <span className="flex items-center gap-0.5" aria-label={`Reyting: ${r.rating} / 5`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          strokeWidth={1.5}
                          className={i < r.rating ? 'fill-ink text-ink' : 'fill-none text-line-2'}
                          aria-hidden="true"
                        />
                      ))}
                    </span>
                    <span className={`tag ${r.isApproved ? 'tag-positive' : 'tag-caution'}`}>
                      {r.isApproved ? 'Tasdiqlangan' : 'Kutilmoqda'}
                    </span>
                  </div>

                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
                    {r.product?.name} · <span className="figures">{formatDate(r.createdAt)}</span>
                  </p>

                  {r.textContent && (
                    <p className="mt-3 text-sm leading-relaxed text-ink-2">{r.textContent}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleApprove(r)}
                    className={`btn btn-sm ${r.isApproved ? 'btn-quiet' : 'btn-outline'}`}
                  >
                    <Check size={14} aria-hidden="true" />
                    {r.isApproved ? 'Bekor qilish' : 'Tasdiqlash'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(r)}
                    className="icon-btn icon-btn-critical"
                    aria-label={`${r.customerName} sharhini o'chirish`}
                    title="O'chirish"
                  >
                    <Trash2 size={15} aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Sharhni oʼchirasizmi?"
        description={deleteTarget ? `"${deleteTarget.customerName}" tomonidan qoldirilgan sharh oʼchiriladi.` : ''}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
