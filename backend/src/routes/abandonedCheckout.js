const express = require('express');
const prisma = require('../config/prisma');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const { normalizePhone } = require('../utils/phone');

const router = express.Router();

// Called (debounced) from the checkout form as soon as the customer has
// entered a phone number, so we can capture drop-offs before they submit.
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, phone, productId, tariffId, amount, stage, utmSource, utmMedium, utmCampaign, utmContent } =
      req.body;

    if (!phone) {
      throw new ApiError(400, 'Telefon raqami majburiy');
    }

    // Bu yozuv mijoz formani to'ldirib bo'lmasidan yuboriladi, shuning uchun
    // to'liq bo'lmagan raqamni rad etmaymiz — normallashtira olsak, buyurtmalar
    // bilan bir xil formatda saqlaymiz, aks holda kiritilgan holicha qoldiramiz.
    const record = await prisma.abandonedCheckout.create({
      data: {
        name,
        phone: normalizePhone(phone) || String(phone).trim(),
        productId: productId || null,
        tariffId: tariffId || null,
        amount: amount ? Number(amount) : null,
        stage,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
      },
    });

    res.status(201).json({ id: record.id, ok: true });
  })
);

module.exports = router;
