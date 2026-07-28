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
  ShoppingCart,
  Tags,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_GROUPS = [
  {
    heading: 'Umumiy',
    items: [
      { to: '/admin', label: 'Dashboard', end: true, icon: LayoutDashboard },
      { to: '/admin/analytics', label: 'Analitika', icon: ChartNoAxesCombined },
    ],
  },
  {
    heading: 'Sotuv',
    items: [
      { to: '/admin/orders', label: 'Buyurtmalar', icon: ShoppingBag },
      { to: '/admin/abandoned-checkouts', label: 'Tugallanmagan', icon: ShoppingCart },
      { to: '/admin/promo-codes', label: 'Promo-kodlar', icon: BadgePercent },
    ],
  },
  {
    heading: 'Katalog',
    items: [
      { to: '/admin/products', label: 'Mahsulotlar', icon: Package },
      { to: '/admin/categories', label: 'Kategoriyalar', icon: Tags },
      { to: '/admin/reviews', label: 'Sharhlar', icon: MessageSquare },
    ],
  },
  {
    heading: 'Mijozlar',
    items: [
      { to: '/admin/customers', label: 'Mijozlar', icon: Users },
      { to: '/admin/leads', label: "Bepul so'rovlar", icon: UserPlus },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

function Sidebar({ admin, onNavigate, onLogout }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-6 h-16 flex items-center border-b border-line shrink-0">
        <span className="font-display text-[17px] font-bold tracking-[-0.05em] text-ink leading-none">
          SOTUV
          <span className="font-mono text-[9px] font-medium tracking-[0.12em] text-accent align-super ml-0.5">
            UZ
          </span>
        </span>
        <span className="ml-3 pl-3 border-l border-line font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
          Admin
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6 flex flex-col gap-7" aria-label="Admin navigatsiya">
        {NAV_GROUPS.map((group) => (
          <div key={group.heading}>
            <h2 className="px-3 mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-ink-3">
              {group.heading}
            </h2>
            <ul className="flex flex-col">
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 pl-3 pr-3 min-h-[44px] rounded-md text-sm transition-colors duration-150 ${
                        isActive
                          ? 'bg-veil text-ink font-medium'
                          : 'text-ink-2 hover:bg-sunken hover:text-ink'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span
                            className="absolute left-0 top-2 bottom-2 w-0.5 rounded-xs bg-accent"
                            aria-hidden="true"
                          />
                        )}
                        <item.icon size={16} strokeWidth={1.75} className="shrink-0" aria-hidden="true" />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-line shrink-0">
        <p className="px-3 mb-2 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3 truncate">
          {admin?.email}
        </p>
        <button
          type="button"
          onClick={onLogout}
          className="w-full min-h-[44px] flex items-center gap-3 px-3 rounded-md text-sm text-ink-2 hover:bg-critical-tint hover:text-critical transition-colors duration-150 cursor-pointer"
        >
          <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
          Chiqish
        </button>
      </div>
    </div>
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

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const current = ALL_ITEMS.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );

  return (
    <div className="min-h-dvh flex bg-sunken">
      <aside className="hidden lg:flex w-[260px] shrink-0 bg-panel border-r border-line fixed inset-y-0 left-0">
        <Sidebar admin={admin} onLogout={handleLogout} />
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="motion-reveal absolute inset-0 bg-obsidian/50"
            onClick={() => setDrawerOpen(false)}
            role="presentation"
          />
          <aside
            className="motion-drawer absolute inset-y-0 left-0 w-[280px] max-w-[85vw] bg-panel border-r border-line shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Navigatsiya menyusi"
          >
            <button
              type="button"
              className="icon-btn absolute top-2.5 right-2"
              onClick={() => setDrawerOpen(false)}
              aria-label="Menyuni yopish"
            >
              <X size={18} aria-hidden="true" />
            </button>
            <Sidebar admin={admin} onNavigate={() => setDrawerOpen(false)} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 lg:ml-[260px] flex flex-col">
        <header className="lg:hidden sticky top-0 z-30 h-16 bg-panel border-b border-line flex items-center gap-2 px-3 shrink-0">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setDrawerOpen(true)}
            aria-label="Menyuni ochish"
            aria-expanded={drawerOpen}
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink truncate">
            {current?.label || 'Admin'}
          </span>
        </header>

        <main className="flex-1 min-w-0 px-4 py-6 sm:px-8 sm:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
