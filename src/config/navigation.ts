import {
  LayoutDashboard,
  Search,
  Users,
  Settings,
  HelpCircle,
  Book,
  Shield,
  Landmark
} from 'lucide-react';

export const navigation = {
  main: {
    label: 'Principal',
    items: [
      { 
        name: 'Tableau de bord', 
        href: '/dashboard', 
        icon: LayoutDashboard 
      },
      { 
        name: 'Prospection', 
        href: '/prospection', 
        icon: Search,
        permissions: ['canViewProspects']
      },
      {
        name: 'Central de risque',
        href: '/central-risque',
        icon: Shield,
        permissions: ['canViewRiskCentral']
      }
    ]
  },

  administration: {
    label: 'Administration',
    items: [
      {
        name: 'Utilisateurs',
        href: '/users',
        icon: Users,
        permissions: ['canManageUsers']
      },
      {
        name: 'Institution',
        href: '/institution',
        icon: Landmark,
        permissions: ['canManageInstitution']
      },
      {
        name: 'Paramètres',
        href: '/settings',
        icon: Settings,
        permissions: ['canManageSettings']
      }
    ]
  },

  help: {
    label: 'Aide',
    items: [
      {
        name: 'Documentation',
        href: '/docs',
        icon: Book
      },
      {
        name: 'Support',
        href: '/help',
        icon: HelpCircle
      }
    ]
  }
};