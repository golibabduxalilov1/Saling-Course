import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, CircleAlert, Loader2, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import { formatMoney } from '../utils/format';
import { getTrackingPayload } from '../utils/utm';
import { track } from '../utils/track';

function Fieldset({ index, title, hint, children }) {
  return (
    <fieldset className="border-t border-ink pt-6">
      <legend className="sr-only">{title}</legend>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        <div className="md:col-span-4">
          <span className="t-index block mb-2">{index}</span>
          <h2 className="t-heading text-[17px] text-ink">{title}</h2>
          {hint && <p className="mt-2 text-sm text-ink-3 leading-relaxed">{hint}</p>}
        </div>
        <div className="md:col-span-8 flex flex-col gap-5">{children}</div>
      </div>
    </fieldset>
  );
}

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { items: cartItems, clearCart } = useCart();

  const buyNowItem = location.state?.buyNow;
  const items = useMemo(() => (buyNowItem ? [buyNowItem] : cartItems), [buyNowItem, cartItems]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0), [items]);

  const [form, setForm] = useState({
    customerName: '',
    customerLastName: '',
    phone: '',
    telegramUsername: '',
    comment: '',
  });
  const [promoInput, setPromoInput] = useState('');
  const [promo, setPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [abandonedSent, setAbandonedSent] = useState(false);

  useEffect(() => {
    track('CHECKOUT_START');
  }, []);

  useEffect(() => {
    if (items.length === 0) {
      navigate('/katalog');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoneBlur = () => {
    if (!form.phone || abandonedSent) return;
    const tracking = getTrackingPayload();
    api
      .post('/abandoned-checkout', {
        name: form.customerName,
        phone: form.phone,
        productId: items[0]?.productId,
        tariffId: items[0]?.tariffId,
        amount: subtotal,
        stage: 'checkout_form',
        utmSource: tracking.utmSource,
        utmMedium: tracking.utmMedium,
        utmCampaign: tracking.utmCampaign,
        utmContent: tracking.utmContent,
      })
      .then(() => setAbandonedSent(true))
      .catch(() => {});
  };

  const applyPromo = async () => {
    setPromoError('');
    if (!promoInput) return;
    try {
      const res = await api.post('/promo/validate', {
        code: promoInput,
        productIds: items.map((i) => i.productId),
        subtotal,
      });
      setPromo(res.data);
    } catch (err) {
      setPromo(null);
      setPromoError(err.response?.data?.error || 'Promo-kod yaroqsiz');
    }
  };

  const discountAmount = promo?.discountAmount || 0;
  const total = Math.max(0, subtotal - discountAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.phone) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const tracking = getTrackingPayload();
      const res = await api.post('/orders', {
        ...form,
        items: items.map((i) => ({ productId: i.productId, tariffId: i.tariffId, quantity: i.quantity })),
        promoCode: promo ? promo.code : undefined,
        ...tracking,
      });
      if (!buyNowItem) clearCart();
      navigate(`/buyurtma/${res.data.orderNumber}`);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Buyurtmani yuborishda xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="shell py-14 md:py-20">
      <span className="t-kicker t-kicker-accent">Rasmiylashtirish</span>
      <h1 className="t-display text-[40px] md:text-[56px] text-ink mt-6">Buyurtma berish</h1>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* ── Form ───────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 flex flex-col gap-14" noValidate>
          <Fieldset index="01" title="Shaxsiy maʼlumotlar" hint="Buyurtmani kim uchun rasmiylashtiryapmiz.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="field-label" htmlFor="co-name">
                  Ism<span className="req">*</span>
                </label>
                <input
                  id="co-name"
                  name="customerName"
                  className="field"
                  autoComplete="given-name"
                  placeholder="Ismingiz"
                  value={form.customerName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="field-label" htmlFor="co-lastname">
                  Familiya <span className="optional">(ixtiyoriy)</span>
                </label>
                <input
                  id="co-lastname"
                  name="customerLastName"
                  className="field"
                  autoComplete="family-name"
                  placeholder="Familiyangiz"
                  value={form.customerLastName}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Fieldset>

          <Fieldset index="02" title="Aloqa maʼlumotlari" hint="Operator shu maʼlumotlar orqali bogʼlanadi.">
            <div>
              <label className="field-label" htmlFor="co-phone">
                Telefon raqami<span className="req">*</span>
              </label>
              <input
                id="co-phone"
                name="phone"
                type="tel"
                className="field figures"
                autoComplete="tel"
                placeholder="+998 90 123 45 67"
                value={form.phone}
                onChange={handleChange}
                onBlur={handlePhoneBlur}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="field-label" htmlFor="co-telegram">
                  Telegram <span className="optional">(ixtiyoriy)</span>
                </label>
                <input
                  id="co-telegram"
                  name="telegramUsername"
                  className="field"
                  placeholder="@username"
                  value={form.telegramUsername}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Fieldset>

          <Fieldset index="03" title="Qoʼshimcha izoh" hint="Ixtiyoriy — savol yoki alohida talabingiz boʼlsa.">
            <div>
              <label className="field-label" htmlFor="co-comment">
                Izoh
              </label>
              <textarea
                id="co-comment"
                name="comment"
                className="field"
                rows={4}
                placeholder="Qoʼshimcha maʼlumot"
                value={form.comment}
                onChange={handleChange}
              />
            </div>
          </Fieldset>

          <div className="border-t border-ink pt-8">
            {submitError && (
              <p className="field-error mb-5" role="alert">
                <CircleAlert size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                {submitError}
              </p>
            )}

            <button type="submit" className="btn btn-lg btn-accent w-full sm:w-auto" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={17} className="motion-spin" aria-hidden="true" />
                  Yuborilmoqda
                </>
              ) : (
                <>
                  Buyurtma berish
                  <ArrowRight size={17} aria-hidden="true" />
                </>
              )}
            </button>

            <p className="mt-5 flex items-start gap-2 text-sm leading-relaxed text-ink-3 max-w-md">
              <ShieldCheck size={15} className="mt-0.5 shrink-0 text-positive" aria-hidden="true" />
              Buyurtma bergandan soʼng sotuvchi siz bilan bogʼlanadi va toʼlovni qabul qiladi.
            </p>
          </div>
        </form>

        {/* ── Summary ────────────────────────────────────────────────────── */}
        <aside className="lg:col-span-5 lg:sticky lg:top-28">
          <div className="panel p-6 md:p-8">
            <h2 className="t-kicker">Buyurtma tarkibi</h2>

            <ul className="mt-6 pt-6 border-t border-line flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.key || item.productId} className="flex justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-ink line-clamp-2">{item.productName}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3">
                      {item.tariffName ? `${item.tariffName} · ` : ''}
                      <span className="figures">{item.quantity} dona</span>
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-ink figures">
                    {formatMoney(item.unitPrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-6 border-t border-line">
              <label className="field-label" htmlFor="co-promo">
                Promo-kod
              </label>
              <div className="flex gap-2">
                <input
                  id="co-promo"
                  className={`field ${promoError ? 'field-invalid' : ''}`}
                  placeholder="Kodni kiriting"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  aria-invalid={!!promoError}
                  aria-describedby={promoError ? 'co-promo-error' : undefined}
                />
                <button type="button" className="btn btn-outline shrink-0" onClick={applyPromo}>
                  Qoʼllash
                </button>
              </div>
              {promoError && (
                <p className="field-error" id="co-promo-error" role="alert">
                  <CircleAlert size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                  {promoError}
                </p>
              )}
              {promo && (
                <p className="mt-2 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.1em] text-positive">
                  <Check size={13} aria-hidden="true" />
                  <span className="figures">−{formatMoney(promo.discountAmount)}</span>
                </p>
              )}
            </div>

            <dl className="mt-6 pt-6 border-t border-line flex flex-col gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-3">Mahsulotlar</dt>
                <dd className="text-ink figures">{formatMoney(subtotal)}</dd>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between gap-4 text-positive">
                  <dt>Chegirma</dt>
                  <dd className="figures">−{formatMoney(discountAmount)}</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 pt-6 border-t border-ink flex items-baseline justify-between gap-4">
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">Jami</span>
              <span className="t-display text-[28px] text-ink figures">{formatMoney(total)}</span>
            </div>
          </div>

          {!buyNowItem && (
            <Link
              to="/savat"
              className="link mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-3 hover:text-accent"
            >
              <ArrowLeft size={13} aria-hidden="true" />
              Savatga qaytish
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
