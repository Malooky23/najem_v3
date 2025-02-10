import { BoxesIcon, Home, Users2, WarehouseIcon } from "lucide-react";
// import { SidebarConfig } from "./types";

export const sidebarConfig = {
  links: [
    {
      href: "/dashboard",
      label: "Home",
      icon: Home,
    },
    {
      href: "/warehouse/items",
      label: "Items",
      icon: WarehouseIcon,
    },
    {
      href: "/customers",
      icon: Users2,
      label: "Customers",
    },
  ],
}; 