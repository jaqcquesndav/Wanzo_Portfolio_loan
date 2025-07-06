import React from 'react';

export default function FinancialReports() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Rapports financiers</h1>
      <ul className="list-disc pl-6 space-y-2">
        <li>Encours de crédit</li>
        <li>États justificatifs</li>
        <li>Balances âgées</li>
        <li>Situation globale</li>
        <li>Export PDF/Excel/CSV</li>
      </ul>
    </div>
  );
}
