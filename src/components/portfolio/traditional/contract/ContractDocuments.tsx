// components/portfolio/traditional/contract/ContractDocuments.tsx
import { PlusIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadDate: string;
  url: string;
}

interface ContractDocumentsProps {
  contractId: string;
}

export function ContractDocuments({ contractId }: ContractDocumentsProps) {
  // Utilisation du contractId pour future implémentation
  console.log('Document contractId:', contractId);
  // Simulation de données de documents
  const documents: Document[] = [
    {
      id: '1',
      name: 'Contrat_de_credit.pdf',
      type: 'PDF',
      size: '2.3 MB',
      uploadDate: '2025-07-15',
      url: '#'
    },
    {
      id: '2',
      name: 'Plan_amortissement.xlsx',
      type: 'Excel',
      size: '1.1 MB',
      uploadDate: '2025-07-15',
      url: '#'
    },
    {
      id: '3',
      name: 'Garantie_hypothécaire.pdf',
      type: 'PDF',
      size: '4.7 MB',
      uploadDate: '2025-07-16',
      url: '#'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Documents du contrat</h3>
        <Button variant="outline" className="flex items-center gap-1">
          <PlusIcon className="h-4 w-4" />
          Ajouter un document
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taille</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'ajout</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="secondary" className="text-xs">
                    {doc.type}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doc.size}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {doc.uploadDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
