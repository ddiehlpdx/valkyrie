import { db } from "~/db.server";

export async function getInteractionsByProjectId(projectId: string) {
    return db.elementInteraction.findMany({
        where: { projectId },
        include: {
            sourceElement: true,
            targetElement: true,
        },
    });
}

export async function upsertInteraction(data: {
    projectId: string;
    sourceElementId: string;
    targetElementId: string;
    multiplier: number;
}) {
    return db.elementInteraction.upsert({
        where: {
            projectId_sourceElementId_targetElementId: {
                projectId: data.projectId,
                sourceElementId: data.sourceElementId,
                targetElementId: data.targetElementId,
            },
        },
        update: { multiplier: data.multiplier },
        create: data,
    });
}

export async function bulkUpsertInteractions(
    projectId: string,
    interactions: Array<{
        sourceElementId: string;
        targetElementId: string;
        multiplier: number;
    }>
) {
    return db.$transaction(
        interactions.map((interaction) =>
            db.elementInteraction.upsert({
                where: {
                    projectId_sourceElementId_targetElementId: {
                        projectId,
                        sourceElementId: interaction.sourceElementId,
                        targetElementId: interaction.targetElementId,
                    },
                },
                update: { multiplier: interaction.multiplier },
                create: { ...interaction, projectId },
            })
        )
    );
}

export async function deleteInteraction(interactionId: string) {
    return db.elementInteraction.delete({ where: { id: interactionId } });
}
