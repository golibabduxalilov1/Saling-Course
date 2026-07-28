const express = require('express');
const prisma = require('../../config/prisma');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../middleware/errorHandler');
const { slugify } = require('../../utils/slugify');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, slug } = req.body;
    if (!name) throw new ApiError(400, 'Kategoriya nomi majburiy');
    const category = await prisma.category.create({
      data: { name, slug: slugify(slug || name) },
    });
    res.status(201).json(category);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { name, slug } = req.body;
    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: { name, slug: slug ? slugify(slug) : undefined },
    });
    res.json(category);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

module.exports = router;
