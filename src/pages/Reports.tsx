import React from 'react';

export default function Reports() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Tous les rapports</h1>
      <ul className="space-y-4">
        <li>
          <a href="/reports/financial" className="text-primary hover:underline font-medium">Rapports financiers</a>
          <p className="text-gray-500 text-sm">Situation financière, encours, états justificatifs, balances âgées, etc.</p>
        </li>
        <li>
          <a href="/reports/investment" className="text-primary hover:underline font-medium">Rapports d'investissement</a>
          <p className="text-gray-500 text-sm">Performance des portefeuilles, allocation d'actifs, rendement, etc.</p>
        </li>
        <li>
          <a href="/reports/risk" className="text-primary hover:underline font-medium">Rapports de risque</a>
          <p className="text-gray-500 text-sm">Analyse des risques, taux d'impayés, couverture, déclassés, etc.</p>
        </li>
      </ul>
    </div>
  );
}