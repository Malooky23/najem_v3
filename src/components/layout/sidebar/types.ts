import { LucideIcon } from 'lucide-react';

export interface SidebarLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface SidebarConfig {
  links: SidebarLink[];
} 