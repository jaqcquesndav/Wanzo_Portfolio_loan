import { Institution } from '../types/institution';

export const mockOrganization: Institution = {
  id: "org-123456",
  name: "Banque Wanzo RDC",
  type: "bank",
  status: "active",
  license_number: "BCC-2024-0123",
  license_type: "Licence bancaire complète",
  address: "Avenue Patrice Lumumba, N°123, Kinshasa",
  phone: "+243 970 123 456",
  email: "contact@wanzo-finance.cd",
  website: "https://www.wanzo-finance.cd",
  legal_representative: "Dr. Jean-Paul Mukendi",
  tax_id: "CD-IMP-202001-456789",
  regulatory_status: "Approuvée par la Banque Centrale du Congo",
  created_at: "2020-01-01T00:00:00Z",
  updated_at: "2025-03-15T09:45:12Z",
  documents: [
    {
      name: "Licence bancaire BCC",
      type: "pdf",
      url: "/documents/licence-bcc.pdf"
    },
    {
      name: "Statuts de la société",
      type: "pdf",
      url: "/documents/statuts-wanzo.pdf"
    },
    {
      name: "Rapport annuel 2024",
      type: "pdf",
      url: "/documents/rapport-annuel-2024.pdf"
    }
  ]
};

// Informations supplémentaires non incluses dans l'interface Institution
export const additionalOrganizationInfo = {
  legalForm: 'sa',
  capital: 25000000000, // 25 milliards CDF
  employeeCount: 350,
  subsidiaryCount: 5, // Kinshasa, Goma, Lubumbashi, Bukavu, Butembo
  boardMembers: 9,
  executiveCommitteeMembers: 6,
  specializedCommittees: 4,
  subsidiaries: [
    {
      name: "Wanzo Finance Kinshasa",
      address: "Boulevard du 30 Juin, N°45, Kinshasa",
      manager: "Mme. Élisabeth Kabongo"
    },
    {
      name: "Wanzo Finance Goma",
      address: "Avenue des Volcans, N°78, Goma",
      manager: "M. Pierre Muhindo"
    },
    {
      name: "Wanzo Finance Lubumbashi",
      address: "Boulevard Mobutu, N°22, Lubumbashi",
      manager: "M. Jacques Tshisekedi"
    },
    {
      name: "Wanzo Finance Bukavu",
      address: "Avenue Patrice Lumumba, N°10, Bukavu",
      manager: "Mme. Marie Nyiragongo"
    },
    {
      name: "Wanzo Finance Butembo",
      address: "Rue du Commerce, N°34, Butembo",
      manager: "M. Joseph Mbusa"
    }
  ]
};

// Combine l'institution et les informations supplémentaires pour l'utilisation dans l'UI
export const getFullOrganizationData = () => {
  return {
    ...mockOrganization,
    ...additionalOrganizationInfo
  };
};
