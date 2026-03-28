-- CreateEnum
CREATE TYPE "SystemStatKey" AS ENUM ('HP', 'MP', 'MOV');

-- Add new columns before dropping old ones
ALTER TABLE "StatDefinition" ADD COLUMN "systemKey" "SystemStatKey";
ALTER TABLE "StatDefinition" ADD COLUMN "group" TEXT;

-- Migrate existing category data to group
UPDATE "StatDefinition" SET "group" = "category"::"text";

-- Drop old category column and enum
ALTER TABLE "StatDefinition" DROP COLUMN "category";
DROP TYPE "CategoryType";

-- Add unique constraint for systemKey per project (nulls are allowed by PostgreSQL)
CREATE UNIQUE INDEX "StatDefinition_projectId_systemKey_key" ON "StatDefinition"("projectId", "systemKey");
