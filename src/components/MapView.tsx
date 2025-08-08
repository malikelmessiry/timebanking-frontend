import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import type { Service } from '../services/api';
import 'leaflet/dist/leaflet.css';


// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  services: Service[];
  loading: boolean;
}

const MapView: React.FC<MapViewProps> = ({ services, loading }) => {
  if (loading) {
    return (
      <div className="map-loading">
        <p>Loading map...</p>
      </div>
    );
  }


// Filter services that have valid coordinates
const servicesWithCoords = services.filter(service => 
  service.latitude && service.longitude && 
  service.latitude !== 0 && service.longitude !== 0
);

if (servicesWithCoords.length === 0) {
  return (
    <div className="map-empty">
      <p>No services with location data found in this area.</p>
    </div>
  );
}

// Calculate center point (average of all coordinates)
const centerLat = servicesWithCoords.reduce((sum, service) => sum + service.latitude, 0) / servicesWithCoords.length;
const centerLng = servicesWithCoords.reduce((sum, service) => sum + service.longitude, 0) / servicesWithCoords.length;

return (
  <div className="map-container">
    <div className="map-info">
      <p>📍 Showing {servicesWithCoords.length} service{servicesWithCoords.length !== 1 ? 's' : ''} on map</p>
    </div>
    
    <MapContainer
      center={[centerLat, centerLng]}
      zoom={12}
      scrollWheelZoom={true}
      className="leaflet-map"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {servicesWithCoords.map((service) => (
        <Marker
          key={service.id}
          position={[service.latitude, service.longitude]}
        >
          <Popup maxWidth={300} className="service-popup">
            <div className="popup-content">
              <h4 className="popup-title">{service.name}</h4>
              <p className="popup-description">
                {service.description.length > 100 
                  ? `${service.description.substring(0, 100)}...` 
                  : service.description
                }
              </p>
              
              <div className="popup-meta">
                <div className="popup-rating">
                  ⭐ {service.average_rating > 0 ? service.average_rating.toFixed(1) : 'No ratings'}
                </div>
                <div className="popup-credits">
                  💰 {service.credit_required} credits
                </div>
              </div>
              
              <div className="popup-location">
                📍 {service.city}, {service.zip_code}
              </div>
              
              <div className="popup-categories">
                {service.category.map((cat, index) => (
                  <span key={index} className="popup-category">
                    {cat}
                  </span>
                ))}
              </div>
              
              <div className="popup-actions">
                <Link 
                  to={`/services/${service.id}`} 
                  className="popup-view-btn"
                >
                  View Details
                </Link>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  </div>
);
};

export default MapView;
