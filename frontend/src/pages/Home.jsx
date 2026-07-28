import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowRight, ChevronDown, Clock, Gift, ShieldCheck, Sparkles } from 'lucide-react';
import { useProducts } from '../utils/useProducts';
import ProductCard from '../components/ProductCard';
import LeadCaptureForm from '../components/LeadCaptureForm';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import { track } from '../utils/track';

const FAQ = [
  { q: 'To\'lovni qanday amalga oshiraman?', a: 'Buyurtma bergandan so\'ng operatorimiz siz bilan bog\'lanib, to\'lov bo\'yicha yo\'riqnoma beradi.' },
  { q: 'Kursga qachon kirish beriladi?', a: 'To\'lov tasdiqlangandan so\'ng darhol kursga kirish huquqi beriladi.' },
  { q: 'Pulni qaytarib olish mumkinmi?', a: 'Har bir mahsulot sahifasidagi kafolat shartlariga muvofiq pul qaytarish mumkin.' },
];

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'Kafolatlangan sifat' },
  { icon: Clock, label: 'Tezkor xizmat ko\'rsatish' },
  { icon: Sparkles, label: 'Individual yondashuv' },
];

function Section({ title, children }) {
  return (
    <section className="container-page py-10">
      <h2 className="text-h2 text-2xl text-ink mb-5">{title}</h2>
      {children}
    </section>
  );
}

function ProductGrid({ params, emptyText }) {
  const { products, loading } = useProducts(params);
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (products.length === 0) return <EmptyState title={emptyText} />;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {products.slice(0, 8).map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export default function Home() {
  useEffect(() => {
    track('PAGE_VIEW');
  }, []);

  return (
    <div>
      <div className="bg-navy-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-navy-900 via-navy-950 to-navy-950" aria-hidden="true" />
        <div className="container-page py-16 md:py-24 text-center flex flex-col items-center gap-5 relative">
          <span className="eyebrow text-gold-400!">Sotuv Platformasi</span>
          <h1 className="text-display text-3xl md:text-5xl max-w-2xl">
            Bilim va mahsulotlaringizni onlayn soting
          </h1>
          <p className="text-white/80 max-w-xl text-base md:text-lg">
            Kurslar, video darslar va raqamli mahsulotlarni namunalar bilan namoyish qiling, mijozlaringiz bir necha
            bosqichda buyurtma bersin.
          </p>
          <Link to="/katalog" className="btn-accent mt-2">
            Katalogni ko'rish
            <ArrowRight size={18} aria-hidden="true" />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-6 text-sm text-white/70">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <span key={label} className="flex items-center gap-2">
                <Icon size={17} className="text-gold-400" aria-hidden="true" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <Section title="Mashhur kurslar">
        <ProductGrid params={{ bestseller: 'true' }} emptyText="Hozircha mashhur mahsulot yo'q" />
      </Section>

      <Section title="Yangi mahsulotlar">
        <ProductGrid params={{ isNew: 'true' }} emptyText="Hozircha yangi mahsulot yo'q" />
      </Section>

      <Section title="Maxsus takliflar va chegirmalar">
        <ProductGrid params={{ featured: 'true' }} emptyText="Hozircha maxsus taklif yo'q" />
      </Section>

      <section className="container-page py-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div>
          <h2 className="text-h2 text-2xl text-ink mb-5">Ko'p beriladigan savollar</h2>
          <div className="flex flex-col gap-3">
            {FAQ.map((item, idx) => (
              <details key={idx} className="card p-4 group [&_summary::-webkit-details-marker]:hidden">
                <summary className="font-semibold text-ink cursor-pointer list-none flex items-center justify-between gap-3">
                  {item.q}
                  <ChevronDown
                    size={18}
                    className="text-ink-muted shrink-0 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="text-sm text-ink-muted mt-2">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-5 md:hidden">
            <Gift size={20} className="text-gold-600" aria-hidden="true" />
            <h2 className="text-h2 text-2xl text-ink">Bepul material</h2>
          </div>
          <LeadCaptureForm title="Bepul material va yangiliklar oling" />
        </div>
      </section>
    </div>
  );
}
