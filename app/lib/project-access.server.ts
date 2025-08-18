import { redirect } from "@remix-run/node";
import { getSession } from "~/session.server";
import { hasProjectAccess } from "~/api/project";

export interface ProjectAccessCheck {
  userId: string;
  projectId: string;
  hasAccess: boolean;
  role: 'owner' | 'collaborator' | null;
}

/**
 * Middleware to check if user has access to a project
 * Redirects to sign-in if not authenticated
 * Throws 403 if user doesn't have access to the project
 */
export async function requireProjectAccess(
  request: Request, 
  projectId: string
): Promise<ProjectAccessCheck> {
  const session = await getSession(request.headers.get('Cookie'));
  
  if (!session.has('userId')) {
    throw redirect('/auth/sign-in');
  }

  const userId = session.get('userId') as string;
  const accessCheck = await hasProjectAccess(projectId, userId);
  
  if (!accessCheck.hasAccess) {
    throw new Response("You don't have access to this project", { status: 403 });
  }

  return {
    userId,
    projectId,
    hasAccess: accessCheck.hasAccess,
    role: accessCheck.role
  };
}

/**
 * Middleware to check if user is the owner of a project
 * Throws 403 if user is not the owner
 */
export async function requireProjectOwnership(
  request: Request, 
  projectId: string
): Promise<ProjectAccessCheck> {
  const accessCheck = await requireProjectAccess(request, projectId);
  
  if (accessCheck.role !== 'owner') {
    throw new Response("Only project owners can perform this action", { status: 403 });
  }

  return accessCheck;
}

/**
 * Check project access without throwing errors
 * Useful for conditional UI rendering
 */
export async function checkProjectAccess(
  request: Request, 
  projectId: string
): Promise<ProjectAccessCheck | null> {
  try {
    return await requireProjectAccess(request, projectId);
  } catch (error) {
    return null;
  }
}