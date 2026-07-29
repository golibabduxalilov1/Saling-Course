const express = require('express');
const prisma = require('../config/prisma');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const { normalizePhoneOrThrow } = require('../utils/phone');

const router = express.Router();

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, phone, telegramUsername, productId, source, utmSource, utmMedium, utmCampaign, utmContent } =
      req.body;

    if (!name) {
      throw new ApiError(400, 'Ism majburiy');
    }
    const normalizedPhone = normalizePhoneOrThrow(phone);

    const lead = await prisma.lead.create({
      data: {
        name,
        phone: normalizedPhone,
        telegramUsername,
        productId: productId || null,
        source,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
      },
    });

    res.status(201).json({ id: lead.id, ok: true });
  })
);

module.exports = router;
