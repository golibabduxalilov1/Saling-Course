-- CreateTable
CREATE TABLE "AdLink" (
    "id" TEXT NOT NULL,
    "campaignName" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "medium" TEXT NOT NULL,
    "content" TEXT,
    "destinationUrl" TEXT NOT NULL,
    "generatedUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdLink_createdAt_idx" ON "AdLink"("createdAt");

-- CreateIndex
CREATE INDEX "AdLink_platform_idx" ON "AdLink"("platform");
