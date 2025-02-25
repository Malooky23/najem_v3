"use client";

import { useState } from "react";
import { sidebarConfig } from "./config";
import { SidebarLink } from "./sidebar-link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from 'next/navigation';
import { useMediaQuery } from "@/hooks/use-media-query";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside
      className={cn(
        "border-r bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col",
        "transition-[width] ease-in-out duration-3000",
        "hidden md:flex", // Hide on mobile, show on medium screens and up
        isCollapsed ? "w-16" : "w-[150px]"
      )}
    >
      <button 
        className={cn(
          "pt-2 pb-2 ",
          "flex items-center justify-center hover:bg-accent",
          "transition-transform duration-300",
          isCollapsed ? "" : "rotate-180"
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
          <ChevronRight className="h-5 w-5" />
      </button>

      <nav className="p-2 flex flex-col gap-1">
        {sidebarConfig.links.map((link) => (
          <SidebarLink
            key={link.href}
            {...link}
            isCollapsed={isCollapsed}
          />
        ))}
      </nav>
    </aside>
  );
}
