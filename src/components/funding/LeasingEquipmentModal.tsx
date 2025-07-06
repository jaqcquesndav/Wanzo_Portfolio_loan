import React from 'react';
import { X, Wrench, Calendar, Tag, Check, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatters';
import type { Equipment } from '../../types/leasing';

interface LeasingEquipmentModalProps {
  equipment: Equipment;
  onClose: () => void;
  onSelect?: () => void;
}

export function LeasingEquipmentModal({ equipment, onClose, onSelect }: LeasingEquipmentModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {equipment.name}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="h-5 w-5" />}
          />
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <img
                src={equipment.imageUrl}
                alt={equipment.name}
                className="w-full rounded-lg object-cover"
              />
              
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Prix mensuel estimé</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(equipment.price / 36)}
                  </p>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Valeur totale</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(equipment.price)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Informations générales
                </h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Wrench className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Fabricant</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {equipment.manufacturer}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Tag className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Modèle</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {equipment.model}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Année</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {equipment.year}
                      </dd>
                    </div>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">État</dt>
                    <dd>
                      <Badge variant={equipment.condition === 'new' ? 'success' : 'warning'}>
                        {equipment.condition === 'new' ? 'Neuf' : 'Occasion'}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Spécifications techniques
                </h3>
                <dl className="grid grid-cols-2 gap-4">
                  {Object.entries(equipment.specifications).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {key.replace(/_/g, ' ')}
                      </dt>
                      <dd className="font-medium text-gray-900 dark:text-white">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Services inclus
                </h3>
                <ul className="space-y-3">
                  <li className="flex items-center">
                    {equipment.maintenanceIncluded ? (
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                    )}
                    <span className="text-gray-700 dark:text-gray-300">
                      Maintenance {equipment.maintenanceIncluded ? 'incluse' : 'non incluse'}
                    </span>
                  </li>
                  {equipment.warrantyDuration && (
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Garantie {equipment.warrantyDuration} mois
                      </span>
                    </li>
                  )}
                  {equipment.deliveryTime && (
                    <li className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Livraison sous {equipment.deliveryTime} jours
                      </span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Description
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {equipment.description}
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                equipment.availability ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {equipment.availability ? 'Disponible' : 'Non disponible'}
              </span>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={onClose}>
                Fermer
              </Button>
              {onSelect && (
                <Button onClick={onSelect} disabled={!equipment.availability}>
                  Sélectionner cet équipement
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}