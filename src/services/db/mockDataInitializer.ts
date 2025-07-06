import { db } from './indexedDB';
import { mockCompanies } from '../../data/mockCompanies';
import { mockOperations } from '../../data/mockOperations';
import { mockPortfolios } from '../../data/mockPortfolios';


export async function initializeMockData() {
  try {
    // Vérifier si les données sont déjà initialisées
    const initialized = localStorage.getItem('mockDataInitialized');
    if (initialized) return;

    // Initialiser les données dans IndexedDB
    const stores = [
      { name: 'companies', data: mockCompanies },
      { name: 'operations', data: mockOperations },
      { name: 'portfolios', data: mockPortfolios }
    ];

    for (const store of stores) {
      for (const item of store.data) {
        try {
          // Vérifier si l'élément existe déjà
          const existing = await db.get(store.name, item.id);
          if (!existing) {
            await db.add(store.name, item);
          }
        } catch (error) {
          console.warn(`Skipping duplicate item in ${store.name}:`, item.id);
        }
      }
    }

    // Marquer comme initialisé
    localStorage.setItem('mockDataInitialized', 'true');
    console.log('Mock data initialized in IndexedDB');
  } catch (error) {
    console.error('Error initializing mock data:', error);
  }
}