import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, Search, ShoppingCart, X } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { count } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/katalog?search=${encodeURIComponent(search)}`);
    setMobileOpen(false);
  };

  return (
    <header className="bg-navy-950 text-white sticky top-0 z-40">
      <div className="container-page flex items-center gap-4 py-3">
        <Link to="/" className="font-extrabold text-xl shrink-0 tracking-tight">
          Sotuv<span className="text-gold-400">.uz</span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
          <Link to="/katalog" className="text-white/80 hover:text-gold-400 transition-colors">
            Katalog
          </Link>
        </nav>

        <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-md ml-auto relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mahsulot qidirish..."
            aria-label="Mahsulot qidirish"
            className="w-full rounded-lg bg-white/10 border border-white/10 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:bg-white/15 transition-colors"
          />
        </form>

        <Link
          to="/savat"
          className="relative btn-icon !text-white hover:!bg-white/10 ml-auto md:ml-0 shrink-0"
          aria-label={`Savat, ${count} ta mahsulot`}
        >
          <ShoppingCart size={20} />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-gold-500 text-navy-950 text-[11px] font-bold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center">
              {count}
            </span>
          )}
        </Link>

        <button
          type="button"
          className="btn-icon !text-white hover:!bg-white/10 md:hidden shrink-0"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Menyuni yopish' : 'Menyuni ochish'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-navy-950">
          <div className="container-page py-4 flex flex-col gap-4">
            <form onSubmit={submitSearch} className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" aria-hidden="true" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Mahsulot qidirish..."
                aria-label="Mahsulot qidirish"
                className="w-full rounded-lg bg-white/10 border border-white/10 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </form>
            <Link
              to="/katalog"
              className="text-white/90 font-medium py-2"
              onClick={() => setMobileOpen(false)}
            >
              Katalog
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
