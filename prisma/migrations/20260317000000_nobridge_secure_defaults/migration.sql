-- Nobridge secure defaults: enable email auth, watermark, and screenshot protection by default
ALTER TABLE "Link" ALTER COLUMN "emailAuthenticated" SET DEFAULT true;
ALTER TABLE "Link" ALTER COLUMN "enableWatermark" SET DEFAULT true;
ALTER TABLE "Link" ALTER COLUMN "enableScreenshotProtection" SET DEFAULT true;
