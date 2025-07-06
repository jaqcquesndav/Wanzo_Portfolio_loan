import { LayoutDashboard, FileText, Truck, Settings, Shield, BarChart2 } from 'lucide-react';
//import React from 'react';

export const leasingSubMenu = [
  { name: 'Vue d’ensemble', href: '/portfolios/leasing', icon: LayoutDashboard },
  { name: 'Réservations', href: '/portfolios/leasing/reservations', icon: FileText },
  { name: 'Mouvements', href: '/portfolios/leasing/movements', icon: Truck },
  { name: 'Maintenance', href: '/portfolios/leasing/maintenance', icon: Settings },
  { name: 'Incidents', href: '/portfolios/leasing/incidents', icon: Shield },
  { name: 'Contrats', href: '/portfolios/leasing/contracts', icon: FileText },
  { name: 'Rapports', href: '/portfolios/leasing/reports', icon: BarChart2 }
];

export default leasingSubMenu;
