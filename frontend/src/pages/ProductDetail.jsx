import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Award,
  Clock,
  FileText,
  GraduationCap,
  ImageOff,
  KeyRound,
  Play,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  X,
} from 'lucide-react';
import { api } from '../api/client';
import { useCart } from '../context/CartContext';
import TariffTable from '../components/TariffTable';
import ReviewList from '../components/ReviewList';
import LeadCaptureForm from '../components/LeadCaptureForm';
import { formatMoney } from '../utils/format';
import { track } from '../utils/track';
import { TYPE_LABELS } from '../components/ProductCard';

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

  if (loading) {
    return (
      <div className="container-page py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-video rounded-xl bg-border-soft/70" />
          <div className="flex flex-col gap-4">
            <div className="h-4 w-24 rounded bg-border-soft/70" />
            <div className="h-8 w-3/4 rounded bg-border-soft/70" />
            <div className="h-4 w-full rounded bg-border-soft/70" />
            <div className="h-10 w-40 rounded bg-border-soft/70" />
          </div>
        </div>
      </div>
    );
  }
  if (notFound || !product) {
    return (
      <div className="container-page py-16 text-center text-ink-muted">Mahsulot topilmadi.</div>
    );
  }

  const hasDiscount = product.discountPrice && Number(product.discountPrice) < Number(product.price);
  const discountPercent = hasDiscount
    ? Math.round(100 - (Number(product.discountPrice) / Number(product.price)) * 100)
    : 0;

  const buyNow = (tariff) => {
    const item = {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.mainImage,
      tariffId: tariff ? tariff.id : null,
      tariffName: tariff ? tariff.name : null,
      unitPrice: tariff ? Number(tariff.discountPrice ?? tariff.price) : Number(product.discountPrice ?? product.price),
      quantity: 1,
    };
    track('ADD_TO_CART', product.id);
    navigate('/checkout', { state: { buyNow: item } });
  };

  const addToCart = (tariff) => {
    const item = {
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      productImage: product.mainImage,
      tariffId: tariff ? tariff.id : null,
      tariffName: tariff ? tariff.name : null,
      unitPrice: tariff ? Number(tariff.discountPrice ?? tariff.price) : Number(product.discountPrice ?? product.price),
      quantity: 1,
    };
    addItem(item);
    track('ADD_TO_CART', product.id);
  };

  return (
    <div className="container-page py-8 flex flex-col gap-10 pb-28 md:pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-video bg-ivory rounded-xl overflow-hidden relative">
          {product.mainImage ? (
            <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-linear-to-br from-navy-900 to-navy-700 text-white/50">
              <ImageOff size={40} strokeWidth={1.5} aria-hidden="true" />
              <span className="text-sm font-medium text-white/40">Rasm mavjud emas</span>
            </div>
          )}
          {hasDiscount && (
            <span className="badge badge-red absolute top-3 left-3">-{discountPercent}%</span>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-xs font-medium text-ink-muted">{TYPE_LABELS[product.type] || product.type}</span>
          <h1 className="text-display text-2xl md:text-3xl text-ink">{product.name}</h1>
          {product.shortDescription && <p className="text-ink-muted">{product.shortDescription}</p>}

          <div className="flex items-baseline gap-3">
            {hasDiscount ? (
              <>
                <span className="text-3xl font-extrabold text-ink tabular-nums">{formatMoney(product.discountPrice)}</span>
                <span className="text-lg text-ink-muted line-through tabular-nums">{formatMoney(product.price)}</span>
              </>
            ) : (
              <span className="text-3xl font-extrabold text-ink tabular-nums">{formatMoney(product.price)}</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button className="btn-accent flex-1" onClick={() => buyNow(null)}>
              Hozir sotib olish
            </button>
            <button className="btn-secondary flex-1" onClick={() => addToCart(null)}>
              <ShoppingCart size={17} aria-hidden="true" />
              Savatga qo'shish
            </button>
          </div>
          {product.demoMaterials?.length > 0 && (
            <button
              className="text-sm font-semibold text-navy-900 hover:text-gold-600 transition-colors text-left inline-flex items-center gap-1.5"
              onClick={() => setShowDemo(true)}
            >
              <Play size={15} aria-hidden="true" />
              Bepul namunani ko'rish
            </button>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm text-ink-muted mt-2">
            {product.duration && (
              <div className="flex items-center gap-1.5">
                <Clock size={15} className="text-gold-600 shrink-0" aria-hidden="true" />
                Davomiyligi: {product.duration}
              </div>
            )}
            {product.format && (
              <div className="flex items-center gap-1.5">
                <GraduationCap size={15} className="text-gold-600 shrink-0" aria-hidden="true" />
                Format: {product.format}
              </div>
            )}
            {product.certificateAvailable && (
              <div className="flex items-center gap-1.5">
                <Award size={15} className="text-gold-600 shrink-0" aria-hidden="true" />
                Sertifikat mavjud
              </div>
            )}
            {product.accessDurationDays && (
              <div className="flex items-center gap-1.5">
                <KeyRound size={15} className="text-gold-600 shrink-0" aria-hidden="true" />
                Kirish: {product.accessDurationDays} kun
              </div>
            )}
          </div>
        </div>
      </div>

      {product.fullDescription && (
        <section>
          <h2 className="text-h2 text-xl text-ink mb-3">Batafsil</h2>
          <p className="text-ink-muted whitespace-pre-line">{product.fullDescription}</p>
        </section>
      )}

      {(product.forWhom || product.results) && (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {product.forWhom && (
            <div className="card p-5">
              <h3 className="font-bold text-ink mb-2">Kimlar uchun</h3>
              <p className="text-sm text-ink-muted">{product.forWhom}</p>
            </div>
          )}
          {product.results && (
            <div className="card p-5">
              <h3 className="font-bold text-ink mb-2">Qanday natija olasiz</h3>
              <p className="text-sm text-ink-muted">{product.results}</p>
            </div>
          )}
        </section>
      )}

      {product.instructorInfo && (
        <section className="card p-5">
          <h3 className="font-bold text-ink mb-2">O'qituvchi haqida</h3>
          <p className="text-sm text-ink-muted">{product.instructorInfo}</p>
        </section>
      )}

      {product.tariffs?.length > 0 && (
        <section>
          <h2 className="text-h2 text-xl text-ink mb-4">Tariflar</h2>
          <TariffTable tariffs={product.tariffs} onBuyNow={buyNow} onAddToCart={addToCart} />
        </section>
      )}

      {product.guaranteeTerms && (
        <section className="card p-5 bg-emerald-500/5 border-emerald-500/20">
          <h3 className="font-bold text-ink mb-1 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-500" aria-hidden="true" />
            Kafolat shartlari
          </h3>
          <p className="text-sm text-ink-muted">{product.guaranteeTerms}</p>
        </section>
      )}

      <section>
        <h2 className="text-h2 text-xl text-ink mb-4">Mijozlar fikrlari</h2>
        <ReviewList reviews={product.reviews} />
      </section>

      <section className="max-w-md">
        <LeadCaptureForm productId={product.id} title="Bepul namuna so'rash" />
      </section>

      {showDemo && (
        <div
          className="fixed inset-0 bg-navy-950/60 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDemo(false)}
        >
          <div
            className="bg-surface rounded-xl p-5 max-w-lg w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-ink flex items-center gap-2">
                <Sparkles size={18} className="text-gold-600" aria-hidden="true" />
                Bepul namunalar
              </h3>
              <button onClick={() => setShowDemo(false)} className="btn-icon" aria-label="Yopish">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {product.demoMaterials.map((demo) => (
                <div key={demo.id} className="card p-3">
                  <p className="font-semibold text-sm text-ink mb-1">{demo.title}</p>
                  {demo.type === 'VIDEO' && demo.url && (
                    <a
                      href={demo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-navy-900 hover:text-gold-600 transition-colors text-sm font-medium inline-flex items-center gap-1.5"
                    >
                      <Play size={14} aria-hidden="true" />
                      Videoni ko'rish
                    </a>
                  )}
                  {demo.type === 'PDF' && demo.url && (
                    <a
                      href={demo.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-navy-900 hover:text-gold-600 transition-colors text-sm font-medium inline-flex items-center gap-1.5"
                    >
                      <FileText size={14} aria-hidden="true" />
                      PDF-ni ko'rish
                    </a>
                  )}
                  {demo.type === 'IMAGE' && demo.url && (
                    <img src={demo.url} alt={demo.title} className="rounded-lg" />
                  )}
                  {demo.type === 'TEXT' && demo.content && (
                    <p className="text-sm text-ink-muted">{demo.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border-soft p-3 flex gap-3 shadow-[0_-4px_16px_rgba(11,23,48,0.08)]">
        <button className="btn-secondary flex-1" onClick={() => addToCart(null)}>
          <ShoppingCart size={17} aria-hidden="true" />
          Savatga
        </button>
        <button className="btn-accent flex-1" onClick={() => buyNow(null)}>
          Hozir sotib olish
        </button>
      </div>
    </div>
  );
}
