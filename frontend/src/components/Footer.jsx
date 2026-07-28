import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, Phone } from 'lucide-react';

const COLUMNS = [
  {
    heading: 'Navigatsiya',
    links: [
      { label: 'Bosh sahifa', to: '/' },
      { label: 'Katalog', to: '/katalog' },
      { label: 'Savat', to: '/savat' },
    ],
  },
];

const SOCIALS = [
  { label: 'Telegram', href: 'https://t.me' },
  { label: 'Instagram', href: 'https://instagram.com' },
  { label: 'YouTube', href: 'https://youtube.com' },
];

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink bg-canvas">
      <div className="shell">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-12 pt-16 pb-12">
          <div className="md:col-span-4">
            <Link to="/" className="inline-block rounded-xs">
              <span className="font-display text-3xl font-bold tracking-[-0.05em] text-ink leading-none">
                SOTUV
                <span className="font-mono text-xs font-medium tracking-[0.12em] text-accent align-super ml-1">
                  UZ
                </span>
              </span>
            </Link>
            <p className="mt-6 text-[15px] leading-relaxed text-ink-2 max-w-xs">
              Kurslar, video darslar va raqamli mahsulotlarni onlayn sotish uchun ishonchli platforma.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading} className="md:col-span-2">
              <h2 className="t-kicker mb-6">{col.heading}</h2>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="link text-[15px] text-ink-2 hover:text-accent">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="md:col-span-3">
            <h2 className="t-kicker mb-6">Aloqa</h2>
            <ul className="flex flex-col gap-3 text-[15px]">
              <li>
                <a href="tel:+998901234567" className="link text-ink-2 hover:text-accent inline-flex items-center gap-2">
                  <Phone size={14} strokeWidth={1.75} className="text-ink-3 shrink-0" aria-hidden="true" />
                  <span className="figures whitespace-nowrap">+998 90 123 45 67</span>
                </a>
              </li>
              <li>
                <a href="mailto:info@sotuv.uz" className="link text-ink-2 hover:text-accent inline-flex items-center gap-2">
                  <Mail size={14} strokeWidth={1.75} className="text-ink-3 shrink-0" aria-hidden="true" />
                  info@sotuv.uz
                </a>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h2 className="t-kicker mb-6">Ijtimoiy</h2>
            <ul className="flex flex-col gap-3 text-[15px]">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="link text-ink-2 hover:text-accent inline-flex items-center gap-1 group"
                  >
                    {s.label}
                    <ArrowUpRight
                      size={13}
                      className="text-ink-3 transition-transform duration-150 group-hover:-translate-y-px group-hover:translate-x-px"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-line py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-ink-3">
            © {new Date().getFullYear()} Sotuv.uz
          </p>
          <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-ink-3">
            Barcha huquqlar himoyalangan
          </p>
        </div>
      </div>
    </footer>
  );
}
