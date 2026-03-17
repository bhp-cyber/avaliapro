/*
  Warnings:

  - A unique constraint covering the columns `[nuvemshopStoreId]` on the table `Company` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Company_nuvemshopStoreId_key" ON "Company"("nuvemshopStoreId");
