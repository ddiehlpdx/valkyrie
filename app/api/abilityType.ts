import { db } from "~/db.server";

export async function getAbilityTypesByProjectId(projectId: string) {
    return db.abilityType.findMany({
        where: { projectId },
        orderBy: { displayOrder: 'asc' },
    });
}

export async function createAbilityType(data: {
    name: string;
    projectId: string;
}) {
    return db.abilityType.create({ data });
}

export async function updateAbilityType(id: string, data: {
    name?: string;
}) {
    return db.abilityType.update({
        where: { id },
        data,
    });
}

export async function deleteAbilityType(id: string) {
    return db.abilityType.delete({ where: { id } });
}

export async function reorderAbilityTypes(projectId: string, orderedIds: string[]) {
    return db.$transaction(
        orderedIds.map((id, index) =>
            db.abilityType.update({
                where: { id },
                data: { displayOrder: index },
            })
        )
    );
}
