import { usePortfolioType } from '../../hooks/usePortfolioType';
import { Button } from '../ui/Button';
import { ArrowRight } from 'lucide-react';

export function WelcomeHero() {
  const portfolioType = usePortfolioType();
  return (
    <div className="relative bg-gradient-to-r from-primary to-primary-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white sm:text-5xl md:text-6xl">
            <span className="block">Bienvenue sur Wanzo</span>
            <span className="block text-primary-light mt-2 text-2xl">
              {portfolioType ? `Votre plateforme ${portfolioType}` : 'Votre plateforme de gestion de portefeuille'}
            </span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-white sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Gérez vos investissements, suivez vos performances et développez votre portefeuille en toute simplicité.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Button 
              className="w-full sm:w-auto"
              icon={<ArrowRight className="ml-2 h-5 w-5" />}
            >
              Commencer maintenant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}