const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const { resolvePromoCode } = require('../services/promo.service');

const router = express.Router();

// Faqat tekshiradi: `usedCount` bu yerda oshirilmaydi. Promo-kod ishlatilgan
// deb faqat buyurtma muvaffaqiyatli yaratilganda hisoblanadi (order.service).
router.post(
  '/validate',
  asyncHandler(async (req, res) => {
    const { code, productIds, subtotal } = req.body;
    if (!code) throw new ApiError(400, 'Promo-kod kiritilmadi');

    const { promoCode, discountAmount } = await resolvePromoCode(code, productIds || [], Number(subtotal) || 0);
    res.json({
      valid: true,
      code: promoCode.code,
      discountType: promoCode.discountType,
      value: promoCode.value,
      discountAmount,
    });
  })
);

module.exports = router;
