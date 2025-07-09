import React from 'react';
import type { LeasingPayment } from '../../../types/leasing-payment';

interface PaymentsTableProps {
  payments: LeasingPayment[];
}

export function PaymentsTable({ payments }: PaymentsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700 w-full">
      <table className="min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left">Montant</th>
            <th className="px-4 py-2 text-left">Type</th>
            <th className="px-4 py-2 text-left">Statut</th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center py-8 text-gray-400">Aucun paiement à afficher</td>
            </tr>
          ) : (
            payments.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2">{p.date}</td>
                <td className="px-4 py-2">{p.amount.toLocaleString()} €</td>
                <td className="px-4 py-2">{p.type}</td>
                <td className="px-4 py-2">{p.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
