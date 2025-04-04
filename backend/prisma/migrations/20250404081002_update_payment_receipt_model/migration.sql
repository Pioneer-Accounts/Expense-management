/*
  Warnings:

  - You are about to drop the column `userId` on the `PaymentReceipt` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PaymentReceipt" DROP CONSTRAINT "PaymentReceipt_userId_fkey";

-- AlterTable
ALTER TABLE "PaymentReceipt" DROP COLUMN "userId";
