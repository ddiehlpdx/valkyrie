import { db } from "~/db.server";

export async function getArmorTypesByProjectId(projectId: string) {
    return db.armorType.findMany({
        where: { projectId },
        orderBy: { displayOrder: 'asc' },
    });
}

export async function createArmorType(data: {
    name: string;
    projectId: string;
}) {
    return db.armorType.create({ data });
}

export async function updateArmorType(id: string, data: {
    name?: string;
}) {
    return db.armorType.update({
        where: { id },
        data,
    });
}

export async function deleteArmorType(id: string) {
    return db.armorType.delete({ where: { id } });
}

export async function reorderArmorTypes(projectId: string, orderedIds: string[]) {
    return db.$transaction(
        orderedIds.map((id, index) =>
            db.armorType.update({
                where: { id },
                data: { displayOrder: index },
            })
        )
    );
}
