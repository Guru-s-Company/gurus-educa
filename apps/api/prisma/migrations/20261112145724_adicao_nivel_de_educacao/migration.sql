-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('ENSINO_FUNDAMENTAL', 'ENSINO_MEDIO', 'GRADUACAO', 'POS_GRADUACAO');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "education" "EducationLevel";
