import type { Equipment } from '../types/leasing';

export const mockEquipments: Equipment[] = [
  {
    id: "EQP-001",
    name: "Tracteur agricole XT5000",
    description: "Tracteur polyvalent idéal pour les grandes exploitations agricoles du Nord-Kivu",
    category: "Agricole",
    manufacturer: "AgriTech Congo",
    model: "XT5000",
    year: 2024,
    price: 75000000,
    condition: "new",
    specifications: {
      puissance: "120 CV",
      carburant: "Diesel",
      capacité: "5000 kg",
      vitesse: "40 km/h"
    },
    availability: true,
    maintenanceIncluded: true,
    warrantyDuration: 24,
    deliveryTime: 15,
    imageUrl: "/images/equipments/tracteur-xt5000.jpg"
  },
  {
    id: "EQP-002",
    name: "Excavatrice BTP Pro X1",
    description: "Excavatrice haute performance pour chantiers de grande envergure",
    category: "Construction",
    manufacturer: "ConstruMach",
    model: "Pro X1",
    year: 2024,
    price: 85000000,
    condition: "new",
    specifications: {
      poids: "12000 kg",
      puissance: "150 CV",
      profondeur_creusage: "5.5 m",
      capacité_godet: "1.2 m³"
    },
    availability: true,
    maintenanceIncluded: true,
    warrantyDuration: 36,
    deliveryTime: 30,
    imageUrl: "/images/equipments/excavatrice-prox1.jpg"
  },
  {
    id: "EQP-003",
    name: "Camion Benne TD-200",
    description: "Camion benne robuste pour transport de matériaux lourds",
    category: "Transport",
    manufacturer: "TransDiesel",
    model: "TD-200",
    year: 2023,
    price: 65000000,
    condition: "used",
    specifications: {
      charge_utile: "20 tonnes",
      puissance: "320 CV",
      carburant: "Diesel",
      volume_benne: "16 m³"
    },
    availability: true,
    maintenanceIncluded: false,
    warrantyDuration: 12,
    deliveryTime: 7,
    imageUrl: "/images/equipments/camion-td200.jpg"
  },
  {
    id: "EQP-004",
    name: "Grue mobile GM-500",
    description: "Grue mobile télescopique pour chantiers urbains",
    category: "Construction",
    manufacturer: "LiftMaster",
    model: "GM-500",
    year: 2024,
    price: 120000000,
    condition: "new",
    specifications: {
      capacité_levage: "50 tonnes",
      hauteur_max: "40 m",
      portée: "35 m",
      mobilité: "tout-terrain"
    },
    availability: true,
    maintenanceIncluded: true,
    warrantyDuration: 24,
    deliveryTime: 45,
    imageUrl: "/images/equipments/grue-gm500.jpg"
  },
  {
    id: "EQP-005",
    name: "Chariot élévateur Eco-Lift",
    description: "Chariot élévateur électrique écologique pour entrepôts",
    category: "Manutention",
    manufacturer: "GreenLift",
    model: "Eco-Lift 3000",
    year: 2024,
    price: 35000000,
    condition: "new",
    specifications: {
      capacité_levage: "3000 kg",
      hauteur_levage: "4.5 m",
      autonomie: "8 heures",
      temps_recharge: "3 heures"
    },
    availability: true,
    maintenanceIncluded: true,
    warrantyDuration: 36,
    deliveryTime: 10,
    imageUrl: "/images/equipments/chariot-ecolift.jpg"
  }
];
