import type { LucideIcon } from 'lucide-react';

export type SettingsTab = 'security' | 'notifications' | 'payments' | 'subscription' | 'languages';

export interface SettingsTabDefinition {
  id: SettingsTab;
  label: string;
  icon: LucideIcon;
}