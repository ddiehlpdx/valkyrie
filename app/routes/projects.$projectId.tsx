import { LoaderFunctionArgs, redirect, json } from "@remix-run/node";
import { useLoaderData, Outlet, useParams, useLocation } from "@remix-run/react";
import { getSession } from "~/session.server";
import { getUserById } from "~/api/user";
import { getProjectById } from "~/api/project";
import { requireProjectAccess } from "~/lib/project-access.server";
import { AppSidebar } from "~/components/dashboard/app-sidebar";
import { getProfileByUserId } from "~/api/profile";
import { getProjectsByUserId } from "~/api/project";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Separator } from "~/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const projectId = params.projectId;

  if (!projectId) {
    throw new Response("Project not found", { status: 404 });
  }

  // Check project access and get user info
  const accessCheck = await requireProjectAccess(request, projectId);
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId') as string;

  // Load all necessary data
  const [user, project, profile, projects] = await Promise.all([
    getUserById(userId),
    getProjectById(projectId),
    getProfileByUserId(userId),
    getProjectsByUserId(userId)
  ]);

  if (!user || !project) {
    throw new Response("Not found", { status: 404 });
  }

  return json({
    user,
    project,
    profile,
    projects,
    userRole: accessCheck.role,
    isOwner: accessCheck.role === 'owner'
  });
}

export default function ProjectLayout() {
  const { user, project, profile, projects, userRole, isOwner } = useLoaderData<typeof loader>();
  const params = useParams();
  const location = useLocation();

  // Generate breadcrumb based on current path  
  const getBreadcrumb = () => {
    const pathname = location.pathname;
    const segments = pathname.split('/').filter(Boolean);
    
    // Remove 'projects' and projectId to get the sub-route
    const subRoute = segments.slice(2).join('/');
    
    switch (subRoute) {
      case '':
        return { title: 'Overview', isSubPage: false };
      case 'settings':
        return { title: 'Settings', isSubPage: true };
      case 'maps':
        return { title: 'Maps', isSubPage: true };
      case 'characters':
        return { title: 'Characters', isSubPage: true };
      case 'abilities':
        return { title: 'Abilities', isSubPage: true };
      default:
        // Format any other sub-route nicely
        const title = subRoute.split('/').pop()?.split('-').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') || 'Project';
        return { title, isSubPage: true };
    }
  };

  const breadcrumb = getBreadcrumb();

  return (
    <div id="project-layout" className="flex min-h-screen">
      <SidebarProvider>
        <AppSidebar user={user} profile={profile} projects={projects} />
        <SidebarInset className="flex-1 flex flex-col">
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink href={`/projects/${project.id}`}>
                      {project.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="max-w-6xl mx-auto w-full">
              {/* Pass project context to child routes */}
              <Outlet context={{ 
                user, 
                project, 
                userRole, 
                isOwner,
                projectId: params.projectId 
              }} />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}