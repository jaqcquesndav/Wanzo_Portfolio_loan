import React from 'react';
import { Calendar, Clock } from 'lucide-react';
// import { useAuth } from '../../contexts/AuthContext';

export function DashboardHeader() {
  // Remplacer par un utilisateur de démonstration ou une logique Auth0 plus tard
  const user = { name: 'Démo', role: 'admin' };
  const currentTime = new Date();
  const hours = currentTime.getHours();

  const getGreeting = () => {
    if (hours < 12) return 'Bonjour';
    if (hours < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  const getDisplayName = () => {
    if (user?.name) return user.name;
    if (user?.role) {
      // Formater le rôle pour l'affichage
      const roleDisplay = {
        admin: 'Administrateur',
        manager: 'Manager',
        portfolio_manager: 'Gestionnaire de portefeuille',
        user: 'Utilisateur'
      };
      return roleDisplay[user.role as keyof typeof roleDisplay] || user.role;
    }
    return 'Utilisateur';
  };

  return (
    <div className="bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-lg shadow-lg mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            {getGreeting()}, {getDisplayName()}
          </h1>
          <p className="text-primary-light flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
            <Clock className="h-4 w-4 ml-4 mr-2" />
            {new Date().toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>
    </div>
  );
}