import { useState } from 'react';
import { ArrowRight, Check, CircleAlert, Loader2 } from 'lucide-react';
import { api } from '../api/client';
import { getTrackingPayload } from '../utils/utm';

export default function LeadCaptureForm({ productId, title = 'Bepul material olish' }) {
  const [form, setForm] = useState({ name: '', phone: '', telegramUsername: '' });
  const [status, setStatus] = useState('idle');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setStatus('sending');
    try {
      const tracking = getTrackingPayload();
      await api.post('/leads', { ...form, productId, ...tracking });
      setStatus('done');
      setForm({ name: '', phone: '', telegramUsername: '' });
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="motion-pop panel p-8 flex flex-col items-start" role="status">
        <span className="w-10 h-10 flex items-center justify-center rounded-md bg-positive-tint border border-positive/25 text-positive">
          <Check size={18} strokeWidth={2.25} aria-hidden="true" />
        </span>
        <p className="t-heading text-lg text-ink mt-5">Soʼrovingiz qabul qilindi</p>
        <p className="mt-2 text-sm text-ink-3 leading-relaxed">
          Tez orada operatorimiz siz bilan bogʼlanadi.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="panel p-6 md:p-8" noValidate>
      <span className="t-kicker t-kicker-accent">Bepul</span>
      <h3 className="t-title text-2xl text-ink mt-4">{title}</h3>
      <p className="mt-3 text-sm text-ink-3 leading-relaxed">
        Maʼlumotlaringizni qoldiring — materialni yuboramiz va savollaringizga javob beramiz.
      </p>

      <div className="mt-8 pt-8 border-t border-line flex flex-col gap-5">
        <div>
          <label htmlFor="lead-name" className="field-label">
            Ismingiz<span className="req">*</span>
          </label>
          <input
            id="lead-name"
            name="name"
            className="field"
            autoComplete="name"
            placeholder="Ismingizni kiriting"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="lead-phone" className="field-label">
            Telefon raqami<span className="req">*</span>
          </label>
          <input
            id="lead-phone"
            name="phone"
            type="tel"
            className="field figures"
            autoComplete="tel"
            placeholder="+998 90 123 45 67"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="lead-telegram" className="field-label">
            Telegram <span className="optional">(ixtiyoriy)</span>
          </label>
          <input
            id="lead-telegram"
            name="telegramUsername"
            className="field"
            placeholder="@username"
            value={form.telegramUsername}
            onChange={handleChange}
          />
        </div>

        {status === 'error' && (
          <p className="field-error" role="alert">
            <CircleAlert size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            Xatolik yuz berdi. Iltimos, qayta urinib koʼring.
          </p>
        )}

        <button type="submit" className="btn btn-accent w-full mt-1" disabled={status === 'sending'}>
          {status === 'sending' ? (
            <>
              <Loader2 size={16} className="motion-spin" aria-hidden="true" />
              Yuborilmoqda
            </>
          ) : (
            <>
              Bepul olish
              <ArrowRight size={16} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
