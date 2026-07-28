import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, CircleX, Plus, Save, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/client';
import { TYPE_LABELS } from '../../components/ProductCard';
import { useToast } from '../../context/ToastContext';

function FormSection({ title, description, children }) {
  return (
    <section className="card p-6 flex flex-col gap-5">
      <header>
        <h2 className="text-h2 text-lg text-ink">{title}</h2>
        {description && <p className="text-sm text-ink-muted mt-1">{description}</p>}
      </header>
      <div className="border-t border-border-soft pt-5 flex flex-col gap-4">{children}</div>
    </section>
  );
}

const emptyProduct = {
  name: '',
  slug: '',
  type: 'COURSE',
  categoryId: '',
  shortDescription: '',
  fullDescription: '',
  mainImage: '',
  videoUrl: '',
  forWhom: '',
  results: '',
  duration: '',
  format: '',
  instructorInfo: '',
  guaranteeTerms: '',
  price: '',
  discountPrice: '',
  accessDurationDays: '',
  seoTitle: '',
  seoDescription: '',
  certificateAvailable: false,
  isActive: true,
  isFeatured: false,
  isNew: false,
  isBestseller: false,
};

const emptyTariff = { name: '', price: '', discountPrice: '', features: '', bonuses: '', accessDurationDays: '' };
const emptyDemo = { type: 'VIDEO', title: '', url: '', content: '' };

const FLAG_LABELS = {
  isActive: 'Faol',
  isFeatured: 'Tavsiya etilgan',
  isNew: 'Yangi',
  isBestseller: 'Bestseller',
  certificateAvailable: 'Sertifikat mavjud',
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = id && id !== 'new';
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(emptyProduct);
  const [categories, setCategories] = useState([]);
  const [tariffs, setTariffs] = useState([]);
  const [demoMaterials, setDemoMaterials] = useState([]);
  const [newTariff, setNewTariff] = useState(emptyTariff);
  const [newDemo, setNewDemo] = useState(emptyDemo);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.get('/categories').then((res) => setCategories(res.data));
    if (isEdit) {
      adminApi.get(`/products/${id}`).then((res) => {
        const { tariffs: t, demoMaterials: d, category: _category, ...fields } = res.data;
        setForm({ ...emptyProduct, ...fields, categoryId: fields.categoryId || '' });
        setTariffs(t || []);
        setDemoMaterials(d || []);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
      accessDurationDays: form.accessDurationDays ? Number(form.accessDurationDays) : null,
      categoryId: form.categoryId || null,
    };
    try {
      if (isEdit) {
        await adminApi.put(`/products/${id}`, payload);
        toast.success('Mahsulot saqlandi');
      } else {
        const res = await adminApi.post('/products', payload);
        toast.success('Mahsulot yaratildi');
        navigate(`/admin/products/${res.data.id}`);
        return;
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Saqlashda xatolik';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const addTariff = async () => {
    if (!newTariff.name || !newTariff.price) return;
    try {
      const res = await adminApi.post(`/products/${id}/tariffs`, {
        ...newTariff,
        price: Number(newTariff.price),
        discountPrice: newTariff.discountPrice ? Number(newTariff.discountPrice) : null,
        accessDurationDays: newTariff.accessDurationDays ? Number(newTariff.accessDurationDays) : null,
        features: newTariff.features ? newTariff.features.split('\n').filter(Boolean) : [],
      });
      setTariffs([...tariffs, res.data]);
      setNewTariff(emptyTariff);
      toast.success("Tarif qo'shildi");
    } catch (err) {
      toast.error(err.response?.data?.error || "Tarif qo'shishda xatolik");
    }
  };

  const removeTariff = async (tariffId) => {
    try {
      await adminApi.delete(`/products/tariffs/${tariffId}`);
      setTariffs(tariffs.filter((t) => t.id !== tariffId));
      toast.success("Tarif o'chirildi");
    } catch (err) {
      toast.error(err.response?.data?.error || "Tarifni o'chirishda xatolik");
    }
  };

  const addDemo = async () => {
    if (!newDemo.title) return;
    try {
      const res = await adminApi.post(`/products/${id}/demo-materials`, newDemo);
      setDemoMaterials([...demoMaterials, res.data]);
      setNewDemo(emptyDemo);
      toast.success("Demo material qo'shildi");
    } catch (err) {
      toast.error(err.response?.data?.error || "Demo material qo'shishda xatolik");
    }
  };

  const removeDemo = async (demoId) => {
    try {
      await adminApi.delete(`/products/demo-materials/${demoId}`);
      setDemoMaterials(demoMaterials.filter((d) => d.id !== demoId));
      toast.success("Demo material o'chirildi");
    } catch (err) {
      toast.error(err.response?.data?.error || "Demo materialni o'chirishda xatolik");
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/products"
          className="btn-icon shrink-0"
          aria-label="Mahsulotlar ro'yxatiga qaytish"
          title="Orqaga"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-ink">{isEdit ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}</h1>
          <p className="text-sm text-ink-muted mt-0.5">
            {isEdit ? 'Mavjud mahsulot maʻlumotlarini yangilang' : 'Katalogga yangi mahsulot qoʻshing'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <FormSection title="Asosiy ma'lumotlar" description="Mahsulotning nomi, turi va tavsifi">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="pf-name">
                  Mahsulot nomi<span className="required">*</span>
                </label>
                <input
                  id="pf-name"
                  className="input-field"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="form-label" htmlFor="pf-slug">
                  URL manzili
                </label>
                <input
                  id="pf-slug"
                  className="input-field"
                  name="slug"
                  placeholder="avtomatik"
                  value={form.slug}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="pf-type">
                  Turi
                </label>
                <select id="pf-type" className="input-field" name="type" value={form.type} onChange={handleChange}>
                  {Object.entries(TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label" htmlFor="pf-category">
                  Kategoriya
                </label>
                <select
                  id="pf-category"
                  className="input-field"
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                >
                  <option value="">Kategoriyasiz</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="pf-short">
                Qisqa tavsif
              </label>
              <textarea
                id="pf-short"
                className="input-field"
                name="shortDescription"
                rows={2}
                value={form.shortDescription}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="form-label" htmlFor="pf-full">
                To'liq tavsif
              </label>
              <textarea
                id="pf-full"
                className="input-field"
                name="fullDescription"
                rows={4}
                value={form.fullDescription}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="pf-forwhom">
                  Kimlar uchun
                </label>
                <textarea
                  id="pf-forwhom"
                  className="input-field"
                  name="forWhom"
                  rows={2}
                  value={form.forWhom}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="pf-results">
                  Qanday natija olishi
                </label>
                <textarea
                  id="pf-results"
                  className="input-field"
                  name="results"
                  rows={2}
                  value={form.results}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="form-label" htmlFor="pf-duration">
                  Davomiyligi
                </label>
                <input
                  id="pf-duration"
                  className="input-field"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="pf-format">
                  Format
                </label>
                <input
                  id="pf-format"
                  className="input-field"
                  name="format"
                  value={form.format}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="pf-access">
                  Kirish muddati (kun)
                </label>
                <input
                  id="pf-access"
                  className="input-field"
                  type="number"
                  name="accessDurationDays"
                  value={form.accessDurationDays}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="form-label" htmlFor="pf-instructor">
                O'qituvchi haqida
              </label>
              <textarea
                id="pf-instructor"
                className="input-field"
                name="instructorInfo"
                rows={2}
                value={form.instructorInfo}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="form-label" htmlFor="pf-guarantee">
                Kafolat shartlari
              </label>
              <textarea
                id="pf-guarantee"
                className="input-field"
                name="guaranteeTerms"
                rows={2}
                value={form.guaranteeTerms}
                onChange={handleChange}
              />
            </div>
          </FormSection>

          <FormSection title="Media" description="Mahsulot rasmi va tanishtiruv videosi">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="pf-image">
                  Asosiy rasm (URL)
                </label>
                <input
                  id="pf-image"
                  className="input-field"
                  name="mainImage"
                  value={form.mainImage}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="pf-video">
                  Reklama videosi (URL)
                </label>
                <input
                  id="pf-video"
                  className="input-field"
                  name="videoUrl"
                  value={form.videoUrl}
                  onChange={handleChange}
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="SEO" description="Qidiruv tizimlari uchun sarlavha va tavsif">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="pf-seotitle">
                  SEO sarlavha
                </label>
                <input
                  id="pf-seotitle"
                  className="input-field"
                  name="seoTitle"
                  value={form.seoTitle}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="form-label" htmlFor="pf-seodesc">
                  SEO tavsif
                </label>
                <input
                  id="pf-seodesc"
                  className="input-field"
                  name="seoDescription"
                  value={form.seoDescription}
                  onChange={handleChange}
                />
              </div>
            </div>
          </FormSection>

          {isEdit && (
            <section className="card p-6 flex flex-col gap-4">
              <h2 className="text-h2 text-lg text-ink">Tariflar</h2>
              {tariffs.map((t) => (
                <div key={t.id} className="flex items-center justify-between border-b border-border-soft pb-2">
                  <div>
                    <p className="font-medium text-sm text-ink">{t.name}</p>
                    <p className="text-xs text-ink-muted">{t.price} so'm</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeTariff(t.id)}
                    className="btn-icon hover:text-danger!"
                    aria-label="Tarifni o'chirish"
                    title="Tarifni o'chirish"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              ))}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  className="input-field"
                  placeholder="Tarif nomi"
                  value={newTariff.name}
                  onChange={(e) => setNewTariff({ ...newTariff, name: e.target.value })}
                />
                <input
                  className="input-field"
                  type="number"
                  placeholder="Narx"
                  value={newTariff.price}
                  onChange={(e) => setNewTariff({ ...newTariff, price: e.target.value })}
                />
                <input
                  className="input-field"
                  type="number"
                  placeholder="Chegirmali narx"
                  value={newTariff.discountPrice}
                  onChange={(e) => setNewTariff({ ...newTariff, discountPrice: e.target.value })}
                />
                <input
                  className="input-field"
                  type="number"
                  placeholder="Kirish muddati (kun)"
                  value={newTariff.accessDurationDays}
                  onChange={(e) => setNewTariff({ ...newTariff, accessDurationDays: e.target.value })}
                />
                <textarea
                  className="input-field sm:col-span-2"
                  placeholder="Tarif tarkibi (har bir qator alohida band)"
                  rows={3}
                  value={newTariff.features}
                  onChange={(e) => setNewTariff({ ...newTariff, features: e.target.value })}
                />
                <input
                  className="input-field sm:col-span-2"
                  placeholder="Bonuslar"
                  value={newTariff.bonuses}
                  onChange={(e) => setNewTariff({ ...newTariff, bonuses: e.target.value })}
                />
              </div>
              <button type="button" onClick={addTariff} className="btn-secondary self-start">
                <Plus size={16} aria-hidden="true" />
                Tarif qo'shish
              </button>
            </section>
          )}

          {isEdit && (
            <section className="card p-6 flex flex-col gap-4">
              <h2 className="text-h2 text-lg text-ink">Demo materiallar</h2>
              {demoMaterials.map((d) => (
                <div key={d.id} className="flex items-center justify-between border-b border-border-soft pb-2">
                  <div>
                    <p className="font-medium text-sm text-ink">{d.title}</p>
                    <p className="text-xs text-ink-muted">{d.type}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDemo(d.id)}
                    className="btn-icon hover:text-danger!"
                    aria-label="Demo materialni o'chirish"
                    title="Demo materialni o'chirish"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              ))}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  className="input-field"
                  value={newDemo.type}
                  onChange={(e) => setNewDemo({ ...newDemo, type: e.target.value })}
                >
                  <option value="VIDEO">Video</option>
                  <option value="PDF">PDF</option>
                  <option value="IMAGE">Rasm</option>
                  <option value="TEXT">Matn</option>
                </select>
                <input
                  className="input-field"
                  placeholder="Sarlavha"
                  value={newDemo.title}
                  onChange={(e) => setNewDemo({ ...newDemo, title: e.target.value })}
                />
                <input
                  className="input-field sm:col-span-2"
                  placeholder="URL (video/pdf/rasm uchun)"
                  value={newDemo.url}
                  onChange={(e) => setNewDemo({ ...newDemo, url: e.target.value })}
                />
                <textarea
                  className="input-field sm:col-span-2"
                  placeholder="Matn (TEXT turi uchun)"
                  rows={2}
                  value={newDemo.content}
                  onChange={(e) => setNewDemo({ ...newDemo, content: e.target.value })}
                />
              </div>
              <button type="button" onClick={addDemo} className="btn-secondary self-start">
                <Plus size={16} aria-hidden="true" />
                Demo material qo'shish
              </button>
            </section>
          )}
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-20">
          <FormSection title="Narx" description="Mahsulot narxi va chegirma">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="form-label" htmlFor="pf-price">
                  Oddiy narx<span className="required">*</span>
                </label>
                <input
                  id="pf-price"
                  className="input-field"
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="form-label" htmlFor="pf-discount">
                  Chegirmali narx
                </label>
                <input
                  id="pf-discount"
                  className="input-field"
                  type="number"
                  name="discountPrice"
                  value={form.discountPrice}
                  onChange={handleChange}
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="Holat va ko'rinish" description="Katalogda qanday ko'rinishini belgilang">
            <div className="flex flex-col gap-3 text-sm">
              {Object.keys(FLAG_LABELS).map((flag) => (
                <label key={flag} className="flex items-center gap-2 text-ink">
                  <input type="checkbox" name={flag} checked={form[flag]} onChange={handleChange} />
                  {FLAG_LABELS[flag]}
                </label>
              ))}
            </div>
          </FormSection>

          <div className="card p-5 flex flex-col gap-3">
            {error && (
              <p className="form-error">
                <CircleX size={14} aria-hidden="true" />
                {error}
              </p>
            )}
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              <Save size={16} aria-hidden="true" />
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
            <Link to="/admin/products" className="btn-secondary w-full">
              Bekor qilish
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
