/*
  Warnings:

  - You are about to drop the column `campOrName` on the `SiteExpense` table. All the data in the column will be lost.
  - You are about to drop the column `campOrName` on the `SiteExpenseRefund` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[siteExpenseId]` on the table `SiteExpenseRefund` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SiteExpense" DROP COLUMN "campOrName";

-- AlterTable
ALTER TABLE "SiteExpenseRefund" DROP COLUMN "campOrName",
ADD COLUMN     "refundFromSite" TEXT,
ALTER COLUMN "refundDate" DROP NOT NULL,
ALTER COLUMN "amount" SET DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "SiteExpenseRefund_siteExpenseId_key" ON "SiteExpenseRefund"("siteExpenseId");
