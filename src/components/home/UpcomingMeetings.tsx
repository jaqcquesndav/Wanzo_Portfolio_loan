import React from 'react';
import { Calendar, Video, MapPin } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import { Button } from '../ui/Button';

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'physical' | 'virtual';
  company: string;
  location?: string;
  meetingLink?: string;
}

const mockMeetings: Meeting[] = [
  {
    id: '1',
    title: 'Présentation projet financement',
    date: '2024-03-20',
    time: '10:00',
    type: 'virtual',
    company: 'Tech Solutions SARL',
    meetingLink: 'https://meet.example.com/abc123'
  },
  {
    id: '2',
    title: 'Revue dossier leasing',
    date: '2024-03-21',
    time: '14:30',
    type: 'physical',
    company: 'Industrial Equipment SA',
    location: 'Salle de réunion A'
  }
];

export function UpcomingMeetings() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Prochains rendez-vous</h2>
        <Button variant="outline" size="sm" icon={<Calendar className="h-4 w-4" />}>
          Voir tout
        </Button>
      </div>

      <div className="space-y-4">
        {mockMeetings.map((meeting) => (
          <div 
            key={meeting.id}
            className="flex items-start p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <div className="flex-shrink-0">
              {meeting.type === 'virtual' ? (
                <Video className="h-5 w-5 text-blue-500" />
              ) : (
                <MapPin className="h-5 w-5 text-green-500" />
              )}
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">{meeting.title}</h3>
                <span className="text-sm text-gray-500">
                  {meeting.time}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{meeting.company}</p>
              <p className="mt-1 text-sm text-gray-500">
                {formatDate(meeting.date)}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="ml-4"
            >
              {meeting.type === 'virtual' ? 'Rejoindre' : 'Voir détails'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}