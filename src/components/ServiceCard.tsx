import { Link } from 'react-router-dom';
import type { Service } from '../services/api';
import '../styles/ServiceCard.css';

interface ServiceCardProps {
  service: Service;
  onBook?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  viewMode?: 'grid' | 'list';
  isOwner?: boolean;
}

export default function ServiceCard({ 
  service, 
  onBook, 
  onEdit, 
  onDelete, 
  showActions = true, 
  viewMode = 'grid',
  isOwner = false 
}: ServiceCardProps) {

  const handleBookClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onBook) onBook();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  return (
    <div className={`service-card ${viewMode} ${!service.is_available ? 'unavailable' : ''}`}>
      <Link to={`/services/${service.id}`} className="service-card-link">
        {/* Service Header */}
        <div className="service-header">
          <h3 className="service-name">{service.name}</h3>
          <div className="service-credit">
            <span className="credit-amount">{service.credit_required}</span>
            <span className="credit-label">credits</span>
          </div>
        </div>

        {/* Service Meta Info */}
        <div className="service-meta">
          <div className="service-provider">
            <span className="provider-label">by</span>
            <span className="provider-email">{service.owner_email}</span>
          </div>
          
          <div className="service-stats">
            {service.average_rating > 0 && (
              <div className="rating">
                <span className="rating-stars">⭐</span>
                <span className="rating-value">{service.average_rating.toFixed(1)}</span>
              </div>
            )}
            
            <div className="sessions-info">
              <span className="sessions-remaining">{service.remaining_sessions}</span>
              <span className="sessions-total">/{service.total_sessions} left</span>
            </div>
          </div>
        </div>

        {/* Service Description */}
        <p className="service-description">
          {service.description.length > 120 
            ? `${service.description.substring(0, 120)}...` 
            : service.description
          }
        </p>

        {/* Categories */}
        <div className="service-categories">
          {service.category.slice(0, 3).map((cat, index) => (
            <span key={index} className="category-tag">
              {cat}
            </span>
          ))}
          {service.category.length > 3 && (
            <span className="category-more">+{service.category.length - 3} more</span>
          )}
        </div>

        {/* Service Type */}
        <div className='service-meta'>
          <div className='service-categories'>
            {service.category.map((cat, index) => (
              <span key={index} className='category-tag'>{cat}</span>
            ))}
          </div>

          <div className='service-type'>
            <span className={`service-type-badge ${service.service_type}`}>
              {service.service_type === 'virtual' ? '💻' : '🏠'}
              {service.service_type === 'virtual' ? 'Virtual' : 'In-Person'}
            </span>
          </div>
        </div>

        {/* Tags */}
        {service.tags.length > 0 && (
          <div className="service-tags">
            {service.tags.slice(0, 4).map((tag, index) => (
              <span key={index} className="service-tag">
                #{tag}
              </span>
            ))}
            {service.tags.length > 4 && (
              <span className="tag-more">+{service.tags.length - 4}</span>
            )}
          </div>
        )}

        {/* Availability Status */}
        <div className="service-status">
          <span className={`status-indicator ${service.is_available ? 'available' : 'unavailable'}`}>
            {service.is_available ? '🟢 Available' : '🔴 Unavailable'}
          </span>
          <span className="service-date">
            Listed {new Date(service.created_at).toLocaleDateString()}
          </span>
        </div>
      </Link>

      {/* Action Buttons */}
      {showActions && (
        <div className="service-actions" onClick={(e) => e.stopPropagation()}>
          {isOwner ? (
            // Owner actions
            <>
              <button 
                onClick={handleEditClick}
                className="action-btn edit-btn"
                title="Edit Service"
              >
                ✏️ Edit
              </button>
              <button 
                onClick={handleDeleteClick}
                className="action-btn delete-btn"
                title="Delete Service"
              >
                🗑️ Delete
              </button>
            </>
          ) : (
            // User actions
            <>
              {service.is_available && service.remaining_sessions > 0 ? (
                <button 
                  onClick={handleBookClick}
                  className="action-btn book-btn"
                  title="Book This Service"
                >
                  📅 Book Now
                </button>
              ) : (
                <button 
                  className="action-btn book-btn disabled"
                  disabled
                  title="Service Not Available"
                >
                  😞 Unavailable
                </button>
              )}
              <Link 
                to={`/services/${service.id}`}
                className="action-btn view-btn"
                title="View Details"
              >
                👁️ Details
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
