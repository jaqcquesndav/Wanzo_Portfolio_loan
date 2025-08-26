import React from 'react';

interface AppLoadingProps {
  message?: string;
}

export const AppLoading: React.FC<AppLoadingProps> = ({ message = 'Initialisation de l\'application...' }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="relative flex items-center justify-center">
        {/* Anneau extérieur - rotation lente */}
        <div className="absolute w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        
        {/* Anneau moyen - rotation normale */}
        <div className="absolute w-14 h-14 border-3 border-primary/50 border-r-primary rounded-full animate-spin" style={{ animationDuration: '0.8s' }}></div>
        
        {/* Anneau intérieur - rotation rapide */}
        <div className="absolute w-8 h-8 border-2 border-primary/70 border-b-primary rounded-full animate-spin" style={{ animationDuration: '0.5s' }}></div>
        
        {/* Point central */}
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
      </div>
      
      {message && (
        <p className="mt-8 text-sm text-gray-600 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};
