import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CircleAlert, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { api } from '../api/client';
import { formatMoney } from '../utils/format';
import { getTrackingPayload } from '../utils/utm';
import { track } from '../utils/track';

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
    email: '',
    region: '',
    address: '',
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
    <div className="container-page py-8">
      <h1 className="text-h2 text-2xl text-ink mb-6">Buyurtmani rasmiylashtirish</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-5 card p-5">
          <div>
            <h3 className="font-bold text-ink mb-3">Shaxsiy ma'lumotlar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="checkout-name">
                  Ism<span className="required">*</span>
                </label>
                <input
                  id="checkout-name"
                  className="input-field"
                  name="customerName"
                  placeholder="Ismingiz"
                  value={form.customerName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="form-label" htmlFor="checkout-lastname">
                  Familiya
                </label>
                <input
                  id="checkout-lastname"
                  className="input-field"
                  name="customerLastName"
                  placeholder="Familiyangiz"
                  value={form.customerLastName}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-ink mb-3">Aloqa ma'lumotlari</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="form-label" htmlFor="checkout-phone">
                  Telefon raqami<span className="required">*</span>
                </label>
                <input
                  id="checkout-phone"
                  className="input-field"
                  name="phone"
                  placeholder="+998 90 123 45 67"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handlePhoneBlur}
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label" htmlFor="checkout-telegram">
                    Telegram username
                  </label>
                  <input
                    id="checkout-telegram"
                    className="input-field"
                    name="telegramUsername"
                    placeholder="@username"
                    value={form.telegramUsername}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="checkout-email">
                    Elektron pochta
                  </label>
                  <input
                    id="checkout-email"
                    className="input-field"
                    name="email"
                    placeholder="email@misol.uz"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-ink mb-3">Yetkazib berish</h3>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label" htmlFor="checkout-region">
                    Viloyat / shahar
                  </label>
                  <input
                    id="checkout-region"
                    className="input-field"
                    name="region"
                    placeholder="Masalan, Toshkent"
                    value={form.region}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="form-label" htmlFor="checkout-address">
                    Manzil <span className="text-ink-muted font-normal">(jismoniy mahsulot uchun)</span>
                  </label>
                  <input
                    id="checkout-address"
                    className="input-field"
                    name="address"
                    placeholder="Ko'cha, uy"
                    value={form.address}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="form-label" htmlFor="checkout-comment">
                  Izoh
                </label>
                <textarea
                  id="checkout-comment"
                  className="input-field"
                  name="comment"
                  placeholder="Qo'shimcha izoh"
                  rows={3}
                  value={form.comment}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {submitError && (
            <p className="form-error">
              <CircleAlert size={15} aria-hidden="true" />
              {submitError}
            </p>
          )}

          <button type="submit" className="btn-accent w-full" disabled={submitting}>
            {submitting ? 'Yuborilmoqda...' : 'Buyurtma berish'}
          </button>
          <p className="text-xs text-ink-muted text-center flex items-center justify-center gap-1.5">
            <ShieldCheck size={15} className="text-emerald-500 shrink-0" aria-hidden="true" />
            Buyurtma bergandan so'ng sotuvchi siz bilan bog'lanadi va to'lovni qabul qiladi.
          </p>
        </form>

        <div className="w-full lg:w-80 shrink-0 flex flex-col gap-4">
          <div className="card p-5 flex flex-col gap-3 sticky top-20">
            <h3 className="font-bold text-ink">Buyurtma tarkibi</h3>
            {items.map((item) => (
              <div key={item.key || item.productId} className="flex justify-between text-sm gap-2">
                <div>
                  <p className="font-medium text-ink line-clamp-1">{item.productName}</p>
                  {item.tariffName && <p className="text-ink-muted text-xs">{item.tariffName}</p>}
                </div>
                <span className="shrink-0 text-ink tabular-nums">{formatMoney(item.unitPrice * item.quantity)}</span>
              </div>
            ))}

            <div className="border-t border-border-soft pt-3 flex gap-2">
              <input
                className="input-field text-sm"
                placeholder="Promo-kod"
                aria-label="Promo-kod"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
              />
              <button type="button" className="btn-secondary text-sm shrink-0" onClick={applyPromo}>
                Qo'llash
              </button>
            </div>
            {promoError && <p className="form-error">{promoError}</p>}
            {promo && (
              <p className="text-sm text-success flex items-center gap-1.5">
                <Tag size={14} aria-hidden="true" />
                Promo-kod qo'llandi: -{formatMoney(promo.discountAmount)}
              </p>
            )}

            <div className="border-t border-border-soft pt-3 flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Mahsulotlar</span>
                <span className="text-ink tabular-nums">{formatMoney(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Chegirma</span>
                  <span className="tabular-nums">-{formatMoney(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base text-ink mt-1 pt-1.5 border-t border-border-soft">
                <span>Jami</span>
                <span className="tabular-nums">{formatMoney(total)}</span>
              </div>
            </div>
          </div>
          {!buyNowItem && (
            <Link
              to="/savat"
              className="text-sm text-center text-ink-muted hover:text-gold-600 transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Savatga qaytish
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
