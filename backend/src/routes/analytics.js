const express = require('express');
const prisma = require('../config/prisma');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

const ALLOWED_TYPES = new Set(['PAGE_VIEW', 'PRODUCT_VIEW', 'ADD_TO_CART', 'CHECKOUT_START']);

router.post(
  '/track',
  asyncHandler(async (req, res) => {
    const { type, productId, sessionId, utmSource, utmMedium, utmCampaign, utmContent } = req.body;

    if (!ALLOWED_TYPES.has(type)) {
      return res.status(204).end();
    }

    await prisma.analyticsEvent.create({
      data: {
        type,
        productId: productId || null,
        sessionId,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
      },
    });

    res.status(204).end();
  })
);

module.exports = router;
