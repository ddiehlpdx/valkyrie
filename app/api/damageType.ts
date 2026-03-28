import { db } from "~/db.server";
import { BaseDamageType } from "../../generated/prisma/browser";

export async function getDamageTypesByProjectId(projectId: string) {
    return db.damageType.findMany({
        where: { projectId },
        orderBy: { displayOrder: 'asc' },
    });
}

export async function createDamageType(data: {
    name: string;
    baseType: BaseDamageType;
    color: string;
    iconKey: string;
    description?: string | null;
    projectId: string;
}) {
    return db.damageType.create({
        data: {
            name: data.name,
            baseType: data.baseType,
            color: data.color,
            iconKey: data.iconKey,
            description: data.description || null,
            projectId: data.projectId,
        },
    });
}

export async function updateDamageType(id: string, data: {
    name?: string;
    baseType?: BaseDamageType;
    color?: string;
    iconKey?: string;
    description?: string | null;
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
