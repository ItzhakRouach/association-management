-- CreateEnum
CREATE TYPE "OperationType" AS ENUM ('MEAL_DELIVERY', 'HOME_VISIT', 'HOLIDAY_EVENT', 'MEDICAL_ESCORT', 'OTHER');

-- CreateEnum
CREATE TYPE "OperationStatus" AS ENUM ('PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('SUGGESTED', 'CONFIRMED', 'DECLINED');

-- CreateEnum
CREATE TYPE "OutreachStatus" AS ENUM ('PENDING', 'SENT', 'DISMISSED');

-- CreateEnum
CREATE TYPE "Trend" AS ENUM ('RISING', 'STABLE', 'DECLINING');

-- CreateTable
CREATE TABLE "Volunteer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "skills" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Volunteer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    "donorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Operation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "OperationType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "OperationStatus" NOT NULL DEFAULT 'PLANNED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Operation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OperationAssignment" (
    "id" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'SUGGESTED',
    "volunteerId" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OperationAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonorOutreach" (
    "id" TEXT NOT NULL,
    "draft" TEXT NOT NULL,
    "status" "OutreachStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "donorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DonorOutreach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImpactScore" (
    "id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "operationCount" INTEGER NOT NULL,
    "consistencyScore" DOUBLE PRECISION NOT NULL,
    "activityTypes" TEXT[],
    "trend" "Trend" NOT NULL,
    "volunteerId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ImpactScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppreciationLetter" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" "OutreachStatus" NOT NULL DEFAULT 'PENDING',
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3),
    "volunteerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppreciationLetter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "councilEmail" TEXT NOT NULL DEFAULT '',
    "orgName" TEXT NOT NULL DEFAULT '',
    "orgDescription" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyReport" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "pdfUrl" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonthlyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Volunteer_email_key" ON "Volunteer"("email");

-- CreateIndex
CREATE INDEX "Volunteer_isActive_idx" ON "Volunteer"("isActive");

-- CreateIndex
CREATE INDEX "Volunteer_joinedAt_idx" ON "Volunteer"("joinedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Donor_email_key" ON "Donor"("email");

-- CreateIndex
CREATE INDEX "Donation_donorId_idx" ON "Donation"("donorId");

-- CreateIndex
CREATE INDEX "Donation_date_idx" ON "Donation"("date");

-- CreateIndex
CREATE INDEX "Operation_status_idx" ON "Operation"("status");

-- CreateIndex
CREATE INDEX "Operation_date_idx" ON "Operation"("date");

-- CreateIndex
CREATE INDEX "OperationAssignment_volunteerId_idx" ON "OperationAssignment"("volunteerId");

-- CreateIndex
CREATE INDEX "OperationAssignment_operationId_idx" ON "OperationAssignment"("operationId");

-- CreateIndex
CREATE INDEX "OperationAssignment_status_idx" ON "OperationAssignment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "OperationAssignment_volunteerId_operationId_key" ON "OperationAssignment"("volunteerId", "operationId");

-- CreateIndex
CREATE INDEX "DonorOutreach_donorId_idx" ON "DonorOutreach"("donorId");

-- CreateIndex
CREATE INDEX "DonorOutreach_status_idx" ON "DonorOutreach"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ImpactScore_volunteerId_key" ON "ImpactScore"("volunteerId");

-- CreateIndex
CREATE INDEX "ImpactScore_score_idx" ON "ImpactScore"("score");

-- CreateIndex
CREATE INDEX "ImpactScore_month_year_idx" ON "ImpactScore"("month", "year");

-- CreateIndex
CREATE INDEX "AppreciationLetter_volunteerId_idx" ON "AppreciationLetter"("volunteerId");

-- CreateIndex
CREATE INDEX "AppreciationLetter_status_idx" ON "AppreciationLetter"("status");

-- CreateIndex
CREATE INDEX "AppreciationLetter_month_year_idx" ON "AppreciationLetter"("month", "year");

-- CreateIndex
CREATE INDEX "MonthlyReport_month_year_idx" ON "MonthlyReport"("month", "year");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationAssignment" ADD CONSTRAINT "OperationAssignment_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OperationAssignment" ADD CONSTRAINT "OperationAssignment_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "Operation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonorOutreach" ADD CONSTRAINT "DonorOutreach_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImpactScore" ADD CONSTRAINT "ImpactScore_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AppreciationLetter" ADD CONSTRAINT "AppreciationLetter_volunteerId_fkey" FOREIGN KEY ("volunteerId") REFERENCES "Volunteer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
