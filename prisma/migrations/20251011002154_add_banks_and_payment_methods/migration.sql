-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "bankId" TEXT,
ADD COLUMN     "paymentMethod" TEXT;

-- CreateTable
CREATE TABLE "Bank" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cardLimit" DOUBLE PRECISION,
    "hasCard" BOOLEAN NOT NULL DEFAULT false,
    "invoiceDueDate" INTEGER,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bank_name_userId_key" ON "Bank"("name", "userId");
