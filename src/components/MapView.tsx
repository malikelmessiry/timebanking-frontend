import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import type { Service } from '../services/api';
import 'leaflet/dist/leaflet.css';

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

  // filter services that have valid coordinates
  const servicesWithCoords = services.filter(service => 
    service.latitude && service.longitude && 
    service.latitude !== 0 && service.longitude !== 0
  );

  // offset coordinates to fix duplicates
  const servicesWithUniqueCoords = servicesWithCoords.map((service, index) => {
    // find how many services before this one have the same coordinates
    const duplicatesBefore = servicesWithCoords.slice(0, index).filter(s => 
      Math.abs(s.latitude - service.latitude) < 0.0001 && 
      Math.abs(s.longitude - service.longitude) < 0.0001
    ).length;
    
    if (duplicatesBefore > 0) {
      // create a small offset in a circular pattern
      const angle = (duplicatesBefore * 2 * Math.PI) / 8; // distribute around circle
      const offsetDistance = 0.002; // small offset distance
      
      return {
        ...service,
        latitude: service.latitude + Math.cos(angle) * offsetDistance,
        longitude: service.longitude + Math.sin(angle) * offsetDistance,
        isOffset: true
      };
    }
    
    return { ...service, isOffset: false };
  });

  console.log('🗺️ MapView: Original services:', servicesWithCoords.length);
  console.log('🗺️ MapView: Services after offset:', servicesWithUniqueCoords.length);
  
  // // Debug: Show which services got offset
  // const offsetServices = servicesWithUniqueCoords.filter(s => s.isOffset);
  // if (offsetServices.length > 0) {
  //   console.log('🗺️ Services with coordinate offsets:', offsetServices.map(s => s.name));
  // }

  if (servicesWithUniqueCoords.length === 0) {
    return (
      <div className="map-empty">
        <p>No services with location data found in this area.</p>
      </div>
    );
  }

  // calculate center point (average of all coordinates)
  const centerLat = servicesWithUniqueCoords.reduce((sum, service) => sum + service.latitude, 0) / servicesWithUniqueCoords.length;
  const centerLng = servicesWithUniqueCoords.reduce((sum, service) => sum + service.longitude, 0) / servicesWithUniqueCoords.length;

  return (
    <div className="map-container">
      <div className="map-info">
        <div style={{
          backgroundColor: '#f8f9fa', 
          padding: '10px', 
          borderRadius: '6px', 
          border: '1px solid #e9ecef',
          marginBottom: '10px'
        }}>
          <p style={{margin: 0, fontSize: '14px'}}>
            📍 Showing {servicesWithUniqueCoords.length} service{servicesWithUniqueCoords.length !== 1 ? 's' : ''} with approximate locations
          </p>
          <p style={{margin: '5px 0 0 0', fontSize: '13px', color: '#666'}}>
            Exact addresses are shared after booking for privacy
          </p>
        </div>
      </div>
      
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={10}
        scrollWheelZoom={true}
        className="leaflet-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {servicesWithUniqueCoords.map((service) => (
          <Marker
            key={service.id}
            position={[service.latitude, service.longitude]}
          >
            <Popup maxWidth={300} className="service-popup">
              <div className="popup-content">
                <h4 className="popup-title">
                  {service.name}
                  {service.isOffset && <span style={{fontSize: '12px', color: '#666'}}> *</span>}
                </h4>
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
                
                {service.isOffset && (
                  <div style={{fontSize: '11px', color: '#666', marginTop: '5px'}}>
                    * Marker position slightly adjusted for visibility
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
