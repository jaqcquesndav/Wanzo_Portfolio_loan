import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  permissions?: string[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}