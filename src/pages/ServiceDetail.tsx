import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getServiceById, getUserProfile, createBooking } from '../services/api';
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
    if (id) {
      loadServiceDetails();
      loadCurrentUser();
    } else {
      setError('No service ID provided');
      setLoading(false);
    }
  }, [id]);

  const loadServiceDetails = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/auth');
        return;
      }

      const serviceData = await getServiceById(token, Number(id));
      
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
        setLoading(false);
        return;
      }

      const user = await getUserProfile(token);
      setCurrentUser(user);
    } catch (error) {
      console.error('❌ Failed to load user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = async () => {
    if (!service || !currentUser) return;

    // Validation checks
    if (currentUser.time_credits < service.credit_required) {
      alert(`Insufficient Credits\n\nYou need ${service.credit_required} credits but only have ${currentUser.time_credits} credits.\n\nPlease offer your own services to earn more credits!`);
      return;
    }

    if (service.remaining_sessions <= 0) {
      alert(`No Sessions Available\n\nThis service has no remaining sessions.\n\nPlease check back later or browse other services.`);
      return;
    }

    // Confirmation dialog
    const confirmed = window.confirm(
      `📅 Confirm Booking\n\n` +
      `Service: ${service.name}\n` +
      `Provider: ${service.owner_email}\n` +
      `Cost: ${service.credit_required} credits\n\n` +
      `Your balance will be: ${currentUser.time_credits - service.credit_required} credits\n\n` +
      `Are you sure you want to book this service?`
    );

    if (!confirmed) return;

    setBookingLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please log in to book services');
      }

      const booking = await createBooking(token, service.id);
      
      // Safely handle the status
      const statusText = booking?.status 
        ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1)
        : 'Pending';

      // Show success message with booking details
      alert(
        `🎉 Booking Successful!\n\n` +
        `Service: ${service.name}\n` +
        `Status: ${statusText}\n\n` +
        `The provider (${service.owner_email}) will be notified and will contact you soon to arrange the session details.\n\n` +
        `You can view your booking status in your dashboard.`
      );

      // Redirect to dashboard to see the new booking
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Booking failed:', error);
      
      // Show specific error messages
      if (error.message.includes('credits')) {
        alert(`Booking Failed\n\nInsufficient credits. Please earn more credits by offering your own services.`);
      } else if (error.message.includes('sessions')) {
        alert(`Booking Failed\n\nNo sessions available. This service may have been fully booked recently.`);
      } else if (error.message.includes('Session expired')) {
        alert(`Session Expired\n\nPlease log in again to book services.`);
        navigate('/auth');
      } else {
        alert(`Booking Failed\n\n${error.message}\n\nPlease try again or contact support if the problem persists.`);
      }
    } finally {
      setBookingLoading(false);
    }
  };

  const handleContactProvider = () => {
    if (!service) return;
    
    const subject = encodeURIComponent(`Inquiry about: ${service.name}`);
    const body = encodeURIComponent(`Hi,\n\nI'm interested in your service "${service.name}". Could you please provide more details about:\n\n- When you're available\n- What's included in the session\n- Any preparation needed\n\nThanks!\n\nBest regards`);
    
    const mailtoLink = `mailto:${service.owner_email}?subject=${subject}&body=${body}`;
    window.open(mailtoLink);
  };

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
                </div>
              </div>

              {/* Reviews Section */}
              <div className="service-section reviews-section">
                <h3>📝 Customer Reviews</h3>
                
                {!service?.customer_reviews || service.customer_reviews.length === 0 ? (
                  <div className="no-reviews">
                    <p>No reviews yet. Be the first to book and review this service!</p>
                  </div>
                ) : (
                  <>
                    <div className="reviews-summary">
                      <div className="average-rating">
                        <span className="rating-number">
                          {service.average_rating ? service.average_rating.toFixed(1) : 'N/A'}
                        </span>
                        <div className="stars">
                          {service.average_rating ? (
                            Array.from({ length: 5 }, (_, i) => (
                              <span 
                                key={i} 
                                className={i < Math.round(service.average_rating) ? 'star filled' : 'star'}
                              >
                                ⭐
                              </span>
                            ))
                          ) : (
                            <span className="no-rating">No ratings yet</span>
                          )}
                        </div>
                        <span className="review-count">
                          ({service.customer_reviews.length} review{service.customer_reviews.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>

                    <div className="reviews-list">
                      {service.customer_reviews.map((review, index) => (
                        <div key={index} className="review-card">
                          <div className="review-header">
                            <div className="reviewer-info">
                              <div className="reviewer-avatar">
                                {index + 1}
                              </div>
                              <div className="reviewer-details">
                                <strong className="reviewer-name">Customer #{index + 1}</strong>
                                <span className="review-date">Verified Review</span>
                              </div>
                            </div>
                            <div className="rating">
                              {Array.from({ length: 5 }, (_, i) => (
                                <span 
                                  key={i} 
                                  className={i < Math.round(service.average_rating) ? 'star filled' : 'star'}
                                >
                                  ⭐
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="review-text">
                            <p>"{review}"</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
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
                      {bookingLoading ? '⏳ Creating Booking...' : '🎯 Book Now'}
                    </button>

                    <p className="booking-note">
                      💡 This will create a booking request. The provider will be notified and can confirm your booking.
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