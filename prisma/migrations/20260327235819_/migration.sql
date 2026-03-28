/*
  Warnings:

  - A unique constraint covering the columns `[projectId,userId]` on the table `Collaborator` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('Self', 'SingleAlly', 'SingleEnemy', 'AllAllies', 'AllEnemies', 'Area', 'Line');

-- CreateEnum
CREATE TYPE "EffectType" AS ENUM ('Inflict', 'Cure');

-- CreateEnum
CREATE TYPE "TurnSystem" AS ENUM ('Initiative', 'RoundRobin', 'PhaseBased');

-- CreateEnum
CREATE TYPE "StatGrowthModel" AS ENUM ('ClassBased', 'Individual', 'Hybrid');

-- CreateEnum
CREATE TYPE "CategoryType" AS ENUM ('Core', 'Offensive', 'Defensive', 'Speed', 'Luck', 'Custom');

-- CreateEnum
CREATE TYPE "StatusEffectCategory" AS ENUM ('Buff', 'Debuff', 'Neutral');

-- CreateEnum
CREATE TYPE "DurationType" AS ENUM ('Temporary', 'Permanent', 'UntilBattleEnd');

-- CreateEnum
CREATE TYPE "ModifierType" AS ENUM ('Flat', 'Percentage');

-- DropForeignKey
ALTER TABLE "AbilityType" DROP CONSTRAINT "AbilityType_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ArmorType" DROP CONSTRAINT "ArmorType_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Collaborator" DROP CONSTRAINT "Collaborator_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Collaborator" DROP CONSTRAINT "Collaborator_userId_fkey";

-- DropForeignKey
ALTER TABLE "DamageType" DROP CONSTRAINT "DamageType_projectId_fkey";

-- DropForeignKey
ALTER TABLE "EquipmentType" DROP CONSTRAINT "EquipmentType_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Profession" DROP CONSTRAINT "Profession_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "WeaponType" DROP CONSTRAINT "WeaponType_projectId_fkey";

-- AlterTable
ALTER TABLE "DamageType" ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#808080',
ADD COLUMN     "description" TEXT,
ADD COLUMN     "iconKey" TEXT NOT NULL DEFAULT 'CircleDot';

-- AlterTable
ALTER TABLE "WeaponType" ADD COLUMN     "damageTypeId" TEXT;

-- CreateTable
CREATE TABLE "Ability" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "projectId" TEXT NOT NULL,
    "abilityTypeId" TEXT,
    "damageTypeId" TEXT,
    "targetType" "TargetType" NOT NULL DEFAULT 'SingleEnemy',
    "rangeMin" INTEGER NOT NULL DEFAULT 1,
    "rangeMax" INTEGER NOT NULL DEFAULT 1,
    "aoeRadius" INTEGER NOT NULL DEFAULT 0,
    "mpCost" INTEGER NOT NULL DEFAULT 0,
    "powerFormula" TEXT,
    "displayOrder" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AbilityStatusEffect" (
    "id" TEXT NOT NULL,
    "abilityId" TEXT NOT NULL,
    "statusEffectId" TEXT NOT NULL,
    "effectType" "EffectType" NOT NULL DEFAULT 'Inflict',
    "chance" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "AbilityStatusEffect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DamageTypeInteraction" (
    "id" TEXT NOT NULL,
    "sourceDamageTypeId" TEXT NOT NULL,
    "targetDamageTypeId" TEXT NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DamageTypeInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionAbility" (
    "id" TEXT NOT NULL,
    "professionId" TEXT NOT NULL,
    "abilityId" TEXT NOT NULL,
    "jpCost" INTEGER NOT NULL DEFAULT 0,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProfessionAbility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionArmorType" (
    "id" TEXT NOT NULL,
    "professionId" TEXT NOT NULL,
    "armorTypeId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProfessionArmorType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfessionWeaponType" (
    "id" TEXT NOT NULL,
    "professionId" TEXT NOT NULL,
    "weaponTypeId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProfessionWeaponType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSettings" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "defaultGridSizeX" INTEGER NOT NULL DEFAULT 10,
    "defaultGridSizeY" INTEGER NOT NULL DEFAULT 10,
    "defaultTileSize" INTEGER NOT NULL DEFAULT 32,
    "turnSystem" "TurnSystem" NOT NULL DEFAULT 'Initiative',
    "maxUnitsPerBattle" INTEGER NOT NULL DEFAULT 8,
    "maxLevel" INTEGER NOT NULL DEFAULT 99,
    "statGrowthModel" "StatGrowthModel" NOT NULL DEFAULT 'ClassBased',
    "physicalColor" TEXT NOT NULL DEFAULT '#d4d4d4',
    "magicalColor" TEXT NOT NULL DEFAULT '#d4d4d4',
    "chemicalColor" TEXT NOT NULL DEFAULT '#d4d4d4',
    "environmentalColor" TEXT NOT NULL DEFAULT '#d4d4d4',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "description" TEXT,
    "category" "CategoryType" NOT NULL,
    "minValue" INTEGER NOT NULL,
    "maxValue" INTEGER NOT NULL,
    "defaultValue" INTEGER NOT NULL,
    "isPercentage" BOOLEAN NOT NULL,
    "projectId" TEXT NOT NULL,
    "displayOrder" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusEffect" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "category" "StatusEffectCategory" NOT NULL DEFAULT 'Neutral',
    "durationType" "DurationType" NOT NULL DEFAULT 'Temporary',
    "duration" INTEGER,
    "stackable" BOOLEAN NOT NULL DEFAULT false,
    "preventsActions" BOOLEAN NOT NULL DEFAULT false,
    "causesRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringFormula" TEXT,
    "displayOrder" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatusEffect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatusEffectStatModifier" (
    "id" TEXT NOT NULL,
    "statusEffectId" TEXT NOT NULL,
    "statId" TEXT NOT NULL,
    "modifierType" "ModifierType" NOT NULL DEFAULT 'Flat',
    "value" DOUBLE PRECISION NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "StatusEffectStatModifier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Ability_projectId_idx" ON "Ability"("projectId");

-- CreateIndex
CREATE INDEX "AbilityStatusEffect_statusEffectId_idx" ON "AbilityStatusEffect"("statusEffectId");

-- CreateIndex
CREATE UNIQUE INDEX "AbilityStatusEffect_abilityId_statusEffectId_effectType_key" ON "AbilityStatusEffect"("abilityId", "statusEffectId", "effectType");

-- CreateIndex
CREATE UNIQUE INDEX "DamageTypeInteraction_projectId_sourceDamageTypeId_targetDa_key" ON "DamageTypeInteraction"("projectId", "sourceDamageTypeId", "targetDamageTypeId");

-- CreateIndex
CREATE INDEX "ProfessionAbility_abilityId_idx" ON "ProfessionAbility"("abilityId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionAbility_professionId_abilityId_key" ON "ProfessionAbility"("professionId", "abilityId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionArmorType_professionId_armorTypeId_key" ON "ProfessionArmorType"("professionId", "armorTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionWeaponType_professionId_weaponTypeId_key" ON "ProfessionWeaponType"("professionId", "weaponTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSettings_projectId_key" ON "ProjectSettings"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "StatDefinition_projectId_abbreviation_key" ON "StatDefinition"("projectId", "abbreviation");

-- CreateIndex
CREATE INDEX "StatusEffect_projectId_idx" ON "StatusEffect"("projectId");

-- CreateIndex
CREATE INDEX "StatusEffectStatModifier_statId_idx" ON "StatusEffectStatModifier"("statId");

-- CreateIndex
CREATE UNIQUE INDEX "StatusEffectStatModifier_statusEffectId_statId_key" ON "StatusEffectStatModifier"("statusEffectId", "statId");

-- CreateIndex
CREATE INDEX "Collaborator_userId_idx" ON "Collaborator"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Collaborator_projectId_userId_key" ON "Collaborator"("projectId", "userId");

-- CreateIndex
CREATE INDEX "Project_ownerId_idx" ON "Project"("ownerId");

-- AddForeignKey
ALTER TABLE "Ability" ADD CONSTRAINT "Ability_abilityTypeId_fkey" FOREIGN KEY ("abilityTypeId") REFERENCES "AbilityType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ability" ADD CONSTRAINT "Ability_damageTypeId_fkey" FOREIGN KEY ("damageTypeId") REFERENCES "DamageType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ability" ADD CONSTRAINT "Ability_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbilityStatusEffect" ADD CONSTRAINT "AbilityStatusEffect_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "Ability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbilityStatusEffect" ADD CONSTRAINT "AbilityStatusEffect_statusEffectId_fkey" FOREIGN KEY ("statusEffectId") REFERENCES "StatusEffect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbilityStatusEffect" ADD CONSTRAINT "AbilityStatusEffect_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AbilityType" ADD CONSTRAINT "AbilityType_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArmorType" ADD CONSTRAINT "ArmorType_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageType" ADD CONSTRAINT "DamageType_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageTypeInteraction" ADD CONSTRAINT "DamageTypeInteraction_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageTypeInteraction" ADD CONSTRAINT "DamageTypeInteraction_sourceDamageTypeId_fkey" FOREIGN KEY ("sourceDamageTypeId") REFERENCES "DamageType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageTypeInteraction" ADD CONSTRAINT "DamageTypeInteraction_targetDamageTypeId_fkey" FOREIGN KEY ("targetDamageTypeId") REFERENCES "DamageType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EquipmentType" ADD CONSTRAINT "EquipmentType_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profession" ADD CONSTRAINT "Profession_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionAbility" ADD CONSTRAINT "ProfessionAbility_professionId_fkey" FOREIGN KEY ("professionId") REFERENCES "Profession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionAbility" ADD CONSTRAINT "ProfessionAbility_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "Ability"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionAbility" ADD CONSTRAINT "ProfessionAbility_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionArmorType" ADD CONSTRAINT "ProfessionArmorType_professionId_fkey" FOREIGN KEY ("professionId") REFERENCES "Profession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionArmorType" ADD CONSTRAINT "ProfessionArmorType_armorTypeId_fkey" FOREIGN KEY ("armorTypeId") REFERENCES "ArmorType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionArmorType" ADD CONSTRAINT "ProfessionArmorType_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionWeaponType" ADD CONSTRAINT "ProfessionWeaponType_professionId_fkey" FOREIGN KEY ("professionId") REFERENCES "Profession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionWeaponType" ADD CONSTRAINT "ProfessionWeaponType_weaponTypeId_fkey" FOREIGN KEY ("weaponTypeId") REFERENCES "WeaponType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfessionWeaponType" ADD CONSTRAINT "ProfessionWeaponType_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSettings" ADD CONSTRAINT "ProjectSettings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatDefinition" ADD CONSTRAINT "StatDefinition_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusEffect" ADD CONSTRAINT "StatusEffect_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusEffectStatModifier" ADD CONSTRAINT "StatusEffectStatModifier_statusEffectId_fkey" FOREIGN KEY ("statusEffectId") REFERENCES "StatusEffect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusEffectStatModifier" ADD CONSTRAINT "StatusEffectStatModifier_statId_fkey" FOREIGN KEY ("statId") REFERENCES "StatDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StatusEffectStatModifier" ADD CONSTRAINT "StatusEffectStatModifier_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeaponType" ADD CONSTRAINT "WeaponType_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeaponType" ADD CONSTRAINT "WeaponType_damageTypeId_fkey" FOREIGN KEY ("damageTypeId") REFERENCES "DamageType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
