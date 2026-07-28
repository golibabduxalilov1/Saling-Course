require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@sotuv.uz';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin12345';
  const adminName = process.env.SEED_ADMIN_NAME || 'Administrator';

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log(`Admin tayyor: ${adminEmail} / ${adminPassword}`);

  const categoriesData = [
    { name: 'Marketing', slug: 'marketing' },
    { name: 'Til o\'rganish', slug: 'til-organish' },
    { name: 'Dasturlash', slug: 'dasturlash' },
  ];

  const categories = {};
  for (const c of categoriesData) {
    categories[c.slug] = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  const productsData = [
    {
      name: 'Instagram Target orqali sotuvlarni oshirish',
      slug: 'instagram-target-sotuv',
      type: 'COURSE',
      categorySlug: 'marketing',
      shortDescription: 'Instagram reklamalarini sozlab, birinchi buyurtmalaringizni oling.',
      fullDescription: 'Ushbu kursda siz Instagram target reklamasini noldan sozlashni, auditoriya tanlashni va sotuv sahifasiga trafik olib kelishni o\'rganasiz.',
      forWhom: 'Tadbirkorlar, SMM mutaxassislar, onlayn sotuvchilar uchun.',
      results: 'Kurs oxirida mustaqil ravishda reklama kampaniyasini yurita olasiz.',
      duration: '4 hafta',
      format: 'Video darslar + amaliyot',
      instructorInfo: 'Aziz Karimov — 5 yillik SMM tajribasiga ega mutaxassis.',
      certificateAvailable: true,
      accessDurationDays: 180,
      guaranteeTerms: '7 kun ichida natija bo\'lmasa, pul qaytariladi.',
      price: 890000,
      discountPrice: 590000,
      isFeatured: true,
      isBestseller: true,
      tariffs: [
        { name: 'Standart', price: 590000, features: ['Asosiy videodarslar', 'Kurs materiallari', '3 oylik kirish', 'Umumiy Telegram guruh'], accessDurationDays: 90, sortOrder: 1 },
        { name: 'Premium', price: 990000, discountPrice: 790000, features: ['Barcha videodarslar', 'Qo\'shimcha materiallar', '6 oylik kirish', 'Yopiq Telegram guruh', 'Savol-javob sessiyalari'], accessDurationDays: 180, sortOrder: 2 },
        { name: 'VIP', price: 1990000, features: ['Barcha kurs materiallari', 'Cheklanmagan kirish', 'Shaxsiy konsultatsiya', 'Individual tekshiruv', 'Premium bonuslar'], sortOrder: 3 },
      ],
      demoMaterials: [
        { type: 'VIDEO', title: 'Bepul kirish darsi', url: 'https://example.com/demo1.mp4', sortOrder: 1 },
        { type: 'PDF', title: 'Kurs dasturi (PDF)', url: 'https://example.com/dastur.pdf', sortOrder: 2 },
      ],
    },
    {
      name: 'Ingliz tili: Noldan A2 darajagacha',
      slug: 'ingliz-tili-a2',
      type: 'VIDEO_COURSE',
      categorySlug: 'til-organish',
      shortDescription: 'Kundalik muloqot uchun ingliz tilini tez va oson o\'rganing.',
      fullDescription: 'Grammatika, so\'z boyligi va nutq amaliyoti bitta kursda. Har bir dars 15-20 daqiqa.',
      forWhom: 'Boshlovchilar uchun.',
      results: 'Kundalik mavzularda erkin muloqot qila olasiz.',
      duration: '8 hafta',
      format: 'Video darslar',
      instructorInfo: 'Dilnoza Yusupova — IELTS 8.0, 7 yillik o\'qituvchilik tajribasi.',
      certificateAvailable: true,
      accessDurationDays: 365,
      price: 450000,
      discountPrice: 320000,
      isNew: true,
      tariffs: [
        { name: 'Standart', price: 320000, features: ['Video darslar', 'Mashqlar to\'plami', '1 yillik kirish'], sortOrder: 1 },
        { name: 'Premium', price: 590000, features: ['Video darslar', 'Mashqlar to\'plami', '1 yillik kirish', 'Haftalik speaking club', 'O\'qituvchidan fikr-mulohaza'], sortOrder: 2 },
      ],
      demoMaterials: [
        { type: 'VIDEO', title: 'Bepul 1-dars', url: 'https://example.com/eng-demo.mp4', sortOrder: 1 },
      ],
    },
    {
      name: 'Frontend dasturlash: React bilan amaliyot',
      slug: 'react-amaliyot',
      type: 'COURSE',
      categorySlug: 'dasturlash',
      shortDescription: 'Real loyihalar orqali React.js\'ni chuqur o\'rganing.',
      fullDescription: 'Komponentlar, hook\'lar, state boshqaruvi va API bilan ishlashni amaliy loyihalar orqali o\'rganasiz.',
      forWhom: 'JavaScript asoslarini biladigan boshlovchilar uchun.',
      results: 'Mustaqil ravishda React ilovalarini qura olasiz.',
      duration: '6 hafta',
      format: 'Video darslar + amaliy vazifalar',
      instructorInfo: 'Sardor Nazarov — Frontend dasturchi, 6 yillik tajriba.',
      certificateAvailable: true,
      accessDurationDays: 365,
      price: 1200000,
      isBestseller: true,
      tariffs: [
        { name: 'Standart', price: 1200000, features: ['Video darslar', 'Amaliy loyihalar', '1 yillik kirish'], sortOrder: 1 },
        { name: 'VIP', price: 2400000, features: ['Video darslar', 'Amaliy loyihalar', 'Shaxsiy mentorlik', 'Portfolio tekshiruvi'], sortOrder: 2 },
      ],
      demoMaterials: [
        { type: 'VIDEO', title: 'Kirish darsi', url: 'https://example.com/react-demo.mp4', sortOrder: 1 },
      ],
    },
    {
      name: 'Marketing strategiyasi bo\'yicha elektron qo\'llanma',
      slug: 'marketing-qollanma',
      type: 'PDF_GUIDE',
      categorySlug: 'marketing',
      shortDescription: 'Kontent-reja va SMM strategiyasi bo\'yicha to\'liq PDF qo\'llanma.',
      fullDescription: 'Kontent-reja, reklama byudjeti va SMM strategiyasi bo\'yicha bosqichma-bosqich PDF qo\'llanma.',
      price: 150000,
      discountPrice: 99000,
      isFeatured: true,
      tariffs: [
        { name: 'Standart', price: 99000, features: ['To\'liq PDF qo\'llanma', 'Google Sheets shablonlari'], sortOrder: 1 },
      ],
      demoMaterials: [
        { type: 'PDF', title: 'Namuna sahifalar', url: 'https://example.com/qollanma-demo.pdf', sortOrder: 1 },
      ],
    },
  ];

  for (const p of productsData) {
    const { categorySlug, tariffs, demoMaterials, ...productFields } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...productFields,
        categoryId: categories[categorySlug].id,
      },
    });

    const existingTariffs = await prisma.tariff.count({ where: { productId: product.id } });
    if (existingTariffs === 0) {
      for (const t of tariffs) {
        await prisma.tariff.create({ data: { ...t, productId: product.id } });
      }
    }

    const existingDemos = await prisma.demoMaterial.count({ where: { productId: product.id } });
    if (existingDemos === 0) {
      for (const d of demoMaterials || []) {
        await prisma.demoMaterial.create({ data: { ...d, productId: product.id } });
      }
    }

    const existingReviews = await prisma.review.count({ where: { productId: product.id } });
    if (existingReviews === 0) {
      await prisma.review.create({
        data: {
          productId: product.id,
          customerName: 'Muhammadali R.',
          textContent: 'Juda foydali kurs, tavsiya qilaman!',
          rating: 5,
          isApproved: true,
        },
      });
    }
  }

  console.log('Seed muvaffaqiyatli yakunlandi.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
