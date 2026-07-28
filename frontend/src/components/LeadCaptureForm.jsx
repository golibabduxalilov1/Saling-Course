import { useState } from 'react';
import { CircleCheck, Gift, Send } from 'lucide-react';
import { api } from '../api/client';
import { getTrackingPayload } from '../utils/utm';

export default function LeadCaptureForm({ productId, title = "Bepul material olish" }) {
  const [form, setForm] = useState({ name: '', phone: '', telegramUsername: '', email: '' });
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
      setForm({ name: '', phone: '', telegramUsername: '', email: '' });
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return (
      <div className="card p-6 text-center flex flex-col items-center gap-2">
        <CircleCheck size={28} className="text-success" aria-hidden="true" />
        <p className="font-semibold text-ink">So'rovingiz qabul qilindi!</p>
        <p className="text-sm text-ink-muted">Tez orada siz bilan bog'lanamiz.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-3.5">
      <h3 className="font-bold text-ink flex items-center gap-2">
        <Gift size={18} className="text-gold-600" aria-hidden="true" />
        {title}
      </h3>
      <div>
        <label htmlFor="lead-name" className="form-label">
          Ismingiz<span className="required">*</span>
        </label>
        <input
          id="lead-name"
          className="input-field"
          name="name"
          autoComplete="name"
          placeholder="Ismingizni kiriting"
          value={form.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="lead-phone" className="form-label">
          Telefon raqami<span className="required">*</span>
        </label>
        <input
          id="lead-phone"
          className="input-field"
          name="phone"
          type="tel"
          autoComplete="tel"
          placeholder="+998 90 123 45 67"
          value={form.phone}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="lead-telegram" className="form-label">
          Telegram username <span className="text-ink-muted font-normal">(ixtiyoriy)</span>
        </label>
        <input
          id="lead-telegram"
          className="input-field"
          name="telegramUsername"
          placeholder="@username"
          value={form.telegramUsername}
          onChange={handleChange}
        />
      </div>
      <button type="submit" className="btn-accent mt-1" disabled={status === 'sending'}>
        {status === 'sending' ? (
          'Yuborilmoqda...'
        ) : (
          <>
            <Send size={16} aria-hidden="true" />
            Bepul olish
          </>
        )}
      </button>
      {status === 'error' && <p className="form-error">Xatolik yuz berdi, qayta urinib ko'ring.</p>}
    </form>
  );
}
