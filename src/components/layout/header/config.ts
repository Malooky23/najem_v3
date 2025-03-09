import  * as LucideIcons  from "lucide-react";
// import { NavConfig } from "./types";
interface NavConfig {
  EMPLOYEE: {
    basic: NavItem[];
    admin: NavItem[];
  };
  CUSTOMER: NavItem[];
}
interface NavItem {
  href: string;
  label: string;
  icon: LucideIcons.LucideIcon;
}
export const navigationConfig: NavConfig = {
  EMPLOYEE: {
    basic: [
      {
        href: "/customers",
        label: "Customers",
        icon: LucideIcons.Users,
      },
      {
        href: "/warehouse/orders",
        label: "Orders",
        icon: LucideIcons.Package,
      },
      {
        href: "/warehouse/items",
        label: "Items",
        icon: LucideIcons.PackageCheck,
      },
      {
        href: "/seed",
        label: "Seeder",
        icon: LucideIcons.Trees,
      },
    ],
    admin: [
      {
        href: "/admin",
        label: "admin",
        icon: LucideIcons.ToiletIcon,
      },

    ],
  },
  CUSTOMER: [
    {
      href: "/warehouse/orders",
      label: "My Orders",
      icon: LucideIcons.Package,
    },
    {
      href: "/warehouse/items",
      label: "My Items",
      icon: LucideIcons.PackageSearch,
    },
    {
      href: "/invoices",
      label: "Invoices",
      icon: LucideIcons.Receipt,
    },
    {
        href: "/inventory",
        label: "Inventory",
        icon: LucideIcons.Warehouse,
      },

  ],
}; 