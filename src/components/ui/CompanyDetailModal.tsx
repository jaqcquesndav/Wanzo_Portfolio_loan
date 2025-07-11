import { useState } from 'react';
import { FileText, Download } from 'lucide-react';
import { Button } from './Button';
import { FormField, Input, Select } from './Form';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from './Table';
import { Badge } from './Badge';
import { Pagination } from './Pagination';
import { mockCompanyDetails } from '../../data/mockCompanyDetails';

interface Financial {
  year: number;
  revenue: number;
  profit: number;
  assets: number;
  liabilities: number;
}
interface Security {
  type: string;
  symbol: string;
  quantity: number;
  value: number;
}
interface Document {
  id: string;
  title: string;
  type: string;
  date: string;
  size: string;
  status: string;
}
interface Company {
  id: string;
  name: string;
  sector: string;
  country: string;
  founded: number;
  employees: number;
  financials: Financial[];
  securities: Security[];
  documents: Document[];
}

interface CompanyDetailModalProps {
  open: boolean;
  onClose: () => void;
  companyId: string;
}

export const CompanyDetailModal: React.FC<CompanyDetailModalProps> = ({ open, onClose, companyId }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    type: 'all',
    startDate: '',
    endDate: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  if (!open) return null;
  const company: Company = mockCompanyDetails;
  if (!company || company.id !== companyId) return null;

  const filteredDocs = company.documents.filter((doc: Document) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filters.type === 'all' || doc.type === filters.type;
    const matchesDateRange = (!filters.startDate || doc.date >= filters.startDate) && (!filters.endDate || doc.date <= filters.endDate);
    return matchesSearch && matchesType && matchesDateRange;
  });

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredDocs.length / ITEMS_PER_PAGE);
  const paginatedDocs = filteredDocs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleDownload = async (doc: Document, format: 'pdf' | 'xlsx') => {
    alert(`Téléchargement ${doc.title} (${format})`);
  };
  const handleExportAll = async () => {
    alert('Exportation de tous les documents...');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Fermer"
        >
          &times;
        </button>
        <div className="mb-4">
          <h2 className="text-2xl font-semibold mb-1">{company.name}</h2>
          <div className="flex gap-4 text-gray-600 text-sm">
            <span>Secteur: <Badge variant="primary">{company.sector}</Badge></span>
            <span>Pays: {company.country}</span>
            <span>Fondée: {company.founded}</span>
            <span>Employés: {company.employees}</span>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Données financières</h3>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Année</TableHeader>
                <TableHeader>Revenus</TableHeader>
                <TableHeader>Bénéfice</TableHeader>
                <TableHeader>Actifs</TableHeader>
                <TableHeader>Passifs</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {company.financials.map((f: Financial) => (
                <TableRow key={f.year}>
                  <TableCell>{f.year}</TableCell>
                  <TableCell>{f.revenue.toLocaleString()} CDF</TableCell>
                  <TableCell>{f.profit.toLocaleString()} CDF</TableCell>
                  <TableCell>{f.assets.toLocaleString()} CDF</TableCell>
                  <TableCell>{f.liabilities.toLocaleString()} CDF</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Valeurs Mobilières</h3>
          <div className="flex gap-4 flex-wrap">
            {company.securities.map((s: Security, idx: number) => (
              <Badge key={idx} variant="primary">
                {s.type}: {s.symbol} — {s.quantity} @ {s.value} CDF
              </Badge>
            ))}
          </div>
        </div>
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-primary mr-2" />
              <h3 className="text-lg font-semibold">Documents</h3>
            </div>
            <Button 
              variant="primary"
              onClick={handleExportAll}
              icon={<Download className="h-5 w-5" />}
            >
              Exporter tout
            </Button>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField label="Rechercher">
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un document..."
                />
              </FormField>
              <FormField label="Type">
                <Select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="all">Tous les types</option>
                  <option value="financial">États financiers</option>
                  <option value="legal">Légal</option>
                  <option value="activity">Activité</option>
                </Select>
              </FormField>
              <FormField label="Date début">
                <Input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </FormField>
              <FormField label="Date fin">
                <Input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </FormField>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mt-4">
            <Table>
              <TableHead>
                <TableRow>
                  <TableHeader>Title</TableHeader>
                  <TableHeader>Type</TableHeader>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Taille</TableHeader>
                  <TableHeader>Statut</TableHeader>
                  <TableHeader align="right">Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedDocs.map((doc: Document) => (
                  <TableRow key={doc.id}>
                    <TableCell>{doc.title}</TableCell>
                    <TableCell><Badge variant="primary">{doc.type}</Badge></TableCell>
                    <TableCell>{doc.date}</TableCell>
                    <TableCell>{doc.size}</TableCell>
                    <TableCell>
                      <Badge variant={doc.status === 'final' ? 'success' : 'warning'}>{doc.status}</Badge>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {}}
                      >
                        Voir
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc, 'pdf')}
                      >
                        PDF
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc, 'xlsx')}
                      >
                        Excel
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {totalPages > 1 && (
              <div className="p-4 border-t dark:border-gray-700">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
