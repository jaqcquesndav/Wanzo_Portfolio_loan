import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, FileText, Calendar, Users, 
  BarChart2, MessageSquare 
} from 'lucide-react';
import { Button } from '../ui/Button';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  description: string;
  href: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    icon: <Plus className="h-6 w-6" />,
    label: "Nouvelle opération",
    description: "Créer une demande de financement",
    href: "/operations/new",
    color: "bg-blue-500"
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    label: "Planifier un RDV",
    description: "Organiser une rencontre",
    href: "/meetings/schedule",
    color: "bg-green-500"
  },
  {
    icon: <Users className="h-6 w-6" />,
    label: "Prospects",
    description: "Gérer vos prospects",
    href: "/prospection",
    color: "bg-purple-500"
  },
  {
    icon: <BarChart2 className="h-6 w-6" />,
    label: "Rapports",
    description: "Voir les analyses",
    href: "/reports",
    color: "bg-yellow-500"
  },
  {
    icon: <MessageSquare className="h-6 w-6" />,
    label: "Messages",
    description: "Voir vos messages",
    href: "/messages",
    color: "bg-pink-500"
  }
];

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {quickActions.map((action) => (
        <button
          key={action.label}
          onClick={() => navigate(action.href)}
          className="p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center text-white mb-3`}>
            {action.icon}
          </div>
          <h3 className="text-lg font-medium text-gray-900">{action.label}</h3>
          <p className="text-sm text-gray-500 mt-1">{action.description}</p>
        </button>
      ))}
    </div>
  );
}