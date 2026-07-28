const express = require('express');
const { asyncHandler } = require('../utils/asyncHandler');
const { resolvePromoCode } = require('../services/promo.service');

const router = express.Router();

router.post(
  '/validate',
  asyncHandler(async (req, res) => {
    const { code, productIds, subtotal } = req.body;
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
