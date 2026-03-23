import { db } from "~/db.server";
import { BaseDamageType } from "@prisma/client";

export async function getDamageTypesByProjectId(projectId: string) {
    return db.damageType.findMany({
        where: { projectId },
        orderBy: { displayOrder: 'asc' },
        include: { element: true },
    });
}

export async function createDamageType(data: {
    name: string;
    baseType: BaseDamageType;
    projectId: string;
    elementId?: string | null;
}) {
    return db.damageType.create({
        data: {
            name: data.name,
            baseType: data.baseType,
            projectId: data.projectId,
            elementId: data.elementId || null,
        },
    });
}

export async function updateDamageType(id: string, data: {
    name?: string;
    baseType?: BaseDamageType;
    elementId?: string | null;
}) {
    return db.damageType.update({
        where: { id },
        data,
    });
}

export async function deleteDamageType(id: string) {
    return db.damageType.delete({ where: { id } });
}

export async function reorderDamageTypes(projectId: string, orderedIds: string[]) {
    return db.$transaction(
        orderedIds.map((id, index) =>
            db.damageType.update({
                where: { id },
                data: { displayOrder: index },
            })
        )
    );
}
