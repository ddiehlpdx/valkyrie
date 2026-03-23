import { db } from "~/db.server";

export async function getProfessionsByProjectId(projectId: string) {
    return db.profession.findMany({
        where: { projectId },
        orderBy: { displayOrder: 'asc' },
        include: {
            allowedWeaponTypes: { include: { weaponType: true } },
            allowedArmorTypes: { include: { armorType: true } },
        },
    });
}

export async function createProfession(data: {
    name: string;
    projectId: string;
    weaponTypeIds?: string[];
    armorTypeIds?: string[];
}) {
    return db.$transaction(async (tx) => {
        const profession = await tx.profession.create({
            data: {
                name: data.name,
                projectId: data.projectId,
            },
        });

        if (data.weaponTypeIds?.length) {
            await tx.professionWeaponType.createMany({
                data: data.weaponTypeIds.map((weaponTypeId) => ({
                    professionId: profession.id,
                    weaponTypeId,
                    projectId: data.projectId,
                })),
            });
        }

        if (data.armorTypeIds?.length) {
            await tx.professionArmorType.createMany({
                data: data.armorTypeIds.map((armorTypeId) => ({
                    professionId: profession.id,
                    armorTypeId,
                    projectId: data.projectId,
                })),
            });
        }

        return profession;
    });
}

export async function updateProfession(id: string, data: {
    name?: string;
    weaponTypeIds?: string[];
    armorTypeIds?: string[];
    projectId?: string;
}) {
    return db.$transaction(async (tx) => {
        const profession = await tx.profession.update({
            where: { id },
            data: { name: data.name },
        });

        if (data.weaponTypeIds !== undefined) {
            await tx.professionWeaponType.deleteMany({
                where: { professionId: id },
            });
            if (data.weaponTypeIds.length) {
                await tx.professionWeaponType.createMany({
                    data: data.weaponTypeIds.map((weaponTypeId) => ({
                        professionId: id,
                        weaponTypeId,
                        projectId: data.projectId!,
                    })),
                });
            }
        }

        if (data.armorTypeIds !== undefined) {
            await tx.professionArmorType.deleteMany({
                where: { professionId: id },
            });
            if (data.armorTypeIds.length) {
                await tx.professionArmorType.createMany({
                    data: data.armorTypeIds.map((armorTypeId) => ({
                        professionId: id,
                        armorTypeId,
                        projectId: data.projectId!,
                    })),
                });
            }
        }

        return profession;
    });
}

export async function deleteProfession(id: string) {
    return db.profession.delete({ where: { id } });
}

export async function reorderProfessions(projectId: string, orderedIds: string[]) {
    return db.$transaction(
        orderedIds.map((id, index) =>
            db.profession.update({
                where: { id },
                data: { displayOrder: index },
            })
        )
    );
}
