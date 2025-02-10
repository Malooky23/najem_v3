"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarLinkProps {
  href: string;
  icon: React.ComponentType;
  label: string;
  isCollapsed: boolean;
}

export function SidebarLink({
  href,
  icon: Icon,
  label,
  isCollapsed,
}: SidebarLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-4 px-3 py-2 rounded-md transition-colors hover:bg-accent",
        isActive && "bg-accent",
      )}
    >
      <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
        <Icon />
      </div>
      {!isCollapsed && (
        <span className="text-sm font-medium">{label}</span>
      )}
    </Link>
  );
}