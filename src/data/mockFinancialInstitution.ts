import { FinancialInstitution } from '../types/financialInstitution';

// Mock data pour l'institution financière
export const mockFinancialInstitution: FinancialInstitution = {
  id: "fin-inst-123456",
  userId: "user-admin-123",
  name: "Banque Wanzo RDC",
  type: "BANQUE",
  sector: "PRIVE",
  
  // Informations réglementaires
  approvalNumber: "BCC-2024-0123",
  taxId: "CD-IMP-202001-456789",
  natId: "IDNAT-202001-123456",
  rccm: "CD/KIN/RCCM/20-B-00123",
  
  // Détails de l'entreprise
  legalForm: "SA",
  creationDate: "2020-01-15",
  website: "https://www.wanzo-finance.cd",
  logo: "/images/logo-wanzo.png",
  
  // Capital et activités
  capital: {
    amount: 25000000000, // 25 milliards CDF
    currency: "CDF"
  },
  primaryActivity: "Services bancaires et financiers",
  secondaryActivities: [
    "Microfinance",
    "Transferts d'argent",
    "Services de leasing"
  ],
  
  // Adresses et contacts
  headquartersAddress: {
    street: "Avenue Patrice Lumumba, N°123",
    city: "Kinshasa",
    state: "Kinshasa",
    country: "République Démocratique du Congo"
  },
  branches: [
    {
      street: "Boulevard du 30 Juin, N°45",
      city: "Kinshasa",
      state: "Kinshasa",
      country: "République Démocratique du Congo"
    },
    {
      street: "Avenue des Volcans, N°78",
      city: "Goma",
      state: "Nord-Kivu",
      country: "République Démocratique du Congo"
    },
    {
      street: "Boulevard Mobutu, N°22",
      city: "Lubumbashi",
      state: "Haut-Katanga",
      country: "République Démocratique du Congo"
    }
  ],
  
  // Nouveau format avec coordonnées géographiques
  locations: [
    {
      id: "loc-001",
      name: "Siège Social Kinshasa",
      type: "headquarters",
      address: "Avenue Patrice Lumumba, N°123, Kinshasa",
      coordinates: {
        lat: -4.325,
        lng: 15.322
      }
    },
    {
      id: "loc-002",
      name: "Agence Goma",
      type: "branch",
      address: "Avenue des Volcans, N°78, Goma",
      coordinates: {
        lat: -1.677,
        lng: 29.238
      }
    },
    {
      id: "loc-003",
      name: "Agence Lubumbashi",
      type: "branch",
      address: "Boulevard Mobutu, N°22, Lubumbashi",
      coordinates: {
        lat: -11.661,
        lng: 27.479
      }
    }
  ],
  
  contactPerson: {
    name: "Dr. Jean-Paul Mukendi",
    title: "Directeur Général",
    email: "jp.mukendi@wanzo-finance.cd",
    phone: "+243 970 123 456",
    department: "Direction Générale"
  },
  
  // Métadonnées
  createdAt: "2020-01-15T00:00:00Z",
  updatedAt: "2025-07-01T09:45:12Z"
};
