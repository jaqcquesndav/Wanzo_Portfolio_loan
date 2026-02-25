// src/scripts/initAppData.tsx
// Script d'initialisation des données de l'application au démarrage

import { useEffect } from 'react';
import { initCompaniesData } from './initLocalStorage';

/**
 * Composant d'initialisation des données de l'application
 * À inclure dans le composant racine (App.tsx)
 */
export function InitAppData() {
  useEffect(() => {
    console.log('🔄 Initialisation des données de l\'application...');
    
    // Initialiser les données d'entreprises
    initCompaniesData();
    
    // Ajouter ici d'autres initialisations de données si nécessaire
    
    console.log('✅ Initialisation des données terminée');
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}

/**
 * Fonction d'initialisation manuelle des données
 * Peut être appelée pour réinitialiser les données
 */
export function resetAppData() {
  // Supprimer toutes les données du localStorage
  localStorage.clear();
  
  // Réinitialiser les données
  initCompaniesData();
  
  console.log('🔄 Données de l\'application réinitialisées');
  
  // Rafraîchir la page pour recharger les données
  window.location.reload();
}
