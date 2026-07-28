const express = require('express');
const prisma = require('../../config/prisma');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../middleware/errorHandler');
const { slugify } = require('../../utils/slugify');

const router = express.Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const products = await prisma.product.findMany({
      include: { category: true, tariffs: true, _count: { select: { orderItems: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        tariffs: { orderBy: { sortOrder: 'asc' } },
        demoMaterials: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!product) throw new ApiError(404, 'Mahsulot topilmadi');
    res.json(product);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { tariffs, demoMaterials, ...fields } = req.body;
    if (!fields.name) throw new ApiError(400, 'Mahsulot nomi majburiy');
    if (!fields.price) throw new ApiError(400, 'Narx majburiy');

    const slug = fields.slug ? slugify(fields.slug) : slugify(fields.name);

    const product = await prisma.product.create({
      data: {
        ...fields,
        slug,
        gallery: fields.gallery || [],
        tariffs: tariffs && tariffs.length ? { create: tariffs } : undefined,
        demoMaterials: demoMaterials && demoMaterials.length ? { create: demoMaterials } : undefined,
      },
      include: { tariffs: true, demoMaterials: true },
    });

    res.status(201).json(product);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { tariffs, demoMaterials, ...fields } = req.body;
    if (fields.slug) fields.slug = slugify(fields.slug);

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: fields,
    });

    res.json(product);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

// --- Tariffs ---

router.post(
  '/:id/tariffs',
  asyncHandler(async (req, res) => {
    const tariff = await prisma.tariff.create({
      data: { ...req.body, productId: req.params.id },
    });
    res.status(201).json(tariff);
  })
);

router.put(
  '/tariffs/:tariffId',
  asyncHandler(async (req, res) => {
    const tariff = await prisma.tariff.update({
      where: { id: req.params.tariffId },
      data: req.body,
    });
    res.json(tariff);
  })
);

router.delete(
  '/tariffs/:tariffId',
  asyncHandler(async (req, res) => {
    await prisma.tariff.delete({ where: { id: req.params.tariffId } });
    res.status(204).end();
  })
);

// --- Demo materials ---

router.post(
  '/:id/demo-materials',
  asyncHandler(async (req, res) => {
    const demo = await prisma.demoMaterial.create({
      data: { ...req.body, productId: req.params.id },
    });
    res.status(201).json(demo);
  })
);

router.delete(
  '/demo-materials/:demoId',
  asyncHandler(async (req, res) => {
    await prisma.demoMaterial.delete({ where: { id: req.params.demoId } });
    res.status(204).end();
  })
);

module.exports = router;
