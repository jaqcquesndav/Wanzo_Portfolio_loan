# Script pour réécrire complètement le fichier SidebarPortfolios.tsx
$content = @'
import { useState } from 'react';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { PortfolioActionsDropdown } from '../portfolio/PortfolioActionsDropdown';
import { CreatePortfolioModal } from '../portfolio/CreatePortfolioModal';
import { useTraditionalPortfolios } from '../../hooks/useTraditionalPortfolios';
import type { TraditionalPortfolio } from '../../types/traditional-portfolio';
import type { DefaultPortfolioFormData } from '../portfolio/DefaultPortfolioForm';

type CreatePortfolioFormData = DefaultPortfolioFormData;

export function SidebarPortfolios() {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const { portfolioType } = useParams();

  // Appel des hooks pour le type traditionnel
  const traditional = useTraditionalPortfolios();

  // Sélection du bon tableau selon le type
  let portfolios: TraditionalPortfolio[] = [];
  if (portfolioType === 'traditional') {
    portfolios = traditional.portfolios;
  }

  const filteredPortfolios = portfolioType
    ? portfolios.filter((p) => p.type === portfolioType)
    : [];

  // Drag & drop désactivé (pas de persistance d''ordre pour l''instant)
  const onDragEnd = () => {
    // Rien pour l''instant
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
    }
    setModalOpen(false);
  };

  const [confirm, setConfirm] = useState<{ open: boolean; portfolio?: TraditionalPortfolio; action?: string }>({ open: false });

  const handlePortfolioMenu = (portfolio: TraditionalPortfolio, action: string) => {
    if (action === 'delete') {
      setConfirm({ open: true, portfolio, action });
      return;
    }

    if (action === 'view') {
      if (portfolioType === 'traditional') {
        navigate(`/app/${portfolioType}/view/${portfolio.id}`);
      }
    } else if (action === 'edit') {
      // Navigation vers la route d''édition du portefeuille
      navigate(`/app/${portfolioType}/${portfolio.id}`);
    }
  };

  const confirmAction = async () => {
    if (confirm.action === 'delete' && confirm.portfolio) {
      // Supprimer le portefeuille
      if (portfolioType === 'traditional' && traditional.deletePortfolio) {
        await traditional.deletePortfolio(confirm.portfolio.id);
      }
    }
    setConfirm({ open: false });
  };

  return (
    <>
      <div className="my-2">
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold text-sm">Portefeuilles</div>
          <button
            onClick={handleAddPortfolio}
            className="w-6 h-6 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary-dark"
          >
            <Plus size={16} />
          </button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="portfolios">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-1"
              >
                {filteredPortfolios.map((portfolio, index) => (
                  <Draggable key={portfolio.id} draggableId={portfolio.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex justify-between items-center p-2 rounded bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer"
                        onClick={() => navigate(`/app/${portfolioType}/${portfolio.id}`)}
                      >
                        <div className="truncate">
                          <div className="font-medium text-sm truncate">
                            {portfolio.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {portfolio.status === 'active' ? 'Actif' : portfolio.status === 'inactive' ? 'Inactif' : portfolio.status === 'pending' ? 'En attente' : 'Archivé'}
                          </div>
                        </div>
                        <PortfolioActionsDropdown
                          portfolio={portfolio}
                          onAction={(action) => handlePortfolioMenu(portfolio, action)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <CreatePortfolioModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreatePortfolio}
        portfolioType={portfolioType || 'traditional'}
      />

      <ConfirmModal
        isOpen={confirm.open}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer le portefeuille "${confirm.portfolio?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={confirmAction}
        onCancel={() => setConfirm({ open: false })}
      />
    </>
  );
}
'@

$filePath = "C:\Users\DevSpace\Wanzo_pf\Wanzo_Portfolio_loan\src\components\layout\SidebarPortfolios.tsx"
Set-Content -Path $filePath -Value $content -Force
