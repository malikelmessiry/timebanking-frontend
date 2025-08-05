import { Link } from 'react-router-dom';
import { Service } from '../services/api';
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
      <Link to={`/services/${service.id}`} className='service-card-link'>
        {/* service header */}
        <div className='service-header'>
          <h3 className='service-name'>{service.name}</h3>
          <div className='service-credit'>
            <span className='credit-amount'>{service.credit_required}</span>
            <span className='credit-label'>credits</span>
          </div>
        </div>


        
      </Link>
    </div>
  )
}