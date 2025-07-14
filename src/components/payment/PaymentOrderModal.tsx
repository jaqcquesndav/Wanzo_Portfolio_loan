import React, { useState, useEffect } from 'react';
import { X, Download, QrCode } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Table, TableBody, TableRow, TableCell } from '../ui/Table';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { convertNumberToWords } from '../../utils/formatters';

export interface PaymentOrderData {
  id?: string;
  orderNumber: string;
  portfolioManager: {
    name: string;
    accountNumber: string;
    portfolioType: string;
    bankName: string;
  };
  beneficiary: {
    companyName: string;
    bank: string;
    branch?: string;
    accountNumber: string;
    swiftCode?: string;
  };
  amount: number;
  reference: string;
  paymentReason: string;
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
}

interface PaymentOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PaymentOrderData) => void;
  onExport: (data: PaymentOrderData) => void;
  onDelete?: (id: string) => void;
  initialData?: PaymentOrderData;
  readOnly?: boolean;
}

export const PaymentOrderModal: React.FC<PaymentOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onExport,
  onDelete,
  initialData,
  readOnly = false,
}) => {
  const [data, setData] = useState<PaymentOrderData>({
    orderNumber: generateOrderNumber(),
    portfolioManager: {
      name: '',
      accountNumber: '',
      portfolioType: '',
      bankName: '',
    },
    beneficiary: {
      companyName: '',
      bank: '',
      branch: '',
      accountNumber: '',
      swiftCode: '',
    },
    amount: 0,
    reference: '',
    paymentReason: '',
    createdAt: new Date(),
    status: 'pending',
  });

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    } else {
      setData(prevData => ({
        ...prevData,
        orderNumber: generateOrderNumber(),
      }));
    }
  }, [initialData]);

  function generateOrderNumber() {
    return `PA${Math.floor(10000000 + Math.random() * 90000000)}`;
  }

  const handleExportPDF = () => {
    // Exporte directement les données
    onExport(data);
  };

  const handleDelete = () => {
    if (onDelete && data.id) {
      onDelete(data.id);
      onClose();
    }
  };

  const handleSave = () => {
    onSave(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {readOnly ? 'Visualisation Ordre de Paiement' : 'Nouvel Ordre de Paiement'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {/* Document d'ordre de paiement */}
          <div className="border border-gray-300 rounded-lg p-8 bg-white shadow-sm">
            {/* En-tête */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  W
                </div>
                <div className="ml-3">
                  <h3 className="font-bold text-lg text-blue-900">WANZO FINANCE</h3>
                  <p className="text-sm text-gray-600">Solutions Financières Innovantes</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="font-bold text-xl text-blue-900">ORDRE DE PAIEMENT</h2>
                <p className="text-sm font-medium text-gray-700">N° {data.orderNumber}</p>
              </div>
            </div>

            {/* Information du gestionnaire de portefeuille */}
            <div className="mb-6 border-b pb-4">
              <h4 className="font-semibold text-gray-800 mb-2">Informations du gestionnaire</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nom du gestionnaire</p>
                  <p className="font-medium">{data.portfolioManager.name || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Type de portefeuille</p>
                  <p className="font-medium">{data.portfolioManager.portfolioType || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Numéro de compte</p>
                  <p className="font-medium">{data.portfolioManager.accountNumber || 'Non spécifié'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Banque</p>
                  <p className="font-medium">{data.portfolioManager.bankName || 'Non spécifié'}</p>
                </div>
              </div>
            </div>

            {/* Instruction de paiement */}
            <div className="mb-6">
              <p className="italic text-gray-700 mb-4">
                Veuillez effectuer le paiement suivant par le débit de mon compte ci-dessus:
              </p>

              {/* Tableau des détails du bénéficiaire */}
              <div className="mb-4">
                <Table className="border-collapse">
                  <TableBody>
                    <TableRow>
                      <TableCell className="border-0 px-0 py-2">
                        <span className="font-semibold">Raison sociale du bénéficiaire:</span>
                      </TableCell>
                      <TableCell className="border-0 px-4 py-2">
                        {readOnly ? (
                          data.beneficiary.companyName
                        ) : (
                          <Input
                            value={data.beneficiary.companyName}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData({
                              ...data,
                              beneficiary: {
                                ...data.beneficiary,
                                companyName: e.target.value
                              }
                            })}
                            className="w-full"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-0 px-0 py-2">
                        <span className="font-semibold">Banque du bénéficiaire:</span>
                      </TableCell>
                      <TableCell className="border-0 px-4 py-2">
                        {readOnly ? (
                          data.beneficiary.bank
                        ) : (
                          <Input
                            value={data.beneficiary.bank}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData({
                              ...data,
                              beneficiary: {
                                ...data.beneficiary,
                                bank: e.target.value
                              }
                            })}
                            className="w-full"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-0 px-0 py-2">
                        <span className="font-semibold">Agence:</span>
                      </TableCell>
                      <TableCell className="border-0 px-4 py-2">
                        {readOnly ? (
                          data.beneficiary.branch || "N/A"
                        ) : (
                          <Input
                            value={data.beneficiary.branch || ""}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setData({
                              ...data,
                              beneficiary: {
                                ...data.beneficiary,
                                branch: e.target.value
                              }
                            })}
                            className="w-full"
                            placeholder="Facultatif"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-0 px-0 py-2">
                        <span className="font-semibold">N° de compte du bénéficiaire:</span>
                      </TableCell>
                      <TableCell className="border-0 px-4 py-2">
                        {readOnly ? (
                          data.beneficiary.accountNumber
                        ) : (
                          <Input
                            value={data.beneficiary.accountNumber}
                            onChange={(e) => setData({
                              ...data,
                              beneficiary: {
                                ...data.beneficiary,
                                accountNumber: e.target.value
                              }
                            })}
                            className="w-full"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-0 px-0 py-2">
                        <span className="font-semibold">Code SWIFT/BIC:</span>
                      </TableCell>
                      <TableCell className="border-0 px-4 py-2">
                        {readOnly ? (
                          data.beneficiary.swiftCode || "N/A"
                        ) : (
                          <Input
                            value={data.beneficiary.swiftCode || ""}
                            onChange={(e) => setData({
                              ...data,
                              beneficiary: {
                                ...data.beneficiary,
                                swiftCode: e.target.value
                              }
                            })}
                            className="w-full"
                            placeholder="Facultatif"
                          />
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-0 px-0 py-2">
                        <span className="font-semibold">Montant à payer:</span>
                      </TableCell>
                      <TableCell className="border-0 px-4 py-2">
                        {readOnly ? (
                          <>
                            <p>{data.amount.toLocaleString()} FCFA</p>
                            <p className="text-sm italic">{convertNumberToWords(data.amount)} Francs CFA</p>
                          </>
                        ) : (
                          <>
                            <Input
                              type="number"
                              value={data.amount}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                setData({
                                  ...data,
                                  amount: isNaN(value) ? 0 : value
                                });
                              }}
                              className="w-full mb-1"
                            />
                            <p className="text-sm italic">{convertNumberToWords(data.amount)} Francs CFA</p>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-0 px-0 py-2">
                        <span className="font-semibold">Motif du paiement:</span>
                      </TableCell>
                      <TableCell className="border-0 px-4 py-2">
                        {readOnly ? (
                          data.paymentReason
                        ) : (
                          <Textarea
                            value={data.paymentReason}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData({
                              ...data,
                              paymentReason: e.target.value
                            })}
                            className="w-full"
                            rows={2}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="border-0 px-0 py-2">
                        <span className="font-semibold">Référence:</span>
                      </TableCell>
                      <TableCell className="border-0 px-4 py-2">
                        {data.reference}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Avertissement */}
              <div className="bg-gray-100 p-3 text-sm text-gray-700 rounded mb-6">
                <p className="italic">
                  L'Institution financière se réserve le droit de ne pas exécuter les ordres portant des ratures, surcharges ou en absence de moyen d'authentification.
                </p>
              </div>

              {/* Bas de page - Signature et QR Code */}
              <div className="flex justify-between items-end mt-8 pt-4 border-t">
                <div>
                  <p className="text-sm">
                    {new Date().toLocaleDateString('fr-FR', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric'
                    })} à {new Date().toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  <div className="h-20 w-40 border-b border-dashed border-gray-400 mt-2">
                    <p className="text-xs text-gray-500">Signature autorisée</p>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="border border-gray-300 p-2 rounded">
                    <QrCode className="h-20 w-20 text-blue-900" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Authentification numérique Wanzo</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            {!readOnly && (
              <Button 
                variant="outline" 
                className="mr-2" 
                onClick={onClose}
              >
                Annuler
              </Button>
            )}
            {data.id && onDelete && data.status === 'pending' && (
              <Button 
                variant="outline" 
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleDelete}
              >
                Supprimer
              </Button>
            )}
          </div>
          <div>
            <Button 
              variant="outline" 
              className="mr-2"
              onClick={handleExportPDF}
            >
              <Download className="w-4 h-4 mr-1" /> Exporter PDF
            </Button>
            {!readOnly && (
              <Button 
                onClick={handleSave}
              >
                Enregistrer
              </Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
};
