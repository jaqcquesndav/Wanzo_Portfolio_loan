import React from 'react';
import { ActionsDropdown } from '../../ui/ActionsDropdown';
import { Badge } from '../../ui/Badge';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../ui/Table';

export interface Repayment {
  id: string;
  company: string;
  product: string;
  dueDate: string;
  amount: number;
  status: 'à venir' | 'payé' | 'retard';
  requestId?: string;
  portfolioId: string;
}

interface RepaymentsTableProps {
  repayments: Repayment[];
  onMarkPaid: (id: string) => void;
  onView: (id: string) => void;
}

// Configuration pour l'affichage des statuts
const statusConfig = {
  'à venir': { label: 'À venir', variant: 'warning', color: 'bg-yellow-100 text-yellow-700' },
  'payé': { label: 'Payé', variant: 'success', color: 'bg-green-100 text-green-700' },
  'retard': { label: 'En retard', variant: 'error', color: 'bg-red-100 text-red-700' },
};

export const RepaymentsTable: React.FC<RepaymentsTableProps> = ({ repayments, onMarkPaid, onView }) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHead>
            <tr>
              <TableHeader>Entreprise</TableHeader>
              <TableHeader>Produit</TableHeader>
              <TableHeader>Échéance</TableHeader>
              <TableHeader>Montant</TableHeader>
              <TableHeader>Statut</TableHeader>
              <TableHeader align="center">Actions</TableHeader>
            </tr>
          </TableHead>
          <TableBody>
            {repayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                  Aucun remboursement
                </TableCell>
              </TableRow>
            ) : (
              repayments.map((r) => (
                <TableRow
                  key={r.id}
                  onClick={() => onView(r.id)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium">{r.company}</TableCell>
                  <TableCell>{r.product}</TableCell>
                  <TableCell>{r.dueDate}</TableCell>
                  <TableCell>{r.amount.toLocaleString()} FCFA</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[r.status].variant as "warning" | "success" | "error" | "secondary" | "primary" | "danger"}>
                      {statusConfig[r.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center overflow-visible relative">
                    <div className="inline-block">
                      <ActionsDropdown
                        actions={[
                          { label: 'Voir', onClick: () => onView(r.id) },
                          { label: 'Marquer comme payé', onClick: () => onMarkPaid(r.id), disabled: r.status !== 'à venir' }
                        ]}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
