import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Removed unused ArrowLeft and Button imports
import { Breadcrumb } from '../components/common/Breadcrumb';
import { Tabs, TabsContent } from '../components/ui/Tabs';
import { TabsOverflow } from '../components/ui/TabsOverflow';
import { useLeasingPortfolio } from '../hooks/useLeasingPortfolio';
import { useInitMockData } from '../hooks/useInitMockData';
import { usePaymentOrder } from '../hooks/usePaymentOrderContext';
import { openPaymentOrder } from '../utils/openPaymentOrder';
import { CompanyDetails } from '../components/prospection/CompanyDetails';
import { useNotification } from '../contexts/NotificationContext';

import { EquipmentsTable } from '../components/portfolio/leasing/EquipmentsTable';
import { LeasingRequestsTable } from '../components/portfolio/leasing/LeasingRequestsTable';
import { ContractsTable } from '../components/portfolio/leasing/ContractsTable';
import { IncidentsTable } from '../components/portfolio/leasing/IncidentsTable';
import { MaintenanceTable } from '../components/portfolio/leasing/MaintenanceTable';
import { PaymentsTable } from '../components/portfolio/leasing/PaymentsTable';
import { LeasingPortfolioSettingsDisplay } from '../components/portfolio/leasing/LeasingPortfolioSettingsDisplay';
import { portfolioTypeConfig } from '../config/portfolioTypes';
import { mockCompanies } from '../data/mockCompanies';
import type { LeasingPortfolio } from '../types/leasing';
import type { Company } from '../types/company';


export default function LeasingPortfolioDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const portfolioType = 'leasing';
  // S'assurer que les données sont à jour avec la dernière version
  const { isInitialized, loading: initLoading } = useInitMockData();
  // Utiliser toujours le type spécifique pour ce composant
  const { portfolio, loading: portfolioLoading } = useLeasingPortfolio(id || '');
  const { showPaymentOrderModal } = usePaymentOrder();
  const { showNotification } = useNotification();
  // Combiner les états de chargement
  const loading = portfolioLoading || initLoading || !isInitialized;
  const config = portfolioTypeConfig[portfolioType];
  const [tab, setTab] = useState(config.tabs[0]?.key || 'equipments');
  
  // État pour le modal de détails de l'entreprise
  const [companyDetailModalOpen, setCompanyDetailModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Fonction pour gérer l'affichage des détails d'une entreprise
  const handleViewCompany = (companyId: string) => {
    // Chercher l'entreprise dans mockCompanies
    const companyFound = mockCompanies.find(c => c.id === companyId);
    
    if (companyFound) {
      setSelectedCompany(companyFound);
      setCompanyDetailModalOpen(true);
      showNotification(`Affichage des détails de l'entreprise: ${companyFound.name}`, 'info');
    } else {
      // Créer une entreprise de base avec l'ID fourni
      const basicCompany: Company = {
        id: companyId,
        name: `Client #${companyId}`,
        sector: 'Non spécifié',
        size: 'small',
        status: 'active',
        annual_revenue: 0,
        employee_count: 0,
        financial_metrics: {
          revenue_growth: 0,
          profit_margin: 0,
          cash_flow: 0,
          debt_ratio: 0,
          working_capital: 0,
          credit_score: 0,
          financial_rating: 'C'
        },
        esg_metrics: {
          carbon_footprint: 0,
          environmental_rating: 'B',
          social_rating: 'B',
          governance_rating: 'B'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setSelectedCompany(basicCompany);
      setCompanyDetailModalOpen(true);
    }
  };

  // Harmonized error/loading/guard logic (like InvestmentPortfolioDetails)
  if (!id) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">ID de portefeuille manquant</h2>
        <button
          className="mt-4 px-4 py-2 border rounded border-gray-300 bg-white hover:bg-gray-50"
          onClick={() => navigate(`/app/${portfolioType}`)}
        >
          Retour au dashboard
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-6 h-6 border-t-2 border-gray-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!portfolio && !loading) {
    navigate(`/app/${portfolioType}`, { replace: true });
    return null;
  }

  // Guard: only show if portfolio.type === 'leasing'
  if (!portfolio || portfolio.type !== 'leasing') {
    navigate(`/app/${portfolioType}`, { replace: true });
    return null;
  }

  // Dynamic config for tabs (supprimé, déjà défini plus haut)

  // Debug log to help diagnose tab/config issues
  // (removed unused eslint-disable-next-line no-console)
  // console.log('DEBUG LeasingPortfolioDetails:', {
  //   configTabs: config.tabs,
  //   tab,
  //   portfolio,
  //   tabsKeys: config.tabs.map(t => t.key),
  // });

  // Fallback UI if no tab matches
  const validTabKeys = config.tabs.map(t => t.key);
  const isTabValid = validTabKeys.includes(tab);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Breadcrumb
        items={[
          { label: 'Dashboard', href: `/app/${portfolioType}` },
          { label: portfolio?.name || 'Portefeuille', href: `/app/${portfolioType}/${id}` },
        ]}
        portfolioType={portfolioType}
      />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{portfolio.name}</h1>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsOverflow
          tabs={config.tabs.map(({ key, label }) => ({ key, label }))}
          value={tab}
          onValueChange={setTab}
        />
        {!isTabValid && (
          <div className="text-center text-red-500 py-8">
            <p>Onglet inconnu ou non configuré : <b>{tab}</b></p>
            <p>Onglets valides : {validTabKeys.join(', ')}</p>
          </div>
        )}
        {/* Tab rendering, harmonized with config */}
        <TabsContent value="equipments" currentValue={tab}>
          <EquipmentsTable
            equipments={portfolio.type === 'leasing' ? (portfolio as unknown as LeasingPortfolio).equipment_catalog : []}
            onRowClick={(equipment) => {
              // Navigation désactivée
              console.log(`Équipement ${equipment.name} sélectionné`);
              showNotification(`Les détails des équipements ne sont pas accessibles, seuls les contrats sont consultables`, 'info');
            }}
          />
        </TabsContent>
        <TabsContent value="requests" currentValue={tab}>
          <LeasingRequestsTable
            requests={portfolio.type === 'leasing' ? (portfolio as unknown as LeasingPortfolio).leasing_requests : []}
            equipments={portfolio.type === 'leasing' ? (portfolio as unknown as LeasingPortfolio).equipment_catalog : []}
            onViewDetails={(request) => {
              console.log(`Demande de leasing ${request.id} sélectionnée`);
              // Comme on a besoin de voir uniquement les détails des contrats, on désactive cette navigation
              showNotification(`Les détails des demandes ne sont pas accessibles, seuls les contrats sont consultables`, 'info');
            }}
            onViewCompany={handleViewCompany}
            onApprove={(request) => {
              console.log('Approuver la demande et créer un contrat:', request);
              
              // Marquer la demande comme approuvée et créer un contrat
              // Note: Dans une implémentation réelle, nous utiliserions useLeasingRequestActions().approveAndCreateContract()
              // Ici, nous simulons juste l'approbation avec un message
              showNotification(`Demande de leasing ${request.id} approuvée et contrat créé`, 'success');
              
              // Redirection vers le contrat créé (dans une implémentation réelle)
              // navigate(`/app/${portfolioType}/leasing/${portfolioId}/contracts/${newContractId}`);
            }}
            onReject={(request) => {
              console.log('Rejeter la demande:', request);
              // Implémenter la logique de rejet
            }}
            onDownloadTechnicalSheet={(request) => {
              console.log('Télécharger la fiche technique:', request);
              // Implémenter le téléchargement
            }}
          />
        </TabsContent>
        <TabsContent value="contracts" currentValue={tab}>
          <ContractsTable
            contracts={portfolio.type === 'leasing' ? (portfolio as unknown as LeasingPortfolio).contracts : []}
            onRowClick={(contract) => {
              // Naviguer vers la page de détail du contrat
              console.log(`Contrat ${contract.id} sélectionné`);
              navigate(`/app/${portfolioType}/leasing/${id}/contracts/${contract.id}`);
              showNotification(`Consultation des détails du contrat ${contract.id}`, 'info');
            }}
            onViewCompany={handleViewCompany}
            orderEquipment={(contract) => {
              console.log('Commander équipement pour le contrat:', contract);
              
              // Récupérer les détails de l'équipement
              const equipment = portfolio.type === 'leasing' 
                ? (portfolio as unknown as LeasingPortfolio).equipment_catalog.find(eq => eq.id === contract.equipment_id)
                : undefined;
              
              // Ouvrir le modal d'ordre de paiement
              openPaymentOrder({
                action: 'order_equipment',
                portfolioId: id || '',
                portfolioName: portfolio?.name,
                itemId: contract.id,
                reference: contract.id,
                amount: contract.monthly_payment * 6, // Exemple: paiement initial de 6 mois
                company: contract.client_name,
                product: equipment?.name || 'Équipement de leasing',
                additionalInfo: {
                  equipmentId: contract.equipment_id,
                  equipmentName: equipment?.name,
                  contractId: contract.id
                }
              }, showPaymentOrderModal);
            }}
          />
        </TabsContent>
        <TabsContent value="incidents" currentValue={tab}>
          <IncidentsTable
            incidents={portfolio.type === 'leasing' ? (portfolio as unknown as LeasingPortfolio).incidents : []}
            onRowClick={(incident) => {
              // Navigation désactivée
              console.log(`Incident ${incident.id} sélectionné`);
              showNotification(`Les détails des incidents ne sont pas accessibles, seuls les contrats sont consultables`, 'info');
            }}
          />
        </TabsContent>
        <TabsContent value="maintenance" currentValue={tab}>
          <MaintenanceTable
            maintenance={portfolio.type === 'leasing' ? (portfolio as unknown as LeasingPortfolio).maintenances : []}
            onRowClick={(maintenance) => {
              // Navigation désactivée
              console.log(`Maintenance ${maintenance.id} sélectionnée`);
              showNotification(`Les détails des maintenances ne sont pas accessibles, seuls les contrats sont consultables`, 'info');
            }}
          />
        </TabsContent>
        <TabsContent value="payments" currentValue={tab}>
          <PaymentsTable
            payments={portfolio.type === 'leasing' ? (portfolio as unknown as LeasingPortfolio).payments : []}
            onRowClick={(payment) => {
              // Navigation désactivée
              console.log(`Paiement ${payment.id} sélectionné`);
              showNotification(`Les détails des paiements ne sont pas accessibles, seuls les contrats sont consultables`, 'info');
            }}
          />
        </TabsContent>
        <TabsContent value="settings" currentValue={tab}>
          <LeasingPortfolioSettingsDisplay 
            portfolio={portfolio as unknown as LeasingPortfolio}
            onEdit={() => {
              // Implémenter la logique d'édition ici
              console.log('Édition des paramètres du portefeuille leasing');
            }}
            onDelete={() => {
              // Implémenter la logique de suppression ici
              console.log('Suppression du portefeuille leasing');
              navigate('/app/leasing');
            }}
          />
        </TabsContent>
      </Tabs>
      
      {/* Modal de détails de l'entreprise */}
      {selectedCompany && companyDetailModalOpen && (
        <CompanyDetails
          company={selectedCompany}
          onClose={() => setCompanyDetailModalOpen(false)}
        />
      )}
    </div>
  );
}