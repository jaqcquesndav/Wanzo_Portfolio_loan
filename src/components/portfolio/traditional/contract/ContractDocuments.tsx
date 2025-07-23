import { useState } from 'react';
import { Card } from '../../../ui/Card';
import { Button } from '../../../ui/Button';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../../ui/Table';
import { FileText, Upload, Download, Trash2, Eye } from 'lucide-react';

interface ContractDocumentsProps {
  contractId: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
}

export function ContractDocuments({ contractId }: ContractDocumentsProps) {
  // Mock data for contract documents
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Contrat signé',
      type: 'PDF',
      uploadDate: '15/06/2025',
      size: '2.4 MB',
    },
    {
      id: '2',
      name: 'Plan de remboursement',
      type: 'XLSX',
      uploadDate: '15/06/2025',
      size: '1.1 MB',
    },
    {
      id: '3',
      name: 'Identification client',
      type: 'PDF',
      uploadDate: '15/06/2025',
      size: '3.7 MB',
    },
  ]);

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    // In a real application, you would call an API to delete the document
    console.log(`Deleting document ${id} for contract ${contractId}`);
  };

  const handleViewDocument = (id: string) => {
    // In a real application, you would open the document for viewing
    console.log(`Viewing document ${id} for contract ${contractId}`);
  };

  const handleDownloadDocument = (id: string) => {
    // In a real application, you would trigger a download
    console.log(`Downloading document ${id} for contract ${contractId}`);
  };

  const handleUploadDocument = () => {
    // In a real application, you would open a file picker and upload the selected file
    console.log(`Uploading document for contract ${contractId}`);
    
    // Simulate adding a new document
    const newDoc: Document = {
      id: (documents.length + 1).toString(),
      name: `Document ${documents.length + 1}`,
      type: 'PDF',
      uploadDate: new Date().toLocaleDateString('fr-FR'),
      size: '1.5 MB',
    };
    
    setDocuments([...documents, newDoc]);
  };

  return (
    <Card className="p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Documents contractuels</h3>
        <Button onClick={handleUploadDocument} className="flex items-center gap-2">
          <Upload size={16} />
          Ajouter un document
        </Button>
      </div>
      
      {documents.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Document</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Date d'upload</TableHeader>
              <TableHeader>Taille</TableHeader>
              <TableHeader className="text-right">Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <FileText size={16} className="text-blue-500" />
                  {doc.name}
                </TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell>{doc.uploadDate}</TableCell>
                <TableCell>{doc.size}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewDocument(doc.id)}>
                      <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDownloadDocument(doc.id)}>
                      <Download size={16} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteDocument(doc.id)}>
                      <Trash2 size={16} className="text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Aucun document disponible pour ce contrat</p>
          <p className="mt-2 text-sm">Cliquez sur "Ajouter un document" pour télécharger des fichiers</p>
        </div>
      )}
    </Card>
  );
}
