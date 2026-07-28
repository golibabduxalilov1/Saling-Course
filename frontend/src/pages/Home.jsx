import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowRight, Minus, Plus, Star } from 'lucide-react';
import { useProducts } from '../utils/useProducts';
import { api } from '../api/client';
import ProductCard from '../components/ProductCard';
import LeadCaptureForm from '../components/LeadCaptureForm';
import EmptyState from '../components/EmptyState';
import { CardSkeleton, Skeleton } from '../components/Skeleton';
import { track } from '../utils/track';

const FAQ = [
  {
    q: "To'lovni qanday amalga oshiraman?",
    a: "Buyurtma bergandan so'ng operatorimiz siz bilan bog'lanib, to'lov bo'yicha yo'riqnoma beradi.",
  },
  {
    q: 'Kursga qachon kirish beriladi?',
    a: "To'lov tasdiqlangandan so'ng darhol kursga kirish huquqi beriladi.",
  },
  {
    q: 'Pulni qaytarib olish mumkinmi?',
    a: 'Har bir mahsulot sahifasidagi kafolat shartlariga muvofiq pul qaytarish mumkin.',
  },
];

const PILLARS = [
  { k: 'Kafolat', v: 'Kafolatlangan sifat', d: 'Har bir mahsulot shartlari sahifada ochiq koʼrsatilgan.' },
  { k: 'Tezlik', v: 'Darhol kirish', d: "To'lov tasdiqlangach materiallar bir zumda ochiladi." },
  { k: 'Qoʼllab-quvvat', v: 'Individual yondashuv', d: 'Operator har bir buyurtmani shaxsan kuzatib boradi.' },
];

/* ── Section header: index + rule + title, the Swiss structural unit ────── */
function SectionHead({ index, title, subtitle, action }) {
  return (
    <div className="border-t border-ink pt-6 mb-10 md:mb-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-baseline">
        <div className="md:col-span-1">
          <span className="t-index">{index}</span>
        </div>
        <div className="md:col-span-7">
          <h2 className="t-title text-[28px] md:text-[38px] text-ink">{title}</h2>
        </div>
        <div className="md:col-span-4 flex md:justify-end items-baseline gap-6">
          {subtitle && <p className="text-sm text-ink-3 md:text-right max-w-[28ch]">{subtitle}</p>}
          {action}
        </div>
      </div>
    </div>
  );
}

function ProductGrid({ params, emptyText, columns = 'lg:grid-cols-4' }) {
  const { products, loading } = useProducts(params);

  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${columns} gap-6`}>
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="panel">
        <EmptyState title={emptyText} />
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${columns} gap-6`}>
      {products.slice(0, 8).map((p, i) => (
        <div key={p.id} className={`motion-rise seq-${Math.min(i + 1, 8)}`}>
          <ProductCard product={p} />
        </div>
      ))}
    </div>
  );
}

function Testimonials({ reviews, index }) {
  return (
    <section className="bg-sunken border-y border-line">
      <div className="shell py-20 md:py-28">
        <SectionHead index={index} title="Mijozlar fikri" subtitle="Platformadan foydalangan oʼquvchilarning baholari." />

        {reviews === null ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="panel p-6 flex flex-col gap-4">
                <Skeleton className="h-2.5 w-24" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
                <div className="border-t border-line pt-4 mt-2 flex gap-3">
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 6).map((review, i) => (
              <figure
                key={review.id}
                className={`motion-rise seq-${Math.min(i + 1, 8)} panel panel-lift p-6 flex flex-col`}
              >
                <div className="flex items-center gap-0.5 mb-5" aria-label={`Reyting: ${review.rating} / 5`}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      size={13}
                      strokeWidth={1.5}
                      className={s < review.rating ? 'fill-ink text-ink' : 'fill-none text-line-2'}
                      aria-hidden="true"
                    />
                  ))}
                </div>

                <blockquote className="flex-1 text-[15px] leading-relaxed text-ink-2">
                  {review.textContent}
                </blockquote>

                <figcaption className="mt-6 pt-5 border-t border-line flex items-center gap-3">
                  <span className="w-9 h-9 shrink-0 rounded-md border border-line bg-veil overflow-hidden flex items-center justify-center font-display text-xs font-semibold text-ink-2">
                    {review.customerImage ? (
                      <img src={review.customerImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      review.customerName?.[0]
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink truncate">{review.customerName}</span>
                    {review.product?.name && (
                      <span className="block font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3 truncate mt-0.5">
                        {review.product.name}
                      </span>
                    )}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FaqItem({ item, index }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-line">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`faq-panel-${index}`}
          className="w-full min-h-[44px] py-5 flex items-start gap-5 text-left group cursor-pointer"
        >
          <span className="t-index pt-1.5 shrink-0">{String(index + 1).padStart(2, '0')}</span>
          <span className="flex-1 t-heading text-[17px] text-ink group-hover:text-accent transition-colors duration-150">
            {item.q}
          </span>
          <span className="shrink-0 w-6 h-6 mt-0.5 flex items-center justify-center text-ink-3" aria-hidden="true">
            {open ? <Minus size={16} /> : <Plus size={16} />}
          </span>
        </button>
      </h3>
      {open && (
        <div id={`faq-panel-${index}`} className="motion-reveal pb-6 pl-11 pr-11">
          <p className="text-[15px] leading-relaxed text-ink-3">{item.a}</p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const [reviews, setReviews] = useState(null);

  useEffect(() => {
    track('PAGE_VIEW');
    api
      .get('/products/reviews/highlights')
      .then((res) => setReviews(res.data))
      .catch(() => setReviews([]));
  }, []);

  // Testimonials only render when there is something to show, so the editorial
  // section numbering has to close the gap rather than skip a number.
  const showTestimonials = reviews === null || reviews.length > 0;
  const faqIndex = showTestimonials ? '05' : '04';

  return (
    <div>
      {/* ── 00 Hero ─────────────────────────────────────────────────────── */}
      <section className="shell pt-16 pb-20 md:pt-28 md:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-10 md:gap-8">
          <div className="md:col-span-9">
            <span className="t-kicker t-kicker-accent motion-rise">Sotuv platformasi</span>
            <h1 className="motion-rise seq-1 t-display text-[44px] sm:text-[64px] lg:text-[80px] text-ink mt-8">
              Bilim va mahsulotlaringizni
              <br className="hidden sm:block" />
              <span className="text-accent"> onlayn soting</span>
            </h1>
          </div>

          <div className="md:col-span-3 md:pt-4 flex md:justify-end">
            <p className="motion-rise seq-2 font-mono text-[11px] uppercase tracking-[0.12em] leading-loose text-ink-3 md:text-right">
              Kurslar
              <br />
              Video darslar
              <br />
              Raqamli mahsulotlar
            </p>
          </div>
        </div>

        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-12 gap-y-8 md:gap-8 items-end">
          <div className="md:col-span-6">
            <p className="motion-rise seq-3 text-[17px] md:text-lg leading-relaxed text-ink-2 max-w-xl">
              Mahsulotlaringizni namunalar bilan namoyish qiling, mijozlaringiz esa bir necha bosqichda
              buyurtma bersin — hammasi bitta platformada.
            </p>
          </div>
          <div className="md:col-span-6 md:flex md:justify-end">
            <div className="motion-rise seq-4 flex flex-col sm:flex-row gap-3">
              <Link to="/katalog" className="btn btn-lg btn-accent">
                Katalogni koʼrish
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <a href="#faq" className="btn btn-lg btn-outline">
                Savollar
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Inverted pillar band ─────────────────────────────────────────── */}
      <section className="band-dark">
        <div className="shell py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/12 border border-white/12 rounded-lg overflow-hidden">
            {PILLARS.map((p, i) => (
              <div key={p.k} className="bg-obsidian p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/50">{p.k}</span>
                  <span className="font-mono text-[11px] text-white/30 figures">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="t-heading text-xl text-white">{p.v}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 01 Bestsellers ──────────────────────────────────────────────── */}
      <section className="shell py-20 md:py-28">
        <SectionHead
          index="01"
          title="Mashhur kurslar"
          subtitle="Eng koʼp sotilgan mahsulotlar."
          action={
            <Link
              to="/katalog?sort=bestseller"
              className="link shrink-0 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink hover:text-accent"
            >
              Barchasi
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          }
        />
        <ProductGrid params={{ bestseller: 'true' }} emptyText="Hozircha mashhur mahsulot yoʼq" />
      </section>

      {/* ── 02 New ──────────────────────────────────────────────────────── */}
      <section className="shell pb-20 md:pb-28">
        <SectionHead
          index="02"
          title="Yangi mahsulotlar"
          subtitle="Yaqinda qoʼshilgan takliflar."
          action={
            <Link
              to="/katalog"
              className="link shrink-0 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink hover:text-accent"
            >
              Katalog
              <ArrowRight size={13} aria-hidden="true" />
            </Link>
          }
        />
        <ProductGrid params={{ isNew: 'true' }} emptyText="Hozircha yangi mahsulot yoʼq" />
      </section>

      {/* ── 03 Featured ─────────────────────────────────────────────────── */}
      <section className="shell pb-20 md:pb-28">
        <SectionHead index="03" title="Maxsus takliflar" subtitle="Cheklangan muddatli chegirmalar." />
        <ProductGrid params={{ featured: 'true' }} emptyText="Hozircha maxsus taklif yoʼq" />
      </section>

      {/* ── 04 Testimonials (only when reviews exist) ───────────────────── */}
      {showTestimonials && <Testimonials reviews={reviews} index="04" />}

      {/* ── FAQ + lead capture ──────────────────────────────────────────── */}
      <section id="faq" className="shell py-20 md:py-28 scroll-mt-24">
        <SectionHead index={faqIndex} title="Savol-javob" subtitle="Eng koʼp beriladigan savollarga javoblar." />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7">
            <div className="border-t border-line">
              {FAQ.map((item, i) => (
                <FaqItem key={i} item={item} index={i} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <LeadCaptureForm title="Bepul material va yangiliklar" />
          </div>
        </div>
      </section>
    </div>
  );
}
