import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/Tabs';
import { OperationsListView } from '../../operations/views/OperationsListView';
import { OperationsPendingView } from '../../operations/views/OperationsPendingView';
import { OperationsArchiveView } from '../../operations/views/OperationsArchiveView';
import { usePortfolioOperations } from '../../../hooks/usePortfolioOperations';

interface PortfolioOperationsTabsProps {
  portfolioId: string;
}

export function PortfolioOperationsTabs({ portfolioId }: PortfolioOperationsTabsProps) {
  const [tab, setTab] = useState('all');
  const { operations, onOperationClick } = usePortfolioOperations(portfolioId);

  return (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList>
        <TabsTrigger value="all" currentValue={tab} onValueChange={setTab}>
          Toutes
        </TabsTrigger>
        <TabsTrigger value="pending" currentValue={tab} onValueChange={setTab}>
          En attente
        </TabsTrigger>
        <TabsTrigger value="archive" currentValue={tab} onValueChange={setTab}>
          Archives
        </TabsTrigger>
      </TabsList>
      <TabsContent value="all" currentValue={tab}>
        <OperationsListView
          operations={operations}
          searchTerm=""
          onSearchChange={() => {}}
          selectedType="all"
          onTypeChange={() => {}}
          selectedStatus="all"
          onStatusChange={() => {}}
          onOperationClick={onOperationClick}
        />
      </TabsContent>
      <TabsContent value="pending" currentValue={tab}>
        <OperationsPendingView operations={operations} onOperationClick={onOperationClick} />
      </TabsContent>
      <TabsContent value="archive" currentValue={tab}>
        <OperationsArchiveView operations={operations} onOperationClick={onOperationClick} />
      </TabsContent>
    </Tabs>
  );
}
