const express = require('express');
const prisma = require('../../config/prisma');
const { asyncHandler } = require('../../utils/asyncHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const records = await prisma.abandonedCheckout.findMany({
      include: { product: true, tariff: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(records);
  })
);

module.exports = router;
