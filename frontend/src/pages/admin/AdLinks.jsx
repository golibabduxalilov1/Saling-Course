import { useEffect, useMemo, useState } from 'react';
import { CircleAlert, Copy, ExternalLink, Link2, Loader2, RotateCcw, Trash2, Wand2 } from 'lucide-react';
import { adminApi } from '../../api/client';
import { formatDate } from '../../utils/format';
import { buildAdLink, copyToClipboard, utmToken } from '../../utils/adLink';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';
import { TableSkeleton } from '../../components/Skeleton';
import ConfirmModal from '../../components/admin/ConfirmModal';
import PageHeader from '../../components/admin/PageHeader';

const PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'google', label: 'Google' },
  { value: 'other', label: 'Boshqa' },
];

const MEDIUMS = [
  { value: 'target', label: 'Target reklama' },
  { value: 'post', label: 'Post' },
  { value: 'story', label: 'Story' },
  { value: 'bio', label: 'Bio' },
  { value: 'channel', label: 'Kanal' },
  { value: 'partner', label: 'Hamkor' },
  { value: 'other', label: 'Boshqa' },
];

const DESTINATIONS = [
  { value: 'home', label: 'Bosh sahifa' },
  { value: 'catalog', label: 'Katalog' },
  { value: 'product', label: 'Mahsulot sahifasi' },
  { value: 'custom', label: 'Ixtiyoriy manzil' },
];

const empty = {
  platform: 'instagram',
  platformOther: '',
  medium: 'target',
  mediumOther: '',
  campaignName: '',
  content: '',
  destination: 'home',
  productSlug: '',
  customUrl: '',
};

function labelOf(options, value) {
  return options.find((o) => o.value === value)?.label || value;
}

export default function AdLinks() {
  const [links, setLinks] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    adminApi
      .get('/ad-links')
      .then((res) => setLinks(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    adminApi
      .get('/products')
      .then((res) => setProducts(res.data))
      .catch(() => setProducts([]));
  }, []);

  const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const platformValue = form.platform === 'other' ? form.platformOther : form.platform;
  const mediumValue = form.medium === 'other' ? form.mediumOther : form.medium;

  const destinationUrl = useMemo(() => {
    if (form.destination === 'catalog') return '/katalog';
    if (form.destination === 'product') return form.productSlug ? `/mahsulot/${form.productSlug}` : '';
    if (form.destination === 'custom') return form.customUrl.trim();
    return '/';
  }, [form.destination, form.productSlug, form.customUrl]);

  const campaignToken = utmToken(form.campaignName);
  const contentToken = utmToken(form.content);

  const preview = useMemo(
    () =>
      buildAdLink({
        destination: destinationUrl,
        source: utmToken(platformValue),
        medium: utmToken(mediumValue),
        campaign: campaignToken,
        content: contentToken,
      }),
    [destinationUrl, platformValue, mediumValue, campaignToken, contentToken]
  );

  // Tayyor havoladagi haqiqiy parametrlar — tekshirish uchun ko'rsatiladi.
  const resultParams = useMemo(() => {
    if (!result) return [];
    try {
      return [...new URL(result.generatedUrl).searchParams].filter(([key]) => key.startsWith('utm_'));
    } catch {
      return [];
    }
  }, [result]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError('');
    setSubmitting(true);
    try {
      const res = await adminApi.post('/ad-links', {
        campaignName: form.campaignName,
        platform: platformValue,
        medium: mediumValue,
        content: form.content,
        destinationUrl,
      });
      setResult(res.data);
      toast.success('Havola yaratildi');
      load();
    } catch (err) {
      const message = err.response?.data?.error || 'Xatolik yuz berdi';
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(empty);
    setResult(null);
    setError('');
  };

  const handleCopy = async (url) => {
    const ok = await copyToClipboard(url);
    if (ok) {
      toast.success('Havola nusxalandi');
    } else {
      toast.error('Nusxalab boʼlmadi — havolani qoʼlda belgilab oling');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminApi.delete(`/ad-links/${deleteTarget.id}`);
      toast.success("Havola o'chirildi");
      if (result?.id === deleteTarget.id) setResult(null);
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || "Havolani o'chirishda xatolik");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        kicker="Sotuv"
        title="Reklama havolalari"
        description="Platforma va trafik turini tanlang — tayyor havola oʼzi yasaladi. Buyurtma kelganda manba admin panelda koʼrinadi."
      />

      <form onSubmit={handleSubmit} className="panel mb-8" noValidate>
        <h2 className="px-5 py-4 border-b border-line font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">
          Yangi havola
        </h2>

        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <div>
            <label className="field-label" htmlFor="al-platform">
              Platforma<span className="req">*</span>
            </label>
            <select
              id="al-platform"
              className="field pick"
              value={form.platform}
              onChange={(e) => update({ platform: e.target.value })}
            >
              {PLATFORMS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            {form.platform === 'other' && (
              <input
                className="field mt-2"
                placeholder="Platforma nomi"
                aria-label="Boshqa platforma nomi"
                value={form.platformOther}
                onChange={(e) => update({ platformOther: e.target.value })}
              />
            )}
            <p className="field-hint">Reklama qaysi ijtimoiy tarmoqda joylashtiriladi.</p>
          </div>

          <div>
            <label className="field-label" htmlFor="al-medium">
              Trafik turi<span className="req">*</span>
            </label>
            <select
              id="al-medium"
              className="field pick"
              value={form.medium}
              onChange={(e) => update({ medium: e.target.value })}
            >
              {MEDIUMS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            {form.medium === 'other' && (
              <input
                className="field mt-2"
                placeholder="Trafik turi"
                aria-label="Boshqa trafik turi"
                value={form.mediumOther}
                onChange={(e) => update({ mediumOther: e.target.value })}
              />
            )}
            <p className="field-hint">Havola qayerga qoʼyiladi: pullik reklama, post, story yoki bio.</p>
          </div>

          <div>
            <label className="field-label" htmlFor="al-campaign">
              Kampaniya nomi<span className="req">*</span>
            </label>
            <input
              id="al-campaign"
              className={`field ${error ? 'field-invalid' : ''}`}
              placeholder="Yozgi aksiya"
              value={form.campaignName}
              onChange={(e) => update({ campaignName: e.target.value })}
              aria-invalid={!!error}
              required
            />
            <p className="field-hint">
              Havolada: <span className="font-mono text-ink-2">{campaignToken || '—'}</span>
            </p>
          </div>

          <div>
            <label className="field-label" htmlFor="al-content">
              Reklama varianti <span className="optional">(ixtiyoriy)</span>
            </label>
            <input
              id="al-content"
              className="field"
              placeholder="video 1"
              value={form.content}
              onChange={(e) => update({ content: e.target.value })}
            />
            <p className="field-hint">
              Bir kampaniyaning bannerlarini ajratish uchun:{' '}
              <span className="font-mono text-ink-2">{contentToken || '—'}</span>
            </p>
          </div>

          <div className="sm:col-span-2 xl:col-span-1">
            <label className="field-label" htmlFor="al-destination">
              Yoʼnaltiriladigan sahifa<span className="req">*</span>
            </label>
            <select
              id="al-destination"
              className="field pick"
              value={form.destination}
              onChange={(e) => update({ destination: e.target.value })}
            >
              {DESTINATIONS.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>

            {form.destination === 'product' && (
              <select
                className="field pick mt-2"
                aria-label="Mahsulotni tanlang"
                value={form.productSlug}
                onChange={(e) => update({ productSlug: e.target.value })}
              >
                <option value="">Mahsulotni tanlang</option>
                {products.map((p) => (
                  <option key={p.id} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}

            {form.destination === 'custom' && (
              <input
                className="field mt-2"
                placeholder="/katalog yoki https://..."
                aria-label="Ixtiyoriy manzil"
                value={form.customUrl}
                onChange={(e) => update({ customUrl: e.target.value })}
              />
            )}

            <p className="field-hint break-all">
              <span className="font-mono text-ink-2">{destinationUrl || '—'}</span>
            </p>
          </div>

          <div className="sm:col-span-2 xl:col-span-3">
            <span className="field-label">Havola koʼrinishi</span>
            <p className="font-mono text-[13px] leading-relaxed text-ink-2 bg-sunken border border-line rounded-md px-4 py-3 break-all">
              {preview || 'Maydonlarni toʼldiring — havola shu yerda koʼrinadi.'}
            </p>
          </div>

          {error && (
            <p className="field-error sm:col-span-2 xl:col-span-3" role="alert">
              <CircleAlert size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}
        </div>

        <div className="px-5 py-4 border-t border-line flex flex-col-reverse sm:flex-row sm:items-center gap-2">
          <button type="submit" className="btn btn-accent" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={15} className="motion-spin" aria-hidden="true" />
                Yaratilmoqda
              </>
            ) : (
              <>
                <Wand2 size={15} aria-hidden="true" />
                Havola yaratish
              </>
            )}
          </button>
          <button type="button" className="btn btn-quiet" onClick={handleReset} disabled={submitting}>
            <RotateCcw size={15} aria-hidden="true" />
            Formani tozalash
          </button>
        </div>
      </form>

      {result && (
        <div className="motion-rise panel mb-8">
          <h2 className="px-5 py-4 border-b border-line font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">
            Tayyor havola
          </h2>

          <div className="p-5">
            <label className="field-label" htmlFor="al-result">
              Reklamaga qoʼyiladigan manzil
            </label>
            <input
              id="al-result"
              className="field font-mono text-[13px]"
              value={result.generatedUrl}
              readOnly
              onFocus={(e) => e.target.select()}
            />

            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <button type="button" className="btn btn-solid" onClick={() => handleCopy(result.generatedUrl)}>
                <Copy size={15} aria-hidden="true" />
                Nusxalash
              </button>
              <a
                href={result.generatedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <ExternalLink size={15} aria-hidden="true" />
                Havolani ochish
              </a>
            </div>

            <div className="mt-5 pt-5 border-t border-line flex flex-wrap gap-2">
              {resultParams.map(([key, value]) => (
                <span key={key} className="tag tag-neutral">
                  {key} · {value}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="tbl-frame">
          <TableSkeleton rows={5} cols={6} />
        </div>
      ) : links.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon={Link2}
            title="Havola yoʼq"
            description="Yuqoridagi generator orqali birinchi reklama havolangizni yarating."
          />
        </div>
      ) : (
        <div className="tbl-frame">
          <table className="tbl">
            <thead>
              <tr>
                <th>Kampaniya</th>
                <th>Platforma</th>
                <th>Trafik turi</th>
                <th>Yoʼnaltirilgan sahifa</th>
                <th>Yaratilgan sana</th>
                <th className="text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.id}>
                  <td>
                    <span className="block text-sm font-medium text-ink">{link.campaignName}</span>
                    {link.content && (
                      <span className="block font-mono text-[11px] text-ink-3 mt-0.5">{link.content}</span>
                    )}
                  </td>
                  <td>
                    <span className="tag tag-accent">{labelOf(PLATFORMS, link.platform)}</span>
                  </td>
                  <td>{labelOf(MEDIUMS, link.medium)}</td>
                  <td>
                    <span className="font-mono text-[11px] text-ink-3 break-all">{link.destinationUrl}</span>
                  </td>
                  <td>
                    <span className="font-mono text-[11px] text-ink-3 figures whitespace-nowrap">
                      {formatDate(link.createdAt)}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopy(link.generatedUrl)}
                        className="icon-btn"
                        aria-label={`${link.campaignName} — havolani nusxalash`}
                        title="Nusxalash"
                      >
                        <Copy size={15} aria-hidden="true" />
                      </button>
                      <a
                        href={link.generatedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="icon-btn"
                        aria-label={`${link.campaignName} — havolani ochish`}
                        title="Havolani ochish"
                      >
                        <ExternalLink size={15} aria-hidden="true" />
                      </a>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(link)}
                        className="icon-btn icon-btn-critical"
                        aria-label={`${link.campaignName} — o'chirish`}
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
        title="Havolani oʼchirasizmi?"
        description={
          deleteTarget ? `"${deleteTarget.campaignName}" kampaniyasining havolasi roʼyxatdan oʼchiriladi.` : ''
        }
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
