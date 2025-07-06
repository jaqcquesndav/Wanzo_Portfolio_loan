import React, { useState } from 'react';
import { X, Wrench } from 'lucide-react';
import { Button } from '../ui/Button';
import { LeasingEquipmentModal } from './LeasingEquipmentModal';
import type { FundingOffer } from '../../types/funding';
import type { Equipment } from '../../types/leasing';

interface FundingOfferModalProps {
  offer: FundingOffer;
  onClose: () => void;
}

export function FundingOfferModal({ offer, onClose }: FundingOfferModalProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{offer.title}</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              icon={<X className="h-5 w-5" />}
            />
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Description</h3>
              <p className="text-gray-600 dark:text-gray-300">{offer.description}</p>
            </div>

            {offer.type === 'leasing' && 'equipments' in offer && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Équipements disponibles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offer.equipments.map(equipment => (
                    <button
                      key={equipment.id}
                      onClick={() => setSelectedEquipment(equipment)}
                      className="text-left p-4 border dark:border-gray-700 rounded-lg hover:border-primary dark:hover:border-primary transition-colors"
                    >
                      <div className="flex items-start">
                        <Wrench className="h-5 w-5 text-gray-400 mt-1" />
                        <div className="ml-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {equipment.name}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {equipment.manufacturer} - {equipment.model}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Critères d'éligibilité
              </h3>
              <ul className="space-y-2">
                {offer.requirements.map((req, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2">•</span>
                    <span className="text-gray-600 dark:text-gray-300">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-6 bg-gray-50 dark:bg-gray-700 border-t dark:border-gray-600">
            <Button onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </div>

      {selectedEquipment && (
        <LeasingEquipmentModal
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
        />
      )}
    </>
  );
}