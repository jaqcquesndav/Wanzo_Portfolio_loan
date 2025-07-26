// src/components/portfolio/traditional/guarantees/GuaranteeCard.tsx
import React from 'react';
import { Card } from '../../../ui/Card';
import { Guarantee, GuaranteeType } from '../../../../types/guarantee';
import { ShieldCheck, Home, Truck, Landmark, FileCheck, Link, Database, LockIcon, CircleDollarSign, HelpCircle } from 'lucide-react';
import { useCurrencyContext } from '../../../../hooks/useCurrencyContext';

interface GuaranteeCardProps {
  guarantee: Guarantee;
  showHeader?: boolean;
}

export const GuaranteeCard: React.FC<GuaranteeCardProps> = ({ guarantee, showHeader = true }) => {
  const { formatAmount } = useCurrencyContext();

  // Fonction pour formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fonction pour déterminer l'icône selon le type de garantie
  const getGuaranteeIcon = (type: GuaranteeType | string) => {
    switch (type) {
      case 'materiel':
        return <Truck className="h-5 w-5 text-blue-600" />;
      case 'immobilier':
        return <Home className="h-5 w-5 text-green-600" />;
      case 'caution_bancaire':
        return <Landmark className="h-5 w-5 text-purple-600" />;
      case 'fonds_garantie':
        return <Database className="h-5 w-5 text-cyan-600" />;
      case 'assurance_credit':
        return <ShieldCheck className="h-5 w-5 text-red-600" />;
      case 'nantissement':
        return <Link className="h-5 w-5 text-yellow-600" />;
      case 'gage':
        return <LockIcon className="h-5 w-5 text-orange-600" />;
      case 'hypotheque':
        return <Home className="h-5 w-5 text-indigo-600" />;
      case 'depot_especes':
        return <CircleDollarSign className="h-5 w-5 text-emerald-600" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  // Fonction pour obtenir le libellé du type de garantie
  const getGuaranteeTypeLabel = (type: GuaranteeType | string) => {
    switch (type) {
      case 'materiel':
        return 'Matériel';
      case 'immobilier':
        return 'Immobilier';
      case 'caution_bancaire':
        return 'Caution bancaire';
      case 'fonds_garantie':
        return 'Fonds de garantie';
      case 'assurance_credit':
        return 'Assurance crédit';
      case 'nantissement':
        return 'Nantissement';
      case 'gage':
        return 'Gage';
      case 'hypotheque':
        return 'Hypothèque';
      case 'depot_especes':
        return 'Dépôt en espèces';
      default:
        return type;
    }
  };

  // Fonction pour obtenir la couleur de badge selon le statut
  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'libérée':
        return 'bg-blue-100 text-blue-800';
      case 'saisie':
        return 'bg-red-100 text-red-800';
      case 'expirée':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Fonction pour afficher les détails spécifiques selon le type de garantie
  const renderTypeSpecificDetails = () => {
    switch (guarantee.type) {
      case 'materiel':
        return (
          <>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-500">Description du matériel:</span>
              <p className="text-sm text-gray-900">{guarantee.details?.description || 'Non spécifié'}</p>
            </div>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-500">Référence:</span>
              <p className="text-sm text-gray-900">{guarantee.details?.reference || 'À générer par le système'}</p>
            </div>
          </>
        );
      case 'immobilier':
        return (
          <>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-500">Localisation:</span>
              <p className="text-sm text-gray-900">{guarantee.details?.location || 'Non spécifié'}</p>
            </div>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-500">Description:</span>
              <p className="text-sm text-gray-900">{guarantee.details?.description || 'Non spécifié'}</p>
            </div>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-500">Référence cadastrale:</span>
              <p className="text-sm text-gray-900">{guarantee.details?.reference || 'À générer par le système'}</p>
            </div>
          </>
        );
      case 'caution_bancaire':
        return (
          <>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-500">Banque émettrice:</span>
              <p className="text-sm text-gray-900">{guarantee.details?.provider || 'Non spécifié'}</p>
            </div>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-500">Numéro de caution:</span>
              <p className="text-sm text-gray-900">{guarantee.details?.reference || 'À générer par le système'}</p>
            </div>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-500">Date d'expiration:</span>
              <p className="text-sm text-gray-900">{formatDate(guarantee.expiry_date)}</p>
            </div>
          </>
        );
      case 'assurance_credit':
        return (
          <>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-500">Assureur:</span>
              <p className="text-sm text-gray-900">{guarantee.details?.provider || 'Non spécifié'}</p>
            </div>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-500">Numéro de police:</span>
              <p className="text-sm text-gray-900">{guarantee.details?.reference || 'À générer par le système'}</p>
            </div>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-500">Taux de couverture:</span>
              <p className="text-sm text-gray-900">{guarantee.details?.coverage ? `${guarantee.details.coverage}%` : 'Non spécifié'}</p>
            </div>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-500">Date d'expiration:</span>
              <p className="text-sm text-gray-900">{formatDate(guarantee.expiry_date)}</p>
            </div>
          </>
        );
      case 'fonds_garantie':
        return (
          <>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-500">Gestionnaire du fonds:</span>
              <p className="text-sm text-gray-900">{guarantee.details?.provider || 'Non spécifié'}</p>
            </div>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-500">Référence du fonds:</span>
              <p className="text-sm text-gray-900">{guarantee.details?.reference || 'À générer par le système'}</p>
            </div>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-500">Taux de couverture:</span>
              <p className="text-sm text-gray-900">{guarantee.details?.coverage ? `${guarantee.details.coverage}%` : 'Non spécifié'}</p>
            </div>
          </>
        );
      default:
        return (
          <>
            <div className="mt-2">
              <span className="text-sm font-medium text-gray-500">Description:</span>
              <p className="text-sm text-gray-900">{guarantee.details?.description || 'Non spécifié'}</p>
            </div>
            {guarantee.details?.reference && (
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-500">Référence:</span>
                <p className="text-sm text-gray-900">{guarantee.details.reference}</p>
              </div>
            )}
            {guarantee.expiry_date && (
              <div className="mt-2">
                <span className="text-sm font-medium text-gray-500">Date d'expiration:</span>
                <p className="text-sm text-gray-900">{formatDate(guarantee.expiry_date)}</p>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <Card className="p-4 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
      {showHeader && (
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium flex items-center">
            {getGuaranteeIcon(guarantee.type)}
            <span className="ml-2">Garantie: {getGuaranteeTypeLabel(guarantee.type)}</span>
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClass(guarantee.status)}`}>
            {guarantee.status}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
        <div>
          <span className="text-sm font-medium text-gray-500">Entreprise/Entité:</span>
          <p className="text-sm text-gray-900">{guarantee.company}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500">Valeur:</span>
          <p className="text-sm text-gray-900 font-semibold">{formatAmount(guarantee.value)}</p>
        </div>
      </div>

      {/* Affichage des détails spécifiques selon le type de garantie */}
      {renderTypeSpecificDetails()}

      {/* Affichage du document de garantie si disponible */}
      {guarantee.details?.document_url && (
        <div className="mt-3">
          <a 
            href={guarantee.details.document_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <FileCheck className="w-4 h-4 mr-1" />
            Voir le document justificatif
          </a>
        </div>
      )}

      {/* Date de création */}
      <div className="mt-3 text-xs text-gray-500">
        Enregistrée le {formatDate(guarantee.created_at)}
      </div>
    </Card>
  );
};
