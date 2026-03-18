import { db } from "~/db.server";

export async function getProjectById(id: string) {
    return db.project.findUnique({ 
        where: { id },
        include: {
            owner: { omit: { password: true } },
            collaborators: {
                include: {
                    user: { omit: { password: true } }
                }
            }
        }
    });
}

export async function getProjectsByUserId(userId: string) {
    // Get projects owned by the user
    const ownedProjects = await db.project.findMany({ 
        where: { ownerId: userId },
        include: {
            owner: { omit: { password: true } },
            collaborators: {
                include: {
                    user: { omit: { password: true } }
                }
            }
        }
    });

    // Get projects where user is a collaborator
    const collaboratedProjects = await db.project.findMany({
        where: {
            collaborators: {
                some: { userId }
            }
        },
        include: {
            owner: { omit: { password: true } },
            collaborators: {
                include: {
                    user: { omit: { password: true } }
                }
            }
        }
    });

    // Combine and deduplicate
    const allProjects = [...ownedProjects];
    collaboratedProjects.forEach(project => {
        if (!allProjects.find(p => p.id === project.id)) {
            allProjects.push(project);
        }
    });

    return allProjects;
}

export async function createProject(data: {
    name: string;
    description?: string;
    template: 'blank' | 'starter';
    ownerId: string;
}) {
    return db.$transaction(async (tx) => {
        const project = await tx.project.create({
            data: {
                name: data.name,
                description: data.description || null,
                ownerId: data.ownerId,
            },
        });

        await tx.projectSettings.create({
            data: { projectId: project.id },
        });

        return project;
    });
}

export async function deleteProject(projectId: string) {
    return db.project.delete({ where: { id: projectId } });
}

// Collaboration functions
export async function addCollaborator(projectId: string, userId: string) {
    // Check if collaboration already exists
    const existing = await db.collaborator.findFirst({
        where: { projectId, userId }
    });
    
    if (existing) {
        throw new Error('User is already a collaborator on this project');
    }
    
    return db.collaborator.create({
        data: { projectId, userId }
    });
}

export async function removeCollaborator(projectId: string, userId: string) {
    return db.collaborator.deleteMany({
        where: { projectId, userId }
    });
}

export async function getProjectCollaborators(projectId: string) {
    return db.collaborator.findMany({
        where: { projectId },
        include: {
            user: { omit: { password: true } }
        }
    });
}

// Permission checking functions
export async function isProjectOwner(projectId: string, userId: string) {
    const project = await db.project.findUnique({
        where: { id: projectId },
        select: { ownerId: true }
    });
    return project?.ownerId === userId;
}

export async function isProjectCollaborator(projectId: string, userId: string) {
    const collaboration = await db.collaborator.findFirst({
        where: { projectId, userId }
    });
    return !!collaboration;
}

export async function hasProjectAccess(projectId: string, userId: string) {
    const project = await db.project.findUnique({
        where: { id: projectId },
        select: {
            ownerId: true,
            collaborators: {
                where: { userId },
                select: { id: true }
            }
        }
    });

    if (!project) return { hasAccess: false, role: null };
    if (project.ownerId === userId) return { hasAccess: true, role: 'owner' as const };
    if (project.collaborators.length > 0) return { hasAccess: true, role: 'collaborator' as const };
    return { hasAccess: false, role: null };
}

// User search for collaboration invites
export async function searchUsers(query: string) {
    return db.user.findMany({
        where: {
            OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } }
            ]
        },
        select: {
            id: true,
            username: true,
            email: true
        },
        take: 10 // Limit to 10 results
    });
}

// Project update functions
export async function updateProject(projectId: string, data: {
    name?: string;
    description?: string;
}) {
    return db.project.update({
        where: { id: projectId },
        data,
        include: {
            owner: { omit: { password: true } },
            collaborators: {
                include: {
                    user: { omit: { password: true } }
                }
            }
        }
    });
}