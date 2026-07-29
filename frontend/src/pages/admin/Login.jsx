import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Loader2, TriangleAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.phone, form.password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh grid grid-cols-1 lg:grid-cols-2 bg-canvas">
      {/* ── Brand panel ─────────────────────────────────────────────────── */}
      <div className="band-dark hidden lg:flex flex-col justify-between p-12 xl:p-16">
        <span className="font-display text-xl font-bold tracking-[-0.05em] text-white leading-none">
          SOTUV
          <span className="font-mono text-[10px] font-medium tracking-[0.12em] text-accent align-super ml-1">
            UZ
          </span>
        </span>

        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">
            Boshqaruv paneli
          </span>
          <p className="t-display text-[44px] xl:text-[54px] text-white mt-6 max-w-md">
            Buyurtmalar, katalog va analitika — bitta joyda.
          </p>
        </div>

        <ul className="flex flex-col gap-3 border-t border-white/12 pt-8">
          {['Buyurtmalarni kuzatish', 'Katalogni boshqarish', 'Sotuv voronkasini tahlil qilish'].map((t, i) => (
            <li key={t} className="flex items-center gap-4">
              <span className="font-mono text-[11px] text-white/30 figures">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-sm text-white/70">{t}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Form panel ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[400px] motion-rise">
          <span className="lg:hidden font-display text-xl font-bold tracking-[-0.05em] text-ink leading-none block mb-10">
            SOTUV
            <span className="font-mono text-[10px] font-medium tracking-[0.12em] text-accent align-super ml-1">
              UZ
            </span>
          </span>

          <span className="t-kicker t-kicker-accent">Kirish</span>
          <h1 className="t-title text-[32px] text-ink mt-4">Admin panel</h1>
          <p className="mt-3 text-sm text-ink-3 leading-relaxed">
            Davom etish uchun hisob maʼlumotlaringizni kiriting.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 pt-10 border-t border-line flex flex-col gap-5" noValidate>
            <div>
              <label htmlFor="login-phone" className="field-label">
                Telefon raqami<span className="req">*</span>
              </label>
              <input
                id="login-phone"
                type="tel"
                className={`field figures ${error ? 'field-invalid' : ''}`}
                autoComplete="tel"
                placeholder="+998 90 123 45 67"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                aria-invalid={!!error}
                required
              />
            </div>

            <div>
              <label htmlFor="login-password" className="field-label">
                Parol<span className="req">*</span>
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`field pr-12 ${error ? 'field-invalid' : ''}`}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'login-error' : undefined}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-md text-ink-3 hover:text-ink hover:bg-veil transition-colors duration-150 cursor-pointer"
                  aria-label={showPassword ? 'Parolni yashirish' : "Parolni ko'rsatish"}
                >
                  {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="field-error" id="login-error" role="alert">
                <TriangleAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                {error}
              </p>
            )}

            <button type="submit" className="btn btn-lg btn-accent w-full mt-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={17} className="motion-spin" aria-hidden="true" />
                  Kirilmoqda
                </>
              ) : (
                <>
                  Kirish
                  <ArrowRight size={17} aria-hidden="true" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
