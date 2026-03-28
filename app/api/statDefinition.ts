import { db } from "~/db.server";
import { SystemStatKey } from "../../generated/prisma/browser";

const CORE_STAT_DEFAULTS: Array<{
    systemKey: SystemStatKey;
    name: string;
    abbreviation: string;
    description: string;
    group: string | null;
    minValue: number;
    maxValue: number;
    defaultValue: number;
    isPercentage: boolean;
    displayOrder: number;
}> = [
    {
        systemKey: "HP",
        name: "Hit Points",
        abbreviation: "HP",
        description: "Determines when a unit is defeated",
        group: null,
        minValue: 0,
        maxValue: 9999,
        defaultValue: 100,
        isPercentage: false,
        displayOrder: 0,
    },
    {
        systemKey: "MP",
        name: "Magic Points",
        abbreviation: "MP",
        description: "Resource consumed when using abilities",
        group: null,
        minValue: 0,
        maxValue: 999,
        defaultValue: 20,
        isPercentage: false,
        displayOrder: 1,
    },
    {
        systemKey: "MOV",
        name: "Movement",
        abbreviation: "MOV",
        description: "Number of tiles a unit can traverse per turn",
        group: null,
        minValue: 1,
        maxValue: 20,
        defaultValue: 4,
        isPercentage: false,
        displayOrder: 2,
    },
];

export { CORE_STAT_DEFAULTS };

export async function getStatsByProjectId(projectId: string) {
    return db.statDefinition.findMany({
        where: { projectId },
        orderBy: { displayOrder: 'asc' },
    });
}

export async function getStatBySystemKey(projectId: string, systemKey: SystemStatKey) {
    return db.statDefinition.findUnique({
        where: { projectId_systemKey: { projectId, systemKey } },
    });
}

export async function ensureCoreStats(projectId: string) {
    const existing = await db.statDefinition.findMany({
        where: { projectId, systemKey: { not: null } },
        select: { systemKey: true },
    });
    const existingKeys = new Set(existing.map((s) => s.systemKey));
    const missing = CORE_STAT_DEFAULTS.filter((d) => !existingKeys.has(d.systemKey));

    if (missing.length === 0) return;

    await db.$transaction(
        missing.map((stat) =>
            // Adopt an existing stat with matching abbreviation, or create a new one
            db.statDefinition.upsert({
                where: {
                    projectId_abbreviation: { projectId, abbreviation: stat.abbreviation },
                },
                update: { systemKey: stat.systemKey },
                create: { ...stat, projectId },
            })
        )
    );
}

export async function createStat(data: {
    name: string;
    abbreviation: string;
    description?: string;
    group?: string;
    minValue: number;
    maxValue: number;
    defaultValue: number;
    isPercentage: boolean;
    projectId: string;
}) {
    return db.statDefinition.create({
        data: {
            ...data,
            description: data.description || null,
            group: data.group || null,
        },
    });
}

export async function updateStat(statId: string, data: {
    name?: string;
    abbreviation?: string;
    description?: string;
    group?: string;
    minValue?: number;
    maxValue?: number;
    defaultValue?: number;
    isPercentage?: boolean;
}) {
    return db.statDefinition.update({
        where: { id: statId },
        data,
    });
}

export async function deleteStat(statId: string) {
    const stat = await db.statDefinition.findUnique({
        where: { id: statId },
        select: { systemKey: true },
    });

    if (stat?.systemKey) {
        throw new Error("Core engine stats cannot be deleted");
    }

    return db.statDefinition.delete({ where: { id: statId } });
}

export async function reorderStats(projectId: string, orderedIds: string[]) {
    return db.$transaction(
        orderedIds.map((id, index) =>
            db.statDefinition.update({
                where: { id },
                data: { displayOrder: index },
            })
        )
    );
}
