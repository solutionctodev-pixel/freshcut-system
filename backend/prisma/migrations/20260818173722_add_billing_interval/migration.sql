-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "billingInterval" "BillingInterval" NOT NULL DEFAULT 'YEARLY';
