-- AlterTable
ALTER TABLE "producto" ADD COLUMN IF NOT EXISTS "video_url" VARCHAR(512);
ALTER TABLE "producto" ADD COLUMN IF NOT EXISTS "video_card_url" VARCHAR(512);
