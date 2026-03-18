import {
  SquareTerminal,
} from "lucide-react";
import { NavMain } from "./nav-main";
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

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: SquareTerminal,
      isActive: true,
    },
  ],
}

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
}

export function AppSidebar({ user, profile, projects }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <ProjectSelector projects={projects || []} currentUserId={user?.id || ''} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} profile={profile} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
