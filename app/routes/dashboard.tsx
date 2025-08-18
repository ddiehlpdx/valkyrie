import { AppSidebar } from "~/components/dashboard/app-sidebar";
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
import { LoaderFunctionArgs, redirect } from "@remix-run/node";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { getSession, commitSession } from "~/session.server";
import { getUserById } from "~/api/user";
import { getProfileByUserId } from "~/api/profile";
import { getProjectsByUserId } from "~/api/project";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));

  if (!session.has('userId')) {
    return redirect('/auth/sign-in');
  }

  const userId = session.get('userId') as string;

  const user = await getUserById(userId);
  
  if (!user) {
    // Clear the invalid session to prevent redirect loop
    session.unset('userId');
    return redirect('/auth/sign-in', {
      headers: {
        'Set-Cookie': await commitSession(session)
      }
    });
  }
  
  const profile = await getProfileByUserId(userId);
  const projects = await getProjectsByUserId(userId);
  
  return {
    user,
    profile,
    projects
  }
}

export default function Dashboard() {
  const { user, profile, projects } = useLoaderData<typeof loader>();
  const location = useLocation();

  // Generate breadcrumb based on current path
  const getBreadcrumb = () => {
    const path = location.pathname;
    
    switch (path) {
      case '/dashboard':
        return { title: 'Overview', showDashboard: false };
      
      case '/dashboard/profile':
        return { title: 'Profile', showDashboard: true };
      
      case '/dashboard/settings':
        return { title: 'Settings', showDashboard: true };
      
      default:
        if (path.startsWith('/dashboard/')) {
          // Extract the last segment and format it
          const segments = path.split('/');
          const lastSegment = segments[segments.length - 1];
          const title = lastSegment.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          return { title, showDashboard: true };
        }
        
        return { title: 'Dashboard', showDashboard: false };
    }
  };

  const breadcrumb = getBreadcrumb();

  return (
      <div id="dashboard" className="flex min-h-screen">
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
                    {breadcrumb.showDashboard && (
                      <>
                        <BreadcrumbItem className="hidden md:block">
                          <BreadcrumbLink href="/dashboard">
                            Dashboard
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="hidden md:block" />
                      </>
                    )}
                    <BreadcrumbItem>
                      <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex-1 flex flex-col p-4 pt-0">
              <div className="max-w-6xl mx-auto w-full">
                <Outlet />
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
  );
}