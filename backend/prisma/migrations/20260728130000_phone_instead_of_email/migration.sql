-- AdminUser: `email` o'rniga majburiy va unique `phone`.
--
-- Mavjud adminlar o'chirilmaydi. Ustun avval NULL bo'lishi mumkin holda
-- qo'shiladi, har bir qatorga noyob vaqtinchalik to'ldirgich raqam yoziladi va
-- shundan keyingina NOT NULL/UNIQUE cheklovlari qo'yiladi. Haqiqiy telefonli
-- SUPER_ADMIN esa seed skripti orqali yaratiladi (`SEED_ADMIN_PHONE`), shuning
-- uchun bu o'tishda admin panelga kirish imkoni yo'qolmaydi.
ALTER TABLE "AdminUser" ADD COLUMN "phone" TEXT;

UPDATE "AdminUser" AS a
SET "phone" = '+00000' || lpad(t.seq::text, 7, '0')
FROM (
  SELECT "id", row_number() OVER (ORDER BY "createdAt", "id") AS seq
  FROM "AdminUser"
) AS t
WHERE a."id" = t."id" AND a."phone" IS NULL;

ALTER TABLE "AdminUser" ALTER COLUMN "phone" SET NOT NULL;

DROP INDEX "AdminUser_email_key";
ALTER TABLE "AdminUser" DROP COLUMN "email";
CREATE UNIQUE INDEX "AdminUser_phone_key" ON "AdminUser"("phone");

-- Buyurtma va lead yozuvlarida email endi ishlatilmaydi — asosiy aloqa
-- maydoni telefon raqami. Qatorlarning o'zi saqlanib qoladi.
ALTER TABLE "Order" DROP COLUMN "email";
ALTER TABLE "Lead" DROP COLUMN "email";
