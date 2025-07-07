import { mockCompanies } from '../data/mockCompanies';
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useInvestmentTransactions } from '../hooks/useInvestmentTransactions';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { NotFound } from '../components/ui/NotFound';

const InvestmentTransactionDetails: React.FC = () => {
  const { portfolioId, transactionId } = useParams();
  const navigate = useNavigate();
  const { transactions } = useInvestmentTransactions(portfolioId);
  const transaction = transactions.find((t) => t.id === transactionId);

  if (!transaction) return <NotFound message="Transaction d'investissement introuvable." />;

  const company = mockCompanies.find(c => c.id === transaction.companyId);
  return (
    <div className="p-6">
      <Breadcrumbs
        items={[
          { label: 'Portefeuilles', to: '/app/portfolio' },
          { label: `Portfolio #${portfolioId}`, to: `/app/portfolio/${portfolioId}` },
          { label: 'Transactions', to: `/app/portfolio/${portfolioId}/investment/transactions` },
          { label: `Transaction #${transactionId}` }
        ]}
      />
      <h1 className="text-2xl font-bold mb-4">Détail de la transaction d'investissement</h1>
      <div className="bg-white rounded shadow p-4">
        <div className="mb-2"><strong>ID:</strong> {transaction.id}</div>
        <div className="mb-2"><strong>Entreprise cible:</strong> {company ? company.name : transaction.companyId}</div>
        <div className="mb-2"><strong>Montant investi:</strong> {transaction.amount.toLocaleString()} FCFA</div>
        <div className="mb-2"><strong>Date:</strong> {transaction.date}</div>
        <div className="mb-2"><strong>Statut:</strong> {transaction.status}</div>
        <button className="mt-4 btn btn-secondary" onClick={() => navigate(-1)}>Retour</button>
      </div>
    </div>
  );
};

export default InvestmentTransactionDetails;
