const express = require('express');
const prisma = require('../../config/prisma');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../middleware/errorHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const leads = await prisma.lead.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(leads);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { status } = req.body;
    const existing = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new ApiError(404, 'Lead topilmadi');

    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: { status },
      include: { product: true },
    });
    res.json(lead);
  })
);

module.exports = router;
