import { db } from "~/db.server";
import { CategoryType } from "@prisma/client";

export async function getStatsByProjectId(projectId: string) {
    return db.statDefinition.findMany({
        where: { projectId },
        orderBy: { displayOrder: 'asc' },
    });
}

export async function createStat(data: {
    name: string;
    abbreviation: string;
    description?: string;
    category: CategoryType;
    minValue: number;
    maxValue: number;
    defaultValue: number;
    isPercentage: boolean;    
    projectId: string;
}) {
    return db.statDefinition.create({ data: {...data, description: data.description || null}})
}

export async function updateStat(statId: string, data: {
    name?: string;
    abbreviation?: string;
    description?: string;
    category?: CategoryType;
    minValue?: number;
    maxValue?: number;
    defaultValue?: number;
    isPercentage?: boolean;      
}) {
    return db.statDefinition.update({
        where: { id: statId },
        data
    });
}

export async function deleteStat(statId: string) {
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