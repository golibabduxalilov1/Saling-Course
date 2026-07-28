import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/client';
import { formatMoney } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import { TableSkeleton } from '../../components/Skeleton';
import ConfirmModal from '../../components/admin/ConfirmModal';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    adminApi.get('/products').then((res) => setProducts(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.delete(`/products/${deleteTarget.id}`);
      toast.success("Mahsulot o'chirildi");
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Mahsulotni o'chirishda xatolik");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-ink">Mahsulotlar</h1>
        <Link to="/admin/products/new" className="btn-primary">
          <Plus size={16} aria-hidden="true" />
          Yangi mahsulot
        </Link>
      </div>

      {loading ? (
        <div className="table-wrap">
          <TableSkeleton rows={6} cols={6} />
        </div>
      ) : products.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Package}
            title="Mahsulot yo'q"
            description="Hozircha hech qanday mahsulot qo'shilmagan."
            action={
              <Link to="/admin/products/new" className="btn-primary">
                <Plus size={16} aria-hidden="true" />
                Yangi mahsulot
              </Link>
            }
          />
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nomi</th>
                <th>Turi</th>
                <th>Narx</th>
                <th>Faol</th>
                <th>Buyurtmalar</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium text-ink">{p.name}</td>
                  <td className="text-ink-muted">{p.type}</td>
                  <td>{formatMoney(p.discountPrice ?? p.price)}</td>
                  <td>
                    {p.isActive ? (
                      <span className="badge badge-green">Faol</span>
                    ) : (
                      <span className="badge badge-neutral">Nofaol</span>
                    )}
                  </td>
                  <td>{p._count?.orderItems ?? 0}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/admin/products/${p.id}`}
                        className="btn-icon"
                        aria-label="Tahrirlash"
                        title="Tahrirlash"
                      >
                        <Pencil size={16} aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(p)}
                        className="btn-icon hover:text-danger!"
                        aria-label="O'chirish"
                        title="O'chirish"
                      >
                        <Trash2 size={16} aria-hidden="true" />
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
        title="Mahsulotni o'chirishni tasdiqlaysizmi?"
        description={deleteTarget ? `"${deleteTarget.name}" mahsuloti butunlay o'chiriladi.` : ''}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
