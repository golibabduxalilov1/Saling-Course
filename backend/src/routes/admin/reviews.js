const express = require('express');
const prisma = require('../../config/prisma');
const { asyncHandler } = require('../../utils/asyncHandler');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const reviews = await prisma.review.findMany({
      include: { product: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { isApproved } = req.body;
    const review = await prisma.review.update({
      where: { id: req.params.id },
      data: { isApproved: Boolean(isApproved) },
    });
    res.json(review);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.review.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

module.exports = router;
