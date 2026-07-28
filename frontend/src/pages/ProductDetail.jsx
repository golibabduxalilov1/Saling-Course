import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  ImageOff,
  Play,
  ShieldCheck,
  ShoppingBag,
  Star,
  X,
} from 'lucide-react';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import TariffTable from '../components/TariffTable';
import ReviewList from '../components/ReviewList';
import LeadCaptureForm from '../components/LeadCaptureForm';
import { Skeleton } from '../components/Skeleton';
import { formatMoney } from '../utils/format';
import { track } from '../utils/track';
import { TYPE_LABELS } from '../components/ProductCard';

function Block({ index, title, children, className = '' }) {
  return (
    <section className={`border-t border-ink pt-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8">
        <div className="md:col-span-3">
          <span className="t-index block mb-2">{index}</span>
          <h2 className="t-heading text-lg text-ink">{title}</h2>
        </div>
        <div className="md:col-span-9">{children}</div>
      </div>
    </section>
  );
}

function SpecRow({ label, value }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-3 border-b border-line">
      <dt className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3 shrink-0">{label}</dt>
      <dd className="text-sm text-ink text-right">{value}</dd>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api
      .get(`/products/${slug}`)
      .then((res) => {
        setProduct(res.data);
        track('PRODUCT_VIEW', res.data.id);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!showDemo) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowDemo(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showDemo]);

  if (loading) {
    return (
      <div className="shell py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 flex flex-col gap-4">
            <Skeleton className="h-2.5 w-32" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="aspect-[16/10] w-full mt-4" />
          </div>
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="shell py-32 text-center">
        <span className="t-kicker">Xatolik 404</span>
        <h1 className="t-display text-4xl text-ink mt-6">Mahsulot topilmadi</h1>
        <p className="mt-4 text-ink-3">Soʼralgan sahifa mavjud emas yoki oʼchirilgan.</p>
        <Link to="/katalog" className="btn btn-solid mt-8">
          Katalogga qaytish
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountPrice && Number(product.discountPrice) < Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(100 - (Number(product.discountPrice) / Number(product.price)) * 100)
    : 0;

  const makeItem = (tariff) => ({
    productId: product.id,
    productName: product.name,
    productSlug: product.slug,
    productImage: product.mainImage,
    tariffId: tariff ? tariff.id : null,
    tariffName: tariff ? tariff.name : null,
    unitPrice: tariff
      ? Number(tariff.discountPrice ?? tariff.price)
      : Number(product.discountPrice ?? product.price),
    quantity: 1,
  });

  const buyNow = (tariff) => {
    const item = makeItem(tariff);
    track('ADD_TO_CART', product.id);
    navigate('/checkout', { state: { buyNow: item } });
  };

  const addToCart = (tariff) => {
    addItem(makeItem(tariff));
    track('ADD_TO_CART', product.id);
  };

  const avgRating = product.reviews?.length
    ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    : 0;

  const specs = [
    product.duration && { label: 'Davomiyligi', value: product.duration },
    product.format && { label: 'Format', value: product.format },
    product.accessDurationDays && { label: 'Kirish muddati', value: `${product.accessDurationDays} kun` },
    product.certificateAvailable && { label: 'Sertifikat', value: 'Mavjud' },
  ].filter(Boolean);

  return (
    <div className="pb-28 lg:pb-0">
      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="shell pt-8">
        <ol className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3">
          <li>
            <Link to="/" className="link hover:text-accent">
              Bosh sahifa
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/katalog" className="link hover:text-accent">
              Katalog
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="text-ink truncate max-w-[40vw]" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* ── Title ───────────────────────────────────────────────────────── */}
      <div className="shell pt-10 pb-10">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="t-kicker t-kicker-accent">{TYPE_LABELS[product.type] || product.type}</span>
          {product.isBestseller && <span className="tag tag-accent">Bestseller</span>}
          {product.isNew && <span className="tag tag-neutral">Yangi</span>}
        </div>

        <h1 className="t-display text-[36px] md:text-[56px] text-ink mt-6 max-w-4xl">{product.name}</h1>

        {avgRating > 0 && (
          <div className="mt-6 flex items-center gap-3">
            <span className="flex items-center gap-0.5" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  strokeWidth={1.5}
                  className={i < Math.round(avgRating) ? 'fill-ink text-ink' : 'fill-none text-line-2'}
                />
              ))}
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-ink-3 figures">
              {avgRating.toFixed(1)} / 5 · {product.reviews.length} sharh
            </span>
          </div>
        )}
      </div>

      {/* ── Media + purchase ────────────────────────────────────────────── */}
      <div className="shell">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-7">
            <div className="relative aspect-[16/10] border border-line rounded-lg overflow-hidden bg-veil motion-reveal">
              {product.mainImage ? (
                <img src={product.mainImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-ink-3">
                  <ImageOff size={32} strokeWidth={1.25} aria-hidden="true" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em]">Rasm mavjud emas</span>
                </div>
              )}
              {hasDiscount && (
                <span className="absolute top-4 left-4 tag tag-solid figures">−{discountPercent}%</span>
              )}
            </div>

            {product.shortDescription && (
              <p className="mt-8 text-lg leading-relaxed text-ink-2 max-w-2xl">{product.shortDescription}</p>
            )}
          </div>

          <aside className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="panel p-6 md:p-8">
              <span className="t-kicker">Narx</span>

              <div className="mt-4">
                {hasDiscount && (
                  <p className="font-mono text-sm text-ink-3 line-through figures">
                    {formatMoney(product.price)}
                  </p>
                )}
                <p className="t-display text-[40px] text-ink figures mt-1">
                  {formatMoney(hasDiscount ? product.discountPrice : product.price)}
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-2">
                <button type="button" className="btn btn-lg btn-accent w-full" onClick={() => buyNow(null)}>
                  Hozir sotib olish
                  <ArrowRight size={17} aria-hidden="true" />
                </button>
                <button type="button" className="btn btn-outline w-full" onClick={() => addToCart(null)}>
                  <ShoppingBag size={16} aria-hidden="true" />
                  Savatga qoʼshish
                </button>
              </div>

              {product.demoMaterials?.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowDemo(true)}
                  className="mt-4 w-full min-h-[44px] flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2 hover:text-accent transition-colors duration-150 cursor-pointer"
                >
                  <Play size={13} aria-hidden="true" />
                  Bepul namunani koʼrish
                </button>
              )}

              {specs.length > 0 && (
                <dl className="mt-8 pt-6 border-t border-line">
                  {specs.map((s) => (
                    <SpecRow key={s.label} label={s.label} value={s.value} />
                  ))}
                </dl>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* ── Content blocks ──────────────────────────────────────────────── */}
      <div className="shell mt-20 md:mt-28 flex flex-col gap-16 md:gap-20">
        {product.fullDescription && (
          <Block index="01" title="Batafsil">
            <p className="text-[17px] leading-relaxed text-ink-2 whitespace-pre-line max-w-3xl">
              {product.fullDescription}
            </p>
          </Block>
        )}

        {(product.forWhom || product.results) && (
          <Block index="02" title="Kimlar uchun va natija">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-line border border-line rounded-lg overflow-hidden">
              {product.forWhom && (
                <div className="bg-panel p-6">
                  <h3 className="t-kicker mb-4">Kimlar uchun</h3>
                  <p className="text-[15px] leading-relaxed text-ink-2">{product.forWhom}</p>
                </div>
              )}
              {product.results && (
                <div className="bg-panel p-6">
                  <h3 className="t-kicker mb-4">Qanday natija olasiz</h3>
                  <p className="text-[15px] leading-relaxed text-ink-2">{product.results}</p>
                </div>
              )}
            </div>
          </Block>
        )}

        {product.instructorInfo && (
          <Block index="03" title="Oʼqituvchi">
            <p className="text-[15px] leading-relaxed text-ink-2 max-w-3xl">{product.instructorInfo}</p>
          </Block>
        )}

        {product.tariffs?.length > 0 && (
          <Block index="04" title="Tariflar">
            <TariffTable tariffs={product.tariffs} onBuyNow={buyNow} onAddToCart={addToCart} />
          </Block>
        )}

        {product.guaranteeTerms && (
          <Block index="05" title="Kafolat">
            <div className="panel p-6 bg-positive-tint border-positive/25">
              <h3 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-positive mb-3">
                <ShieldCheck size={14} aria-hidden="true" />
                Kafolat shartlari
              </h3>
              <p className="text-[15px] leading-relaxed text-ink-2">{product.guaranteeTerms}</p>
            </div>
          </Block>
        )}

        <Block index="06" title="Mijozlar fikri">
          <ReviewList reviews={product.reviews} />
        </Block>

        <Block index="07" title="Bepul namuna" className="pb-8">
          <div className="max-w-lg">
            <LeadCaptureForm productId={product.id} title="Bepul namuna soʼrash" />
          </div>
        </Block>
      </div>

      {/* ── Demo modal ──────────────────────────────────────────────────── */}
      {showDemo && (
        <div
          className="motion-reveal fixed inset-0 z-[900] bg-obsidian/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
          onClick={() => setShowDemo(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="demo-title"
            className="motion-pop bg-panel w-full sm:max-w-lg max-h-[85vh] overflow-y-auto rounded-t-2xl sm:rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-panel border-b border-line px-6 py-5 flex items-center justify-between gap-4">
              <h2 id="demo-title" className="t-heading text-lg text-ink">
                Bepul namunalar
              </h2>
              <button type="button" onClick={() => setShowDemo(false)} className="icon-btn -mr-2" aria-label="Yopish">
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-px bg-line border-y border-line">
              {product.demoMaterials.map((demo) => (
                <div key={demo.id} className="bg-panel py-4 first:pt-0 last:pb-0">
                  <p className="t-heading text-[15px] text-ink">{demo.title}</p>
                  {demo.type === 'VIDEO' && demo.url && (
                    <a
                      href={demo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="link mt-2 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3 hover:text-accent"
                    >
                      <Play size={13} aria-hidden="true" />
                      Videoni koʼrish
                    </a>
                  )}
                  {demo.type === 'PDF' && demo.url && (
                    <a
                      href={demo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="link mt-2 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3 hover:text-accent"
                    >
                      <FileText size={13} aria-hidden="true" />
                      PDF-ni ochish
                    </a>
                  )}
                  {demo.type === 'IMAGE' && demo.url && (
                    <img src={demo.url} alt={demo.title} className="mt-3 w-full rounded-md border border-line" />
                  )}
                  {demo.type === 'TEXT' && demo.content && (
                    <p className="mt-2 text-sm leading-relaxed text-ink-3">{demo.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile purchase bar ─────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-panel border-t border-line px-4 py-3 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">Narx</p>
          <p className="font-display text-lg font-semibold tracking-[-0.03em] text-ink figures truncate">
            {formatMoney(hasDiscount ? product.discountPrice : product.price)}
          </p>
        </div>
        <button type="button" className="icon-btn border border-line" onClick={() => addToCart(null)} aria-label="Savatga qoʼshish">
          <ShoppingBag size={18} aria-hidden="true" />
        </button>
        <button type="button" className="btn btn-accent" onClick={() => buyNow(null)}>
          Sotib olish
        </button>
      </div>
    </div>
  );
}
