const express = require('express');
const prisma = require('../../config/prisma');
const { asyncHandler } = require('../../utils/asyncHandler');
const { ApiError } = require('../../middleware/errorHandler');

const router = express.Router();

// Customers aren't a first-class model — they're derived by grouping orders
// by phone number, since the spec explicitly treats this as order history,
// not a CRM contact record.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'asc' },
    });

    const byPhone = new Map();
    for (const order of orders) {
      const key = order.phone;
      if (!byPhone.has(key)) {
        byPhone.set(key, {
          phone: order.phone,
          name: order.customerName,
          telegramUsername: order.telegramUsername,
          firstSource: order.utmSource || order.source || null,
          lastSource: order.utmSource || order.source || null,
          ordersCount: 0,
          paidOrdersCount: 0,
          totalSpent: 0,
          lastOrderAt: order.createdAt,
        });
      }
      const entry = byPhone.get(key);
      entry.ordersCount += 1;
      if (order.paymentStatus === 'PAID') {
        entry.paidOrdersCount += 1;
        entry.totalSpent += Number(order.totalAmount);
      }
      entry.lastSource = order.utmSource || order.source || entry.lastSource;
      entry.lastOrderAt = order.createdAt;
      entry.name = order.customerName || entry.name;
    }

    res.json([...byPhone.values()].sort((a, b) => new Date(b.lastOrderAt) - new Date(a.lastOrderAt)));
  })
);

router.get(
  '/:phone',
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({
      where: { phone: req.params.phone },
      include: { items: { include: { product: true, tariff: true } } },
      orderBy: { createdAt: 'desc' },
    });
    if (orders.length === 0) throw new ApiError(404, 'Mijoz topilmadi');

    const leads = await prisma.lead.findMany({ where: { phone: req.params.phone } });
    const abandonedCheckouts = await prisma.abandonedCheckout.findMany({ where: { phone: req.params.phone } });

    res.json({ orders, leads, abandonedCheckouts });
  })
);

module.exports = router;
