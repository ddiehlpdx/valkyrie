import { db } from "~/db.server";

export async function getInteractionsByProjectId(projectId: string) {
    return db.damageTypeInteraction.findMany({
        where: { projectId },
        include: {
            sourceDamageType: true,
            targetDamageType: true,
        },
    });
}

export async function upsertInteraction(data: {
    projectId: string;
    sourceDamageTypeId: string;
    targetDamageTypeId: string;
    multiplier: number;
}) {
    return db.damageTypeInteraction.upsert({
        where: {
            projectId_sourceDamageTypeId_targetDamageTypeId: {
                projectId: data.projectId,
                sourceDamageTypeId: data.sourceDamageTypeId,
                targetDamageTypeId: data.targetDamageTypeId,
            },
        },
        update: { multiplier: data.multiplier },
        create: data,
    });
}

export async function bulkUpsertInteractions(
    projectId: string,
    interactions: Array<{
        sourceDamageTypeId: string;
        targetDamageTypeId: string;
        multiplier: number;
    }>
) {
    return db.$transaction(
        interactions.map((interaction) =>
            db.damageTypeInteraction.upsert({
                where: {
                    projectId_sourceDamageTypeId_targetDamageTypeId: {
                        projectId,
                        sourceDamageTypeId: interaction.sourceDamageTypeId,
                        targetDamageTypeId: interaction.targetDamageTypeId,
                    },
                },
                update: { multiplier: interaction.multiplier },
                create: { ...interaction, projectId },
            })
        )
    );
}

export async function deleteInteraction(interactionId: string) {
    return db.damageTypeInteraction.delete({ where: { id: interactionId } });
}
