import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "@remix-run/react";
import { ChevronsUpDown, Plus, FolderOpen, Crown, User, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";

interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  owner: {
    id: string;
    username: string;
    email: string;
  };
  collaborators: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      username: string;
      email: string;
    };
  }>;
}

interface ProjectSelectorProps {
  projects: Project[];
  currentUserId: string;
}

export function ProjectSelector({ projects, currentUserId }: ProjectSelectorProps) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Set active project based on current URL or default to first project
  useEffect(() => {
    const currentPath = location.pathname;
    const projectIdMatch = currentPath.match(/^\/projects\/([^\/]+)/);
    
    if (projectIdMatch && projects.length > 0) {
      const currentProjectId = projectIdMatch[1];
      const currentProject = projects.find(p => p.id === currentProjectId);
      if (currentProject) {
        setActiveProject(currentProject);
        return;
      }
    }
    
    // Fallback to first project if no current project is found
    if (projects.length > 0 && !activeProject) {
      setActiveProject(projects[0]);
    }
  }, [location.pathname, projects, activeProject]);

  const hasProjects = projects && projects.length > 0;
  
  const getUserRole = (project: Project) => {
    return project.ownerId === currentUserId ? 'owner' : 'collaborator';
  };

  const handleProjectSelect = (project: Project) => {
    setActiveProject(project);
    navigate(`/projects/${project.id}`);
  };
  
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-10 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 h-12 text-sm group-data-[collapsible=icon]:!p-0 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <FolderOpen className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {hasProjects ? activeProject?.name || 'Select Project' : 'No Projects'}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {hasProjects ? `${projects.length} project${projects.length !== 1 ? 's' : ''}` : 'Get started'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            {hasProjects ? (
              <>
                <DropdownMenuLabel className="text-muted-foreground text-xs">
                  Projects
                </DropdownMenuLabel>
                {projects.map((project) => {
                  const userRole = getUserRole(project);
                  const isOwner = userRole === 'owner';
                  const isActive = activeProject?.id === project.id;
                  
                  return (
                    <DropdownMenuItem
                      key={project.id}
                      onClick={() => handleProjectSelect(project)}
                      className={`gap-2 p-2 ${isActive ? 'bg-accent' : ''}`}
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border bg-background">
                        <FolderOpen className="size-4 shrink-0" />
                      </div>
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{project.name}</span>
                          {isOwner ? (
                            <Crown className="size-3 text-yellow-500" />
                          ) : (
                            <User className="size-3 text-blue-500" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {isOwner ? 'Owner' : 'Collaborator'} • {project.collaborators.length} collaborator{project.collaborators.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {isOwner && (
                        <a
                          href={`/projects/${project.id}/settings`}
                          className="ml-auto p-1 hover:bg-accent rounded opacity-60 hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Settings className="size-3" />
                        </a>
                      )}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
              </>
            ) : (
              <DropdownMenuLabel className="text-muted-foreground text-xs">
                Get Started
              </DropdownMenuLabel>
            )}
            <DropdownMenuItem className="gap-2 p-2" asChild>
              <a href="/projects/new">
                <div className="bg-background flex size-6 items-center justify-center rounded-md border">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium">Create Project</div>
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
