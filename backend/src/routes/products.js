const express = require('express');
const prisma = require('../config/prisma');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const router = express.Router();

const SORT_MAP = {
  newest: { createdAt: 'desc' },
  popular: { viewCount: 'desc' },
  bestseller: { isBestseller: 'desc' },
  price_asc: { price: 'asc' },
  price_desc: { price: 'desc' },
};

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { category, type, minPrice, maxPrice, search, sort, featured, bestseller, isNew } = req.query;

    const where = { isActive: true };
    if (category) where.category = { slug: category };
    if (type) where.type = type;
    if (featured === 'true') where.isFeatured = true;
    if (bestseller === 'true') where.isBestseller = true;
    if (isNew === 'true') where.isNew = true;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true, tariffs: { orderBy: { sortOrder: 'asc' } } },
      orderBy: SORT_MAP[sort] || { createdAt: 'desc' },
    });

    res.json(products);
  })
);

router.get(
  '/reviews/highlights',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 6, 12);
    const reviews = await prisma.review.findMany({
      where: { isApproved: true, rating: { gte: 4 }, textContent: { not: null } },
      include: { product: { select: { name: true, slug: true } } },
      orderBy: [{ rating: 'desc' }, { createdAt: 'desc' }],
      take: limit,
    });
    res.json(reviews);
  })
);

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true,
        tariffs: { orderBy: { sortOrder: 'asc' } },
        demoMaterials: { orderBy: { sortOrder: 'asc' } },
        reviews: { where: { isApproved: true }, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!product || !product.isActive) {
      throw new ApiError(404, 'Mahsulot topilmadi');
    }

    prisma.product
      .update({ where: { id: product.id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {});

    res.json(product);
  })
);

module.exports = router;
