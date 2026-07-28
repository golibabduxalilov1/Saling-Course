import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowRight, Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

const NAV = [
  { to: '/', label: 'Bosh sahifa', end: true },
  { to: '/katalog', label: 'Katalog' },
];

function Wordmark() {
  return (
    <span className="font-display text-[19px] font-bold tracking-[-0.05em] text-ink leading-none">
      SOTUV
      <span className="font-mono text-[10px] font-medium tracking-[0.12em] text-accent align-super ml-0.5">
        UZ
      </span>
    </span>
  );
}

export default function Header() {
  const { count } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/katalog?search=${encodeURIComponent(search)}`);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-canvas/92 backdrop-blur-md border-b border-line">
      <div className="shell">
        <div className="h-16 md:h-[72px] flex items-center gap-6">
          <Link
            to="/"
            className="shrink-0 rounded-xs"
            aria-label="Sotuv.uz — bosh sahifa"
            onClick={() => setMenuOpen(false)}
          >
            <Wordmark />
          </Link>

          <span className="hidden md:block w-px h-6 bg-line" aria-hidden="true" />

          <nav className="hidden md:flex items-center gap-7" aria-label="Asosiy">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `font-mono text-[11px] font-medium uppercase tracking-[0.14em] transition-colors duration-150 ${
                    isActive ? 'text-ink' : 'text-ink-3 hover:text-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <form onSubmit={submitSearch} role="search" className="hidden lg:block flex-1 max-w-sm ml-auto">
            <label htmlFor="hdr-search" className="sr-only">
              Mahsulot qidirish
            </label>
            <div className="relative">
              <Search
                size={15}
                strokeWidth={2}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="hdr-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Qidirish"
                className="field pl-9 h-10 min-h-10 text-sm bg-sunken"
              />
            </div>
          </form>

          <div className="flex items-center gap-1 ml-auto lg:ml-0">
            <Link
              to="/savat"
              className="icon-btn relative"
              aria-label={count > 0 ? `Savat, ${count} ta mahsulot` : 'Savat, boʼsh'}
            >
              <ShoppingBag size={19} strokeWidth={1.75} aria-hidden="true" />
              {count > 0 && (
                <span className="motion-pop absolute top-1.5 right-1.5 min-w-[17px] h-[17px] px-1 rounded-xs bg-accent text-white font-mono text-[10px] font-semibold leading-[17px] text-center figures">
                  {count}
                </span>
              )}
            </Link>

            <button
              type="button"
              className="icon-btn md:hidden"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
            >
              {menuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div id="mobile-nav" className="motion-reveal md:hidden border-t border-line bg-canvas">
          <div className="shell py-6 flex flex-col gap-6">
            <form onSubmit={submitSearch} role="search">
              <label htmlFor="mob-search" className="field-label">
                Qidirish
              </label>
              <div className="flex gap-2">
                <input
                  id="mob-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Mahsulot nomi"
                  className="field"
                />
                <button type="submit" className="btn btn-solid px-4 shrink-0" aria-label="Qidirish">
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </form>

            <nav className="flex flex-col" aria-label="Mobil navigatsiya">
              {NAV.map((item, i) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-between py-4 border-b border-line"
                >
                  <span className="flex items-center gap-4">
                    <span className="t-index">{String(i + 1).padStart(2, '0')}</span>
                    <span className="font-display text-lg font-medium tracking-[-0.02em] text-ink">
                      {item.label}
                    </span>
                  </span>
                  <ArrowRight size={16} className="text-ink-3" aria-hidden="true" />
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
