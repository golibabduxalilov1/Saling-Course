import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BadgePercent,
  ChartNoAxesCombined,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  ShoppingBag,
  Tags,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', end: true, icon: LayoutDashboard },
  { to: '/admin/orders', label: 'Buyurtmalar', icon: ShoppingBag },
  { to: '/admin/products', label: 'Mahsulotlar', icon: Package },
  { to: '/admin/categories', label: 'Kategoriyalar', icon: Tags },
  { to: '/admin/customers', label: 'Mijozlar', icon: Users },
  { to: '/admin/promo-codes', label: 'Promo-kodlar', icon: BadgePercent },
  { to: '/admin/reviews', label: 'Sharhlar', icon: MessageSquare },
  { to: '/admin/leads', label: "Bepul so'rovlar", icon: UserPlus },
  { to: '/admin/abandoned-checkouts', label: 'Tugallanmagan buyurtmalar', icon: ShoppingBag },
  { to: '/admin/analytics', label: 'Analitika', icon: ChartNoAxesCombined },
];

function SidebarContent({ admin, onNavigate, onLogout }) {
  return (
    <>
      <div className="font-extrabold text-lg text-white mb-8 px-2 flex items-baseline gap-2">
        Sotuv<span className="text-gold-400">.uz</span>
        <span className="text-xs text-white/40 font-normal">admin</span>
      </div>
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-gold-500 text-navy-950' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <item.icon size={18} aria-hidden="true" className="shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 pt-3 mt-3">
        <p className="text-xs text-white/40 px-2 mb-2 truncate">{admin?.email}</p>
        <button onClick={onLogout} className="btn-ghost text-white/80! hover:text-white! hover:bg-white/10! w-full text-sm justify-start">
          <LogOut size={16} aria-hidden="true" />
          Chiqish
        </button>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const currentLabel = NAV_ITEMS.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  )?.label;

  return (
    <div className="min-h-dvh flex bg-ivory">
      <aside className="hidden lg:flex w-64 shrink-0 bg-navy-950 flex-col p-4">
        <SidebarContent admin={admin} onLogout={handleLogout} />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-950/50"
            onClick={() => setDrawerOpen(false)}
            role="presentation"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[80vw] bg-navy-950 flex flex-col p-4">
            <button
              type="button"
              className="btn-icon text-white/70! hover:bg-white/10! self-end mb-2"
              onClick={() => setDrawerOpen(false)}
              aria-label="Menyuni yopish"
            >
              <X size={20} />
            </button>
            <SidebarContent admin={admin} onNavigate={() => setDrawerOpen(false)} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="lg:hidden sticky top-0 z-30 bg-surface border-b border-border-soft flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            className="btn-icon"
            onClick={() => setDrawerOpen(true)}
            aria-label="Menyuni ochish"
            aria-expanded={drawerOpen}
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-ink truncate">{currentLabel || 'Admin'}</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
