import { BoxesIcon, Home, TestTube2Icon, Users2, WarehouseIcon } from "lucide-react";
// import { SidebarConfig } from "./types";

export const sidebarConfig = {
  links: [
    {
      href: "/dashboard",
      label: "Home",
      icon: Home,
    },
    {
      href: "/warehouse",
      label: "Warehouse",
      icon: WarehouseIcon,
    },
    {
      href: "/customers",
      icon: Users2,
      label: "Customers",
    },
    {
      href: "/test",
      icon: TestTube2Icon,
      label: "TEST",
    },
  ],
}; 