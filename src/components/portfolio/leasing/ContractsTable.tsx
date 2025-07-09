import React from 'react';
import type { LeasingContract } from '../../../types/leasing';

interface ContractsTableProps {
  contracts: LeasingContract[];
}

export function ContractsTable({ contracts }: ContractsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700 w-full">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th className="px-4 py-2 text-left">Numéro</th>
            <th className="px-4 py-2 text-left">Client</th>
            <th className="px-4 py-2 text-left">Équipement</th>
            <th className="px-4 py-2 text-left">Montant</th>
            <th className="px-4 py-2 text-left">Durée</th>
            <th className="px-4 py-2 text-left">Statut</th>
          </tr>
        </thead>
        <tbody>
          {contracts.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-400">Aucun contrat à afficher</td>
            </tr>
          ) : (
            contracts.map((contract) => (
              <tr key={contract.id}>
                <td className="px-4 py-2">{contract.id}</td>
                <td className="px-4 py-2">{contract.client_id}</td>
                <td className="px-4 py-2">{contract.equipment_id}</td>
                <td className="px-4 py-2">{contract.monthly_payment.toLocaleString()} €</td>
                <td className="px-4 py-2">{contract.start_date} - {contract.end_date}</td>
                <td className="px-4 py-2">{contract.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
