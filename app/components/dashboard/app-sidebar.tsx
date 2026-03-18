import {
  SquareTerminal,
  Map,
  User,
  Zap,
  Sword,
} from "lucide-react";
import { NavMain, type NavItem } from "./nav-main";
import { NavUser } from "./nav-user";
import { ProjectSelector } from "./project-selector";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "../ui/sidebar";
import { Profile } from "@prisma/client";

interface SidebarProject {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  owner: { id: string; username: string; email: string };
  collaborators: Array<{
    id: string;
    userId: string;
    user: { id: string; username: string; email: string };
  }>;
}

interface AppSidebarProps {
  user?: {
    id: string;
    email: string;
    username: string;
  } | null;
  profile?: Profile | null;
  projects?: SidebarProject[] | null;
  activeProjectId?: string | null;
}

const platformNav: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: SquareTerminal,
    isActive: true,
  },
];

function getGameDesignNav(projectId: string): NavItem[] {
  return [
    {
      title: "Maps & Battlefields",
      url: `/projects/${projectId}/maps`,
      icon: Map,
    },
    {
      title: "Characters & Classes",
      url: `/projects/${projectId}/characters`,
      icon: User,
      disabled: true,
      badge: "Soon",
    },
    {
      title: "Abilities & Skills",
      url: `/projects/${projectId}/abilities`,
      icon: Zap,
      disabled: true,
      badge: "Soon",
    },
    {
      title: "Equipment & Items",
      url: `/projects/${projectId}/equipment`,
      icon: Sword,
      disabled: true,
      badge: "Soon",
    },
  ];
}

export function AppSidebar({ user, profile, projects, activeProjectId }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <ProjectSelector projects={projects || []} currentUserId={user?.id || ''} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={platformNav} />
        {activeProjectId && (
          <NavMain label="Game Design" items={getGameDesignNav(activeProjectId)} />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} profile={profile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
