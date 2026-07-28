const express = require('express');
const prisma = require('../../config/prisma');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../middleware/errorHandler');
const { ordersToCsv } = require('../../services/export.service');

const router = express.Router();

router.get(
  '/export',
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const csv = ordersToCsv(orders);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="buyurtmalar.csv"');
    res.send('﻿' + csv);
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { orderStatus, paymentStatus, search, utmSource, dateFrom, dateTo } = req.query;
    const where = {};
    if (orderStatus) where.orderStatus = orderStatus;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (utmSource) where.utmSource = utmSource;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      include: { items: { include: { product: true, tariff: true } }, promoCode: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true, tariff: true } }, promoCode: true },
    });
    if (!order) throw new ApiError(404, 'Buyurtma topilmadi');
    res.json(order);
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { orderStatus, paymentStatus, paidAmount, internalNote } = req.body;

    const existing = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new ApiError(404, 'Buyurtma topilmadi');

    const data = {};
    if (orderStatus) data.orderStatus = orderStatus;
    if (internalNote !== undefined) data.internalNote = internalNote;
    if (paidAmount !== undefined) {
      data.paidAmount = paidAmount;
      data.remainingAmount = Math.max(0, Number(existing.totalAmount) - Number(paidAmount));
    }
    if (paymentStatus) {
      data.paymentStatus = paymentStatus;
      if (paymentStatus === 'PAID') {
        data.paidAt = new Date();
        if (paidAmount === undefined) {
          data.paidAmount = existing.totalAmount;
          data.remainingAmount = 0;
        }
        if (!orderStatus) data.orderStatus = 'PAID';
      }
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data,
      include: { items: { include: { product: true, tariff: true } } },
    });

    res.json(order);
  })
);

module.exports = router;
