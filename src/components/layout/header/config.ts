import  * as LucideIcons  from "lucide-react";
import { NavConfig } from "./types";

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
      // {
      //   href: "/inventory",
      //   label: "Inventory",
      //   icon: LucideIcons.Warehouse,
      // },
      // {
      //   href: "/items",
      //   label: "My Items",
      //   icon: LucideIcons.PackageSearch,
      // },
      // {
      //   href: "/tx",
      //   label: "Transactions",
      //   icon: LucideIcons.Receipt,
      // },
      // {
      //   href: "/vendors",
      //   label: "Vendors",
      //   icon: LucideIcons.Truck,
      // },
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