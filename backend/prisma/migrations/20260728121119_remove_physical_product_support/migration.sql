
-- AlterEnum
BEGIN;
CREATE TYPE "ProductType_new" AS ENUM ('COURSE', 'VIDEO_COURSE', 'WEBINAR', 'MASTERCLASS', 'CONSULTATION', 'EBOOK', 'PDF_GUIDE', 'AUDIO');
ALTER TABLE "Product" ALTER COLUMN "type" TYPE "ProductType_new" USING ("type"::text::"ProductType_new");
ALTER TYPE "ProductType" RENAME TO "ProductType_old";
ALTER TYPE "ProductType_new" RENAME TO "ProductType";
DROP TYPE "public"."ProductType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "address",
DROP COLUMN "deliveryPrice",
DROP COLUMN "region";

