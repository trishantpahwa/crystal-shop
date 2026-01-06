-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('RINGS', 'NECKLACES', 'EARRINGS', 'BRACELETS');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" "ProductCategory" NOT NULL DEFAULT 'RINGS';
