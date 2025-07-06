import { db } from '../services/db/indexedDB';
import type { Portfolio } from '../types/portfolio';

export async function savePortfolioOffline(portfolio: Portfolio) {
  await db.add('portfolios', portfolio);
  await db.add('sync_queue', {
    id: `${portfolio.id}-create`,
    action: 'create',
    entity: 'portfolio',
    data: portfolio,
    timestamp: Date.now(),
    retries: 0,
    priority: 1
  });
}
