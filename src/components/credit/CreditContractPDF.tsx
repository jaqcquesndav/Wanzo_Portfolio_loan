import { forwardRef, useImperativeHandle, useRef } from 'react';
import { CreditContract } from '../../types/credit';
import { formatAmount, formatDate, formatStatus } from '../../utils/credit';
import { QRCodeSVG } from 'qrcode.react';

// Interface pour les données additionnelles
interface CreditContractExportAddData {
  institutionName: string;
  institutionLogo?: string;
  institutionAddress?: string;
  institutionContact?: string;
  portfolioName: string;
  portfolioManager?: string;
  scheduleData?: {
    number: number;
    dueDate: string;
    principal: number;
    interest: number;
    total: number;
    status: string;
  }[];
}

export interface CreditContractPDFProps {
  contract: CreditContract;
  additionalData: CreditContractExportAddData;
}

export interface CreditContractPDFRef {
  downloadPDF: () => Promise<boolean>;
}

const CreditContractPDF = forwardRef<CreditContractPDFRef, CreditContractPDFProps>(
  ({ contract, additionalData }, ref) => {
    const contractRef = useRef<HTMLDivElement>(null);

    // Exposer la méthode downloadPDF via la référence
    useImperativeHandle(ref, () => ({
      async downloadPDF() {
        try {
          if (!contractRef.current) return false;

          // Importation dynamique des bibliothèques nécessaires
          const html2canvas = (await import('html2canvas')).default;
          const { jsPDF } = await import('jspdf');

          // Créer une capture du contrat
          const canvas = await html2canvas(contractRef.current, {
            scale: 2, // Échelle 2x pour une meilleure qualité
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: '#ffffff'
          });

          // Créer un nouveau document PDF au format A4
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });

          // Obtenir les dimensions de la page
          const imgData = canvas.toDataURL('image/png');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          // Calculer les dimensions de l'image pour conserver le ratio
          const canvasRatio = canvas.height / canvas.width;
          const imgWidth = pdfWidth;
          const imgHeight = pdfWidth * canvasRatio;
          
          // Si l'image est plus grande que la page, créer plusieurs pages
          let heightLeft = imgHeight;
          let position = 0;
          let page = 1;
          
          // Ajouter l'image à la première page
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;
          
          // Ajouter des pages supplémentaires si nécessaire
          while (heightLeft > 0) {
            position = -pdfHeight * page;
            page++;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
          }
          
          // Ajouter le pied de page sur chaque page
          const pageCount = pdf.getNumberOfPages();
          for (let i = 1; i <= pageCount; i++) {
            pdf.setPage(i);
            
            // Texte du pied de page
            const footer = `Contrat ${contract.reference} - ${additionalData.institutionName} - Généré le ${formatDate(new Date().toISOString())}`;
            const pageInfo = `Page ${i} sur ${pageCount}`;
            
            // Style du pied de page
            pdf.setFontSize(8);
            pdf.setTextColor(100, 100, 100);
            
            // Position du pied de page
            const footerY = pdfHeight - 5;
            pdf.text(footer, pdfWidth / 2, footerY, { align: 'center' });
            pdf.text(pageInfo, pdfWidth - 10, footerY, { align: 'right' });
          }
          
          // Sauvegarder le PDF
          pdf.save(`Contrat_${contract.reference}.pdf`);
          return true;
        } catch (error) {
          console.error('Erreur lors de la génération du PDF:', error);
          return false;
        }
      }
    }));

    // Données du QR code
    const qrCodeData = JSON.stringify({
      institution: additionalData.institutionName,
      portfolio: additionalData.portfolioName,
      reference: contract.reference,
      amount: contract.amount,
      status: contract.status
    });

    // Variables pour le style (couleurs Tailwind converties en RGB)
    const primaryColor = '#197ca8'; // bleu principal
    const primaryDarkColor = '#156088'; // bleu foncé
    const primaryLightColor = '#e6f3f8'; // bleu clair

    return (
      <div 
        ref={contractRef} 
        className="credit-contract-pdf" 
        style={{ 
          width: '210mm',  // largeur A4
          minHeight: '297mm', // hauteur minimale A4
          padding: '15mm',
          backgroundColor: 'white',
          fontFamily: 'Arial, sans-serif',
          color: '#333',
          boxSizing: 'border-box',
          position: 'relative'
        }}
      >
        {/* En-tête avec logo et informations de l'institution */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ width: '150px', height: '60px', backgroundColor: '#f2f2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {additionalData.institutionLogo ? (
              <img src={additionalData.institutionLogo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%' }} />
            ) : (
              <div style={{ textAlign: 'center', color: '#aaa', fontSize: '12px' }}>LOGO</div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ color: primaryDarkColor, margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold' }}>
              {additionalData.institutionName}
            </h2>
            {additionalData.institutionAddress && (
              <p style={{ margin: '0 0 3px 0', fontSize: '12px' }}>{additionalData.institutionAddress}</p>
            )}
            {additionalData.institutionContact && (
              <p style={{ margin: '0', fontSize: '12px' }}>{additionalData.institutionContact}</p>
            )}
          </div>
        </div>

        {/* Ligne de séparation */}
        <div style={{ height: '2px', backgroundColor: primaryColor, marginBottom: '20px' }}></div>

        {/* Titre du document */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ color: primaryColor, fontSize: '22px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
            CONTRAT DE CRÉDIT
          </h1>
          <h3 style={{ fontSize: '16px', margin: '0' }}>
            Référence: {contract.reference}
          </h3>
        </div>

        {/* QR Code placé dans le footer */}
        <div style={{ position: 'absolute', bottom: '15mm', right: '15mm', textAlign: 'center' }}>
          <QRCodeSVG
            value={qrCodeData}
            size={100}
            bgColor="#ffffff"
            fgColor={primaryColor}
            level="H"
            includeMargin={false}
          />
          <p style={{ fontSize: '10px', color: '#777', marginTop: '5px' }}>
            Code de vérification
          </p>
        </div>

        {/* Informations du portefeuille */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ 
            color: primaryDarkColor, 
            fontSize: '14px', 
            borderBottom: `1px solid ${primaryDarkColor}`, 
            paddingBottom: '5px',
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            Informations du Portefeuille
          </h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '5px 10px 5px 0', fontWeight: 'bold', width: '180px' }}>Nom du Portefeuille:</td>
                <td style={{ padding: '5px 0' }}>{additionalData.portfolioName}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 10px 5px 0', fontWeight: 'bold' }}>Gestionnaire:</td>
                <td style={{ padding: '5px 0' }}>{additionalData.portfolioManager || 'Non spécifié'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Informations du contrat */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ 
            color: primaryDarkColor, 
            fontSize: '14px', 
            borderBottom: `1px solid ${primaryDarkColor}`, 
            paddingBottom: '5px',
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            Informations du Contrat
          </h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '5px 10px 5px 0', fontWeight: 'bold', width: '180px', borderBottom: '1px solid #eee' }}>
                  Client:
                </td>
                <td style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>{contract.memberName}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 10px 5px 0', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                  ID Client:
                </td>
                <td style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>{contract.memberId}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 10px 5px 0', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                  Produit:
                </td>
                <td style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>{contract.productName}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 10px 5px 0', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                  Montant:
                </td>
                <td style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                  {formatAmount(contract.amount, { spaceBetweenAmountAndCurrency: true, currency: 'XOF' })}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '5px 10px 5px 0', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                  Montant décaissé:
                </td>
                <td style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                  {formatAmount(contract.disbursedAmount, { spaceBetweenAmountAndCurrency: true, currency: 'XOF' })}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '5px 10px 5px 0', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                  Montant restant:
                </td>
                <td style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                  {formatAmount(contract.remainingAmount, { spaceBetweenAmountAndCurrency: true, currency: 'XOF' })}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '5px 10px 5px 0', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                  Taux d'intérêt:
                </td>
                <td style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>{contract.interestRate}%</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 10px 5px 0', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                  Date de début:
                </td>
                <td style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>{formatDate(contract.startDate)}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 10px 5px 0', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                  Date de fin:
                </td>
                <td style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>{formatDate(contract.endDate)}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 10px 5px 0', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                  Dernier paiement:
                </td>
                <td style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                  {contract.lastPaymentDate ? formatDate(contract.lastPaymentDate) : 'N/A'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '5px 10px 5px 0', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                  Prochain paiement:
                </td>
                <td style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                  {contract.nextPaymentDate ? formatDate(contract.nextPaymentDate) : 'N/A'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '5px 10px 5px 0', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                  Statut:
                </td>
                <td style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>{formatStatus(contract.status)}</td>
              </tr>
              <tr>
                <td style={{ padding: '5px 10px 5px 0', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                  Durée:
                </td>
                <td style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                  {contract.duration ? `${contract.duration} mois` : 'Non spécifié'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '5px 10px 5px 0', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                  Période de grâce:
                </td>
                <td style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                  {contract.gracePeriod ? `${contract.gracePeriod} mois` : 'Aucune'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '5px 10px 5px 0', fontWeight: 'bold', borderBottom: '1px solid #eee' }}>
                  Méthode d'amortissement:
                </td>
                <td style={{ padding: '5px 0', borderBottom: '1px solid #eee' }}>
                  {contract.amortization_method
                    ? contract.amortization_method.charAt(0).toUpperCase() + contract.amortization_method.slice(1)
                    : 'Non spécifiée'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Échéancier de remboursement */}
        {additionalData.scheduleData && additionalData.scheduleData.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ 
              color: primaryDarkColor, 
              fontSize: '14px', 
              borderBottom: `1px solid ${primaryDarkColor}`, 
              paddingBottom: '5px',
              marginBottom: '10px',
              fontWeight: 'bold'
            }}>
              Échéancier de Remboursement
            </h3>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ backgroundColor: primaryColor, color: 'white' }}>
                  <th style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #ddd' }}>N°</th>
                  <th style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #ddd' }}>Date d'échéance</th>
                  <th style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', border: '1px solid #ddd' }}>Principal</th>
                  <th style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', border: '1px solid #ddd' }}>Intérêts</th>
                  <th style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', border: '1px solid #ddd' }}>Total</th>
                  <th style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold', border: '1px solid #ddd' }}>Statut</th>
                </tr>
              </thead>
              <tbody>
                {additionalData.scheduleData.map((item, index) => (
                  <tr key={index} style={{ backgroundColor: index % 2 === 0 ? 'white' : primaryLightColor }}>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>{item.number}</td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>{formatDate(item.dueDate)}</td>
                    <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>
                      {formatAmount(item.principal, { spaceBetweenAmountAndCurrency: true, currency: 'XOF' })}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>
                      {formatAmount(item.interest, { spaceBetweenAmountAndCurrency: true, currency: 'XOF' })}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'right', border: '1px solid #ddd' }}>
                      {formatAmount(item.total, { spaceBetweenAmountAndCurrency: true, currency: 'XOF', showDecimals: false })}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center', border: '1px solid #ddd' }}>{formatStatus(item.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Filigrane */}
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%) rotate(45deg)',
          fontSize: '80px',
          fontWeight: 'bold',
          color: 'rgba(240, 240, 240, 0.8)',
          zIndex: -1,
          pointerEvents: 'none'
        }}>
          WANZO
        </div>
      </div>
    );
  }
);

export default CreditContractPDF;
