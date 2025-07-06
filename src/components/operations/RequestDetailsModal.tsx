import React, { useState } from 'react';
import { X, Building, Calendar, DollarSign, Clock, Download, Play, FileText, Briefcase, Users, TrendingUp, AlertTriangle, XCircle, Wrench, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CompanyDetails } from '../prospection/CompanyDetails';
import { WorkflowSelector } from '../workflow/WorkflowSelector';
import { formatCurrency } from '../../utils/formatters';
import type { OperationRequest, LeasingEquipmentRequest } from '../../types/operations';

interface RequestDetailsModalProps {
  request: OperationRequest;
  onClose: () => void;
  onStartWorkflow?: (request: OperationRequest, equipment?: LeasingEquipmentRequest) => void;
  onReject?: (request: OperationRequest) => void;
}

export function RequestDetailsModal({ 
  request, 
  onClose, 
  onStartWorkflow,
  onReject
}: RequestDetailsModalProps) {
  const [showCompanyDetails, setShowCompanyDetails] = useState(false);
  const [showWorkflowSelector, setShowWorkflowSelector] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<LeasingEquipmentRequest | null>(null);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  const handleStartWorkflow = (equipment?: LeasingEquipmentRequest) => {
    if (onStartWorkflow) {
      onStartWorkflow(request, equipment);
    }
    setShowWorkflowSelector(true);
  };

  const handleReject = () => {
    if (onReject) {
      onReject(request);
      onClose();
    }
  };

  const renderCreditDetails = () => (
    <div className="mt-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <FileText className="h-5 w-5 text-gray-400 mr-2" />
          Détails du crédit
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Montant demandé</p>
            <p className="font-medium">{formatCurrency(request.amount)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Durée</p>
            <p className="font-medium">{request.details.duration} mois</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Score crédit</p>
            <div className="flex items-center">
              <span className={`font-medium ${
                (request.details.creditScore || 0) >= 80 ? 'text-green-600' :
                (request.details.creditScore || 0) >= 60 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {request.details.creditScore}/100
              </span>
              {(request.details.creditScore || 0) >= 80 && (
                <Check className="h-4 w-4 text-green-500 ml-2" />
              )}
              {(request.details.creditScore || 0) < 60 && (
                <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Taux d'intérêt proposé</p>
            <p className="font-medium">{request.details.interestRate}%</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Building className="h-5 w-5 text-gray-400 mr-2" />
          Métriques de l'entreprise
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <TrendingUp className="h-4 w-4 mr-2" />
              Croissance CA
            </div>
            <p className="text-lg font-medium text-green-600">
              +{request.company.financial_metrics.revenue_growth}%
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <DollarSign className="h-4 w-4 mr-2" />
              Marge bénéficiaire
            </div>
            <p className="text-lg font-medium">
              {request.company.financial_metrics.profit_margin}%
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Ratio d'endettement
            </div>
            <p className="text-lg font-medium">
              {request.company.financial_metrics.debt_ratio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLeasingDetails = () => (
    <div className="mt-6 space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Wrench className="h-5 w-5 text-gray-400 mr-2" />
          Équipements demandés
        </h3>
        <div className="space-y-4">
          {request.details.leasingEquipment?.map((item, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {item.equipment.name}
                    </h4>
                    <Badge variant={item.equipment.condition === 'new' ? 'success' : 'warning'}>
                      {item.equipment.condition === 'new' ? 'Neuf' : 'Occasion'}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm text-gray-500">Catégorie</span>
                      <p className="font-medium">{item.equipment.category}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Prix unitaire</span>
                      <p className="font-medium">{formatCurrency(item.equipment.price)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Quantité</span>
                      <p className="font-medium">{item.quantity}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Durée</span>
                      <p className="font-medium">{item.duration} mois</p>
                    </div>
                  </div>

                  <div className="flex space-x-4 text-sm">
                    <div className="flex items-center">
                      <Check className={`h-4 w-4 ${item.maintenanceIncluded ? 'text-green-500' : 'text-gray-300'} mr-1`} />
                      <span>Maintenance incluse</span>
                    </div>
                    <div className="flex items-center">
                      <Check className={`h-4 w-4 ${item.insuranceIncluded ? 'text-green-500' : 'text-gray-300'} mr-1`} />
                      <span>Assurance incluse</span>
                    </div>
                  </div>

                  {/* Spécifications techniques */}
                  <div className="mt-4">
                    <h5 className="text-sm font-medium mb-2">Spécifications</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(item.equipment.specifications).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-gray-500">{key}: </span>
                          <span className="font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Image de l'équipement */}
                <img
                  src={item.equipment.imageUrl}
                  alt={item.equipment.name}
                  className="w-32 h-32 object-cover rounded-lg ml-4"
                />
              </div>

              {/* Bouton pour démarrer le workflow spécifique à cet équipement */}
              {request.status === 'pending' && onStartWorkflow && (
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() => handleStartWorkflow(item)}
                    icon={<Play className="h-4 w-4" />}
                  >
                    Démarrer le workflow
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <Building className="h-5 w-5 text-gray-400 mr-2" />
          Métriques de l'entreprise
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <TrendingUp className="h-4 w-4 mr-2" />
              Croissance CA
            </div>
            <p className="text-lg font-medium text-green-600">
              +{request.company.financial_metrics.revenue_growth}%
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <DollarSign className="h-4 w-4 mr-2" />
              Capacité de remboursement
            </div>
            <p className="text-lg font-medium">
              {request.company.financial_metrics.cash_flow / request.amount * 100}%
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center text-sm text-gray-500 mb-1">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Score crédit
            </div>
            <p className="text-lg font-medium">
              {request.details.creditScore}/100
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <Badge variant={request.status === 'pending' ? 'warning' : 'primary'}>
                {request.status}
              </Badge>
              <h2 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">
                Demande de {request.type === 'leasing' ? 'leasing' : 'crédit'} - {request.company.name}
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              {request.status === 'pending' && (
                <>
                  <Button
                    variant="danger"
                    onClick={() => setShowRejectConfirm(true)}
                    icon={<XCircle className="h-4 w-4" />}
                  >
                    Rejeter
                  </Button>
                  <Button
                    onClick={() => handleStartWorkflow()}
                    icon={<Play className="h-4 w-4" />}
                  >
                    Démarrer le workflow
                  </Button>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                icon={<X className="h-5 w-5" />}
              />
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Informations de l'entreprise */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Building className="h-5 w-5 text-gray-400 mr-2" />
              Informations de l'entreprise
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Nom</p>
                  <p className="font-medium">{request.company.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Secteur</p>
                  <p className="font-medium">{request.company.sector}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Chiffre d'affaires</p>
                  <p className="font-medium">{formatCurrency(request.company.annual_revenue)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Employés</p>
                  <p className="font-medium">{request.company.employee_count}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCompanyDetails(true)}
                  className="w-full"
                >
                  Voir profil complet
                </Button>
              </div>
            </div>
          </div>

          {/* Détails spécifiques selon le type de demande */}
          {request.type === 'credit' ? renderCreditDetails() : renderLeasingDetails()}

          {/* Documents */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <FileText className="h-5 w-5 text-gray-400 mr-2" />
              Documents fournis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {request.documents?.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <div className="font-medium">{doc.name}</div>
                    <div className="text-sm text-gray-500">{doc.size}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(doc.url, '_blank')}
                    icon={<Download className="h-4 w-4" />}
                  >
                    Télécharger
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal de confirmation de rejet */}
        {showRejectConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium mb-4">Confirmer le rejet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Êtes-vous sûr de vouloir rejeter cette demande ? Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowRejectConfirm(false)}
                >
                  Annuler
                </Button>
                <Button
                  variant="danger"
                  onClick={handleReject}
                >
                  Confirmer le rejet
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Autres modals */}
        {showCompanyDetails && (
          <CompanyDetails
            company={request.company}
            onClose={() => setShowCompanyDetails(false)}
            onContact={() => {}}
            onScheduleMeeting={() => {}}
          />
        )}

        {showWorkflowSelector && (
          <WorkflowSelector
            workflows={[]}
            productId={request.product.id}
            onSelect={() => {}}
            onClose={() => setShowWorkflowSelector(false)}
          />
        )}
      </div>
    </div>
  );
}