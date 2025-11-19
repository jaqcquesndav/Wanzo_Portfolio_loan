import { useState, useEffect } from 'react';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Label } from '../../ui/Label';
import { Select } from '../../ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/Tabs';
import { ConfirmModal } from '../../ui/ConfirmModal';
import { AccountsPanel } from '../shared/AccountsPanel';
import { usePortfolioAccounts } from '../../../hooks/usePortfolioAccounts';
import { useToastStore } from '../../../stores/toastStore';
import { ExportPortfolioData } from '../shared/ExportPortfolioData';
import { ProductList } from './ProductList';
import { PortfolioDocumentsSection } from '../shared/PortfolioDocumentsSection';
import { BCCParametersPanel, BCCSurveillancePanel } from './bcc-components';
import { Save, X, Edit3, Plus } from 'lucide-react';
import type { Portfolio } from '../../../types/portfolio';
import type { FinancialProduct } from '../../../types/traditional-portfolio';
import { getPortfolioStatusLabel } from '../../../utils/portfolioStatus';

interface PortfolioSettingsDisplayProps {
  portfolio: Portfolio;
  onEdit: (updatedPortfolio: Partial<Portfolio>) => void;
  onDelete: () => void;
  onAddProduct?: () => void;
}

export function PortfolioSettingsDisplay({ portfolio, onEdit, onDelete, onAddProduct }: PortfolioSettingsDisplayProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isEditing, setIsEditing] = useState(false);
  const [editedPortfolio, setEditedPortfolio] = useState<Partial<Portfolio>>({});
  const addToast = useToastStore((state) => state.addToast);
  
  // Hook pour gérer les comptes du portefeuille
  const {
    bankAccounts,
    mobileMoneyAccounts,
    loading: accountsLoading,
    addBankAccount,
    updateBankAccount,
    deleteBankAccount,
    addMobileMoneyAccount,
    updateMobileMoneyAccount,
    deleteMobileMoneyAccount,
    loadBankAccounts,
    loadMobileMoneyAccounts,
  } = usePortfolioAccounts(portfolio.id);
  
  // Charger les comptes au montage du composant
  useEffect(() => {
    loadBankAccounts();
    loadMobileMoneyAccounts();
  }, [loadBankAccounts, loadMobileMoneyAccounts]);
  
  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedPortfolio({
      name: portfolio.name,
      risk_profile: portfolio.risk_profile,
      target_amount: portfolio.target_amount,
      target_return: portfolio.target_return,
      target_sectors: portfolio.target_sectors,
      status: portfolio.status
    });
  };

  const handleSaveEdit = () => {
    onEdit(editedPortfolio);
    setIsEditing(false);
    setEditedPortfolio({});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedPortfolio({});
  };

  const updateField = (field: keyof Portfolio, value: string | number | Date | string[]) => {
    setEditedPortfolio(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleExport = (format: string, dataType: string) => {
    console.log(`Exporting portfolio data in ${format} format, data type: ${dataType}`);
    // Implement actual export functionality here
  };
  
  const handleProductEdit = (product: FinancialProduct) => {
    console.log("éditer le produit:", product);
    // Implémenter la fonction d'édition de produit
  };
  
  const handleProductDelete = (productId: string) => {
    console.log("Supprimer le produit:", productId);
    // Implémenter la fonction de suppression de produit
  };
  
  const handleProductView = (product: FinancialProduct) => {
    console.log("Voir les dûtails du produit:", product);
    // Implémenter la fonction de visualisation dûtaillée du produit
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-end items-center mb-6">
        <div className="flex gap-3">
          <ExportPortfolioData portfolio={portfolio} onExport={handleExport} />
          {!isEditing ? (
            <Button variant="primary" onClick={handleStartEdit}>
              <Edit3 className="h-4 w-4 mr-2" />
              Modifier les paramètres
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="primary" onClick={handleSaveEdit}>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder
              </Button>
              <Button variant="secondary" onClick={handleCancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="general" currentValue={activeTab} onValueChange={setActiveTab}>Général</TabsTrigger>
          <TabsTrigger value="products" currentValue={activeTab} onValueChange={setActiveTab}>Produits</TabsTrigger>
          <TabsTrigger value="accounts" currentValue={activeTab} onValueChange={setActiveTab}>Comptes</TabsTrigger>
          <TabsTrigger value="bcc-parameters" currentValue={activeTab} onValueChange={setActiveTab}>Paramètres BCC</TabsTrigger>
          <TabsTrigger value="bcc-surveillance" currentValue={activeTab} onValueChange={setActiveTab}>Surveillance BCC</TabsTrigger>
        </TabsList>

        <TabsContent value="general" currentValue={activeTab}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Informations générales</h3>
              <div className="flex flex-col gap-4 text-base text-gray-800 dark:text-gray-100">
                
                {/* Nom du portefeuille */}
                <div className="space-y-2">
                  <Label htmlFor="portfolio-name">Nom du portefeuille</Label>
                  {isEditing ? (
                    <Input
                      id="portfolio-name"
                      value={editedPortfolio.name || portfolio.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Nom du portefeuille"
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded border">
                      {portfolio.name}
                    </div>
                  )}
                </div>

                {/* Statut */}
                <div className="space-y-2">
                  <Label htmlFor="portfolio-status">Statut</Label>
                  {isEditing ? (
                    <Select 
                      id="portfolio-status"
                      value={editedPortfolio.status || portfolio.status} 
                      onChange={(e) => updateField('status', e.target.value)}
                    >
                      <option value="active">Actif</option>
                      <option value="inactive">Inactif</option>
                      <option value="pending">En attente</option>
                      <option value="archived">Archivé</option>
                    </Select>
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded border">
                      {getPortfolioStatusLabel(portfolio.status)}
                    </div>
                  )}
                </div>

                {/* Profil de risque */}
                <div className="space-y-2">
                  <Label htmlFor="portfolio-risk">Profil de risque</Label>
                  {isEditing ? (
                    <Select 
                      id="portfolio-risk"
                      value={editedPortfolio.risk_profile || portfolio.risk_profile} 
                      onChange={(e) => updateField('risk_profile', e.target.value)}
                    >
                      <option value="conservative">Conservateur</option>
                      <option value="moderate">Modéré</option>
                      <option value="aggressive">Agressif</option>
                    </Select>
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded border">
                      {portfolio.risk_profile}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 flex flex-col gap-4">
              <h3 className="text-lg font-semibold">Objectifs</h3>
              <div className="flex flex-col gap-4 text-base text-gray-800 dark:text-gray-100">
                
                {/* Objectif de collecte */}
                <div className="space-y-2">
                  <Label htmlFor="target-amount">Objectif de collecte (FCFA)</Label>
                  {isEditing ? (
                    <Input
                      id="target-amount"
                      type="number"
                      value={editedPortfolio.target_amount || portfolio.target_amount || ''}
                      onChange={(e) => updateField('target_amount', Number(e.target.value))}
                      placeholder="Montant cible"
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded border">
                      {portfolio.target_amount?.toLocaleString()} FCFA
                    </div>
                  )}
                </div>

                {/* Objectif de rendement */}
                <div className="space-y-2">
                  <Label htmlFor="target-return">Objectif de rendement (%)</Label>
                  {isEditing ? (
                    <Input
                      id="target-return"
                      type="number"
                      step="0.1"
                      value={editedPortfolio.target_return || portfolio.target_return || ''}
                      onChange={(e) => updateField('target_return', Number(e.target.value))}
                      placeholder="Rendement cible"
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded border">
                      {portfolio.target_return}%
                    </div>
                  )}
                </div>

                {/* Secteurs visés */}
                <div className="space-y-2">
                  <Label htmlFor="target-sectors">Secteurs visés</Label>
                  {isEditing ? (
                    <Input
                      id="target-sectors"
                      value={editedPortfolio.target_sectors?.join(', ') || portfolio.target_sectors?.join(', ') || ''}
                      onChange={(e) => updateField('target_sectors', e.target.value.split(', ').filter(s => s.trim()))}
                      placeholder="Agriculture, Industrie, Services..."
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded border">
                      {portfolio.target_sectors?.length ? portfolio.target_sectors.join(', ') : 
                       <span className="italic text-gray-400">Aucun secteur défini</span>}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Section des documents */}
            <div className="col-span-1 md:col-span-2 mt-4">
              <PortfolioDocumentsSection portfolioId={portfolio.id} />
            </div>
          </div>
          
          {/* Card suppression */}
          <div className="rounded-lg bg-white dark:bg-gray-800 border border-red-200 dark:border-red-700 p-6 mt-6 flex flex-col gap-2">
            <h3 className="text-lg font-bold text-red-700 dark:text-red-300 mb-2">Supprimer ce portefeuille</h3>
            <p className="text-red-700 dark:text-red-300">Cette action supprimera dûfinitivement ce portefeuille et toutes ses données. Cette opération est irRéversible.</p>
            <div className="flex justify-end">
              <Button variant="danger" onClick={() => setShowConfirm(true)}>
                Supprimer dûfinitivement
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="products" currentValue={activeTab}>
          <div className="rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Produits financiers</h3>
              <Button 
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    // Gérer l'ajout de produit en mode édition
                    if (onAddProduct) {
                      onAddProduct();
                    } else {
                      console.log("Ajouter un nouveau produit financier");
                    }
                  } else {
                    handleStartEdit();
                  }
                }}
                disabled={!isEditing && !onAddProduct}
              >
                Ajouter un produit
                <Plus className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            {portfolio.products && portfolio.products.length > 0 ? (
              <ProductList 
                products={portfolio.products} 
                onEdit={handleProductEdit}
                onDelete={handleProductDelete}
                onView={handleProductView}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Aucun produit financier n'a encore été créé dans ce portefeuille.</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
                      if (onAddProduct) {
                        onAddProduct();
                      } else {
                        console.log("Créer un nouveau produit financier");
                      }
                    } else {
                      handleStartEdit();
                    }
                  }}
                  className="mt-4"
                  disabled={!isEditing && !onAddProduct}
                >
                  Créer un produit
                  <Plus className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="accounts" currentValue={activeTab}>
          <AccountsPanel
            bankAccounts={bankAccounts}
            mobileMoneyAccounts={mobileMoneyAccounts}
            onAddBank={async (account) => {
              if (!isEditing) {
                handleStartEdit();
                return;
              }
              try {
                await addBankAccount(account);
                addToast('success', 'Compte bancaire ajouté avec succès');
              } catch (error) {
                addToast('error', 'Erreur lors de l\'ajout du compte bancaire');
                console.error('Error adding bank account:', error);
              }
            }}
            onEditBank={async (account) => {
              if (!isEditing) {
                handleStartEdit();
                return;
              }
              try {
                await updateBankAccount(account.id, account);
                addToast('success', 'Compte bancaire modifié avec succès');
              } catch (error) {
                addToast('error', 'Erreur lors de la modification du compte bancaire');
                console.error('Error updating bank account:', error);
              }
            }}
            onDeleteBank={async (accountId) => {
              if (!isEditing) {
                handleStartEdit();
                return;
              }
              try {
                await deleteBankAccount(accountId);
                addToast('success', 'Compte bancaire supprimé avec succès');
              } catch (error) {
                addToast('error', 'Erreur lors de la suppression du compte bancaire');
                console.error('Error deleting bank account:', error);
              }
            }}
            onAddMobileMoney={async (account) => {
              if (!isEditing) {
                handleStartEdit();
                return;
              }
              try {
                await addMobileMoneyAccount(account);
                addToast('success', 'Compte Mobile Money ajouté avec succès');
              } catch (error) {
                addToast('error', 'Erreur lors de l\'ajout du compte Mobile Money');
                console.error('Error adding mobile money account:', error);
              }
            }}
            onEditMobileMoney={async (account) => {
              if (!isEditing) {
                handleStartEdit();
                return;
              }
              try {
                await updateMobileMoneyAccount(account.id, account);
                addToast('success', 'Compte Mobile Money modifié avec succès');
              } catch (error) {
                addToast('error', 'Erreur lors de la modification du compte Mobile Money');
                console.error('Error updating mobile money account:', error);
              }
            }}
            onDeleteMobileMoney={async (accountId) => {
              if (!isEditing) {
                handleStartEdit();
                return;
              }
              try {
                await deleteMobileMoneyAccount(accountId);
                addToast('success', 'Compte Mobile Money supprimé avec succès');
              } catch (error) {
                addToast('error', 'Erreur lors de la suppression du compte Mobile Money');
                console.error('Error deleting mobile money account:', error);
              }
            }}
            readOnly={!isEditing || accountsLoading}
          />
        </TabsContent>

        <TabsContent value="bcc-parameters" currentValue={activeTab}>
          <BCCParametersPanel />
        </TabsContent>

        <TabsContent value="bcc-surveillance" currentValue={activeTab}>
          <BCCSurveillancePanel />
        </TabsContent>
      </Tabs>
      <ConfirmModal
        open={showConfirm}
        title="Supprimer dûfinitivement le portefeuille ?"
        message={`Êtes-vous sûr de vouloir supprimer dûfinitivement le portefeuille "${portfolio.name}" ? Cette action est irRéversible.`}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        onConfirm={() => { setShowConfirm(false); onDelete(); }}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}

