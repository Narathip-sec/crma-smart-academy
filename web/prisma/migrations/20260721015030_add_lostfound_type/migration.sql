-- CreateEnum
CREATE TYPE "LostFoundType" AS ENUM ('lost', 'found');

-- AlterTable
ALTER TABLE "LostFoundItem" ADD COLUMN     "type" "LostFoundType" NOT NULL DEFAULT 'found';
