import { db } from "~/db.server";

export async function getWeaponTypesByProjectId(projectId: string) {
    return db.weaponType.findMany({
        where: { projectId },
        orderBy: { displayOrder: 'asc' },
        include: { damageType: true },
    });
}

export async function createWeaponType(data: {
    name: string;
    projectId: string;
    damageTypeId?: string | null;
}) {
    return db.weaponType.create({
        data: {
            name: data.name,
            projectId: data.projectId,
            damageTypeId: data.damageTypeId || null,
        },
    });
}

export async function updateWeaponType(id: string, data: {
    name?: string;
    damageTypeId?: string | null;
}) {
    return db.weaponType.update({
        where: { id },
        data,
    });
}

export async function deleteWeaponType(id: string) {
    return db.weaponType.delete({ where: { id } });
}

export async function reorderWeaponTypes(projectId: string, orderedIds: string[]) {
    return db.$transaction(
        orderedIds.map((id, index) =>
            db.weaponType.update({
                where: { id },
                data: { displayOrder: index },
            })
        )
    );
}
