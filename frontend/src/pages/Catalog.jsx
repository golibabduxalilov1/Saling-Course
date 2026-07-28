import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SearchX } from 'lucide-react';
import { api } from '../api/client';
import { useProducts } from '../utils/useProducts';
import ProductCard from '../components/ProductCard';
import { TYPE_LABELS } from '../components/ProductCard';
import EmptyState from '../components/EmptyState';
import { CardSkeleton } from '../components/Skeleton';
import { track } from '../utils/track';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);

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

  return (
    <div className="container-page py-8">
      <h1 className="text-h2 text-2xl text-ink mb-6">Mahsulotlar katalogi</h1>

      <div className="card p-4 mb-6 flex flex-col lg:flex-row lg:items-end gap-3">
        <div className="flex-1 min-w-0">
          <label className="form-label" htmlFor="filter-search">Qidirish</label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" aria-hidden="true" />
            <input
              id="filter-search"
              type="search"
              className="input-field pl-10"
              placeholder="Mahsulot qidirish..."
              defaultValue={searchParams.get('search') || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>
        </div>

        <div className="w-full lg:w-48">
          <label className="form-label" htmlFor="filter-category">Kategoriya</label>
          <select
            id="filter-category"
            className="input-field text-sm"
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

        <div className="w-full lg:w-48">
          <label className="form-label" htmlFor="filter-type">Mahsulot turi</label>
          <select
            id="filter-type"
            className="input-field text-sm"
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

        <div className="w-full lg:w-56">
          <label className="form-label" htmlFor="filter-sort">Saralash</label>
          <select
            id="filter-sort"
            className="input-field text-sm"
            value={searchParams.get('sort') || ''}
            onChange={(e) => updateFilter('sort', e.target.value)}
          >
            <option value="">Eng yangi</option>
            <option value="popular">Eng mashhur</option>
            <option value="bestseller">Eng ko'p sotilgan</option>
            <option value="price_asc">Narx: arzondan qimmatga</option>
            <option value="price_desc">Narx: qimmatdan arzonga</option>
          </select>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="Hech narsa topilmadi"
            description="Boshqa kalit so'z yoki filtr bilan qayta urinib ko'ring."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
