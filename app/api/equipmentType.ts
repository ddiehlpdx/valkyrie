import { db } from "~/db.server";
import { SystemEquipmentKey } from "../../generated/prisma/browser";

const CORE_EQUIPMENT_DEFAULTS: Array<{
    systemKey: SystemEquipmentKey;
    name: string;
    iconKey: string;
    displayOrder: number;
}> = [
    {
        systemKey: "MAIN_HAND",
        name: "Main Hand",
        iconKey: "Sword",
        displayOrder: 0,
    },
    {
        systemKey: "OFF_HAND",
        name: "Off Hand",
        iconKey: "Shield",
        displayOrder: 1,
    },
];

export { CORE_EQUIPMENT_DEFAULTS };

export async function ensureCoreEquipmentTypes(projectId: string) {
    const existing = await db.equipmentType.findMany({
        where: { projectId, systemKey: { not: null } },
        select: { systemKey: true },
    });
    const existingKeys = new Set(existing.map((e) => e.systemKey));
    const missing = CORE_EQUIPMENT_DEFAULTS.filter((d) => !existingKeys.has(d.systemKey));

    if (missing.length === 0) return;

    await db.$transaction(
        missing.map((equipment) =>
            db.equipmentType.create({
                data: { ...equipment, projectId },
            })
        )
    );
}

export async function getEquipmentTypesByProjectId(projectId: string) {
    return db.equipmentType.findMany({
        where: { projectId },
        orderBy: { displayOrder: 'asc' },
    });
}

export async function createEquipmentType(data: {
    name: string;
    iconKey?: string;
    projectId: string;
}) {
    return db.equipmentType.create({ data });
}

export async function updateEquipmentType(id: string, data: {
    name?: string;
    iconKey?: string;
}) {
    return db.equipmentType.update({
        where: { id },
        data,
    });
}

export async function deleteEquipmentType(id: string) {
    const equipmentType = await db.equipmentType.findUnique({
        where: { id },
        select: { systemKey: true },
    });

    if (equipmentType?.systemKey) {
        throw new Error("Core engine equipment types cannot be deleted");
    }

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
