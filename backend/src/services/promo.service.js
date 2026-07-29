const prisma = require('../config/prisma');
const { ApiError } = require('../middleware/errorHandler');

const USAGE_LIMIT_MESSAGE = 'Promo-kod foydalanish limiti tugagan';

/**
 * Normalizes an incoming `usageLimit` value. Faqat musbat butun son yoki
 * `null` (cheklanmagan) qabul qilinadi. `undefined` qaytsa — chaqiruvchi
 * maydonni umuman o'zgartirmaydi (PUT so'rovlari uchun).
 */
function parseUsageLimit(value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;

  const parsed = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ApiError(400, "Foydalanish limiti musbat butun son yoki bo'sh bo'lishi kerak");
  }
  return parsed;
}

/**
 * Validates a promo code against a set of product ids and a subtotal, and
 * returns the promo record plus the computed discount amount. Throws ApiError
 * on any invalid state so callers can surface a clear message.
 *
 * Bu funksiya faqat tekshiradi — `usedCount` ni o'zgartirmaydi. Kodni
 * "ishlatilgan" deb belgilash uchun `consumePromoCode` ishlatiladi.
 * `client` orqali Prisma transaction konteksti uzatilishi mumkin.
 */
async function resolvePromoCode(code, productIds, subtotal, client = prisma) {
  if (!code) return { promoCode: null, discountAmount: 0 };

  const promoCode = await client.promoCode.findUnique({ where: { code: code.trim().toUpperCase() } });

  if (!promoCode || !promoCode.isActive) {
    throw new ApiError(400, 'Promo-kod topilmadi yoki faol emas');
  }
  if (promoCode.expiresAt && promoCode.expiresAt < new Date()) {
    throw new ApiError(400, 'Promo-kod muddati tugagan');
  }
  if (promoCode.usageLimit !== null && promoCode.usedCount >= promoCode.usageLimit) {
    throw new ApiError(400, USAGE_LIMIT_MESSAGE);
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

/**
 * Atomically claims one use of a promo code. Yagona shartli UPDATE bo'lgani
 * uchun tekshirish va oshirish bo'linmas amaldir:
 *
 *   UPDATE "PromoCode" SET "usedCount" = "usedCount" + 1
 *   WHERE id = $1 AND "isActive" = true
 *     AND ("usageLimit" IS NULL OR "usedCount" < "usageLimit")
 *
 * Postgres bir vaqtda kelgan ikkinchi so'rovni qator qulfida ushlab turadi va
 * qulf bo'shagach shartni yangilangan qiymatga qarab qayta baholaydi — shu
 * sababli limitdan ortiq foydalanish mumkin emas. Hech bir yozuv
 * yangilanmasa 400 xatosi tashlanadi va chaqiruvchi transaction qaytariladi.
 *
 * `tx` — Prisma interactive transaction konteksti bo'lishi shart, aks holda
 * buyurtma yaratishda xato chiqsa `usedCount` oshib qolgan bo'ladi.
 */
async function consumePromoCode(tx, promoCodeId) {
  const { count } = await tx.promoCode.updateMany({
    where: {
      id: promoCodeId,
      isActive: true,
      OR: [
        { usageLimit: null },
        { usedCount: { lt: prisma.promoCode.fields.usageLimit } },
      ],
    },
    data: { usedCount: { increment: 1 } },
  });

  if (count === 0) {
    throw new ApiError(400, USAGE_LIMIT_MESSAGE);
  }
}

module.exports = { resolvePromoCode, consumePromoCode, parseUsageLimit, USAGE_LIMIT_MESSAGE };
