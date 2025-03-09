"use client"

import * as React from "react"
import Image from 'next/image';


import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarHoverToggle,
  SidebarRail,
} from "@/components/ui/sidebar"
import { UserMenu } from "../header/user-menu/user-menu"
import { Separator } from "@/components/ui/separator";
import { Session } from "next-auth";
import {data} from "./sidebar-data"
import BackButton from "@/components/redirectBack";
// This is sample data.

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  session: Session | null
}

export function AppSidebar({ session, ...props }: AppSidebarProps) {
  const user = {
    name: session?.user?.name ?? "Error",
    email: session?.user?.email ?? "Error",
    avatar: session?.user?.image ?? "Error",
    id: session?.user?.id ?? "Error",
  }
  return (
    <Sidebar   collapsible="icon" {...props}>
      <SidebarHeader className="flex-row items-center">
        <Image src="/favicon.ico" alt="Najem Aleen Sidebar Logo" width={30} height={30} />
        <span className="truncate text-2xl font-bold  text-black">Najem Aleen </span>
      </SidebarHeader>

            <BackButton />

        <Separator />
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        {/* <UserMenu session={session}/> */}
      <SidebarHoverToggle />
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
