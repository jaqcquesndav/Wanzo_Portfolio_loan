import React from 'react';
import { Wrench, Calendar, Tag, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { formatCurrency } from '../../../utils/formatters';
import type { Equipment } from '../../../types/leasing';

interface EquipmentCardProps {
  equipment: Equipment;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function EquipmentCard({ equipment, onView, onEdit, onDelete }: EquipmentCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Image de l'équipement */}
      <div className="aspect-w-16 aspect-h-9 relative">
        <img
          src={equipment.imageUrl}
          alt={equipment.name}
          className="w-full h-48 object-cover"
          onError={(e) => {
            // Image de secours en cas d'erreur
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <Badge
          variant={equipment.condition === 'new' ? 'success' : 'warning'}
          className="absolute top-2 right-2"
        >
          {equipment.condition === 'new' ? 'Neuf' : 'Occasion'}
        </Badge>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h3 className="font-medium text-gray-900 dark:text-white">{equipment.name}</h3>
          <p className="text-sm text-gray-500">{equipment.manufacturer} - {equipment.model}</p>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Wrench className="h-4 w-4 mr-2" />
            {equipment.category}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-2" />
            {equipment.year}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Tag className="h-4 w-4 mr-2" />
            {formatCurrency(equipment.price, undefined, 'USD')}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              icon={<Edit2 className="h-4 w-4" />}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              icon={<Trash2 className="h-4 w-4 text-red-500" />}
            />
          </div>
          <Button
            variant="outline"
            onClick={onView}
          >
            Voir détails
          </Button>
        </div>
      </div>
    </div>
  );
}