// src/components/prospection/treasury/TreasuryTable.tsx
import { useState, useMemo } from 'react';
import { ArrowUpDown, Building2, Wallet, TrendingUp, ArrowRightLeft, Search, Filter } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from '../../ui/Table';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { useCurrencyContext } from '../../../hooks/useCurrencyContext';
import type { TreasuryAccount, TreasuryAccountType, Currency } from '../../../types/company';

interface TreasuryTableProps {
  accounts: TreasuryAccount[];
}

type SortField = 'code' | 'name' | 'type' | 'balance' | 'currency';
type SortDirection = 'asc' | 'desc';

const accountTypeLabels: Record<TreasuryAccountType, string> = {
  bank: 'Banque',
  cash: 'Caisse',
  investment: 'Placement',
  transit: 'Transit'
};

const accountTypeIcons: Record<TreasuryAccountType, React.ElementType> = {
  bank: Building2,
  cash: Wallet,
  investment: TrendingUp,
  transit: ArrowRightLeft
};

const accountTypeColors: Record<TreasuryAccountType, string> = {
  bank: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  cash: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  investment: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  transit: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400'
};

export function TreasuryTable({ accounts }: TreasuryTableProps) {
  const { formatAmount } = useCurrencyContext();
  const [sortField, setSortField] = useState<SortField>('code');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<TreasuryAccountType | ''>('');
  const [filterCurrency, setFilterCurrency] = useState<Currency | ''>('');

  // Toggle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered and sorted accounts
  const displayedAccounts = useMemo(() => {
    let filtered = [...accounts];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        acc =>
          acc.name.toLowerCase().includes(term) ||
          acc.code.toLowerCase().includes(term) ||
          acc.bankName?.toLowerCase().includes(term) ||
          acc.accountNumber?.toLowerCase().includes(term)
      );
    }

    // Type filter
    if (filterType) {
      filtered = filtered.filter(acc => acc.type === filterType);
    }

    // Currency filter
    if (filterCurrency) {
      filtered = filtered.filter(acc => acc.currency === filterCurrency);
    }

    // Sort
    filtered.sort((a, b) => {
      let compareA: string | number = a[sortField] as string | number;
      let compareB: string | number = b[sortField] as string | number;

      // Special handling for optional fields
      if (sortField === 'type') {
        compareA = accountTypeLabels[a.type];
        compareB = accountTypeLabels[b.type];
      }

      if (typeof compareA === 'string' && typeof compareB === 'string') {
        compareA = compareA.toLowerCase();
        compareB = compareB.toLowerCase();
      }

      if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [accounts, searchTerm, filterType, filterCurrency, sortField, sortDirection]);

  // Calculate totals by currency
  const totals = useMemo(() => {
    const result: Record<Currency, number> = { CDF: 0, USD: 0, EUR: 0 };
    displayedAccounts.forEach(acc => {
      result[acc.currency] += acc.balance;
    });
    return result;
  }, [displayedAccounts]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un compte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TreasuryAccountType | '')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tous les types</option>
            {(Object.keys(accountTypeLabels) as TreasuryAccountType[]).map(type => (
              <option key={type} value={type}>{accountTypeLabels[type]}</option>
            ))}
          </select>
        </div>

        {/* Currency Filter */}
        <select
          value={filterCurrency}
          onChange={(e) => setFilterCurrency(e.target.value as Currency | '')}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="">Toutes devises</option>
          <option value="CDF">CDF</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </select>

        {/* Reset */}
        {(searchTerm || filterType || filterCurrency) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm('');
              setFilterType('');
              setFilterCurrency('');
            }}
          >
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => handleSort('code')}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    Code SYSCOHADA
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    Libellé
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    Type
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>Banque / Institution</TableHead>
                <TableHead>N° de compte</TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('balance')}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    Solde
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort('currency')}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    Devise
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedAccounts.map(account => {
                const Icon = accountTypeIcons[account.type];
                return (
                  <TableRow key={account.code}>
                    <TableCell className="font-mono font-semibold text-gray-900 dark:text-white">
                      {account.code}
                    </TableCell>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>
                      <Badge className={accountTypeColors[account.type]}>
                        <Icon className="w-3 h-3 mr-1" />
                        {accountTypeLabels[account.type]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-gray-400">
                      {account.bankName || '-'}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-gray-600 dark:text-gray-400">
                      {account.accountNumber || '-'}
                    </TableCell>
                    <TableCell className="font-semibold text-right">
                      {formatAmount(account.balance)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{account.currency}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}

              {displayedAccounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    Aucun compte trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Totals */}
      {displayedAccounts.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-900 dark:text-white">
              Total par devise ({displayedAccounts.length} compte{displayedAccounts.length > 1 ? 's' : ''}) :
            </span>
            <div className="flex gap-6">
              {(Object.entries(totals) as [Currency, number][]).map(([currency, total]) => {
                if (total === 0) return null;
                return (
                  <div key={currency} className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">{currency}</div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {formatAmount(total)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
