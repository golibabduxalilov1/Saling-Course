const prisma = require('../config/prisma');
const { ApiError } = require('../middleware/errorHandler');

/**
 * Validates a promo code against a set of product ids and a subtotal, and
 * returns the promo record plus the computed discount amount. Throws ApiError
 * on any invalid state so callers can surface a clear message.
 */
async function resolvePromoCode(code, productIds, subtotal) {
  if (!code) return { promoCode: null, discountAmount: 0 };

  const promoCode = await prisma.promoCode.findUnique({ where: { code: code.trim().toUpperCase() } });

  if (!promoCode || !promoCode.isActive) {
    throw new ApiError(400, 'Promo-kod topilmadi yoki faol emas');
  }
  if (promoCode.expiresAt && promoCode.expiresAt < new Date()) {
    throw new ApiError(400, 'Promo-kod muddati tugagan');
  }
  if (promoCode.usageLimit !== null && promoCode.usedCount >= promoCode.usageLimit) {
    throw new ApiError(400, 'Promo-kod foydalanish limiti tugagan');
  }
  if (promoCode.minOrderAmount && subtotal < Number(promoCode.minOrderAmount)) {
    throw new ApiError(400, `Promo-kod uchun minimal buyurtma summasi: ${promoCode.minOrderAmount}`);
  }
  if (promoCode.productIds.length > 0) {
    const applicable = productIds.some((id) => promoCode.productIds.includes(id));
    if (!applicable) {
      throw new ApiError(400, 'Promo-kod ushbu mahsulotlarga tegishli emas');
    }
  }

  let discountAmount = 0;
  if (promoCode.discountType === 'PERCENT') {
    discountAmount = (subtotal * Number(promoCode.value)) / 100;
  } else {
    discountAmount = Number(promoCode.value);
  }
  discountAmount = Math.min(discountAmount, subtotal);

  return { promoCode, discountAmount };
}

module.exports = { resolvePromoCode };
