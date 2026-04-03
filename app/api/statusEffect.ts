import { db } from "~/db.server";
import { ModifierType } from "../../generated/prisma/browser";

type StatModifierInput = {
    statId: string;
    modifierType: ModifierType;
    value: number;
};

export async function getStatusEffectsByProjectId(projectId: string) {
    return db.statusEffect.findMany({
        where: { projectId },
        orderBy: { displayOrder: "asc" },
        include: {
            statModifiers: {
                include: { statDefinition: true },
            },
        },
    });
}

export async function createStatusEffect(data: {
    name: string;
    description?: string;
    color: string;
    iconKey: string;
    category: "Buff" | "Debuff" | "Neutral";
    durationType: "Temporary" | "Permanent" | "UntilBattleEnd";
    duration?: number | null;
    stackable: boolean;
    preventsActions: boolean;
    causesRecurring: boolean;
    recurringFormula?: string | null;
    projectId: string;
    statModifiers?: StatModifierInput[];
}) {
    return db.$transaction(async (tx) => {
        const statusEffect = await tx.statusEffect.create({
            data: {
                name: data.name,
                description: data.description || null,
                color: data.color,
                iconKey: data.iconKey,
                category: data.category,
                durationType: data.durationType,
                duration: data.duration ?? null,
                stackable: data.stackable,
                preventsActions: data.preventsActions,
                causesRecurring: data.causesRecurring,
                recurringFormula: data.recurringFormula || null,
                projectId: data.projectId,
            },
        });

        if (data.statModifiers?.length) {
            await tx.statusEffectStatModifier.createMany({
                data: data.statModifiers.map((m) => ({
                    statusEffectId: statusEffect.id,
                    statId: m.statId,
                    modifierType: m.modifierType,
                    value: m.value,
                    projectId: data.projectId,
                })),
            });
        }

        return statusEffect;
    });
}

export async function updateStatusEffect(
    id: string,
    data: {
        name?: string;
        description?: string | null;
        color?: string;
        iconKey?: string;
        category?: "Buff" | "Debuff" | "Neutral";
        durationType?: "Temporary" | "Permanent" | "UntilBattleEnd";
        duration?: number | null;
        stackable?: boolean;
        preventsActions?: boolean;
        causesRecurring?: boolean;
        recurringFormula?: string | null;
        projectId?: string;
        statModifiers?: StatModifierInput[];
    }
) {
    return db.$transaction(async (tx) => {
        const statusEffect = await tx.statusEffect.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                color: data.color,
                iconKey: data.iconKey,
                category: data.category,
                durationType: data.durationType,
                duration: data.duration,
                stackable: data.stackable,
                preventsActions: data.preventsActions,
                causesRecurring: data.causesRecurring,
                recurringFormula: data.recurringFormula,
            },
        });

        if (data.statModifiers !== undefined) {
            await tx.statusEffectStatModifier.deleteMany({
                where: { statusEffectId: id },
            });

            if (data.statModifiers.length) {
                await tx.statusEffectStatModifier.createMany({
                    data: data.statModifiers.map((m) => ({
                        statusEffectId: id,
                        statId: m.statId,
                        modifierType: m.modifierType,
                        value: m.value,
                        projectId: data.projectId!,
                    })),
                });
            }
        }

        return statusEffect;
    });
}

export async function deleteStatusEffect(id: string) {
    return db.statusEffect.delete({ where: { id } });
}

export async function reorderStatusEffects(projectId: string, orderedIds: string[]) {
    return db.$transaction(
        orderedIds.map((id, index) =>
            db.statusEffect.update({
                where: { id },
                data: { displayOrder: index },
            })
        )
    );
}
