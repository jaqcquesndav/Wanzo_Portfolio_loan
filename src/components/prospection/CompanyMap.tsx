import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Company } from '../../types/company';
import { useFormatCurrency } from '../../hooks/useFormatCurrency';

// Position de Goma
const GOMA_POSITION: [number, number] = [-1.6777, 29.2285];

// Configuration du marker personnalisé
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Positions fictives autour de Goma pour les entreprises
const getRandomPosition = (): [number, number] => {
  const lat = GOMA_POSITION[0] + (Math.random() - 0.5) * 0.05;
  const lng = GOMA_POSITION[1] + (Math.random() - 0.5) * 0.05;
  return [lat, lng];
};

interface CompanyMapProps {
  companies: Company[];
  onSelectCompany: (company: Company) => void;
}

export function CompanyMap({ companies, onSelectCompany }: CompanyMapProps) {
  const { formatCurrency } = useFormatCurrency();
  
  useEffect(() => {
    // Fix for default marker icons in production build
    // @ts-expect-error - _getIconUrl is a private property but needs to be deleted for the leaflet workaround
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }, []);

  return (
    <div className="h-[calc(100vh-16rem)] w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden z-0">
      <MapContainer
        center={GOMA_POSITION}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {companies.map((company) => (
          <Marker
            key={company.id}
            position={getRandomPosition()}
            icon={customIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-medium text-lg mb-2">{company.name}</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Secteur:</span> {company.sector}</p>
                  <p><span className="font-medium">CA Annuel:</span> {formatCurrency(company.annual_revenue, undefined, 'USD')}</p>
                  <p><span className="font-medium">Employés:</span> {company.employee_count}</p>
                  <p><span className="font-medium">Croissance:</span> {company.financial_metrics.revenue_growth}%</p>
                </div>
                <button
                  onClick={() => onSelectCompany(company)}
                  className="mt-3 w-full px-3 py-1.5 bg-primary text-white rounded-md text-sm hover:bg-primary-dark transition-colors"
                >
                  Voir détails
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}