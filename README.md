# Sotuv Platformasi — Onlayn kurslar/mahsulotlar sotish

Instagram/Telegram/TikTok reklamadan kelgan foydalanuvchilar mahsulot yoki kursni ko'rib, tarif tanlab,
buyurtma beradi. **Real to'lov integratsiyasi (Click/Payme) yo'q** — mijoz buyurtma bergandan so'ng
operator/administrator u bilan bog'lanib to'lovni qabul qiladi va admin panelda buyurtmani qo'lda
"To'landi" qiladi. Platforma CRM emas — faqat buyurtma/mijoz/lead ma'lumotlarini saqlaydi.

Stack: **React (Vite) + Tailwind CSS** (frontend), **Express.js + PostgreSQL + Prisma** (backend), **JWT** admin autentifikatsiyasi.

## Loyihaning tuzilishi

```
SOTUV/
  backend/    — Express API, Prisma schema/seed
  frontend/   — React (Vite) ilova, public sayt + /admin paneli
```

## 1. PostgreSQL bazasini tayyorlash

Kompyuteringizda PostgreSQL 18 xizmati o'rnatilgan (`postgresql-x64-18`). Baza yaratish uchun pgAdmin yoki
`psql` orqali quyidagini bajaring:

```sql
CREATE DATABASE sotuv;
```

(Xohlasangiz alohida user ham yaratishingiz mumkin — `postgres` superuser bilan ham ishlaydi.)

## 2. Backend sozlash

```powershell
cd backend
npm install          # agar hali qilinmagan bo'lsa
```

`.env` fayli allaqachon `.env.example`dan nusxalab yaratilgan. Uni oching va **DATABASE_URL** qatoridagi
parolni haqiqiy `postgres` parolingizga almashtiring:

```
DATABASE_URL="postgresql://postgres:HAQIQIY_PAROL@localhost:5432/sotuv?schema=public"
```

Boshqa maydonlar (`JWT_SECRET`, `SEED_ADMIN_PHONE`, `SEED_ADMIN_PASSWORD` va h.k.) ixtiyoriy — xohlasangiz
o'zgartiring, xohlasangiz standart qiymatlar bilan qoldiring.

So'ngra migratsiya va boshlang'ich ma'lumotlarni yuklang:

```powershell
npx prisma migrate dev --name init
npx prisma db seed
```

Bu admin foydalanuvchi (`.env`dagi `SEED_ADMIN_PHONE` / `SEED_ADMIN_PASSWORD`, standart namuna qiymatlar:
`+998901234567` / `admin12345`), 3 ta kategoriya va 4 ta namuna mahsulot (tariflari, demo materiallari,
bitta sharh bilan) yaratadi. Admin panelga aynan shu telefon raqami bilan kiriladi.

Backendni ishga tushiring:

```powershell
npm run dev
```

`http://localhost:4000/api/health` manzili `{"ok":true}` qaytarishi kerak.

## 3. Frontend ishga tushirish

Yangi terminalda:

```powershell
cd frontend
npm install          # agar hali qilinmagan bo'lsa
npm run dev
```

`http://localhost:5173` ochiladi. Vite dev-server `/api` so'rovlarini avtomatik `http://localhost:4000`ga
yo'naltiradi (`vite.config.js`dagi proxy sozlamasi).

## 4. Sinab ko'rish

**Ommaviy qism:**
1. Bosh sahifa → "Katalogni ko'rish"
2. Mahsulot ustiga bosib mahsulot sahifasiga o'ting, tarif tanlang
3. "Hozir sotib olish" (tezkor xarid) yoki "Savatga qo'shish" → Savat → "Buyurtmani rasmiylashtirish"
4. Checkout formasini to'ldirib "Buyurtma berish" tugmasini bosing
5. "Buyurtmangiz qabul qilindi" sahifasi ko'rinishi kerak

**Admin panel** (`http://localhost:5173/admin/login`):
1. Seed skriptidagi admin telefon raqami/parol bilan kiring
2. **Buyurtmalar** bo'limida yangi buyurtmani ko'ring, uni oching va to'lov holatini **"To'landi"**ga
   o'zgartirib saqlang
3. **Mijozlar** bo'limida shu mijoz paydo bo'lganini tekshiring
4. **Promo-kodlar** bo'limida yangi kod yarating (masalan `SALE10`, 10% chegirma) va checkout sahifasida
   qo'llab ko'ring
5. **Analitika** / **Dashboard** bo'limlarida hisoblagichlar oshganini tekshiring
6. **Reklama havolalari** bo'limida platforma (masalan Instagram) va trafik turini tanlab, kampaniya nomini
   yozing → "Havola yaratish" → tayyor havolani nusxalab, brauzerda oching va buyurtma bering. Buyurtma
   kartasidagi **"Manba"** maydonida tanlangan platforma ko'rinadi.

## Muhim eslatmalar

- **To'lov**: real Click/Payme integratsiyasi yo'q. Har bir buyurtma `PENDING` (to'lov kutilmoqda) holatida
  yaratiladi; administrator mijoz bilan bog'langach buyurtmani admin panelda qo'lda "To'landi" qiladi.
- **CRM**: platformaning o'zi CRM emas. Lead va buyurtma ma'lumotlari saqlanadi, kerak bo'lsa kelajakda
  tashqi CRM'ga webhook orqali yuborish uchun joy qoldirilgan (`backend/src/services/order.service.js`),
  lekin hozircha real ulanish yo'q.
- **Reklama havolalari**: generator saytning manzilini `.env`dagi `PUBLIC_SITE_URL`dan (bo'sh bo'lsa —
  `FRONTEND_URL`dan) oladi. Production'ga chiqarishda shu maydonni haqiqiy domenga qo'ying, aks holda
  havolalar `localhost` bilan yaratiladi. Havoladagi `utm_*` parametrlarini sayt allaqachon o'qiydi va
  buyurtma/lead yozuviga biriktiradi.
- **Media fayllar**: mahsulot formasidagi "Media" bo'limida rasm/video uchun havola kiritish ham, qurilmadan
  fayl yuklash ham mumkin. Cheklovlar: rasm — JPEG/JPG/PNG, 15 MB gacha; video — faqat MP4, 50 MB gacha.
  Tekshiruv frontendda ham, backendda ham (MIME + kengaytma + fayl mazmuni) bajariladi. Fayllar `.env`dagi
  `UPLOAD_DIR` papkasida (bo'sh bo'lsa `backend/uploads`) tasodifiy nom bilan saqlanadi va `/api/uploads/...`
  manzili orqali tarqatiladi. Bu papka git'ga tushmaydi — production'da uni backup/volume sifatida saqlang.
- **Xabarnomalar**: avtomatik xabar yuborish (email/SMS) yo'q. Yangi buyurtmalar admin panelning
  **Buyurtmalar** bo'limida ko'rinadi — operator shu yerdan kuzatadi.
- **Telefon raqami**: mijozning ham, adminning ham asosiy identifikatori. Barcha endpointlar raqamni bitta
  formatga (`+998901234567`) keltiradi, shuning uchun `+998 (90) 123-45-67` va `901234567` bir xil mijoz
  sifatida saqlanadi.
- Standart admin telefon raqami va parolini production muhitida albatta almashtiring.
