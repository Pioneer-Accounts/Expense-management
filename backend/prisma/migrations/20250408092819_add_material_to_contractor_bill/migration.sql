-- AlterTable
ALTER TABLE "ContractorBill" ADD COLUMN     "materialCodeId" INTEGER,
ADD COLUMN     "remarks" TEXT;

-- AddForeignKey
ALTER TABLE "ContractorBill" ADD CONSTRAINT "ContractorBill_materialCodeId_fkey" FOREIGN KEY ("materialCodeId") REFERENCES "MaterialCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
