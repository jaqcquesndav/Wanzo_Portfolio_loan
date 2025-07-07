export interface LeasingTransaction {
  id: string;
  equipmentId: string;
  type: string;
  amount: number;
  date: string;
  status: string;
  portfolioId: string;
}
