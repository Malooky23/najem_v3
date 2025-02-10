"use client";

import { useState } from "react";
import { sidebarConfig } from "./config";
import { SidebarLink } from "./sidebar-link";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside
      className={cn(
        "border-r bg-background flex flex-col",
        "transition-[width] ease-in-out duration-3000",
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
