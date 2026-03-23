import { db } from "~/db.server";

export async function getEquipmentTypesByProjectId(projectId: string) {
    return db.equipmentType.findMany({
        where: { projectId },
        orderBy: { displayOrder: 'asc' },
    });
}

export async function createEquipmentType(data: {
    name: string;
    projectId: string;
}) {
    return db.equipmentType.create({ data });
}

export async function updateEquipmentType(id: string, data: {
    name?: string;
}) {
    return db.equipmentType.update({
        where: { id },
        data,
    });
}

export async function deleteEquipmentType(id: string) {
    return db.equipmentType.delete({ where: { id } });
}

export async function reorderEquipmentTypes(projectId: string, orderedIds: string[]) {
    return db.$transaction(
        orderedIds.map((id, index) =>
            db.equipmentType.update({
                where: { id },
                data: { displayOrder: index },
            })
        )
    );
}
