import { LeasingRequest } from '../../types/leasing-request';
import { LeasingContract, Equipment } from '../../types/leasing';
import { mockLeasingRequests } from '../../data/mockLeasingRequests';
import { mockLeasingContracts } from '../../data/mockLeasingContracts';
import { mockEquipments } from '../../data/mockEquipments';

// Clés pour le localStorage
const STORAGE_KEYS = {
  REQUESTS: 'wanzo_leasing_requests',
  CONTRACTS: 'wanzo_leasing_contracts',
  EQUIPMENTS: 'wanzo_leasing_equipments',
};

// Initialise les données dans le localStorage si elles n'existent pas déjà
export const initLeasingData = (): void => {
  // Initialiser les demandes de leasing
  if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(mockLeasingRequests));
  }

  // Initialiser les contrats de leasing
  if (!localStorage.getItem(STORAGE_KEYS.CONTRACTS)) {
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(mockLeasingContracts));
  }

  // Initialiser les équipements
  if (!localStorage.getItem(STORAGE_KEYS.EQUIPMENTS)) {
    localStorage.setItem(STORAGE_KEYS.EQUIPMENTS, JSON.stringify(mockEquipments));
  }
};

// Récupère toutes les demandes de leasing du localStorage
export const getLeasingRequests = (): LeasingRequest[] => {
  const requests = localStorage.getItem(STORAGE_KEYS.REQUESTS);
  return requests ? JSON.parse(requests) : [];
};

// Récupère une demande de leasing spécifique par son ID
export const getLeasingRequestById = (id: string): LeasingRequest | undefined => {
  const requests = getLeasingRequests();
  return requests.find(req => req.id === id);
};

// Met à jour une demande de leasing
export const updateLeasingRequest = (request: LeasingRequest): void => {
  const requests = getLeasingRequests();
  const index = requests.findIndex(req => req.id === request.id);
  
  if (index !== -1) {
    requests[index] = { ...requests[index], ...request };
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }
};

// Récupère tous les contrats de leasing du localStorage
export const getLeasingContracts = (): LeasingContract[] => {
  const contracts = localStorage.getItem(STORAGE_KEYS.CONTRACTS);
  return contracts ? JSON.parse(contracts) : [];
};

// Récupère un contrat de leasing spécifique par son ID
export const getLeasingContractById = (id: string): LeasingContract | undefined => {
  const contracts = getLeasingContracts();
  return contracts.find(contract => contract.id === id);
};

// Met à jour un contrat de leasing
export const updateLeasingContract = (contract: LeasingContract): void => {
  const contracts = getLeasingContracts();
  const index = contracts.findIndex(c => c.id === contract.id);
  
  if (index !== -1) {
    contracts[index] = { ...contracts[index], ...contract };
    localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
  }
};

// Ajoute un nouveau contrat de leasing
export const addLeasingContract = (contract: LeasingContract): void => {
  const contracts = getLeasingContracts();
  contracts.push(contract);
  localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(contracts));
};

// Récupère tous les équipements du localStorage
export const getEquipments = (): Equipment[] => {
  const equipments = localStorage.getItem(STORAGE_KEYS.EQUIPMENTS);
  return equipments ? JSON.parse(equipments) : [];
};

// Récupère un équipement spécifique par son ID
export const getEquipmentById = (id: string): Equipment | undefined => {
  const equipments = getEquipments();
  return equipments.find(equipment => equipment.id === id);
};

// Réinitialise toutes les données (utile pour le développement)
export const resetLeasingData = (): void => {
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(mockLeasingRequests));
  localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(mockLeasingContracts));
  localStorage.setItem(STORAGE_KEYS.EQUIPMENTS, JSON.stringify(mockEquipments));
};

// Génère un nouvel ID de contrat
export const generateContractId = (): string => {
  const contracts = getLeasingContracts();
  const lastId = contracts.length > 0 
    ? parseInt(contracts[contracts.length - 1].id.replace('LC-', ''))
    : 0;
  return `LC-${String(lastId + 1).padStart(5, '0')}`;
};
