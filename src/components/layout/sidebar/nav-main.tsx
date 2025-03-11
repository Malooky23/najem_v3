"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { Router } from "next/router"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      icon?: LucideIcon
    }[]
  }[]
}) {
  const pathname = usePathname();
  // State to track which items are open
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  
  // Check if the item should be expanded based on the current path
  const shouldBeExpanded = (item: { url: string, items?: { url: string }[] }) => {
    // Check if current path starts with this item's URL
    if (pathname.startsWith(item.url) && item.url !== "/") {
      return true;
    }
    
    // Check if any of the sub-items match the current path
    if (item.items && item.items.some(subItem => pathname.startsWith(subItem.url))) {
      return true;
    }
    
    return false;
  };

  // Update open state when pathname changes
  useEffect(() => {
    const newOpenState: Record<string, boolean> = {};
    items.forEach(item => {
      newOpenState[item.title] = shouldBeExpanded(item);
    });
    setOpenItems(newOpenState);
  }, [pathname, items]);

  // Handler for toggling items manually
  const handleToggle = (itemTitle: string, isOpen: boolean) => {
    setOpenItems(prev => ({
      ...prev,
      [itemTitle]: isOpen
    }));
  };
  const router = useRouter()

  return (
    <SidebarGroup>
      {/* <SidebarGroupLabel>Platform</SidebarGroupLabel> */}
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            open={openItems[item.title]}
            onOpenChange={(isOpen) => handleToggle(item.title, isOpen)}
            className="group/collapsible"
          >
            <SidebarMenuItem className="py-4">
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title}>
                  {item.icon && <item.icon onClick={()=>router.push(item.url)}/>}
                  <span>{item.title}</span>
                  <ChevronRight className="ml-auto transition-transform duration-300 ease-in-out group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent 
                className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
              >
                <SidebarMenuSub 
                  className=" origin-top data-[state=closed]:opacity-0 data-[state=open]:opacity-100"
                >
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title} >
                      <SidebarMenuSubButton asChild >
                      <Link href={subItem.url ?? "/dashboard"}>
                        {subItem.icon && <subItem.icon />}
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            <Separator />
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
