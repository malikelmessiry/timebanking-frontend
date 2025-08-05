import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getServiceById, getUserProfile } from '../services/api';
import type { Service } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/ServiceDetail.css';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  time_credits: number;
}

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [service, setService] = useState<Service | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    console.log('ServiceDetail mounted, id:', id);
    if (id) {
      loadServiceDetails();
      loadCurrentUser();
    } else {
      setError('No service ID provided');
      setLoading(false);
    }
  }, [id]);

  const loadServiceDetails = async () => {
    console.log('Loading service details for ID:', id);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No auth token found, redirecting to auth');
        navigate('/auth');
        return;
      }

      console.log('Fetching service by ID:', id);
      const serviceData = await getServiceById(token, id!);
      console.log('✅ Service loaded:', serviceData);
      
      setService(serviceData);
    } catch (error: any) {
      console.error('❌ Failed to load service details:', error);
      setError(error.message || 'Failed to load service details');
    }
  };

  const loadCurrentUser = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        console.log('No token for user profile');
        setLoading(false);
        return;
      }

      console.log('Loading current user...');
      const user = await getUserProfile(token);
      console.log('✅ Current user loaded:', user.email);
      setCurrentUser(user);
    } catch (error) {
      console.error('❌ Failed to load user profile:', error);
      // Don't set error here, just continue without user profile
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = async () => {
    if (!service || !currentUser) return;

    if (currentUser.time_credits < service.credit_required) {
      alert(`You need ${service.credit_required} credits but only have ${currentUser.time_credits} credits.`);
      return;
    }

    setBookingLoading(true);
    
    try {
      // TODO: Implement actual booking API call when backend supports it
      console.log('🎯 Booking service:', service.name);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      alert(`Successfully requested booking for "${service.name}"!\n\nThe provider (${service.owner_email}) will contact you soon to arrange the session details.`);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('❌ Booking failed:', error);
      alert('Failed to request booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleContactProvider = () => {
    if (!service) return;
    
    const subject = encodeURIComponent(`Inquiry about: ${service.name}`);
    const body = encodeURIComponent(`Hi,\n\nI'm interested in your service "${service.name}". Could you please provide more details about:\n\n- When you're available\n- What's included in the session\n- Any preparation needed\n\nThanks!\n\nBest regards`);
    
    const mailtoLink = `mailto:${service.owner_email}?subject=${subject}&body=${body}`;
    console.log('📧 Opening email to:', service.owner_email);
    window.open(mailtoLink);
  };

  // Add debug info
  console.log('🔄 ServiceDetail render - loading:', loading, 'error:', error, 'service:', service?.name);

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="service-detail-page">
          <div className="loading-state">
            <h2>📋 Loading Service Details...</h2>
            <p>Getting all the information for you</p>
            <p style={{ fontSize: '12px', color: 'rgba(99, 39, 19, 0.5)', marginTop: '16px' }}>
              Service ID: {id}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div>
        <Navbar />
        <div className="service-detail-page">
          <div className="error-state">
            <h2>⚠️ {error || 'Service Not Found'}</h2>
            <p>The service you're looking for doesn't exist or has been removed.</p>
            <div style={{ 
              fontSize: '12px', 
              color: 'rgba(99, 39, 19, 0.5)', 
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '8px'
            }}>
              <p>Debug Info:</p>
              <p>• Requested Service ID: {id}</p>
              <p>• Error: {error}</p>
            </div>
            <Link to="/services" className="back-btn" style={{ marginTop: '24px' }}>
              ← Back to Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = currentUser?.email === service.owner_email;
  const canBook = !isOwner && service.is_available && service.remaining_sessions > 0;
  const hasEnoughCredits = currentUser && currentUser.time_credits >= service.credit_required;

  return (
    <div>
      <Navbar />
      <div className="service-detail-page">
        <div className="service-detail-container">
          {/* Breadcrumb Navigation */}
          <div className="breadcrumb">
            <Link to="/services">Services</Link>
            <span>›</span>
            <span>{service.name}</span>
          </div>

          {/* Service Header */}
          <div className="service-detail-header">
            <div className="service-title-section">
              <h1 className="service-title">{service.name}</h1>
              <div className="service-status-badge">
                <span className={`status-dot ${service.is_available ? 'available' : 'unavailable'}`}></span>
                {service.is_available ? 'Available' : 'Unavailable'}
              </div>
            </div>

            <div className="service-credit-info">
              <div className="credit-display">
                <span className="credit-amount">{service.credit_required}</span>
                <span className="credit-label">credits per session</span>
              </div>
            </div>
          </div>

          <div className="service-detail-content">
            {/* Main Service Information */}
            <div className="service-main-info">
              {/* Service Description */}
              <div className="service-section">
                <h3>📋 About This Service</h3>
                <p className="service-full-description">{service.description}</p>
              </div>

              {/* Categories */}
              <div className="service-section">
                <h3>🏷️ Categories</h3>
                <div className="categories-list">
                  {service.category.map((cat, index) => (
                    <Link 
                      key={index} 
                      to={`/services?category=${cat}`}
                      className="category-link"
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {service.tags.length > 0 && (
                <div className="service-section">
                  <h3>🔖 Tags</h3>
                  <div className="tags-list">
                    {service.tags.map((tag, index) => (
                      <span key={index} className="tag-item">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Service Statistics */}
              <div className="service-section">
                <h3>📊 Service Details</h3>
                <div className="service-stats-grid">
                  <div className="stat-item">
                    <span className="stat-label">Sessions Available</span>
                    <span className="stat-value">{service.remaining_sessions} / {service.total_sessions}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Listed Date</span>
                    <span className="stat-value">{new Date(service.created_at).toLocaleDateString()}</span>
                  </div>
                  {service.average_rating > 0 && (
                    <div className="stat-item">
                      <span className="stat-label">Rating</span>
                      <span className="stat-value">⭐ {service.average_rating.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="stat-item">
                    <span className="stat-label">Service ID</span>
                    <span className="stat-value">#{service.id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="service-sidebar">
              {/* Provider Information */}
              <div className="provider-card">
                <h3>👤 Service Provider</h3>
                <div className="provider-info">
                  <div className="provider-avatar">
                    {service.owner_email.charAt(0).toUpperCase()}
                  </div>
                  <div className="provider-details">
                    <h4>{service.owner_email}</h4>
                    <p>Trusted Community Member</p>
                  </div>
                </div>

                <button 
                  onClick={handleContactProvider}
                  className="contact-btn"
                  title={`Send email to ${service.owner_email}`}
                >
                  ✉️ Contact Provider
                </button>
              </div>

              {/* Booking Section */}
              <div className="booking-card">
                <h3>📅 Book This Service</h3>
                
                {isOwner ? (
                  <div className="owner-notice">
                    <p>🏠 This is your service</p>
                    <p style={{ fontSize: '12px', color: 'rgba(99, 39, 19, 0.6)', marginTop: '8px' }}>
                      You can't book your own service
                    </p>
                  </div>
                ) : !service.is_available ? (
                  <div className="unavailable-notice">
                    <p>😞 This service is currently unavailable</p>
                    <p style={{ fontSize: '12px', color: 'rgba(99, 39, 19, 0.6)', marginTop: '8px' }}>
                      The provider has temporarily disabled bookings
                    </p>
                  </div>
                ) : service.remaining_sessions === 0 ? (
                  <div className="unavailable-notice">
                    <p>📅 No sessions available</p>
                    <p style={{ fontSize: '12px', color: 'rgba(99, 39, 19, 0.6)', marginTop: '8px' }}>
                      All sessions for this service have been booked
                    </p>
                  </div>
                ) : !currentUser ? (
                  <div className="unavailable-notice">
                    <p>🔐 Please log in to book</p>
                    <Link to="/auth" className="login-btn" style={{ 
                      display: 'block', 
                      marginTop: '12px',
                      padding: '10px',
                      background: 'linear-gradient(135deg, #f8a91f, #ec6426)',
                      color: '#632713',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      textAlign: 'center',
                      fontWeight: '500'
                    }}>
                      Go to Login
                    </Link>
                  </div>
                ) : !hasEnoughCredits ? (
                  <div className="insufficient-credits">
                    <p>⚠️ You need {service.credit_required} credits</p>
                    <p>You have: {currentUser.time_credits} credits</p>
                    <Link to="/dashboard" className="earn-credits-btn">
                      Earn More Credits
                    </Link>
                  </div>
                ) : (
                  <div className="booking-section">
                    <div className="booking-summary">
                      <div className="summary-row">
                        <span>Cost per session:</span>
                        <strong>{service.credit_required} credits</strong>
                      </div>
                      <div className="summary-row">
                        <span>Your balance:</span>
                        <strong>{currentUser.time_credits} credits</strong>
                      </div>
                      <div className="summary-row total">
                        <span>After booking:</span>
                        <strong>{currentUser.time_credits - service.credit_required} credits</strong>
                      </div>
                    </div>

                    <button 
                      onClick={handleBookService}
                      disabled={bookingLoading}
                      className="book-now-btn"
                    >
                      {bookingLoading ? '⏳ Booking...' : '🎯 Request Booking'}
                    </button>

                    <p className="booking-note">
                      💡 This will send a booking request to the provider. They will contact you to arrange the session details.
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <button 
                  onClick={() => {
                    const url = window.location.href;
                    if (navigator.share) {
                      navigator.share({ 
                        title: `${service.name} - TimeBank Service`, 
                        text: `Check out this service: ${service.name}`,
                        url 
                      });
                    } else {
                      navigator.clipboard.writeText(url).then(() => {
                        alert('Service link copied to clipboard!');
                      });
                    }
                  }}
                  className="share-btn"
                  title="Share this service"
                >
                  🔗 Share Service
                </button>
                
                <Link to="/services" className="back-to-services-btn">
                  ← Back to All Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}