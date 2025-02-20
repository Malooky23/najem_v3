import Link from "next/link";
import { NavigationMenuItem } from "@radix-ui/react-navigation-menu";
import { NavLink } from "./types";

export function NavigationLink({ href, label, icon: Icon }: NavLink) {
  return (
    <NavigationMenuItem>
      <Link href={href} className="flex  gap-2 hover:text-gray-600 transition-colors whitespace-nowrap">
        {/* <Icon className="h-4 w-4" /> */}
        {/* <span className="hidden xl:inline max-w-[100px] truncate">{label}</span> */}
        <span className="">{label}</span>
      </Link>
    </NavigationMenuItem>
  );
} 