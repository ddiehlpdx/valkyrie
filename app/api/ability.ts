import { db } from "~/db.server";
import { EffectType } from "../../generated/prisma/browser";

type ProfessionEntry = {
    professionId: string;
    jpCost: number;
};

type StatusEffectEntry = {
    statusEffectId: string;
    effectType: EffectType;
    chance: number;
};

export async function getAbilitiesByProjectId(projectId: string) {
    return db.ability.findMany({
        where: { projectId },
        orderBy: { displayOrder: "asc" },
        include: {
            abilityType: true,
            damageType: true,
            professions: { include: { profession: true } },
            statusEffects: { include: { statusEffect: true } },
        },
    });
}

export async function createAbility(data: {
    name: string;
    description?: string;
    abilityTypeId?: string | null;
    damageTypeId?: string | null;
    targetType: "Self" | "SingleAlly" | "SingleEnemy" | "AllAllies" | "AllEnemies" | "Area" | "Line";
    rangeMin: number;
    rangeMax: number;
    aoeRadius: number;
    mpCost: number;
    powerFormula?: string | null;
    projectId: string;
    professionEntries?: ProfessionEntry[];
    statusEffectEntries?: StatusEffectEntry[];
}) {
    return db.$transaction(async (tx) => {
        const ability = await tx.ability.create({
            data: {
                name: data.name,
                description: data.description || null,
                abilityTypeId: data.abilityTypeId || null,
                damageTypeId: data.damageTypeId || null,
                targetType: data.targetType,
                rangeMin: data.rangeMin,
                rangeMax: data.rangeMax,
                aoeRadius: data.aoeRadius,
                mpCost: data.mpCost,
                powerFormula: data.powerFormula || null,
                projectId: data.projectId,
            },
        });

        if (data.professionEntries?.length) {
            await tx.professionAbility.createMany({
                data: data.professionEntries.map((e) => ({
                    professionId: e.professionId,
                    abilityId: ability.id,
                    jpCost: e.jpCost,
                    projectId: data.projectId,
                })),
            });
        }

        if (data.statusEffectEntries?.length) {
            await tx.abilityStatusEffect.createMany({
                data: data.statusEffectEntries.map((e) => ({
                    abilityId: ability.id,
                    statusEffectId: e.statusEffectId,
                    effectType: e.effectType,
                    chance: e.chance,
                    projectId: data.projectId,
                })),
            });
        }

        return ability;
    });
}

export async function updateAbility(
    id: string,
    data: {
        name?: string;
        description?: string | null;
        abilityTypeId?: string | null;
        damageTypeId?: string | null;
        targetType?: "Self" | "SingleAlly" | "SingleEnemy" | "AllAllies" | "AllEnemies" | "Area" | "Line";
        rangeMin?: number;
        rangeMax?: number;
        aoeRadius?: number;
        mpCost?: number;
        powerFormula?: string | null;
        projectId?: string;
        professionEntries?: ProfessionEntry[];
        statusEffectEntries?: StatusEffectEntry[];
    }
) {
    return db.$transaction(async (tx) => {
        const ability = await tx.ability.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                abilityTypeId: data.abilityTypeId,
                damageTypeId: data.damageTypeId,
                targetType: data.targetType,
                rangeMin: data.rangeMin,
                rangeMax: data.rangeMax,
                aoeRadius: data.aoeRadius,
                mpCost: data.mpCost,
                powerFormula: data.powerFormula,
            },
        });

        if (data.professionEntries !== undefined) {
            await tx.professionAbility.deleteMany({ where: { abilityId: id } });
            if (data.professionEntries.length) {
                await tx.professionAbility.createMany({
                    data: data.professionEntries.map((e) => ({
                        professionId: e.professionId,
                        abilityId: id,
                        jpCost: e.jpCost,
                        projectId: data.projectId!,
                    })),
                });
            }
        }

        if (data.statusEffectEntries !== undefined) {
            await tx.abilityStatusEffect.deleteMany({ where: { abilityId: id } });
            if (data.statusEffectEntries.length) {
                await tx.abilityStatusEffect.createMany({
                    data: data.statusEffectEntries.map((e) => ({
                        abilityId: id,
                        statusEffectId: e.statusEffectId,
                        effectType: e.effectType,
                        chance: e.chance,
                        projectId: data.projectId!,
                    })),
                });
            }
        }

        return ability;
    });
}

export async function deleteAbility(id: string) {
    return db.ability.delete({ where: { id } });
}

export async function reorderAbilities(projectId: string, orderedIds: string[]) {
    return db.$transaction(
        orderedIds.map((id, index) =>
            db.ability.update({
                where: { id },
                data: { displayOrder: index },
            })
        )
    );
}
