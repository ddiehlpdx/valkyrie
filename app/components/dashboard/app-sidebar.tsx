import * as React from "react";
import {
  Bot,
  Settings2,
  SquareTerminal,
  Map,
  Users,
  Zap,
  Package,
  ScrollText,
  MessageSquare,
  Target,
  Sliders,
  FlaskConical,
  Image,
  GitBranch,
  FolderOpen,
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
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "#",
        },
        {
          title: "Recent Projects",
          url: "#",
        },
        {
          title: "Quick Actions",
          url: "#",
        },
      ],
    },
    {
      title: "Project",
      url: "#",
      icon: FolderOpen,
      items: [
        {
          title: "All Projects",
          url: "#",
        },
        {
          title: "New Project",
          url: "#",
        },
        {
          title: "Project Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Maps & Battlefields",
      url: "#",
      icon: Map,
      items: [
        {
          title: "Battle Maps",
          url: "#",
        },
        {
          title: "World Map",
          url: "#",
        },
        {
          title: "Terrain Editor",
          url: "#",
        },
        {
          title: "Map Templates",
          url: "#",
        },
      ],
    },
    {
      title: "Characters & Units",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Player Units",
          url: "#",
        },
        {
          title: "Enemy Units",
          url: "#",
        },
        {
          title: "NPC Characters",
          url: "#",
        },
        {
          title: "Unit Templates",
          url: "#",
        },
      ],
    },
    {
      title: "Classes & Jobs",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Job Classes",
          url: "#",
        },
        {
          title: "Skill Trees",
          url: "#",
        },
        {
          title: "Class Balance",
          url: "#",
        },
      ],
    },
    {
      title: "Skills & Abilities",
      url: "#",
      icon: Zap,
      items: [
        {
          title: "Combat Skills",
          url: "#",
        },
        {
          title: "Magic Spells",
          url: "#",
        },
        {
          title: "Passive Abilities",
          url: "#",
        },
        {
          title: "Status Effects",
          url: "#",
        },
      ],
    },
    {
      title: "Items & Equipment",
      url: "#",
      icon: Package,
      items: [
        {
          title: "Weapons",
          url: "#",
        },
        {
          title: "Armor",
          url: "#",
        },
        {
          title: "Consumables",
          url: "#",
        },
        {
          title: "Accessories",
          url: "#",
        },
      ],
    },
    {
      title: "Story & Scenarios",
      url: "#",
      icon: ScrollText,
      items: [
        {
          title: "Campaign",
          url: "#",
        },
        {
          title: "Battle Scenarios",
          url: "#",
        },
        {
          title: "Cutscenes",
          url: "#",
        },
        {
          title: "Chapter Flow",
          url: "#",
        },
      ],
    },
    {
      title: "Dialogue System",
      url: "#",
      icon: MessageSquare,
      items: [
        {
          title: "Conversations",
          url: "#",
        },
        {
          title: "Character Voices",
          url: "#",
        },
        {
          title: "Localization",
          url: "#",
        },
      ],
    },
    {
      title: "Battle System",
      url: "#",
      icon: Target,
      items: [
        {
          title: "Victory Conditions",
          url: "#",
        },
        {
          title: "AI Behavior",
          url: "#",
        },
        {
          title: "Turn Order",
          url: "#",
        },
        {
          title: "Damage Formulas",
          url: "#",
        },
      ],
    },
    {
      title: "Game Rules",
      url: "#",
      icon: Sliders,
      items: [
        {
          title: "Core Mechanics",
          url: "#",
        },
        {
          title: "Difficulty Settings",
          url: "#",
        },
        {
          title: "Progression Rules",
          url: "#",
        },
      ],
    },
    {
      title: "Testing & Balance",
      url: "#",
      icon: FlaskConical,
      items: [
        {
          title: "Playtesting",
          url: "#",
        },
        {
          title: "Balance Reports",
          url: "#",
        },
        {
          title: "Debug Tools",
          url: "#",
        },
      ],
    },
    {
      title: "Asset Library",
      url: "#",
      icon: Image,
      items: [
        {
          title: "Sprites",
          url: "#",
        },
        {
          title: "Animations",
          url: "#",
        },
        {
          title: "Audio",
          url: "#",
        },
        {
          title: "UI Elements",
          url: "#",
        },
      ],
    },
    {
      title: "Collaboration",
      url: "#",
      icon: GitBranch,
      items: [
        {
          title: "Team Members",
          url: "#",
        },
        {
          title: "Version History",
          url: "#",
        },
        {
          title: "Shared Assets",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Project Settings",
          url: "#",
        },
        {
          title: "Export Options",
          url: "#",
        },
        {
          title: "Preferences",
          url: "#",
        },
      ],
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
}

export function AppSidebar({ user, profile }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {/* <ProjectSelector /> */}
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
