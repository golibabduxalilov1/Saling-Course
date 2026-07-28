import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { api } from '../api/client';
import { useProducts } from '../utils/useProducts';
import ProductCard, { TYPE_LABELS } from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import { track } from '../utils/track';

const SORTS = [
  { value: '', label: 'Eng yangi' },
  { value: 'popular', label: 'Eng mashhur' },
  { value: 'bestseller', label: "Eng ko'p sotilgan" },
  { value: 'price_asc', label: 'Narx: arzondan qimmatga' },
  { value: 'price_desc', label: 'Narx: qimmatdan arzonga' },
];

const FILTER_KEYS = ['category', 'type', 'search', 'sort'];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    track('PAGE_VIEW');
    api.get('/categories').then((res) => setCategories(res.data));
  }, []);

  const params = {
    category: searchParams.get('category') || undefined,
    type: searchParams.get('type') || undefined,
    search: searchParams.get('search') || undefined,
    sort: searchParams.get('sort') || undefined,
  };

  const { products, loading } = useProducts(params);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams(new URLSearchParams());

  const activeCount = FILTER_KEYS.filter((k) => searchParams.get(k)).length;

  const filterRail = (
    <div className="flex flex-col">
      <div className="pb-6 border-b border-line">
        <label className="field-label" htmlFor="flt-search">
          Qidirish
        </label>
        <div className="relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="flt-search"
            type="search"
            className="field pl-9"
            placeholder="Mahsulot nomi"
            defaultValue={searchParams.get('search') || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>
      </div>

      <div className="py-6 border-b border-line">
        <label className="field-label" htmlFor="flt-category">
          Kategoriya
        </label>
        <select
          id="flt-category"
          className="field pick"
          value={searchParams.get('category') || ''}
          onChange={(e) => updateFilter('category', e.target.value)}
        >
          <option value="">Barchasi</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="py-6 border-b border-line">
        <label className="field-label" htmlFor="flt-type">
          Mahsulot turi
        </label>
        <select
          id="flt-type"
          className="field pick"
          value={searchParams.get('type') || ''}
          onChange={(e) => updateFilter('type', e.target.value)}
        >
          <option value="">Barchasi</option>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="py-6 border-b border-line">
        <label className="field-label" htmlFor="flt-sort">
          Saralash
        </label>
        <select
          id="flt-sort"
          className="field pick"
          value={searchParams.get('sort') || ''}
          onChange={(e) => updateFilter('sort', e.target.value)}
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {activeCount > 0 && (
        <button type="button" onClick={clearAll} className="btn btn-quiet btn-sm mt-6 self-start">
          <X size={14} aria-hidden="true" />
          Filtrlarni tozalash ({activeCount})
        </button>
      )}
    </div>
  );

  return (
    <div>
      <div className="shell pt-14 pb-10 md:pt-20 md:pb-14">
        <span className="t-kicker t-kicker-accent">Katalog</span>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-y-4 md:gap-8 items-end">
          <h1 className="md:col-span-7 t-display text-[40px] md:text-[60px] text-ink">Mahsulotlar</h1>
          <p className="md:col-span-5 text-[15px] leading-relaxed text-ink-3 md:text-right">
            Barcha kurslar, videokurslar va raqamli materiallarni bir joydan toping.
          </p>
        </div>
      </div>

      <div className="shell pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Filter rail — desktop */}
          <aside className="hidden lg:block lg:col-span-3 lg:sticky lg:top-28">
            <h2 className="t-kicker pb-6 border-t border-ink pt-5">Filtrlar</h2>
            {filterRail}
          </aside>

          {/* Filter trigger — mobile */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="btn btn-outline w-full"
              aria-expanded={filtersOpen}
              aria-controls="mobile-filters"
            >
              <SlidersHorizontal size={16} aria-hidden="true" />
              Filtrlar
              {activeCount > 0 && <span className="tag tag-accent figures ml-1">{activeCount}</span>}
            </button>
            {filtersOpen && (
              <div id="mobile-filters" className="motion-reveal mt-6 pt-2 border-t border-ink">
                {filterRail}
              </div>
            )}
          </div>

          <div className="lg:col-span-9">
            <div className="flex items-center justify-between gap-4 border-t border-ink pt-5 pb-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3">
                {loading ? 'Yuklanmoqda' : <span className="figures">{products.length} ta mahsulot</span>}
              </p>
              {activeCount > 0 && !loading && (
                <span className="tag tag-neutral">Filtr qoʼllanildi</span>
              )}
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="panel">
                <EmptyState
                  icon={SearchX}
                  title="Hech narsa topilmadi"
                  description="Boshqa kalit soʼz yoki filtr bilan qayta urinib koʼring."
                  action={
                    activeCount > 0 && (
                      <button type="button" onClick={clearAll} className="btn btn-outline">
                        Filtrlarni tozalash
                      </button>
                    )
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((p, i) => (
                  <div key={p.id} className={`motion-rise seq-${Math.min((i % 8) + 1, 8)}`}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
