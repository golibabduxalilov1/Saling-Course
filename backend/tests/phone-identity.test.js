require('dotenv').config();

const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const bcrypt = require('bcryptjs');

const prisma = require('../src/config/prisma');
const { errorHandler } = require('../src/middleware/errorHandler');
const adminAuthRoutes = require('../src/routes/admin/auth');
const orderRoutes = require('../src/routes/orders');
const leadRoutes = require('../src/routes/leads');

// Testlar o'z yozuvlarini yaratadi va oxirida tozalaydi, shunda mavjud
// ma'lumotlarga tegmaydi.
const RUN_ID = `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const ADMIN_PASSWORD = 'test-parol-12345';
// `+99899` + 7 raqam — mavjud raqamlar bilan to'qnashmaydigan test raqami.
const ADMIN_PHONE_DIGITS = `99899${String(Math.floor(1000000 + Math.random() * 8999999))}`;
const ADMIN_PHONE = `+${ADMIN_PHONE_DIGITS}`;

let server = null;
let baseUrl = '';
let admin = null;
let product = null;

function api(path, body) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(async (res) => ({ status: res.status, body: await res.json() }));
}

test.before(async () => {
  const app = express();
  app.use(express.json());
  app.use('/api/admin/auth', adminAuthRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/leads', leadRoutes);
  app.use(errorHandler);

  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;

  admin = await prisma.adminUser.create({
    data: {
      name: `Test admin ${RUN_ID}`,
      phone: ADMIN_PHONE,
      passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 10),
      role: 'SUPER_ADMIN',
    },
  });

  product = await prisma.product.create({
    data: {
      name: `Telefon test mahsuloti ${RUN_ID}`,
      slug: `phone-test-${RUN_ID}`,
      type: 'COURSE',
      price: 100000,
      isActive: true,
    },
  });
});

test.after(async () => {
  if (product) {
    await prisma.order.deleteMany({ where: { items: { some: { productId: product.id } } } });
    await prisma.analyticsEvent.deleteMany({ where: { productId: product.id } });
    await prisma.lead.deleteMany({ where: { productId: product.id } });
    await prisma.product.deleteMany({ where: { id: product.id } });
  }
  await prisma.lead.deleteMany({ where: { source: RUN_ID } });
  if (admin) {
    await prisma.adminUser.deleteMany({ where: { id: admin.id } });
  }
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await prisma.$disconnect();
});

test('admin telefon raqami va parol bilan tizimga kiradi', async () => {
  const res = await api('/api/admin/auth/login', { phone: ADMIN_PHONE, password: ADMIN_PASSWORD });

  assert.equal(res.status, 200);
  assert.ok(res.body.token, 'token qaytishi kerak');
  assert.equal(res.body.admin.phone, ADMIN_PHONE);
  assert.equal('email' in res.body.admin, false, 'javobda email bo\'lmasligi kerak');
});

test('login formatlangan raqamni ham qabul qiladi', async () => {
  const formatted = `+${ADMIN_PHONE_DIGITS.slice(0, 3)} (${ADMIN_PHONE_DIGITS.slice(3, 5)}) ${ADMIN_PHONE_DIGITS.slice(
    5,
    8
  )}-${ADMIN_PHONE_DIGITS.slice(8, 10)}-${ADMIN_PHONE_DIGITS.slice(10)}`;

  const res = await api('/api/admin/auth/login', { phone: formatted, password: ADMIN_PASSWORD });

  assert.equal(res.status, 200);
  assert.equal(res.body.admin.phone, ADMIN_PHONE);
});

test('noto\'g\'ri parolda 401 va telefonli xato matni qaytadi', async () => {
  const res = await api('/api/admin/auth/login', { phone: ADMIN_PHONE, password: 'noto-g-ri-parol' });

  assert.equal(res.status, 401);
  assert.equal(res.body.error, 'Telefon raqami yoki parol noto\'g\'ri');
});

test('yaroqsiz telefon raqami bilan login 400 qaytaradi', async () => {
  const empty = await api('/api/admin/auth/login', { phone: '', password: ADMIN_PASSWORD });
  assert.equal(empty.status, 400);
  assert.match(empty.body.error, /majburiy/);

  const invalid = await api('/api/admin/auth/login', { phone: '12345', password: ADMIN_PASSWORD });
  assert.equal(invalid.status, 400);
  assert.match(invalid.body.error, /noto'g'ri formatda/);
});

test('buyurtma emailsiz yaratiladi va telefon normallashtiriladi', async () => {
  const digits = `99890${String(Math.floor(1000000 + Math.random() * 8999999))}`;
  const res = await api('/api/orders', {
    items: [{ productId: product.id, quantity: 1 }],
    customerName: 'Test Xaridor',
    phone: `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)}-${digits.slice(8)}`,
    source: RUN_ID,
  });

  assert.equal(res.status, 201);

  const order = await prisma.order.findUnique({ where: { orderNumber: res.body.orderNumber } });
  assert.equal(order.phone, `+${digits}`, 'telefon E.164 formatda saqlanishi kerak');
  assert.equal('email' in order, false, 'Order yozuvida email maydoni qolmasligi kerak');
});

test('telefonsiz buyurtma 400 qaytaradi', async () => {
  const res = await api('/api/orders', {
    items: [{ productId: product.id, quantity: 1 }],
    customerName: 'Test Xaridor',
    source: RUN_ID,
  });

  assert.equal(res.status, 400);
  assert.match(res.body.error, /Telefon raqami majburiy/);
});

test('lead faqat ism va telefon bilan yuboriladi', async () => {
  const digits = `99893${String(Math.floor(1000000 + Math.random() * 8999999))}`;
  const res = await api('/api/leads', {
    name: 'Test Lead',
    phone: `${digits.slice(3)}`, // mamlakat kodisiz
    telegramUsername: '@testlead',
    productId: product.id,
    source: RUN_ID,
  });

  assert.equal(res.status, 201);

  const lead = await prisma.lead.findUnique({ where: { id: res.body.id } });
  assert.equal(lead.phone, `+${digits}`, 'telefon E.164 formatda saqlanishi kerak');
  assert.equal(lead.telegramUsername, '@testlead', 'telegram ixtiyoriy maydon sifatida saqlanadi');
  assert.equal('email' in lead, false, 'Lead yozuvida email maydoni qolmasligi kerak');
});

test('telefonsiz lead 400 qaytaradi', async () => {
  const res = await api('/api/leads', { name: 'Test Lead', source: RUN_ID });

  assert.equal(res.status, 400);
  assert.match(res.body.error, /Telefon raqami majburiy/);
});
