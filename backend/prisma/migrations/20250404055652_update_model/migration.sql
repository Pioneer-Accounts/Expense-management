/*
  Warnings:

  - You are about to drop the column `userId` on the `ClientBill` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ClientBill" DROP CONSTRAINT "ClientBill_userId_fkey";

-- AlterTable
ALTER TABLE "ClientBill" DROP COLUMN "userId";
