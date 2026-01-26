import { useState } from 'react';
import { ConfirmModal } from '../ui/ConfirmModal';
import { useNavigate, useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ChevronDown, ChevronRight, Folder, Plus, Loader2 } from 'lucide-react';
import { PortfolioActionsDropdown } from '../portfolio/PortfolioActionsDropdown';
import { CreatePortfolioModal } from '../portfolio/CreatePortfolioModal';
// Utilisation des hooks React Query professionnels
import { 
  useTraditionalPortfoliosQuery, 
  useCreatePortfolioMutation,
  useDeletePortfolioMutation 
} from '../../hooks/queries';
import { usePortfolioContext } from '../../contexts/usePortfolioContext';
import { useAppContextStore } from '../../stores/appContextStore';
import type { TraditionalPortfolio } from '../../types/traditional-portfolio';
import type { DefaultPortfolioFormData } from '../portfolio/DefaultPortfolioForm';

type CreatePortfolioFormData = DefaultPortfolioFormData;

export function SidebarPortfolios() {
  const navigate = useNavigate();
  const { portfolioType } = useParams();
  const { currentPortfolioId } = usePortfolioContext();
  const { institutionId, user } = useAppContextStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // ✅ Utilisation de React Query - cache intelligent et pas de requêtes en boucle
  const { 
    data: traditionalData, 
    isLoading: isLoadingTraditional,
    error: traditionalError 
  } = useTraditionalPortfoliosQuery();
  
  // Mutations avec invalidation automatique du cache
  const createPortfolioMutation = useCreatePortfolioMutation();
  const deletePortfolioMutation = useDeletePortfolioMutation();

  // Sélection du bon tableau selon le type
  let portfolios: TraditionalPortfolio[] = [];
  if (portfolioType === 'traditional') {
    portfolios = traditionalData?.data || [];
  }

  const filteredPortfolios = portfolioType
    ? portfolios.filter((p) => p.type === portfolioType)
    : [];

  // Drag & drop désactivé (pas de persistance d'ordre pour l'instant)
  const onDragEnd = () => {
    // Rien pour l'instant
  };

  const handleAddPortfolio = () => {
    setShowCreateModal(true);
  };

  const handleCreatePortfolio = async (data: CreatePortfolioFormData) => {
    if (!portfolioType) {
      return;
    }
    if (portfolioType === 'traditional') {
      try {
        const toCreate = {
          ...data,
          manager_id: user?.id || 'default-manager',
          institution_id: institutionId || 'default-institution',
        };
        // ✅ Utilisation de la mutation React Query
        const newPortfolio = await createPortfolioMutation.mutateAsync(toCreate);
        setShowCreateModal(false);
        // Naviguer vers le nouveau portfolio créé
        navigate(`/app/${portfolioType}/${newPortfolio.id}`);
      } catch (error) {
        console.error('Erreur lors de la création du portefeuille:', error);
      }
    }
  };

  const [confirm, setConfirm] = useState<{ open: boolean; portfolio?: TraditionalPortfolio; action?: string }>({ open: false });

  const handlePortfolioMenu = (portfolio: TraditionalPortfolio, action: string) => {
    if (action === 'delete') {
      setConfirm({ open: true, portfolio, action });
      return;
    }

    if (action === 'view') {
      if (portfolioType === 'traditional') {
        navigate(`/app/${portfolioType}/${portfolio.id}`);
      }
    } else if (action === 'edit') {
      // Navigation vers la route d'édition du portefeuille - utilise traditional/:id
      navigate(`/app/${portfolioType}/${portfolio.id}`);
    }
  };

  const confirmAction = async () => {
    if (confirm.action === 'delete' && confirm.portfolio) {
      // ✅ Utilisation de la mutation React Query avec invalidation automatique
      if (portfolioType === 'traditional') {
        await deletePortfolioMutation.mutateAsync(confirm.portfolio.id);
      }
    }
    setConfirm({ open: false });
  };

  // Gestion du chargement
  if (isLoadingTraditional && portfolioType === 'traditional') {
    return (
      <div className="my-4 flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-primary-light" />
        <span className="ml-2 text-sm text-primary-light">Chargement...</span>
      </div>
    );
  }

  // Gestion des erreurs
  if (traditionalError && portfolioType === 'traditional') {
    return (
      <div className="my-4 p-3 bg-red-500/10 rounded-md">
        <p className="text-sm text-red-400">Erreur de chargement</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative my-4 group">
        {/* Section Header with Expand/Collapse */}
        <div className="flex justify-between items-center mb-2 group-hover:opacity-100 opacity-90 transition-opacity">
          <div 
            className="flex items-center text-primary-light cursor-pointer hover:text-white transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-2" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2" />
            )}
            <div className="font-semibold text-sm uppercase tracking-wider sidebar-label mb-2 text-primary-light dark:text-gray-400">Portefeuilles</div>
          </div>
          <button
            onClick={handleAddPortfolio}
            className="w-5 h-5 flex items-center justify-center rounded-sm text-primary-light dark:text-gray-400 hover:text-white hover:bg-primary-dark dark:hover:bg-gray-700 transition-colors"
            aria-label="Ajouter un portefeuille"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Portfolios List - with max height and scrolling */}
        {isExpanded && (
          <div className="overflow-hidden transition-all duration-300 ease-in-out">
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="portfolios">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-1 max-h-[calc(5*2.5rem)] overflow-y-auto pr-1 transition-all"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(255,255,255,0.1) transparent'
                    }}
                  >
                    {filteredPortfolios.map((portfolio, index) => (
                      <Draggable key={portfolio.id} draggableId={portfolio.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`flex justify-between items-center py-2.5 px-4 rounded-md text-primary-light dark:text-gray-300 hover:bg-primary-dark dark:hover:bg-gray-700 hover:text-white cursor-pointer transition-colors duration-150 ${
                              currentPortfolioId === portfolio.id ? 'bg-primary-dark dark:bg-gray-700 text-white shadow-sm' : 'bg-transparent'
                            }`}
                            onClick={() => navigate(`/app/${portfolioType}/${portfolio.id}`)}
                          >
                            <div className="truncate flex items-center">
                              <Folder className="w-4 h-4 mr-2 flex-shrink-0" />
                              <div className="text-base font-medium truncate">
                                {portfolio.name}
                              </div>
                            </div>
                            <div className="opacity-70 hover:opacity-100 sidebar-actions">
                              <PortfolioActionsDropdown
                                actions={[
                                  { key: 'view', label: 'Voir' },
                                  { key: 'edit', label: 'Modifier' },
                                  { key: 'delete', label: 'Supprimer' }
                                ]}
                                onAction={(action) => handlePortfolioMenu(portfolio, action)}
                                buttonClassName="text-inherit w-5 h-5"
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            
            {filteredPortfolios.length === 0 && (
              <div className="text-center py-2 text-primary-light text-base italic opacity-70">
                Aucun portefeuille
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreatePortfolioModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePortfolio}
        />
      )}

      <ConfirmModal
        open={confirm.open}
        title="Confirmer la suppression"
        message={`Êtes-vous sûr de vouloir supprimer le portefeuille "${confirm.portfolio?.name}" ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={confirmAction}
        onCancel={() => setConfirm({ open: false })}
      />
    </>
  );
}
