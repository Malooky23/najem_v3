import { LucideIcon } from 'lucide-react';

export interface NavLink {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavConfig {
  EMPLOYEE: {
    basic: NavLink[];
    admin: NavLink[];
  };
  CUSTOMER: NavLink[];
} 