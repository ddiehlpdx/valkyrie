import {
  SquareTerminal,
  Zap,
  Sword,
  BookOpen,
  GraduationCap,
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
import { Profile } from "../../../generated/prisma/browser";

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
      title: "Core Rules",
      url: "#",
      icon: BookOpen,
      isActive: true,
      items: [
        { title: "Stats", url: `/projects/${projectId}/stats` },
        { title: "Damage Types", url: `/projects/${projectId}/damage-types` },
      ],
    },
    {
      title: "Characters & Classes",
      url: "#",
      icon: GraduationCap,
      items: [
        { title: "Professions", url: `/projects/${projectId}/professions` },
      ],
    },
    {
      title: "Abilities & Skills",
      url: "#",
      icon: Zap,
      items: [
        { title: "Ability Types", url: `/projects/${projectId}/ability-types` },
        { title: "Abilities", url: `/projects/${projectId}/abilities` },
        { title: "Status Effects", url: `/projects/${projectId}/status-effects` },
      ],
    },
    {
      title: "Equipment & Items",
      url: "#",
      icon: Sword,
      items: [
        { title: "Armor Types", url: `/projects/${projectId}/armor-types` },
        { title: "Equipment Types", url: `/projects/${projectId}/equipment-types` },
        { title: "Weapon Types", url: `/projects/${projectId}/weapon-types` },
      ],
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
