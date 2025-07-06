import React, { useState } from 'react';
import { mockCompanies } from '../data/mockCompanies';
import type { Company } from '../types/company';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../components/ui';
import { Button } from '../components/ui/Button';
import { Download, ChevronDown } from 'lucide-react';

// Mock data
const mockData = [
  {
    id: '1',
    institution: 'Banque Commerciale du Congo',
    entreprise: 'Kinshasa Digital',
    secteur: 'Technologies',
    encours: 120000000,
    statut: 'Actif',
    rating: 'A',
    incidents: 0
  },
  {
    id: '2',
    institution: 'COOPEC Lumière',
    entreprise: 'Congo Agro Business',
    secteur: 'Agriculture',
    encours: 80000000,
    statut: 'Actif',
    rating: 'B',
    incidents: 1
  },
  {
    id: '3',
    institution: 'Microfinance RDC',
    entreprise: 'Lubumbashi Mining Services',
    secteur: 'Industrie',
    encours: 250000000,
    statut: 'En défaut',
    rating: 'C',
    incidents: 2
  }
];

// Ajout d'un user et institution minimum pour la démo
const user = { id: 'demo', role: 'admin' };
const institution = { name: 'Institution Démo' };

export default function CentralRisque() {
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [form, setForm] = useState({
    id: '',
    institution: institution?.name || '',
    entreprise: '',
    secteur: '',
    encours: '',
    statut: 'Actif',
    rating: 'A',
    incidents: 0
  });
  const [data, setData] = useState(mockData);
  const [companyInput, setCompanyInput] = useState('');
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [companies, setCompanies] = useState(mockCompanies);
  const isAdmin = user && user.role === 'admin';

  const filtered = data.filter(row =>
    (row.entreprise.toLowerCase().includes(search.toLowerCase()) ||
      row.institution.toLowerCase().includes(search.toLowerCase())) &&
    (filterStatut ? row.statut === filterStatut : true)
  );

  // Export handlers (à implémenter avec SheetJS ou autre lib)
  const handleExport = (type: string) => {
    setExportOpen(false);
    alert('Export ' + type + ' non implémenté (démo)');
  };

  // Fermer le menu export si clic en dehors
  React.useEffect(() => {
    if (!exportOpen) return;
    const handler = (e: MouseEvent) => {
      const menu = document.getElementById('export-menu');
      if (menu && !menu.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [exportOpen]);

  // Gestion du formulaire Modal
  const handleOpenModal = () => {
    setForm({
      id: '',
      institution: institution?.name || '',
      entreprise: '',
      secteur: '',
      encours: '',
      statut: 'Actif',
      rating: 'A',
      incidents: 0
    });
    setCompanyInput('');
    setShowAddCompany(false);
    setModalOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'entreprise') {
      setCompanyInput(value);
      const company = companies.find(c => c.name.toLowerCase() === value.toLowerCase());
      if (company) {
        setForm(prev => ({ ...prev, secteur: company.sector }));
        setShowAddCompany(false);
      } else {
        setShowAddCompany(value.length > 2);
        setForm(prev => ({ ...prev, secteur: '' }));
      }
    }
  };

  const handleCompanyInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyInput(e.target.value);
    setForm(prev => ({ ...prev, entreprise: e.target.value }));
    const company = companies.find(c => c.name.toLowerCase() === e.target.value.toLowerCase());
    if (company) {
      setForm(prev => ({ ...prev, secteur: company.sector }));
      setShowAddCompany(false);
    } else {
      setShowAddCompany(e.target.value.length > 2);
      setForm(prev => ({ ...prev, secteur: '' }));
    }
  };

  const handleAddCompany = () => {
    if (!companyInput.trim()) return;
    const newCompany = {
      id: (Math.random() * 100000).toFixed(0),
      name: companyInput,
      sector: form.secteur || 'Autre',
      size: 'small' as const,
      annual_revenue: 0,
      employee_count: 0,
      status: 'active' as const,
      financial_metrics: {
        revenue_growth: 0,
        profit_margin: 0,
        cash_flow: 0,
        debt_ratio: 0,
        working_capital: 0,
        credit_score: 0,
        financial_rating: 'C' as const
      },
      esg_metrics: {
        carbon_footprint: 0,
        environmental_rating: 'D' as const,
        social_rating: 'D' as const,
        governance_rating: 'D' as const
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setCompanies(prev => [...prev, newCompany as Company]);
    setForm(prev => ({ ...prev, entreprise: companyInput, secteur: newCompany.sector }));
    setShowAddCompany(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setData(prev => [
      ...prev,
      {
        ...form,
        id: (Math.random() * 100000).toFixed(0),
        encours: Number(form.encours),
        incidents: Number(form.incidents)
      }
    ]);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Central de risque</h1>
          <p className="text-gray-500 text-sm max-w-2xl">Partagé avec les institutions financières et acteurs du capital investissement. Visualisez l’exposition au risque du marché financier local.</p>
          {isAdmin && (
            <Button variant="primary" onClick={handleOpenModal} className="mt-4">Ajouter une exposition</Button>
          )}
        </div>
        <div className="relative w-full md:w-auto flex justify-end items-end">
          <Button
            variant="outline"
            icon={<Download className="h-4 w-4" />}
            onClick={() => setExportOpen(v => !v)}
            className="w-full md:w-auto"
            type="button"
            aria-haspopup="listbox"
            aria-expanded={exportOpen ? 'true' : 'false'}
            aria-controls="export-menu"
          >
            Exporter <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
          {exportOpen && (
            <div id="export-menu" className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-10">
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleExport('xlsx')}>Exporter XLSX</button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleExport('csv')}>Exporter CSV</button>
              <button className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => handleExport('pdf')}>Exporter PDF</button>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Recherche entreprise ou institution..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-80"
        />
        <select
          value={filterStatut}
          onChange={e => setFilterStatut(e.target.value)}
          className="border rounded px-3 py-2 w-full md:w-60"
        >
          <option value="">Tous statuts</option>
          <option value="Actif">Actif</option>
          <option value="En défaut">En défaut</option>
        </select>
      </div>
      {/* Modal d'ajout */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h2 className="text-lg font-semibold mb-4">Ajouter une exposition</h2>
            <div className="mb-3">
              <label className="block text-sm mb-1">Institution</label>
              <input name="institution" value={form.institution} readOnly className="border rounded px-3 py-2 w-full bg-gray-100" />
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1">Entreprise</label>
              <input
                name="entreprise"
                value={companyInput}
                onChange={handleCompanyInput}
                required
                className="border rounded px-3 py-2 w-full"
                placeholder="Rechercher ou saisir une entreprise..."
                autoComplete="off"
                list="company-list"
              />
              <datalist id="company-list">
                {companies.filter(c => c.name.toLowerCase().includes(companyInput.toLowerCase())).map(c => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
              {showAddCompany && (
                <button type="button" className="mt-2 text-blue-600 underline text-sm" onClick={handleAddCompany}>Ajouter « {companyInput} » comme nouvelle entreprise</button>
              )}
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1">Secteur</label>
              <input name="secteur" value={form.secteur} onChange={handleFormChange} className="border rounded px-3 py-2 w-full" placeholder="Secteur (si nouvelle entreprise)" />
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1">Encours (CDF)</label>
              <input name="encours" type="number" value={form.encours} onChange={handleFormChange} required className="border rounded px-3 py-2 w-full" />
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1">Statut</label>
              <select name="statut" value={form.statut} onChange={handleFormChange} className="border rounded px-3 py-2 w-full">
                <option value="Actif">Actif</option>
                <option value="En défaut">En défaut</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1">Rating</label>
              <select name="rating" value={form.rating} onChange={handleFormChange} className="border rounded px-3 py-2 w-full">
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-sm mb-1">Incidents</label>
              <input name="incidents" type="number" value={form.incidents} onChange={handleFormChange} required className="border rounded px-3 py-2 w-full" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>Annuler</Button>
              <Button variant="primary" type="submit">Publier</Button>
            </div>
          </form>
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm min-w-[900px]">
            <Table className="min-w-full">
              <TableHead>
                <TableRow>
                  <TableHeader>Institution</TableHeader>
                  <TableHeader>Entreprise</TableHeader>
                  <TableHeader>Secteur</TableHeader>
                  <TableHeader>Encours (CDF)</TableHeader>
                  <TableHeader>Statut</TableHeader>
                  <TableHeader>Rating</TableHeader>
                  <TableHeader>Incidents</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(row => (
                  <TableRow key={row.id}>
                    <TableCell>{row.institution}</TableCell>
                    <TableCell>{row.entreprise}</TableCell>
                    <TableCell>{row.secteur}</TableCell>
                    <TableCell>{row.encours.toLocaleString('fr-CD')}</TableCell>
                    <TableCell>{row.statut}</TableCell>
                    <TableCell>{row.rating}</TableCell>
                    <TableCell>{row.incidents}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
