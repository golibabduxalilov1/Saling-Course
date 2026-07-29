require('dotenv').config();

const test = require('node:test');
const assert = require('node:assert/strict');

const prisma = require('../src/config/prisma');
const { createOrder } = require('../src/services/order.service');
const { resolvePromoCode, USAGE_LIMIT_MESSAGE } = require('../src/services/promo.service');

// Har bir ishga tushirish o'ziga xos yozuvlar yaratadi va oxirida ularni
// tozalaydi, shunda testlar mavjud ma'lumotlarga tegmaydi.
const RUN_ID = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createdPromoIds = [];
let product = null;
let hugePriceProduct = null;

function baseOrderPayload(overrides = {}) {
  return {
    items: [{ productId: product.id, quantity: 1 }],
    customerName: 'Test Xaridor',
    phone: `+99890${Math.floor(1000000 + Math.random() * 8999999)}`,
    source: RUN_ID,
    ...overrides,
  };
}

async function makePromoCode(usageLimit) {
  const promo = await prisma.promoCode.create({
    data: {
      code: `${RUN_ID}-${createdPromoIds.length}`.toUpperCase(),
      discountType: 'PERCENT',
      value: 10,
      usageLimit,
      isActive: true,
    },
  });
  createdPromoIds.push(promo.id);
  return promo;
}

function usedCountOf(promoId) {
  return prisma.promoCode.findUnique({ where: { id: promoId } }).then((p) => p.usedCount);
}

test.before(async () => {
  // Prisma ulanish havzasini "isitamiz". Sovuq havzada birinchi so'rovlar
  // bitta ulanish ortida navbatga tizilib qoladi va parallel test aslida
  // ketma-ket bajarilib, poyga holatini umuman tekshirmay qo'yadi.
  await Promise.all(Array.from({ length: 8 }, () => prisma.$queryRaw`SELECT pg_sleep(0.05)::text AS s`));

  product = await prisma.product.create({
    data: {
      name: `Promo test mahsuloti ${RUN_ID}`,
      slug: `promo-test-${RUN_ID}`,
      type: 'COURSE',
      price: 100000,
      isActive: true,
    },
  });

  // Bu mahsulotning narxi Decimal(12,2) chegarasida, lekin ikki dona
  // buyurtma qilinganda `Order.subtotal` bazada sig'maydi. Shu tariqa
  // transaction ichida — promo-kod "band qilingandan" keyin — deterministik
  // xato hosil qilamiz va rollback ishlashini tekshiramiz.
  hugePriceProduct = await prisma.product.create({
    data: {
      name: `Promo overflow mahsuloti ${RUN_ID}`,
      slug: `promo-overflow-${RUN_ID}`,
      type: 'COURSE',
      price: '9999999999.99',
      isActive: true,
    },
  });
});

test.after(async () => {
  const productIds = [product?.id, hugePriceProduct?.id].filter(Boolean);
  if (productIds.length) {
    await prisma.order.deleteMany({ where: { items: { some: { productId: { in: productIds } } } } });
    await prisma.analyticsEvent.deleteMany({ where: { productId: { in: productIds } } });
  }
  if (createdPromoIds.length) {
    await prisma.order.deleteMany({ where: { promoCodeId: { in: createdPromoIds } } });
    await prisma.promoCode.deleteMany({ where: { id: { in: createdPromoIds } } });
  }
  if (productIds.length) {
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });
  }
  await prisma.$disconnect();
});

test('usageLimit=1: birinchi buyurtma muvaffaqiyatli yaratiladi', async () => {
  const promo = await makePromoCode(1);

  const order = await createOrder(baseOrderPayload({ promoCode: promo.code }));

  assert.ok(order.orderNumber, 'buyurtma raqami qaytishi kerak');
  assert.equal(Number(order.discountAmount), 10000);
  assert.equal(Number(order.totalAmount), 90000);
  assert.equal(await usedCountOf(promo.id), 1);
});

test('usageLimit=1: ikkinchi buyurtma 400 xato qaytaradi', async () => {
  const promo = await makePromoCode(1);

  await createOrder(baseOrderPayload({ promoCode: promo.code }));

  await assert.rejects(
    () => createOrder(baseOrderPayload({ promoCode: promo.code })),
    (err) => {
      assert.equal(err.statusCode, 400);
      assert.equal(err.message, USAGE_LIMIT_MESSAGE);
      return true;
    }
  );

  assert.equal(await usedCountOf(promo.id), 1, 'usedCount limitdan oshmasligi kerak');
  const orders = await prisma.order.count({ where: { promoCodeId: promo.id } });
  assert.equal(orders, 1, 'faqat bitta buyurtma yaratilgan bo\'lishi kerak');
});

test('usageLimit=1: parallel yuborilgan ikki buyurtmadan faqat bittasi muvaffaqiyatli bo\'ladi', async () => {
  const promo = await makePromoCode(1);

  const results = await Promise.allSettled([
    createOrder(baseOrderPayload({ promoCode: promo.code })),
    createOrder(baseOrderPayload({ promoCode: promo.code })),
  ]);

  const fulfilled = results.filter((r) => r.status === 'fulfilled');
  const rejected = results.filter((r) => r.status === 'rejected');

  assert.equal(fulfilled.length, 1, 'aynan bitta so\'rov muvaffaqiyatli bo\'lishi kerak');
  assert.equal(rejected.length, 1, 'aynan bitta so\'rov rad etilishi kerak');
  assert.equal(rejected[0].reason.statusCode, 400);
  assert.equal(rejected[0].reason.message, USAGE_LIMIT_MESSAGE);

  assert.equal(await usedCountOf(promo.id), 1);
  assert.equal(await prisma.order.count({ where: { promoCodeId: promo.id } }), 1);
});

test('muvaffaqiyatsiz buyurtmada usedCount oshmaydi (transaction rollback)', async () => {
  const promo = await makePromoCode(5);

  await assert.rejects(() =>
    createOrder(
      baseOrderPayload({
        promoCode: promo.code,
        items: [{ productId: hugePriceProduct.id, quantity: 2 }],
      })
    )
  );

  assert.equal(await usedCountOf(promo.id), 0, 'rollbackdan keyin usedCount 0 bo\'lishi kerak');
  assert.equal(await prisma.order.count({ where: { promoCodeId: promo.id } }), 0);
});

test('usageLimit=null bo\'lgan kod cheklanmaydi', async () => {
  const promo = await makePromoCode(null);

  for (let i = 0; i < 3; i += 1) {
    const order = await createOrder(baseOrderPayload({ promoCode: promo.code }));
    assert.equal(Number(order.totalAmount), 90000);
  }

  assert.equal(await usedCountOf(promo.id), 3);
});

test('/promo/validate oqimi usedCount ni oshirmaydi', async () => {
  const promo = await makePromoCode(1);

  // `/promo/validate` endpointi aynan shu funksiyani chaqiradi.
  for (let i = 0; i < 3; i += 1) {
    const { discountAmount } = await resolvePromoCode(promo.code, [product.id], 100000);
    assert.equal(discountAmount, 10000);
  }

  assert.equal(await usedCountOf(promo.id), 0, 'tekshirish kodni ishlatilgan deb belgilamasligi kerak');

  // Tekshirishdan keyin ham kod hali bir marta ishlatilishi mumkin.
  await createOrder(baseOrderPayload({ promoCode: promo.code }));
  assert.equal(await usedCountOf(promo.id), 1);
});
