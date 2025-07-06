import React from 'react';

export default function PortfolioErrorBoundary() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Erreur lors du chargement du portefeuille</h1>
      <p className="mb-6 text-gray-600">Le portefeuille demandé n'a pas pu être trouvé ou une erreur est survenue.</p>
      <a href="/app" className="text-primary underline">Retour à la liste des portefeuilles</a>
    </div>
  );
}
