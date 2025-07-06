import { Shield, Bell, CreditCard, DollarSign, Languages } from 'lucide-react';
import type { SettingsTabDefinition } from './types';

export const SETTINGS_TABS: SettingsTabDefinition[] = [
  {
    id: 'security',
    label: 'Sécurité',
    icon: Shield
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell
  },
  {
    id: 'payments',
    label: 'Paiements',
    icon: CreditCard
  },
  {
    id: 'subscription',
    label: 'Abonnement',
    icon: DollarSign
  },
  {
    id: 'languages',
    label: 'Langues',
    icon: Languages
  }
];