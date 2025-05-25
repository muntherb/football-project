"use client"

import type * as React from "react"
import {
  BarChartIcon,
  TrophyIcon,
  UsersIcon,
  TargetIcon,
  ActivityIcon,
  SettingsIcon,
  HelpCircleIcon,
  SearchIcon,
  DatabaseIcon,
  ClipboardListIcon,
  FileIcon,
} from "lucide-react"

import { NavDocuments } from "./nav-documents"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Coach Alex",
    email: "coach@footballclub.com",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BarChartIcon,
    },
    {
      title: "Players",
      url: "/players",
      icon: UsersIcon,
    },
    {
      title: "Matches",
      url: "/match-reports",
      icon: TrophyIcon,
    },
    {
      title: "Training",
      url: "/training",
      icon: TargetIcon,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: ActivityIcon,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "/help",
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "/search",
      icon: SearchIcon,
    },
  ],
  documents: [
    {
      name: "Player Database",
      url: "/players",
      icon: DatabaseIcon,
    },
    {
      name: "Match Reports",
      url: "/match-reports",
      icon: ClipboardListIcon,
    },
    {
      name: "Training Plans",
      url: "/training",
      icon: FileIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/dashboard">
                <TrophyIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Football Club</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
