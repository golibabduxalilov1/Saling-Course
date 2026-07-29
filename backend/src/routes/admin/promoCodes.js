const express = require('express');
const prisma = require('../../config/prisma');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../middleware/errorHandler');
const { parseUsageLimit } = require('../../services/promo.service');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const promoCodes = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(promoCodes);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { code, discountType, value, expiresAt, usageLimit, minOrderAmount, productIds, isActive } = req.body;
    if (!code || !discountType || value === undefined) {
      throw new ApiError(400, 'Kod, chegirma turi va miqdori majburiy');
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.trim().toUpperCase(),
        discountType,
        value,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        usageLimit: parseUsageLimit(usageLimit) ?? null,
        minOrderAmount: minOrderAmount ?? null,
        productIds: productIds || [],
        isActive: isActive ?? true,
      },
    });
    res.status(201).json(promoCode);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { code, discountType, value, expiresAt, usageLimit, minOrderAmount, productIds, isActive } = req.body;
    const promoCode = await prisma.promoCode.update({
      where: { id: req.params.id },
      data: {
        code: code ? code.trim().toUpperCase() : undefined,
        discountType,
        value,
        expiresAt: expiresAt ? new Date(expiresAt) : expiresAt === null ? null : undefined,
        // `undefined` — maydon o'zgartirilmaydi, `null` — limit olib tashlanadi.
        usageLimit: parseUsageLimit(usageLimit),
        minOrderAmount,
        productIds,
        isActive,
      },
    });
    res.json(promoCode);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.promoCode.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

module.exports = router;
