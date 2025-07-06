import React from 'react';

export default function PortfolioNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-16">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Portefeuille introuvable</h1>
      <p className="mb-6 text-gray-600">Le portefeuille demandé n'existe pas ou a été supprimé.</p>
      <a href="/app" className="text-primary underline">Retour à la liste des portefeuilles</a>
    </div>
  );
}
