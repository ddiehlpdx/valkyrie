import { db } from "~/db.server";
import { TurnSystem, StatGrowthModel } from "../../generated/prisma/browser";

export async function getProjectSettings(projectId: string) {
  return db.projectSettings.findUnique({
    where: { projectId },
  });
}

export async function createDefaultProjectSettings(projectId: string) {
  return db.projectSettings.create({
    data: { projectId },
  });
}

export interface UpdateProjectSettingsData {
  defaultGridSizeX?: number;
  defaultGridSizeY?: number;
  defaultTileSize?: number;
  turnSystem?: TurnSystem;
  maxUnitsPerBattle?: number;
  maxLevel?: number;
  statGrowthModel?: StatGrowthModel;
  physicalColor?: string;
  magicalColor?: string;
  chemicalColor?: string;
  environmentalColor?: string;
}

export async function updateProjectSettings(
  projectId: string,
  data: UpdateProjectSettingsData
) {
  return db.projectSettings.upsert({
    where: { projectId },
    update: data,
    create: { projectId, ...data },
  });
}
