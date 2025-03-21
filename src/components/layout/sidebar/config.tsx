import { ItemIndicator } from "@radix-ui/react-select";
import { BoxesIcon, Home, Repeat, ShoppingBag, TestTube2Icon, Users2, WarehouseIcon } from "lucide-react";
// import { SidebarConfig } from "./types";

function chicken()  {
  return (    <>
    🐔
    </>);
};
function Box()  {
  return (    <>
    📦
    </>);
};
const ItemTx = () =>  {
  return (    <>
    <Repeat size={48} strokeWidth={2.25} />
    </>);
};

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
      href: "/warehouse/items",
      icon: Box,
      label: "Items",
    },
    {
      href: "/warehouse/orders",
      icon: ShoppingBag,
      label: "Orders",
    },
    {
      href: "/warehouse/items/tx",
      icon: ItemTx,
      label: "Transactions",
    },
  ],
}; 

<Repeat size={48} strokeWidth={2.25} />