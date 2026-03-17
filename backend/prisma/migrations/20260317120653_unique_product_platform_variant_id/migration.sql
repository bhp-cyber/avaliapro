/*
  Warnings:

  - A unique constraint covering the columns `[platformVariantId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Product_platformVariantId_key" ON "Product"("platformVariantId");
