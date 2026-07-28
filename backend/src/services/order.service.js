const prisma = require('../config/prisma');
const { ApiError } = require('../middleware/errorHandler');
const { generateOrderNumber } = require('../utils/orderNumber');
const { resolvePromoCode } = require('./promo.service');
const { notifyAdminNewOrder } = require('./mailer.service');

/**
 * Creates an order from raw cart items. All prices are re-derived from the
 * database (never trusted from the client) so a tampered request can't change
 * what the customer actually owes.
 */
async function createOrder(payload) {
  const {
    items, // [{ productId, tariffId?, quantity? }]
    customerName,
    customerLastName,
    phone,
    telegramUsername,
    email,
    region,
    address,
    comment,
    promoCode: promoCodeInput,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    landingPage,
    deviceType,
    source,
  } = payload;

  if (!Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Savat bo\'sh bo\'lishi mumkin emas');
  }
  if (!customerName || !phone) {
    throw new ApiError(400, 'Ism va telefon raqami majburiy');
  }

  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: { tariffs: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const resolvedItems = items.map((item) => {
    const product = productMap.get(item.productId);
    if (!product) {
      throw new ApiError(400, `Mahsulot topilmadi yoki faol emas: ${item.productId}`);
    }
    let unitPrice = product.discountPrice ?? product.price;
    let tariff = null;
    if (item.tariffId) {
      tariff = product.tariffs.find((t) => t.id === item.tariffId);
      if (!tariff) {
        throw new ApiError(400, `Tarif topilmadi: ${item.tariffId}`);
      }
      unitPrice = tariff.discountPrice ?? tariff.price;
    }
    const quantity = Math.max(1, Number(item.quantity) || 1);
    return {
      productId: product.id,
      tariffId: tariff ? tariff.id : null,
      quantity,
      price: Number(unitPrice),
    };
  });

  const subtotal = resolvedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  let discountAmount = 0;
  let promoCode = null;
  if (promoCodeInput) {
    const resolved = await resolvePromoCode(promoCodeInput, productIds, subtotal);
    discountAmount = resolved.discountAmount;
    promoCode = resolved.promoCode;
  }

  const deliveryPrice = 0;
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryPrice);

  let orderNumber = generateOrderNumber();
  for (let attempts = 0; attempts < 5; attempts += 1) {
    const clash = await prisma.order.findUnique({ where: { orderNumber } });
    if (!clash) break;
    orderNumber = generateOrderNumber();
  }

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        customerName,
        customerLastName,
        phone,
        telegramUsername,
        email,
        region,
        address,
        comment,
        subtotal,
        discountAmount,
        promoCodeId: promoCode ? promoCode.id : null,
        deliveryPrice,
        totalAmount,
        remainingAmount: totalAmount,
        paymentStatus: 'PENDING',
        orderStatus: 'NEW',
        source,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        landingPage,
        deviceType,
        items: {
          create: resolvedItems,
        },
      },
      include: { items: { include: { product: true, tariff: true } } },
    });

    if (promoCode) {
      await tx.promoCode.update({
        where: { id: promoCode.id },
        data: { usedCount: { increment: 1 } },
      });
    }

    await tx.analyticsEvent.create({
      data: {
        type: 'PURCHASE',
        productId: resolvedItems[0].productId,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
      },
    });

    return created;
  });

  notifyAdminNewOrder(order).catch(() => {});

  return order;
}

module.exports = { createOrder };
