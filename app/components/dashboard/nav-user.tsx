import * as React from "react";
import {
  User,
  Settings,
  ChevronsUpDown,
  LogOut,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../ui/avatar";
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
import { Profile } from "@prisma/client";
import { Form } from "@remix-run/react";

interface NavUserProps {
  user?: {
    id: string;
    email: string;
    username: string;
  } | null;
  profile?: Profile | null;
}

export function NavUser({ user, profile }: NavUserProps) {
  const { isMobile } = useSidebar();

  console.log("NavUser props:", { user, profile }); // Debug log

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-12 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={profile?.avatar || undefined} alt={user?.username || "User"} />
              <AvatarFallback className="rounded-lg">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user?.username || "User"}</span>
              <span className="truncate text-xs">{user?.email || "No email"}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-56 z-[9999]"
            side="right"
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="px-2 py-1.5 text-sm font-medium">
              My Account
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href="/dashboard/profile" className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Form method="post" action="/auth/logout" className="w-full">
                <button type="submit" className="flex w-full items-center cursor-pointer px-2 py-1.5 text-sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </button>
              </Form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
