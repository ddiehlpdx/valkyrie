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
    iconKey?: string;
    projectId: string;
    damageTypeId?: string | null;
    twoHanded?: boolean;
    defaultMinRange?: number;
    defaultMaxRange?: number;
}) {
    return db.weaponType.create({
        data: {
            name: data.name,
            iconKey: data.iconKey,
            projectId: data.projectId,
            damageTypeId: data.damageTypeId || null,
            twoHanded: data.twoHanded ?? false,
            defaultMinRange: data.defaultMinRange ?? 1,
            defaultMaxRange: data.defaultMaxRange ?? 1,
        },
    });
}

export async function updateWeaponType(id: string, data: {
    name?: string;
    iconKey?: string;
    damageTypeId?: string | null;
    twoHanded?: boolean;
    defaultMinRange?: number;
    defaultMaxRange?: number;
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
