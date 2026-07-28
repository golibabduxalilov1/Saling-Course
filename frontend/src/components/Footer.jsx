import { Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-white/70 mt-16">
      <div className="container-page py-12 grid grid-cols-1 md:grid-cols-3 gap-10 text-sm">
        <div>
          <div className="font-extrabold text-lg text-white mb-2">
            Sotuv<span className="text-gold-400">.uz</span>
          </div>
          <p>Onlayn kurslar va mahsulotlar sotish platformasi.</p>
        </div>
        <div>
          <div className="font-semibold text-white mb-3">Aloqa</div>
          <p className="flex items-center gap-2 mb-1.5">
            <Phone size={15} className="text-gold-400" aria-hidden="true" />
            +998 90 123 45 67
          </p>
          <p className="flex items-center gap-2">
            <Mail size={15} className="text-gold-400" aria-hidden="true" />
            info@sotuv.uz
          </p>
        </div>
        <div>
          <div className="font-semibold text-white mb-3">Ijtimoiy tarmoqlar</div>
          <div className="flex gap-4">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gold-400 transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              className="hover:text-gold-400 transition-colors"
            >
              Telegram
            </a>
          </div>
        </div>
      </div>
      <div className="text-center text-xs text-white/40 pb-6 border-t border-white/10 pt-6">
        © {new Date().getFullYear()} Sotuv.uz
      </div>
    </footer>
  );
}
