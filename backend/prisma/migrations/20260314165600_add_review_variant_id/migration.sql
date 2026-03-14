/*
  Warnings:

  - Made the column `sku` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "platform" TEXT,
ADD COLUMN     "platformProductId" TEXT,
ADD COLUMN     "platformVariantId" TEXT,
ALTER COLUMN "sku" SET NOT NULL;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "variantId" TEXT;

-- CreateIndex
CREATE INDEX "Product_companyId_idx" ON "Product"("companyId");

-- CreateIndex
CREATE INDEX "Product_companyId_sku_idx" ON "Product"("companyId", "sku");

-- CreateIndex
CREATE INDEX "Product_companyId_platformProductId_idx" ON "Product"("companyId", "platformProductId");

-- CreateIndex
CREATE INDEX "Product_companyId_platformVariantId_idx" ON "Product"("companyId", "platformVariantId");
