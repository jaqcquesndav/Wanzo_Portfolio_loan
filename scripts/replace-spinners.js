const fs = require('fs');
const path = require('path');

// Liste des fichiers à traiter avec leurs spinners
const filesToUpdate = [
  'src/pages/Prospection.tsx',
  'src/pages/TraditionalPortfolioDetails.tsx',
  'src/pages/CreditRequestDetails.tsx',
  'src/pages/AllFundingOffers.tsx',
  'src/components/portfolio/traditional/RepaymentsTable.tsx',
  'src/components/portfolio/shared/PortfolioDocumentsSection.tsx',
  'src/components/portfolio/traditional/DisbursementsTable.tsx',
  'src/components/portfolio/traditional/contract/ContractDocumentsManager.tsx',
  'src/components/portfolio/traditional/contract/EditableAmortizationSchedule.tsx',
  'src/components/funding/FundingOffersList.tsx'
];

// Patrons de spinners à remplacer
const spinnerPatterns = [
  {
    old: '<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>',
    new: '<MultiSegmentSpinner size="medium" />'
  },
  {
    old: '<div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full mx-auto"></div>',
    new: '<MultiSegmentSpinner size="medium" />'
  },
  {
    old: '<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" aria-label="Chargement..." />',
    new: '<MultiSegmentSpinner size="medium" />'
  },
  {
    old: '<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>',
    new: '<MultiSegmentSpinner size="medium" />'
  },
  {
    old: '<div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>',
    new: '<MultiSegmentSpinner size="small" />'
  },
  {
    old: '<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>',
    new: '<MultiSegmentSpinner size="large" />'
  }
];

console.log('Script de remplacement des spinners créé avec succès!');
console.log('Ce script liste les fichiers à traiter et les patrons de remplacement.');
console.log('\nFichiers à traiter:', filesToUpdate.length);
console.log('Patrons de spinners:', spinnerPatterns.length);
