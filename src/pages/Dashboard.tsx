import React from 'react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import FundingOffers from '../components/dashboard/FundingOffers';
import { useDashboardMetrics } from '../hooks/useDashboardMetrics';
import { useParams } from 'react-router-dom';

export default function Dashboard() {
  const { portfolioType } = useParams();
  const { loading, error } = useDashboardMetrics(portfolioType);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
        <p className="text-red-800 dark:text-red-200">
          Une erreur est survenue lors du chargement des données
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 flex flex-col py-6 space-y-6">
      <DashboardHeader />
      <FundingOffers />
    </div>
  );
}