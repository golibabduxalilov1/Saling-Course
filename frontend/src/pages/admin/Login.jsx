import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LockKeyhole, Mail, ShieldCheck, TriangleAlert, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.error || 'Kirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ivory px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-6">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
            <ShieldCheck size={24} strokeWidth={1.75} />
          </span>
          <h1 className="text-h2 text-xl text-ink">Admin panelga kirish</h1>
          <p className="text-sm text-ink-muted text-center">
            Sotuv Platformasi boshqaruv paneliga xush kelibsiz
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 sm:p-8 flex flex-col gap-4" noValidate>
          <div>
            <label htmlFor="login-email" className="form-label">
              Email <span className="required">*</span>
            </label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
              <input
                id="login-email"
                className="input-field pl-10"
                type="email"
                autoComplete="username"
                placeholder="siz@kompaniya.uz"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="form-label">
              Parol <span className="required">*</span>
            </label>
            <div className="relative">
              <LockKeyhole size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
              <input
                id="login-password"
                className="input-field pl-10"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          {error && (
            <p className="form-error" role="alert">
              <TriangleAlert size={14} aria-hidden="true" />
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary w-full mt-1" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                Kirilmoqda...
              </>
            ) : (
              'Kirish'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
