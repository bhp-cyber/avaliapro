-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "avatarPreset" TEXT,
ADD COLUMN     "avatarType" TEXT DEFAULT 'initial',
ADD COLUMN     "avatarUrl" TEXT;
