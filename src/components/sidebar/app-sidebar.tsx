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
  useSidebar,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator";
import { Session } from "next-auth";
import { data } from "./sidebar-data"
import BackButton from "@/components/redirectBack";
import Link from "next/link";
import { cn } from "@/lib/utils";


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
  const { isMobile, closeMobileSidebar, state } = useSidebar();
  const handleLinkClick = () => {
    if (isMobile) {
      closeMobileSidebar();
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex-row items-center justify-center relative h-16">
        <Link href="/dashboard" onClick={handleLinkClick} className="flex items-center justify-center w-full h-full">
          <div className="relative w-full h-full flex items-center justify-center">
            <div
              className={cn("absolute transition-all duration-300 ease-in-out",
                state === "expanded"
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95",
                  isMobile ? "opacity-100 scale-150" : ""
              )}
            >
              <Image
                src="/name_banner.png"
                alt="Najem Aleen Sidebar Banner"
                className="object-contain"
                width={200}
                height={70}
                priority
              />
            </div>
            <div
              className={cn("absolute transition-all duration-300 ease-in-out", 
                state === "expanded"
                ? "opacity-0 scale-105"
                : "opacity-100 scale-100",
                isMobile ? "hidden" : ""

              )}
            >
              <Image
                src="/favicon.ico"
                alt="Najem Aleen Sidebar Logo"
                width={30}
                height={30}
              />
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <BackButton />

      <Separator />
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
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

