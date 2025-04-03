-- CreateEnum
CREATE TYPE "DeductionType" AS ENUM ('IT_TDS', 'GST_TDS', 'SD_RETENTION', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "jobNo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,
    "site" TEXT NOT NULL,
    "workOrderValue" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientBill" (
    "id" SERIAL NOT NULL,
    "billNo" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "baseAmount" DOUBLE PRECISION NOT NULL,
    "gst" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "jobId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ClientBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentReceipt" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "billNo" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "chequeOrDdNo" TEXT,
    "baseAmount" DOUBLE PRECISION NOT NULL,
    "gst" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "clientId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PaymentReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deduction" (
    "id" SERIAL NOT NULL,
    "type" "DeductionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paymentReceiptId" INTEGER NOT NULL,

    CONSTRAINT "Deduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientPaymentStatus" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "billId" INTEGER NOT NULL,
    "billValue" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "paymentMode" TEXT,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "balanceDue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientPaymentStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractorSupplier" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractorSupplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractorBill" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "contractorSupplierId" INTEGER NOT NULL,
    "billNo" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "baseAmount" DOUBLE PRECISION NOT NULL,
    "gst" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractorBill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractorPayment" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "billNo" TEXT NOT NULL,
    "contractorBillId" INTEGER NOT NULL,
    "contractorSupplierId" INTEGER NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "chequeOrDdNo" TEXT,
    "baseAmount" DOUBLE PRECISION NOT NULL,
    "gst" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractorPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractorDeduction" (
    "id" SERIAL NOT NULL,
    "type" "DeductionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "contractorPaymentId" INTEGER NOT NULL,

    CONSTRAINT "ContractorDeduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractorPaymentStatus" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "contractorSupplierId" INTEGER NOT NULL,
    "billId" INTEGER NOT NULL,
    "billNo" TEXT NOT NULL,
    "billAmount" DOUBLE PRECISION NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "paymentMode" TEXT,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "balanceDue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractorPaymentStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteExpense" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "siteId" TEXT NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "campOrName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteExpense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteExpenseRefund" (
    "id" SERIAL NOT NULL,
    "siteExpenseId" INTEGER NOT NULL,
    "refundDate" TIMESTAMP(3) NOT NULL,
    "campOrName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteExpenseRefund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteExpenseEnquiry" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "clientId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "site" TEXT NOT NULL,
    "campOrName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteExpenseEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobNo_key" ON "Job"("jobNo");

-- CreateIndex
CREATE UNIQUE INDEX "ClientBill_billNo_key" ON "ClientBill"("billNo");

-- CreateIndex
CREATE UNIQUE INDEX "ContractorSupplier_code_key" ON "ContractorSupplier"("code");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientBill" ADD CONSTRAINT "ClientBill_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientBill" ADD CONSTRAINT "ClientBill_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientBill" ADD CONSTRAINT "ClientBill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentReceipt" ADD CONSTRAINT "PaymentReceipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deduction" ADD CONSTRAINT "Deduction_paymentReceiptId_fkey" FOREIGN KEY ("paymentReceiptId") REFERENCES "PaymentReceipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPaymentStatus" ADD CONSTRAINT "ClientPaymentStatus_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPaymentStatus" ADD CONSTRAINT "ClientPaymentStatus_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientPaymentStatus" ADD CONSTRAINT "ClientPaymentStatus_billId_fkey" FOREIGN KEY ("billId") REFERENCES "ClientBill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorBill" ADD CONSTRAINT "ContractorBill_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorBill" ADD CONSTRAINT "ContractorBill_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorBill" ADD CONSTRAINT "ContractorBill_contractorSupplierId_fkey" FOREIGN KEY ("contractorSupplierId") REFERENCES "ContractorSupplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorPayment" ADD CONSTRAINT "ContractorPayment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorPayment" ADD CONSTRAINT "ContractorPayment_contractorBillId_fkey" FOREIGN KEY ("contractorBillId") REFERENCES "ContractorBill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorPayment" ADD CONSTRAINT "ContractorPayment_contractorSupplierId_fkey" FOREIGN KEY ("contractorSupplierId") REFERENCES "ContractorSupplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorDeduction" ADD CONSTRAINT "ContractorDeduction_contractorPaymentId_fkey" FOREIGN KEY ("contractorPaymentId") REFERENCES "ContractorPayment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorPaymentStatus" ADD CONSTRAINT "ContractorPaymentStatus_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorPaymentStatus" ADD CONSTRAINT "ContractorPaymentStatus_contractorSupplierId_fkey" FOREIGN KEY ("contractorSupplierId") REFERENCES "ContractorSupplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorPaymentStatus" ADD CONSTRAINT "ContractorPaymentStatus_billId_fkey" FOREIGN KEY ("billId") REFERENCES "ContractorBill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteExpense" ADD CONSTRAINT "SiteExpense_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteExpense" ADD CONSTRAINT "SiteExpense_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteExpenseRefund" ADD CONSTRAINT "SiteExpenseRefund_siteExpenseId_fkey" FOREIGN KEY ("siteExpenseId") REFERENCES "SiteExpense"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteExpenseEnquiry" ADD CONSTRAINT "SiteExpenseEnquiry_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteExpenseEnquiry" ADD CONSTRAINT "SiteExpenseEnquiry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
