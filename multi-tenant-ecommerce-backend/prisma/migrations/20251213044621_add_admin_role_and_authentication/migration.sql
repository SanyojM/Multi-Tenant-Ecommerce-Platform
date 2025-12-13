/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `StoreAdmin` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'STORE_OWNER');

-- DropForeignKey
ALTER TABLE "StoreAdmin" DROP CONSTRAINT "StoreAdmin_storeId_fkey";

-- AlterTable
ALTER TABLE "StoreAdmin" ADD COLUMN     "name" TEXT,
ADD COLUMN     "role" "AdminRole" NOT NULL DEFAULT 'STORE_OWNER',
ALTER COLUMN "storeId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StoreAdmin_email_key" ON "StoreAdmin"("email");

-- AddForeignKey
ALTER TABLE "StoreAdmin" ADD CONSTRAINT "StoreAdmin_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE SET NULL ON UPDATE CASCADE;
