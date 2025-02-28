import { db } from "~/db.server";

export async function getProjectById(id: string) {
    return db.project.findUnique({ where: { id }});
}

export async function getProjectsByUserId(userId: string) {
    const projects = await db.project.findMany({ where: { ownerId: userId }});
    const collaborations = await db.collaborator.findMany({ where: { userId }});

    collaborations.map(async (collab) => {
        const project = await getProjectById(collab.projectId);

        if (project) {
            projects.push(project);
        }
    });

    return projects;
}