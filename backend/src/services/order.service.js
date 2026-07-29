const prisma = require('../config/prisma');
const { ApiError } = require('../middleware/errorHandler');
const { generateOrderNumber } = require('../utils/orderNumber');
const { resolvePromoCode, consumePromoCode } = require('./promo.service');
const { normalizePhoneOrThrow } = require('../utils/phone');

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
  if (!customerName) {
    throw new ApiError(400, 'Ism majburiy');
  }
  // Telefon raqami mijozning asosiy aloqa ma'lumoti — bazaga doim bitta formatda
  // tushishi kerak, aks holda mijozlar ro'yxati bir odamni bir nechta yozuvga bo'lib
  // yuboradi.
  const normalizedPhone = normalizePhoneOrThrow(phone);

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

  let orderNumber = generateOrderNumber();
  for (let attempts = 0; attempts < 5; attempts += 1) {
    const clash = await prisma.order.findUnique({ where: { orderNumber } });
    if (!clash) break;
    orderNumber = generateOrderNumber();
  }

  // Promo-kodni tekshirish, "band qilish" va buyurtmani yozish bitta
  // transaction ichida bajariladi. Shu sababli quyidagi bosqichlarning
  // birortasi xato bersa `usedCount` ham avtomatik ravishda qaytariladi.
  const order = await prisma.$transaction(async (tx) => {
    let discountAmount = 0;
    let promoCode = null;
    if (promoCodeInput) {
      const resolved = await resolvePromoCode(promoCodeInput, productIds, subtotal, tx);
      discountAmount = resolved.discountAmount;
      promoCode = resolved.promoCode;
      // Limitning yagona ishonchli tekshiruvi — shartli atomar UPDATE.
      await consumePromoCode(tx, promoCode.id);
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);

    const created = await tx.order.create({
      data: {
        orderNumber,
        customerName,
        customerLastName,
        phone: normalizedPhone,
        telegramUsername,
        comment,
        subtotal,
        discountAmount,
        promoCodeId: promoCode ? promoCode.id : null,
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

  return order;
}

module.exports = { createOrder };
