import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, CircleAlert, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { adminApi } from '../../api/client';
import MediaField from '../../components/admin/MediaField';
import { TYPE_LABELS } from '../../components/ProductCard';
import { useToast } from '../../context/ToastContext';

/* Two-column section: mono caption rail on the left, fields on the right. */
function Section({ index, title, description, children }) {
  return (
    <section className="border-t border-ink pt-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-4">
          <span className="t-index block mb-2">{index}</span>
          <h2 className="t-heading text-[17px] text-ink">{title}</h2>
          {description && <p className="mt-2 text-sm text-ink-3 leading-relaxed">{description}</p>}
        </div>
        <div className="lg:col-span-8 flex flex-col gap-5">{children}</div>
      </div>
    </section>
  );
}

function Field({ id, label, required, optional, children }) {
  return (
    <div>
      <label className="field-label" htmlFor={id}>
        {label}
        {required && <span className="req">*</span>}
        {optional && <span className="optional"> (ixtiyoriy)</span>}
      </label>
      {children}
    </div>
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
    <div className="max-w-6xl">
      <Link
        to="/admin/products"
        className="link inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3 hover:text-accent"
      >
        <ArrowLeft size={13} aria-hidden="true" />
        Mahsulotlar
      </Link>

      <header className="mt-6 mb-10 pb-6 border-b border-ink">
        <span className="t-kicker t-kicker-accent">{isEdit ? 'Tahrirlash' : 'Yaratish'}</span>
        <h1 className="t-title text-[30px] md:text-[36px] text-ink mt-3">
          {isEdit ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot'}
        </h1>
        <p className="mt-2 text-sm text-ink-3">
          {isEdit ? 'Mavjud mahsulot maʼlumotlarini yangilang.' : 'Katalogga yangi mahsulot qoʼshing.'}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-14">
        <Section index="01" title="Asosiy maʼlumotlar" description="Mahsulotning nomi, turi va tavsifi.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field id="pf-name" label="Mahsulot nomi" required>
              <input id="pf-name" name="name" className="field" value={form.name} onChange={handleChange} required />
            </Field>
            <Field id="pf-slug" label="URL manzili" optional>
              <input
                id="pf-slug"
                name="slug"
                className="field font-mono text-sm"
                placeholder="avtomatik"
                value={form.slug}
                onChange={handleChange}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field id="pf-type" label="Turi">
              <select id="pf-type" name="type" className="field pick" value={form.type} onChange={handleChange}>
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="pf-category" label="Kategoriya">
              <select
                id="pf-category"
                name="categoryId"
                className="field pick"
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
            </Field>
          </div>

          <Field id="pf-short" label="Qisqa tavsif">
            <textarea
              id="pf-short"
              name="shortDescription"
              className="field"
              rows={2}
              value={form.shortDescription}
              onChange={handleChange}
            />
          </Field>

          <Field id="pf-full" label="Toʼliq tavsif">
            <textarea
              id="pf-full"
              name="fullDescription"
              className="field"
              rows={5}
              value={form.fullDescription}
              onChange={handleChange}
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field id="pf-forwhom" label="Kimlar uchun">
              <textarea
                id="pf-forwhom"
                name="forWhom"
                className="field"
                rows={3}
                value={form.forWhom}
                onChange={handleChange}
              />
            </Field>
            <Field id="pf-results" label="Qanday natija olishi">
              <textarea
                id="pf-results"
                name="results"
                className="field"
                rows={3}
                value={form.results}
                onChange={handleChange}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field id="pf-duration" label="Davomiyligi">
              <input id="pf-duration" name="duration" className="field" value={form.duration} onChange={handleChange} />
            </Field>
            <Field id="pf-format" label="Format">
              <input id="pf-format" name="format" className="field" value={form.format} onChange={handleChange} />
            </Field>
            <Field id="pf-access" label="Kirish (kun)">
              <input
                id="pf-access"
                name="accessDurationDays"
                type="number"
                className="field figures"
                value={form.accessDurationDays}
                onChange={handleChange}
              />
            </Field>
          </div>

          <Field id="pf-instructor" label="Oʼqituvchi haqida">
            <textarea
              id="pf-instructor"
              name="instructorInfo"
              className="field"
              rows={3}
              value={form.instructorInfo}
              onChange={handleChange}
            />
          </Field>

          <Field id="pf-guarantee" label="Kafolat shartlari">
            <textarea
              id="pf-guarantee"
              name="guaranteeTerms"
              className="field"
              rows={3}
              value={form.guaranteeTerms}
              onChange={handleChange}
            />
          </Field>
        </Section>

        <Section index="02" title="Narx" description="Oddiy narx va chegirmali taklif.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field id="pf-price" label="Oddiy narx" required>
              <input
                id="pf-price"
                name="price"
                type="number"
                className="field figures"
                value={form.price}
                onChange={handleChange}
                required
              />
            </Field>
            <Field id="pf-discount" label="Chegirmali narx" optional>
              <input
                id="pf-discount"
                name="discountPrice"
                type="number"
                className="field figures"
                value={form.discountPrice}
                onChange={handleChange}
              />
            </Field>
          </div>
        </Section>

        <Section
          index="03"
          title="Media"
          description="Mahsulot rasmi va tanishtiruv videosi. Tayyor havola kiriting yoki faylni qurilmangizdan yuklang."
        >
          <MediaField
            kind="image"
            id="pf-image"
            label="Mahsulot rasmi"
            hint="Tashqi havola yoki yuklangan fayl — katalog va mahsulot sahifasida shu rasm koʼrinadi."
            value={form.mainImage}
            onChange={(url) => setForm((prev) => ({ ...prev, mainImage: url }))}
          />
          <MediaField
            kind="video"
            id="pf-video"
            label="Tanishtiruv videosi"
            hint="YouTube/Vimeo havolasi yoki qurilmadan yuklangan MP4 fayl."
            value={form.videoUrl}
            onChange={(url) => setForm((prev) => ({ ...prev, videoUrl: url }))}
          />
        </Section>

        <Section index="04" title="Holat va koʼrinish" description="Katalogda qanday koʼrinishini belgilang.">
          <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-line border border-line rounded-lg overflow-hidden">
            <legend className="sr-only">Mahsulot bayroqlari</legend>
            {Object.keys(FLAG_LABELS).map((flag) => (
              <label
                key={flag}
                className="bg-panel flex items-center gap-3 px-4 min-h-[52px] cursor-pointer select-none hover:bg-sunken transition-colors duration-150"
              >
                <input
                  type="checkbox"
                  className="tick"
                  name={flag}
                  checked={form[flag]}
                  onChange={handleChange}
                />
                <span className="text-sm text-ink">{FLAG_LABELS[flag]}</span>
              </label>
            ))}
          </fieldset>
        </Section>

        <Section index="05" title="SEO" description="Qidiruv tizimlari uchun sarlavha va tavsif.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field id="pf-seotitle" label="SEO sarlavha">
              <input id="pf-seotitle" name="seoTitle" className="field" value={form.seoTitle} onChange={handleChange} />
            </Field>
            <Field id="pf-seodesc" label="SEO tavsif">
              <input
                id="pf-seodesc"
                name="seoDescription"
                className="field"
                value={form.seoDescription}
                onChange={handleChange}
              />
            </Field>
          </div>
        </Section>

        <div className="border-t border-ink pt-6">
          {error && (
            <p className="field-error mb-5" role="alert">
              <CircleAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" className="btn btn-accent" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={15} className="motion-spin" aria-hidden="true" />
                  Saqlanmoqda
                </>
              ) : (
                <>
                  <Save size={15} aria-hidden="true" />
                  Saqlash
                </>
              )}
            </button>
            <Link to="/admin/products" className="btn btn-quiet">
              Bekor qilish
            </Link>
          </div>
        </div>
      </form>

      {/* ── Tariffs & demo materials (edit mode only, outside the main form) ── */}
      {isEdit && (
        <div className="mt-14 flex flex-col gap-14">
          <Section index="06" title="Tariflar" description="Mahsulot uchun bir nechta narx varianti.">
            {tariffs.length > 0 && (
              <ul className="border border-line rounded-lg divide-y divide-line">
                {tariffs.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{t.name}</p>
                      <p className="mt-0.5 font-mono text-[11px] text-ink-3 figures">{t.price} soʼm</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTariff(t.id)}
                      className="icon-btn icon-btn-critical shrink-0"
                      aria-label={`${t.name} tarifini o'chirish`}
                      title="O'chirish"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="panel p-5 flex flex-col gap-5">
              <h3 className="t-kicker">Yangi tarif</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field id="pf-tariff-name" label="Tarif nomi" required>
                  <input
                    id="pf-tariff-name"
                    className="field"
                    placeholder="Masalan: Standart"
                    value={newTariff.name}
                    onChange={(e) => setNewTariff({ ...newTariff, name: e.target.value })}
                  />
                </Field>
                <Field id="pf-tariff-price" label="Narx" required>
                  <input
                    id="pf-tariff-price"
                    type="number"
                    className="field figures"
                    placeholder="0"
                    value={newTariff.price}
                    onChange={(e) => setNewTariff({ ...newTariff, price: e.target.value })}
                  />
                </Field>
                <Field id="pf-tariff-discount" label="Chegirmali narx" optional>
                  <input
                    id="pf-tariff-discount"
                    type="number"
                    className="field figures"
                    value={newTariff.discountPrice}
                    onChange={(e) => setNewTariff({ ...newTariff, discountPrice: e.target.value })}
                  />
                </Field>
                <Field id="pf-tariff-access" label="Kirish (kun)" optional>
                  <input
                    id="pf-tariff-access"
                    type="number"
                    className="field figures"
                    placeholder="30"
                    value={newTariff.accessDurationDays}
                    onChange={(e) => setNewTariff({ ...newTariff, accessDurationDays: e.target.value })}
                  />
                </Field>
              </div>

              <Field id="pf-tariff-features" label="Tarif tarkibi">
                <textarea
                  id="pf-tariff-features"
                  className="field"
                  rows={4}
                  placeholder="Har bir qator — alohida band"
                  value={newTariff.features}
                  onChange={(e) => setNewTariff({ ...newTariff, features: e.target.value })}
                />
                <p className="field-hint">Har bir qator alohida imkoniyat sifatida koʼrsatiladi.</p>
              </Field>

              <Field id="pf-tariff-bonuses" label="Bonuslar" optional>
                <input
                  id="pf-tariff-bonuses"
                  className="field"
                  value={newTariff.bonuses}
                  onChange={(e) => setNewTariff({ ...newTariff, bonuses: e.target.value })}
                />
              </Field>

              <button type="button" onClick={addTariff} className="btn btn-outline self-start">
                <Plus size={15} aria-hidden="true" />
                Tarif qoʼshish
              </button>
            </div>
          </Section>

          <Section index="07" title="Demo materiallar" description="Xaridorga bepul koʼrsatiladigan namunalar.">
            {demoMaterials.length > 0 && (
              <ul className="border border-line rounded-lg divide-y divide-line">
                {demoMaterials.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-4 px-4 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{d.title}</p>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">{d.type}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDemo(d.id)}
                      className="icon-btn icon-btn-critical shrink-0"
                      aria-label={`${d.title} materialini o'chirish`}
                      title="O'chirish"
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="panel p-5 flex flex-col gap-5">
              <h3 className="t-kicker">Yangi material</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field id="pf-demo-type" label="Turi">
                  <select
                    id="pf-demo-type"
                    className="field pick"
                    value={newDemo.type}
                    onChange={(e) => setNewDemo({ ...newDemo, type: e.target.value })}
                  >
                    <option value="VIDEO">Video</option>
                    <option value="PDF">PDF</option>
                    <option value="IMAGE">Rasm</option>
                    <option value="TEXT">Matn</option>
                  </select>
                </Field>
                <Field id="pf-demo-title" label="Sarlavha" required>
                  <input
                    id="pf-demo-title"
                    className="field"
                    placeholder="Masalan: 1-dars namunasi"
                    value={newDemo.title}
                    onChange={(e) => setNewDemo({ ...newDemo, title: e.target.value })}
                  />
                </Field>
              </div>

              <Field id="pf-demo-url" label="URL">
                <input
                  id="pf-demo-url"
                  className="field font-mono text-sm"
                  placeholder="https://"
                  value={newDemo.url}
                  onChange={(e) => setNewDemo({ ...newDemo, url: e.target.value })}
                />
              </Field>

              <Field id="pf-demo-content" label="Matn" optional>
                <textarea
                  id="pf-demo-content"
                  className="field"
                  rows={3}
                  placeholder="Faqat 'Matn' turi uchun"
                  value={newDemo.content}
                  onChange={(e) => setNewDemo({ ...newDemo, content: e.target.value })}
                />
              </Field>

              <button type="button" onClick={addDemo} className="btn btn-outline self-start">
                <Plus size={15} aria-hidden="true" />
                Material qoʼshish
              </button>
            </div>
          </Section>
        </div>
      )}
    </div>
  );
}
