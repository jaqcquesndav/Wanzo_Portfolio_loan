
import { useState } from 'react';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { PortfolioActionsDropdown } from '../portfolio/PortfolioActionsDropdown';
import { CreatePortfolioModal } from '../portfolio/CreatePortfolioModal';
import { useTraditionalPortfolios } from '../../hooks/useTraditionalPortfolios';
import { useLeasingPortfolios } from '../../hooks/useLeasingPortfolios';
import { useInvestmentPortfolios } from '../../hooks/useInvestmentPortfolios';
import type { TraditionalPortfolio } from '../../lib/indexedDbPortfolioService';
import type { LeasingPortfolio } from '../../lib/indexedDbPortfolioService';
import type { InvestmentPortfolio } from '../../lib/indexedDbPortfolioService';
import type { DefaultPortfolioFormData } from '../portfolio/DefaultPortfolioForm';
import type { LeasingPortfolioFormData } from '../portfolio/leasing/CreateLeasingPortfolioForm';

type CreatePortfolioFormData = DefaultPortfolioFormData | LeasingPortfolioFormData;




export function SidebarPortfolios() {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const { portfolioType } = useParams();

  // Appel des hooks pour tous les types (ordre fixe)
  const traditional = useTraditionalPortfolios();
  const leasing = useLeasingPortfolios();
  const investment = useInvestmentPortfolios();

  // Sélection du bon tableau et créateur selon le type
  let portfolios: TraditionalPortfolio[] | LeasingPortfolio[] | InvestmentPortfolio[] = [];
  // Sélection du bon tableau selon le type
  if (portfolioType === 'traditional') {
    portfolios = traditional.portfolios;
  } else if (portfolioType === 'leasing') {
    portfolios = leasing.portfolios;
  } else if (portfolioType === 'investment') {
    portfolios = investment.portfolios;
  }

  const filteredPortfolios = portfolioType
    ? portfolios.filter((p) => p.type === portfolioType)
    : [];

  // Drag & drop désactivé (pas de persistance d'ordre pour l'instant)
  const onDragEnd = () => {
    // Rien pour l'instant
  };

  const handleAddPortfolio = () => {
    setModalOpen(true);
  };

  const handleCreatePortfolio = async (data: CreatePortfolioFormData) => {
    if (!portfolioType) {
      setModalOpen(false);
      return;
    }
    if (portfolioType === 'traditional' && traditional.createPortfolio) {
      const toCreate = {
        ...data,
        manager_id: 'default-manager', // à remplacer par la vraie valeur
        institution_id: 'default-institution', // à remplacer par la vraie valeur
      };
      await traditional.createPortfolio(toCreate);
    } else if (portfolioType === 'leasing' && leasing.createPortfolio) {
      const leasingData = data as LeasingPortfolioFormData;
      await leasing.createPortfolio({
        ...leasingData,
        products: [],
        metrics: {
          net_value: leasingData.target_amount,
          average_return: 0,
          risk_portfolio: 0,
          sharpe_ratio: 0,
          volatility: 0,
          alpha: 0,
          beta: 0,
          asset_allocation: [],
          taux_couverture: 0,
          taux_impayes: 0,
        },
      });
    } else if (portfolioType === 'investment' && investment.createPortfolio) {
      const investmentData = data as DefaultPortfolioFormData;
      await investment.createPortfolio({
        ...investmentData,
        products: [],
        metrics: {
          net_value: investmentData.target_amount,
          average_return: 0,
          risk_portfolio: 0,
          sharpe_ratio: 0,
          volatility: 0,
          alpha: 0,
          beta: 0,
          asset_allocation: [],
          taux_couverture: 0,
          taux_impayes: 0,
        },
      });
    }
    setModalOpen(false);
  };

  const [confirm, setConfirm] = useState<{ open: boolean; portfolio?: TraditionalPortfolio | LeasingPortfolio | InvestmentPortfolio; action?: string }>({ open: false });

  const handlePortfolioMenu = (portfolio: TraditionalPortfolio | LeasingPortfolio | InvestmentPortfolio, action: string) => {
    if (action === 'delete') {
      setConfirm({ open: true, portfolio, action });
    } else {
      // Pour edit/duplicate, à remplacer par vos modals personnalisés
      setConfirm({ open: true, portfolio, action });
    }
  };

  const handleConfirm = () => {
    // Ici, suppression ou action réelle du portefeuille (à brancher sur le hook approprié)
    setConfirm({ open: false });
    // TODO: Appeler la suppression ou l'action réelle
  };

  return (
    <div>
      <ConfirmModal
        open={confirm.open}
        title={confirm.action === 'delete' ? 'Cacher le portefeuille ?' : confirm.action === 'edit' ? 'Modifier le portefeuille' : 'Dupliquer le portefeuille'}
        message={
          confirm.action === 'delete'
            ? `Le portefeuille "${confirm.portfolio?.name}" sera caché de la liste. Vous pourrez le supprimer définitivement dans l'onglet Paramètres.`
            : confirm.action === 'edit'
              ? `Fonctionnalité de modification à implémenter pour "${confirm.portfolio?.name}".`
              : confirm.action === 'duplicate'
                ? `Fonctionnalité de duplication à implémenter pour "${confirm.portfolio?.name}".`
                : ''
        }
        confirmLabel={confirm.action === 'delete' ? 'Cacher' : 'OK'}
        cancelLabel="Annuler"
        onConfirm={handleConfirm}
        onCancel={() => setConfirm({ open: false })}
      />
      {modalOpen && (
        <CreatePortfolioModal
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreatePortfolio}
        />
      )}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-primary-light uppercase tracking-wider">Portefeuille</h3>
        <button onClick={handleAddPortfolio} className="text-primary-light hover:text-white p-1 rounded-full transition-colors" aria-label="Créer un portefeuille">
          <Plus className="h-5 w-5" />
        </button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="portfolios" direction="vertical">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="space-y-1 max-h-36 overflow-auto scrollbar-none pr-1"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {filteredPortfolios.slice(0, 3).map((portfolio, idx) => (
                <Draggable key={portfolio.id} draggableId={portfolio.id} index={idx}>
                  {(dragProvided) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                      className="flex items-center bg-primary-dark/70 hover:bg-primary-dark rounded-md px-3 py-2 cursor-pointer group transition-colors"
                      onClick={() => navigate(`/app/${portfolioType}/${portfolio.id}`)}
                    >
                      <span className="flex-1 truncate text-white" title={portfolio.name}>{portfolio.name}</span>
                      <PortfolioActionsDropdown
                        actions={[
                          { key: 'edit', label: 'Modifier' },
                          { key: 'duplicate', label: 'Dupliquer' },
                          { key: 'delete', label: 'Cacher' }
                        ]}
                        onAction={action => handlePortfolioMenu(portfolio, action)}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {/* Affiche le reste si scroll */}
              {filteredPortfolios.length > 3 && (
                <div className="text-xs text-primary-light text-center py-1">Faites défiler pour voir plus...</div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
