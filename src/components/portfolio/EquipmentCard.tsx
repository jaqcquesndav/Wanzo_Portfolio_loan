// src/components/portfolio/leasing/EquipmentCard.tsx
import React from 'react';
import { Tool, Calendar, Tag } from 'lucide-react';
import { Button } from '../../ui/Button';
import { formatCurrency } from '../../../utils/formatters';
import type { Equipment } from '../../../types/leasing';

interface EquipmentCardProps {
  equipment: Equipment;
  onView: () => void;
}

export function EquipmentCard({ equipment, onView }: EquipmentCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{equipment.name}</h3>
          <p className="text-sm text-gray-500">{equipment.manufacturer} - {equipment.model}</p>
        </div>
        <Badge variant={equipment.condition === 'new' ? 'success' : 'warning'}>
          {equipment.condition === 'new' ? 'Neuf' : 'Occasion'}
        </Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-500">
          <Tool className="h-4 w-4 mr-2" />
          {equipment.category}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-2" />
          {equipment.year}
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Tag className="h-4 w-4 mr-2" />
          {formatCurrency(equipment.price)}
        </div>
      </div>

      <Button
        variant="outline"
        onClick={onView}
        className="w-full"
      >
        Voir détails
      </Button>
    </div>
  );
}
