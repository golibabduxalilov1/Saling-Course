const express = require('express');
const prisma = require('../config/prisma');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const { createOrder } = require('../services/order.service');

const router = express.Router();

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const order = await createOrder(req.body);
    res.status(201).json({
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
    });
  })
);

router.get(
  '/:orderNumber',
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({
      where: { orderNumber: req.params.orderNumber },
      include: { items: { include: { product: true, tariff: true } } },
    });
    if (!order) throw new ApiError(404, 'Buyurtma topilmadi');
    res.json(order);
  })
);

module.exports = router;
