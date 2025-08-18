import * as React from "react";
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

interface AppSidebarProps {
  user?: {
    id: string;
    email: string;
    username: string;
  } | null;
  profile?: Profile | null;
  projects?: any[] | null;
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
