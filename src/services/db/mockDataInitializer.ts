import { db, StoreName } from './indexedDB';
import { mockCompanies } from '../../data/mockCompanies';
import { mockOperations } from '../../data/mockOperations';
// import { mockPortfolios } from '../../data/mockPortfolios';
import { mockLeasingPortfolios } from '../../data/mockLeasingPortfolios';
import { mockInvestmentPortfolios } from '../../data/mockInvestmentPortfolios';
import { mockTraditionalPortfolios } from '../../data/mockTraditionalPortfolios';
import { portfolioDbService } from './indexedDB';


export async function initializeMockData() {
  try {
    // Vérifier la présence réelle de données dans IndexedDB
    const portfolios = await db.getAll('portfolios');
    if (portfolios && portfolios.length > 0) {
      localStorage.setItem('mockDataInitialized', 'true');
      return;
    }

    // Injecter les portefeuilles mockés dans la base principale (financeflow_db)
    for (const p of mockLeasingPortfolios) {
      // Ensure reports is an empty array for type compatibility
      await portfolioDbService.addOrUpdatePortfolio({ ...p, type: 'leasing', reports: [] });
    }
    for (const p of mockInvestmentPortfolios) {
      await portfolioDbService.addOrUpdatePortfolio({ ...p, type: 'investment' });
    }
    for (const p of mockTraditionalPortfolios) {
      await portfolioDbService.addOrUpdatePortfolio({ ...p, type: 'traditional' });
    }

    // Initialiser les données dans IndexedDB (hors portefeuilles, qui sont injectés via les seeds métiers)
    const stores: { name: StoreName; data: unknown[] }[] = [
      { name: 'companies', data: mockCompanies },
      { name: 'operations', data: mockOperations }
    ];

    for (const store of stores) {
      for (const item of store.data) {
        try {
          // Vérifier si l'élément existe déjà
          const existing = await db.get(store.name, (item as { id: string }).id);
          if (!existing) {
            // Cast explicite selon le store
            if (store.name === 'companies') {
              await db.add('companies', item as import('./indexedDB').Company);
            } else if (store.name === 'operations') {
              await db.add('operations', item as import('./indexedDB').Operation);
            } else {
              throw new Error(`Type de store inattendu: ${store.name}`);
            }
          }
        } catch {
          // Duplicate or error, skip
        }
      }
    }

    // Marquer comme initialisé uniquement si la base contient bien des portefeuilles
    const portfoliosAfter = await db.getAll('portfolios');
    if (portfoliosAfter && portfoliosAfter.length > 0) {
      localStorage.setItem('mockDataInitialized', 'true');
      console.log('Mock data initialized in IndexedDB');
    } else {
      localStorage.removeItem('mockDataInitialized');
      console.warn('Aucune donnée mock n’a pu être injectée dans IndexedDB.');
    }
  } catch (error) {
    console.error('Error initializing mock data:', error);
  }
}