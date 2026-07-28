import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Pencil, Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/client';
import { formatMoney } from '../../utils/format';
import { useToast } from '../../context/ToastContext';
import { TYPE_LABELS } from '../../components/ProductCard';
import EmptyState from '../../components/EmptyState';
import { TableSkeleton } from '../../components/Skeleton';
import ConfirmModal from '../../components/admin/ConfirmModal';
import PageHeader from '../../components/admin/PageHeader';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    adminApi
      .get('/products')
      .then((res) => setProducts(res.data))
      .finally(() => setLoading(false));
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

  const newButton = (
    <Link to="/admin/products/new" className="btn btn-accent">
      <Plus size={16} aria-hidden="true" />
      Yangi mahsulot
    </Link>
  );

  return (
    <div>
      <PageHeader
        kicker="Katalog"
        title="Mahsulotlar"
        description="Katalogdagi barcha kurslar va raqamli mahsulotlar."
        actions={newButton}
      />

      {loading ? (
        <div className="tbl-frame">
          <TableSkeleton rows={6} cols={6} />
        </div>
      ) : products.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={Package}
            title="Mahsulot yoʼq"
            description="Hozircha hech qanday mahsulot qoʼshilmagan."
            action={newButton}
          />
        </div>
      ) : (
        <div className="tbl-frame">
          <table className="tbl">
            <thead>
              <tr>
                <th>Nomi</th>
                <th>Turi</th>
                <th>Narx</th>
                <th>Holat</th>
                <th>Buyurtmalar</th>
                <th className="text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/admin/products/${p.id}`} className="link font-medium text-ink">
                      {p.name}
                    </Link>
                  </td>
                  <td>
                    <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-3">
                      {TYPE_LABELS[p.type] || p.type}
                    </span>
                  </td>
                  <td className="figures text-ink">{formatMoney(p.discountPrice ?? p.price)}</td>
                  <td>
                    <span className={`tag ${p.isActive ? 'tag-positive' : 'tag-neutral'}`}>
                      {p.isActive ? 'Faol' : 'Nofaol'}
                    </span>
                  </td>
                  <td className="figures">{p._count?.orderItems ?? 0}</td>
                  <td>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/admin/products/${p.id}`}
                        className="icon-btn"
                        aria-label={`${p.name} — tahrirlash`}
                        title="Tahrirlash"
                      >
                        <Pencil size={15} aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(p)}
                        className="icon-btn icon-btn-critical"
                        aria-label={`${p.name} — o'chirish`}
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
        title="Mahsulotni oʼchirasizmi?"
        description={deleteTarget ? `"${deleteTarget.name}" mahsuloti butunlay oʼchiriladi. Bu amalni qaytarib boʼlmaydi.` : ''}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
