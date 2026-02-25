// src/components/portfolio/traditional/FinancialProductsList.tsx
// Liste des produits financiers — affichage aligné sur le schéma backend

import { Edit2, Trash2, TrendingUp, Banknote, Clock, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { useCurrencyContext } from '../../../hooks/useCurrencyContext';
import { PRODUCT_TYPE_LABELS } from '../../../types/traditional-portfolio';
import type { FinancialProduct } from '../../../types/traditional-portfolio';

interface FinancialProductsListProps {
  products: FinancialProduct[];
  onEdit?: (product: FinancialProduct) => void;
  onDelete?: (product: FinancialProduct) => void;
  /** Conservé pour compatibilité — appelé lors du clic "Modifier" si onEdit absent */
  onViewDetails?: (product: FinancialProduct) => void;
}

/** Formater un taux numérique ou string */
function formatRate(value: number | string | undefined): string {
  if (value === undefined || value === null) return '—';
  const n = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(n) ? '—' : `${n.toFixed(2)} %`;
}

/** Badge de statut produit */
function StatusBadge({ status }: { status: FinancialProduct['status'] }) {
  return (
    <Badge variant={status === 'active' ? 'success' : 'warning'}>
      {status === 'active' ? 'Actif' : 'Inactif'}
    </Badge>
  );
}

/** Libellé de la méthode de calcul */
const CALC_LABELS: Record<string, string> = {
  declining_balance: 'Solde dégressif',
  flat:              'Taux fixe (flat)',
  annuity:           'Annuités constantes',
};

const TERM_UNIT_LABELS: Record<string, string> = {
  days:   'jours',
  months: 'mois',
  years:  'ans',
};

export function FinancialProductsList({
  products,
  onEdit,
  onDelete,
  onViewDetails,
}: FinancialProductsListProps) {
  const { formatAmount } = useCurrencyContext();

  // Filtrer les entrées malformées (ex: ["[]"] de l'API)
  const validProducts = (products ?? []).filter(
    (p): p is FinancialProduct => typeof p === 'object' && p !== null && 'id' in p,
  );

  if (validProducts.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
        <p className="text-sm">Aucun produit financier</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {validProducts.map((product) => {
        const typeLabel = PRODUCT_TYPE_LABELS[product.type] ?? product.type;
        const termUnit  = TERM_UNIT_LABELS[product.term_unit] ?? product.term_unit;
        const calcLabel = CALC_LABELS[product.interest_calculation_method ?? ''] ?? product.interest_calculation_method ?? '—';

        return (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-4"
          >
            {/* ── En-tête ── */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                  {product.name}
                </h3>
                {product.code && (
                  <span className="text-xs text-gray-400 font-mono">{product.code}</span>
                )}
                {product.description && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <Badge variant="primary">{typeLabel}</Badge>
                <StatusBadge status={product.status} />
              </div>
            </div>

            {/* ── Taux & méthode ── */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <TrendingUp className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span>
                <span className="font-medium">{formatRate(product.base_interest_rate)}</span>
                &nbsp;·&nbsp;{product.interest_type === 'fixed' ? 'Fixe' : 'Variable'}
                &nbsp;·&nbsp;{calcLabel}
              </span>
            </div>

            {/* ── Montants ── */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Banknote className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>
                {formatAmount(typeof product.min_amount === 'string'
                  ? parseFloat(product.min_amount) : product.min_amount)}
                {' '}&ndash;{' '}
                {formatAmount(typeof product.max_amount === 'string'
                  ? parseFloat(product.max_amount) : product.max_amount)}
              </span>
            </div>

            {/* ── Durée ── */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <Clock className="h-4 w-4 text-orange-400 flex-shrink-0" />
              <span>
                {product.min_term} – {product.max_term} {termUnit}
              </span>
            </div>

            {/* ── Documents requis ── */}
            {product.required_documents?.length > 0 && (
              <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                <FileText className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {product.required_documents.map((doc, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                                 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Frais ── */}
            {product.fees?.length > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-600 dark:text-gray-300">Frais : </span>
                {product.fees.map((fee, i) => (
                  <span key={i}>
                    {i > 0 && ', '}
                    {fee.type} {fee.amount}{fee.is_percentage ? '%' : ' FCFA'}
                  </span>
                ))}
              </div>
            )}

            {/* ── Actions ── */}
            <div className="flex gap-2 mt-auto pt-2 border-t dark:border-gray-700">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                icon={<Edit2 className="h-3.5 w-3.5" />}
                onClick={() => {
                  if (onEdit) onEdit(product);
                  else if (onViewDetails) onViewDetails(product);
                }}
              >
                Modifier
              </Button>
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800"
                  icon={<Trash2 className="h-3.5 w-3.5" />}
                  onClick={() => onDelete(product)}
                >
                  Désactiver
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

