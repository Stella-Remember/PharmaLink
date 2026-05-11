-- CreateEnum
CREATE TYPE "InsuranceClaimSubmissionType" AS ENUM ('DIGITAL', 'PAPER', 'BOTH');

-- CreateEnum
CREATE TYPE "FormularyStatus" AS ENUM ('FORMULARY', 'PREFERRED', 'NON_FORMULARY', 'EXCLUDED');

-- AlterTable
ALTER TABLE "Claim" ADD COLUMN     "diagnosis" TEXT,
ADD COLUMN     "insuranceMemberNumber" TEXT,
ADD COLUMN     "insurancePlanId" TEXT,
ADD COLUMN     "patientId" TEXT,
ADD COLUMN     "patientName" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "coverageDetails" JSONB,
ADD COLUMN     "insuranceContribution" DOUBLE PRECISION,
ADD COLUMN     "insuranceMemberNumber" TEXT,
ADD COLUMN     "insurancePlanId" TEXT,
ADD COLUMN     "patientCopay" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "coveragePercent" DOUBLE PRECISION,
ADD COLUMN     "insuranceAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "patientAmount" DOUBLE PRECISION DEFAULT 0;

-- CreateTable
CREATE TABLE "ClaimLineItem" (
    "id" TEXT NOT NULL,
    "claimId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "medicineName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "coveragePercent" DOUBLE PRECISION NOT NULL,
    "insuranceAmount" DOUBLE PRECISION NOT NULL,
    "patientAmount" DOUBLE PRECISION NOT NULL,
    "formularyStatus" "FormularyStatus" NOT NULL,
    "priceCapApplied" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimLineItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceProvider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "claimRequirements" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsurancePlan" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "coveragePercent" DOUBLE PRECISION NOT NULL DEFAULT 80,
    "patientCopayPercent" DOUBLE PRECISION NOT NULL DEFAULT 20,
    "requiresPrescription" BOOLEAN NOT NULL DEFAULT true,
    "claimSubmissionType" "InsuranceClaimSubmissionType" NOT NULL DEFAULT 'DIGITAL',
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsurancePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsuranceCoverageRule" (
    "id" TEXT NOT NULL,
    "insurancePlanId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "coveragePercent" DOUBLE PRECISION NOT NULL,
    "priceCap" DOUBLE PRECISION,
    "requiresPreAuth" BOOLEAN NOT NULL DEFAULT false,
    "formularyStatus" "FormularyStatus" NOT NULL DEFAULT 'FORMULARY',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceCoverageRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClaimLineItem_claimId_idx" ON "ClaimLineItem"("claimId");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceProvider_shortName_key" ON "InsuranceProvider"("shortName");

-- CreateIndex
CREATE UNIQUE INDEX "InsurancePlan_shortCode_key" ON "InsurancePlan"("shortCode");

-- CreateIndex
CREATE INDEX "InsuranceCoverageRule_medicineId_idx" ON "InsuranceCoverageRule"("medicineId");

-- CreateIndex
CREATE INDEX "InsuranceCoverageRule_insurancePlanId_idx" ON "InsuranceCoverageRule"("insurancePlanId");

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceCoverageRule_insurancePlanId_medicineId_key" ON "InsuranceCoverageRule"("insurancePlanId", "medicineId");

-- CreateIndex
CREATE INDEX "Claim_status_idx" ON "Claim"("status");

-- CreateIndex
CREATE INDEX "Claim_insurancePlanId_idx" ON "Claim"("insurancePlanId");

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_insurancePlanId_fkey" FOREIGN KEY ("insurancePlanId") REFERENCES "InsurancePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_insurancePlanId_fkey" FOREIGN KEY ("insurancePlanId") REFERENCES "InsurancePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimLineItem" ADD CONSTRAINT "ClaimLineItem_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "Claim"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurancePlan" ADD CONSTRAINT "InsurancePlan_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "InsuranceProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceCoverageRule" ADD CONSTRAINT "InsuranceCoverageRule_insurancePlanId_fkey" FOREIGN KEY ("insurancePlanId") REFERENCES "InsurancePlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceCoverageRule" ADD CONSTRAINT "InsuranceCoverageRule_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
