import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Video } from 'lucide-react';
import { Button } from '../ui/Button';
import { FormField, Input, Select, TextArea } from '../ui/Form';
import type { Company } from '../../types/company';

interface MeetingSchedulerProps {
  company: Company;
  onClose: () => void;
  onSchedule: (meetingData: any) => Promise<void>;
}

export function MeetingScheduler({ company, onClose, onSchedule }: MeetingSchedulerProps) {
  const [loading, setLoading] = useState(false);
  const [meetingType, setMeetingType] = useState<'physical' | 'virtual'>('virtual');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSchedule({
        companyId: company.id,
        type: meetingType,
        date,
        time,
        location: meetingType === 'physical' ? location : null,
        notes
      });
      onClose();
    } catch (error) {
      console.error('Failed to schedule meeting:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full mx-4">
        <div className="p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Planifier un rendez-vous avec {company.name}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <FormField label="Type de rendez-vous">
            <Select
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value as 'physical' | 'virtual')}
            >
              <option value="virtual">Virtuel</option>
              <option value="physical">Physique</option>
            </Select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Date">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Heure">
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </FormField>
          </div>

          {meetingType === 'physical' && (
            <FormField label="Lieu">
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Adresse du rendez-vous"
                required
              />
            </FormField>
          )}

          <FormField label="Notes">
            <TextArea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajoutez des notes ou un ordre du jour..."
              rows={4}
            />
          </FormField>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" loading={loading}>
              Planifier
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}