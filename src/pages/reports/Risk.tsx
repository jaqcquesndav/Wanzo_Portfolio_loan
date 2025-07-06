import React from 'react';

export default function RiskReports() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Rapports de risque</h1>
      <ul className="list-disc pl-6 space-y-2">
        <li>Taux d'impayés</li>
        <li>Crédits déclassés</li>
        <li>Couverture des risques</li>
        <li>Analyse des incidents</li>
        <li>Export PDF/Excel/CSV</li>
      </ul>
    </div>
  );
}
