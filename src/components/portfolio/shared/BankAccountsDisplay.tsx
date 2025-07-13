import type { BankAccount } from '../../../types/bankAccount';

interface BankAccountsDisplayProps {
  accounts: BankAccount[];
}

export function BankAccountsDisplay({ accounts }: BankAccountsDisplayProps) {
  if (accounts.length === 0) {
    return (
      <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 flex flex-col items-center justify-center gap-2">
        <p className="text-gray-500 dark:text-gray-400 text-center">Aucun compte bancaire associé à ce portefeuille.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4">
      <h3 className="text-lg font-bold text-primary mb-2">Comptes bancaires</h3>
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-50 dark:bg-gray-700 text-left">
            <tr>
              <th className="px-4 py-2 text-sm font-medium">Nom</th>
              <th className="px-4 py-2 text-sm font-medium">Banque</th>
              <th className="px-4 py-2 text-sm font-medium">Numéro de compte</th>
              <th className="px-4 py-2 text-sm font-medium">IBAN</th>
              <th className="px-4 py-2 text-sm font-medium">Devise</th>
              <th className="px-4 py-2 text-sm font-medium">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {accounts.map((account) => (
              <tr key={account.id}>
                <td className="px-4 py-3">{account.account_name}</td>
                <td className="px-4 py-3">{account.bank_name}</td>
                <td className="px-4 py-3">
                  <span className="font-mono">{account.account_number}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono">{account.iban || '-'}</span>
                </td>
                <td className="px-4 py-3">{account.currency}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                    account.is_active 
                      ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200' 
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {account.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
