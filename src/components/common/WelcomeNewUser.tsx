import React, { useState } from 'react';
// ✅ Utilisation des hooks React Query professionnels
import { useCreatePortfolioMutation } from '../../hooks/queries';
import { useNotification } from '../../contexts/useNotification';
import { useAppContextStore } from '../../stores/appContextStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';

export const WelcomeNewUser: React.FC = () => {
  // ✅ Mutation React Query avec invalidation automatique du cache
  const createPortfolioMutation = useCreatePortfolioMutation();
  const { showNotification } = useNotification();
  const { institutionId, user } = useAppContextStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: 1000000,
    target_return: 12, // Taux de rendement cible (%)
    risk_profile: 'moderate' as 'conservative' | 'moderate' | 'aggressive',
    target_sectors: ['Finance'] as string[],
    duration_months: 36,
    manager_id: user?.id || 'default-manager', // ID du gestionnaire depuis le contexte
    institution_id: institutionId || 'default-institution', // ID de l'institution depuis le contexte
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'target_amount') {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10) || 0,
      });
    } else if (name === 'target_return') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else if (name === 'duration_months') {
      setFormData({
        ...formData,
        [name]: parseInt(value, 10) || 0,
      });
    } else if (name === 'target_sectors') {
      setFormData({
        ...formData,
        target_sectors: [value], // Pour simplifier, on ne met qu'un seul secteur
      });
    } else if (name === 'risk_profile') {
      // Ce cas est géré directement dans le composant Select
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      showNotification('Le nom du portefeuille est obligatoire', 'error');
      return;
    }
    
    try {
      setLoading(true);
      // ✅ Utilisation de la mutation React Query
      const newPortfolio = await createPortfolioMutation.mutateAsync(formData);
      showNotification('🎉 Votre premier portefeuille a été créé avec succès!', 'success');
      
      // Rediriger vers le nouveau portefeuille pour l'onboarding
      if (newPortfolio && newPortfolio.id) {
        // Petit délai pour laisser le cache se mettre à jour
        setTimeout(() => {
          window.location.href = `/app/traditional/${newPortfolio.id}`;
        }, 500);
      }
    } catch (error) {
      console.error('Erreur lors de la création du portefeuille:', error);
      showNotification('La création du portefeuille a échoué', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            Bienvenue sur Wanzo Portfolio
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Commençons par créer votre premier portefeuille de prêts traditionnels.
          </p>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Un portefeuille vous permet de regrouper et gérer vos crédits selon différents critères.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nom du portefeuille *
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Crédits PME 2023"
                required
              />
            </div>
            
            <div>
              <label htmlFor="target_amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Montant cible (FCFA)
              </label>
              <Input
                id="target_amount"
                name="target_amount"
                type="number"
                value={formData.target_amount}
                onChange={handleChange}
                placeholder="Ex: 10000000"
              />
            </div>
            
            <div>
              <label htmlFor="target_return" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rendement cible (%)
              </label>
              <Input
                id="target_return"
                name="target_return"
                type="number"
                value={formData.target_return}
                onChange={handleChange}
                placeholder="Ex: 12"
              />
            </div>
            
            <div>
              <label htmlFor="risk_profile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Profil de risque
              </label>
              <Select 
                id="risk_profile" 
                name="risk_profile"
                value={formData.risk_profile}
                onChange={(e) => {
                  const value = e.target.value as 'conservative' | 'moderate' | 'aggressive';
                  setFormData({
                    ...formData,
                    risk_profile: value
                  });
                }}
              >
                <option value="conservative">Conservateur</option>
                <option value="moderate">Modéré</option>
                <option value="aggressive">Agressif</option>
              </Select>
            </div>
            
            <div>
              <label htmlFor="target_sectors" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Secteur cible
              </label>
              <Select 
                id="target_sectors" 
                name="target_sectors"
                value={formData.target_sectors[0]}
                onChange={handleChange}
              >
                <option value="Finance">Finance</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Technology">Technologie</option>
                <option value="Health">Santé</option>
                <option value="Education">Éducation</option>
                <option value="Real Estate">Immobilier</option>
              </Select>
            </div>
            
            <div>
              <label htmlFor="duration_months" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Durée (mois)
              </label>
              <Input
                id="duration_months"
                name="duration_months"
                type="number"
                value={formData.duration_months}
                onChange={handleChange}
                placeholder="Ex: 36"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez l'objectif de ce portefeuille..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-center pt-4">
            <Button 
              type="submit" 
              variant="primary" 
              size="lg" 
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? 'Création en cours...' : 'Créer mon premier portefeuille'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
