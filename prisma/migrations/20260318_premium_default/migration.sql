-- Upgrade all existing teams to datarooms-premium
UPDATE "Team" SET plan = 'datarooms-premium' WHERE plan != 'datarooms-premium';

-- Update the default value for new teams
ALTER TABLE "Team" ALTER COLUMN "plan" SET DEFAULT 'datarooms-premium';
