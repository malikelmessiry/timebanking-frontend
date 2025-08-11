import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getUserProfile, getAllServices, deleteService, getBookings, confirmBooking, cancelBooking, completeBooking, getServicesByOwner, completeBookingWithReview } from '../services/api';
import type { Service, Booking } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';

interface User {
  id: number; 
  first_name: string;
  last_name: string;
  email: string; 
  username: string;
  time_credits: number;
}

type DashboardTab = 'overview' | 'services' | 'bookings' | 'messages' | 'history';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const [myServices, setMyServices] = useState<Service[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);

  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [actionLoading, setActionLoading] = useState<{ [key: number]: string }>({});
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('pending');
  const [customerBookingFilter, setCustomerBookingFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('pending');

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState<number | null>(null);
  const [reviewServiceName, setReviewServiceName] = useState('');
  const [reviewData, setReviewData] = useState({ rating: 5, review: '' });

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          // Redirect to login if no token
          navigate('/auth');
          return;
        }

        const profile = await getUserProfile(token);
        setUser(profile);
      } catch (error) {
        console.error('Failed to load profile:', error);
        // Token might be invalid, redirect to login
        localStorage.removeItem('authToken');
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [navigate]);

  useEffect(() => {
    if (user && user.email) {
      loadAllServicesData();
      loadBookings(); 
    } else if (user && !user.email) {
      console.error('User profile missing email:', user);
      setServicesError('User profile is missing email. Please log out and log back in.');
    }
  }, [user, searchParams]);

  // Handle tab switching from URL:
  useEffect(() => {
    const tab = searchParams.get('tab') as DashboardTab;
    if (tab && ['overview', 'services', 'bookings', 'messages', 'history'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const loadAllServicesData = async () => {
    if (!user || !user.id) { 
      setServicesError('User ID is required to load services');
      return;
    }

    setServicesLoading(true);
    setServicesError(null);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setServicesError('No authentication token found');
        navigate('/auth');
        return;
      }

      const [allServicesData, myServicesData] = await Promise.all([
        getAllServices(token), // excludes my services
        getServicesByOwner(token, user.id), // my services
      ]);

      setAllServices(allServicesData);
      setMyServices(myServicesData);

    } catch (error) {
      console.error('Services loading error:', error);
      const errorMessage = typeof error === 'object' && error !== null && 'message' in error
        ? String((error as { message?: unknown }).message)
        : String(error);

      setServicesError(`Failed to load services: ${errorMessage}`);
      
      if (errorMessage.includes('Session expired') || errorMessage.includes('401')) {
        localStorage.removeItem('authToken');
        navigate('/auth');
      }
    } finally {
      setServicesLoading(false);
    }
  };

  const loadBookings = async () => {
    if (!user || !user.id) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/auth');
        return;
      }

      // Get both bookings where user is owner and customer
      const [ownerBookings, customerBookings] = await Promise.all([
        getBookings(token, `owner_id=${user.id}`).catch(_ => {
          return []; // Return empty array if fails
        }),
        getBookings(token, `customer_id=${user.id}`).catch(_ => {
          return []; // Return empty array if fails
        })
      ]);

      // Combine and deduplicate bookings
      const allBookingsData = [...ownerBookings, ...customerBookings];
      const uniqueBookings = allBookingsData.filter((booking, index, self) => 
        index === self.findIndex(b => b.id === booking.id)
      );

      setAllBookings(uniqueBookings);

    } catch (error) {
      console.error('Failed to load bookings:', error);
      setAllBookings([]);
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;

      await deleteService(token, serviceId);

      setMyServices(prev => prev.filter(service => service.id !== serviceId));
      setAllServices(prev => prev.filter(service => service.id !== serviceId));

      alert('Service deleted successfully');
    } catch (error) {
      console.error('Failed to delete service:', error);
      alert('Failed to delete service');
    }
  };

  const handleBookingAction = async (bookingId: number, action: 'confirm' | 'cancel' | 'complete', reviewData?: { rating: number; review: string }) => {
    if (!bookingId) return;

    setActionLoading(prev => ({ ...prev, [bookingId]: action }));

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please log in again');
      }

      let updatedBooking: Booking;
    
      if (action === 'complete' && reviewData) {
        // Add rating and review when completing
        updatedBooking = await completeBookingWithReview(token, bookingId, reviewData.rating, reviewData.review);
      } else {
        switch (action) {
          case 'confirm':
            updatedBooking = await confirmBooking(token, bookingId);
            break;
          case 'cancel':
            updatedBooking = await cancelBooking(token, bookingId);
            break;
          case 'complete':
            updatedBooking = await completeBooking(token, bookingId);
            break;
          default:
            throw new Error('Invalid action');
        }
      }

      console.log(`Booking action completed:`, updatedBooking);

      // Update bookings list
      setAllBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId ? updatedBooking : booking
        )
      );

      // Show success message
      const actionText = action === 'complete' ? 'completed' : `${action}ed`;
      alert(`🎉 Booking ${actionText} successfully!`);

    } catch (error: any) {
      console.error(`Failed to ${action} booking:`, error);
      alert(`Failed to ${action} booking\n\n${error.message}`);
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[bookingId];
        return newState;
      });
    }
  };

  const openReviewModal = (bookingId: number, serviceName: string) => {
    setReviewBookingId(bookingId);
    setReviewServiceName(serviceName);
    setReviewData({ rating: 5, review: '' });
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setReviewBookingId(null);
    setReviewServiceName('');
    setReviewData({ rating: 5, review: '' });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewBookingId) return;

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please log in again');
      }

      console.log('🎯 Submitting review for booking:', reviewBookingId); // Debug
      const updatedBooking = await completeBookingWithReview(token, reviewBookingId, reviewData.rating, reviewData.review);
      console.log('✅ Review submitted, updated booking:', updatedBooking); // Debug

      // Update bookings list
      setAllBookings(prev => {
        const newBookings = prev.map(booking => 
          booking.id === reviewBookingId ? updatedBooking : booking
        );
        console.log('🔄 Updated bookings state:', newBookings); // Debug
        return newBookings;
      });

      alert('🎉 Review submitted and booking completed!');
      closeReviewModal();

      // Force refresh of bookings to ensure UI updates
      setTimeout(() => {
        loadBookings();
      }, 500);

    } catch (error: any) {
      console.error('Failed to submit review:', error);
      alert(`Failed to submit review: ${error.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f8a91f';
      case 'confirmed': return '#72ac43';
      case 'completed': return '#4a90e2';
      case 'cancelled': return '#e74c3c';
      default: return '#632713';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'completed': return '🎉';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <div className='dashboard'>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='dashboard'>
        <p>Failed to load user dashboard</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className='dashboard'>
        {/* <h1>TimeBank Dashboard</h1> */}
        
        {/* Dashboard Navigation Tabs */}
        <div className='dashboard-tabs'>
          <button
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}>
            Overview
          </button>

          <button 
            className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            My Services
          </button>

          <button 
            className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            Bookings
          </button>

          <button 
            className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Messages
          </button>

          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {/* Tab Content */}
        <div className='dashboard-content'>
          {activeTab === 'overview' && (
            <div className='overview-section'>
              <div className='user-welcome'>
                <h2>Hello, {user.first_name || user.username}!</h2>
                <p>Welcome back to your TimeBank account</p>

                <div className='dashboard-stats'>
                  <div className='stat-card'>
                    <h3>Time Credits</h3>
                    <p>{user.time_credits || 0} hours</p>
                  </div>

                  <div className='stat-card'>
                    <h3>My Services</h3>
                    <p>{myServices.length}</p>
                  </div>

                  <div className='stat-card'>
                    <h3>My Bookings</h3>
                    <p>{allBookings.filter(b => b.customer_email === user.email).length}</p>
                  </div>

                  <div className='stat-card'>
                    <h3>Service Requests</h3>
                    <p>{allBookings.filter(b => b.owner_email === user.email && b.status === 'pending').length}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className='services-section'>
              {/* <h2>My Services</h2> */}
              
              {/* Services you offer */}
              <div className="section-header">
                <h3>Services I Offer ({myServices.length})</h3>
                <Link to='/services/create' className='add-service-btn'>+ Offer New Service</Link>
              </div>

              {servicesLoading ? (
                <p>Loading your services...</p>
              ) : servicesError ? (
                <p className="error">{servicesError}</p>
              ) : myServices.length === 0 ? (
                <div className="empty-state">
                  <p>You haven't created any services yet.</p>
                  <Link to="/services/create" className="cta-button">
                    Create Your First Service
                  </Link>
                </div>
              ) : (
                <div className='services-list'>
                  {myServices.map((service) => (
                    <div key={service.id} className='service-card'>
                      <h3>{service.name}</h3>
                      <p>{service.description}</p>
                      <div className="service-meta">
                        <span className='rate'>
                          {service.credit_required
                          } credits
                        </span>
                        <span className='rating'>
                          ⭐ {service.average_rating ? service.average_rating.toFixed(1) : 'No ratings'}
                        </span>
                        {/* <span className={`status ${service.is_available ? 'available' : 'unavailable'}`}>
                          {service.is_available ? 'Available' : 'Unavailable'}
                        </span> */}
                      </div>
                      <div className="service-tags">
                        {service.category.map((cat, index) => (
                          <span key={index} className="category-tag">{cat}</span>
                        ))}
                        {service.tags.map((tag, index) => (
                          <span key={index} className="service-tag">{tag}</span>
                        ))}
                      </div>
                      <div className='service-actions'>
                        <Link to={`/services/${service.id}/edit`}>Edit</Link>
                        <button onClick={() => handleDeleteService(service.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Booking requests for your services */}
              <div className="service-requests-section">
                <h3>Service Requests ({allBookings.filter(b => b.owner_email === user.email).length})</h3>
                <div className='booking-filters'>
                  <button 
                    className={bookingFilter === 'pending' ? 'active' : ''}
                    onClick={() => setBookingFilter('pending')}
                  >
                    Pending ({allBookings.filter(b => b.owner_email === user.email && b.status === 'pending').length})
                  </button>
                  <button 
                    className={bookingFilter === 'confirmed' ? 'active' : ''}
                    onClick={() => setBookingFilter('confirmed')}
                  >
                    Confirmed ({allBookings.filter(b => b.owner_email === user.email && b.status === 'confirmed').length})
                  </button>
                  <button 
                    className={bookingFilter === 'completed' ? 'active' : ''}
                    onClick={() => setBookingFilter('completed')}
                  >
                    Completed ({allBookings.filter(b => b.owner_email === user.email && b.status === 'completed').length})
                  </button>
                  <button 
                    className={bookingFilter === 'all' ? 'active' : ''}
                    onClick={() => setBookingFilter('all')}
                  >
                    All ({allBookings.filter(b => b.owner_email === user.email).length})
                  </button>
                </div>
                
                <div className='service-requests-list'>
                  {(() => {
                    // Filter bookings based on selected filter
                    const serviceRequests = allBookings.filter(b => b.owner_email === user.email);
                    const filteredRequests = bookingFilter === 'all' 
                      ? serviceRequests 
                      : serviceRequests.filter(b => b.status === bookingFilter);

                    if (filteredRequests.length === 0) {
                      return (
                        <div className='booking-card incoming'>
                          <div className="request-header">
                            <h4>No {bookingFilter === 'all' ? 'service requests' : bookingFilter + ' requests'} yet</h4>
                            <span className="service-badge">Your Service</span>
                          </div>
                        </div>
                      );
                    }

                    return filteredRequests.map(booking => (
                      <div key={booking.id} className='booking-card incoming'>
                        <div className="request-header">
                          {/* <h4>Service Request</h4> */}
                          <span className="service-badge">Your Service</span>
                        </div>
                        <p> <strong>{booking.service_name}</strong></p>
                        <p>booked by {booking.customer_first_name} ({booking.customer_email})</p>
                        <p>{getStatusIcon(booking.status)} {booking.status}</p>
                        <p>booked at {new Date(booking.booked_at).toLocaleDateString()}</p>
                        {booking.completed_at && (
                          <p>completed at {new Date(booking.completed_at).toLocaleDateString()}</p>
                        )}
                        {booking.customer_rating && (
                          <p><strong>Rating:</strong> ⭐ {booking.customer_rating}/5</p>
                        )}
                        {booking.customer_review && (
                          <p><strong>Review:</strong> "{booking.customer_review}"</p>
                        )}

                        <div className='booking-actions'>
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleBookingAction(booking.id, 'confirm')}
                                disabled={actionLoading[booking.id] === 'confirm'}
                                className='confirm-btn'
                              >
                                {actionLoading[booking.id] === 'confirm' ? '⏳ Confirming...' : '✅ Confirm'}
                              </button>
                              <button
                                onClick={() => handleBookingAction(booking.id, 'cancel')}
                                disabled={actionLoading[booking.id] === 'cancel'}
                                className='cancel-btn'
                              >
                                {actionLoading[booking.id] === 'cancel' ? '⏳ Declining...' : '❌ Decline'}
                              </button>
                            </>
                          )}

                          {/* Show completion info if already completed */}
                          {booking.status === 'completed' && (
                            <div className="completed-info">
                              <p>✅ Service completed by customer</p>
                              {booking.customer_rating && (
                                <p>Rating received: ⭐ {booking.customer_rating}/5</p>
                              )}
                            </div>
                          )}

                          <button
                            onClick={() => window.open(`mailto:${booking.customer_email}?subject=Booking: ${booking.service_name}`)}
                            className="contact-btn"
                          >
                            ✉️ Contact Customer
                          </button>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className='bookings-section'>
              {/* <h2>My Bookings</h2> */}
              <p>Services you've booked from other providers</p>
              
              {/* Add filter buttons */}
              <div className='booking-filters'>
                <button 
                  className={customerBookingFilter === 'pending' ? 'active' : ''}
                  onClick={() => setCustomerBookingFilter('pending')}
                >
                  Pending ({allBookings.filter(b => b.customer_email === user.email && b.status === 'pending').length})
                </button>
                <button 
                  className={customerBookingFilter === 'confirmed' ? 'active' : ''}
                  onClick={() => setCustomerBookingFilter('confirmed')}
                >
                  Confirmed ({allBookings.filter(b => b.customer_email === user.email && b.status === 'confirmed').length})
                </button>
                <button 
                  className={customerBookingFilter === 'completed' ? 'active' : ''}
                  onClick={() => setCustomerBookingFilter('completed')}
                >
                  Completed ({allBookings.filter(b => b.customer_email === user.email && b.status === 'completed').length})
                </button>
                <button 
                  className={customerBookingFilter === 'all' ? 'active' : ''}
                  onClick={() => setCustomerBookingFilter('all')}
                >
                  All ({allBookings.filter(b => b.customer_email === user.email).length})
                </button>
              </div>
              
              <div className='bookings-list'>
                {
                  (() => {
                    // Filter customer bookings
                    const customerBookings = allBookings.filter(b => b.customer_email === user.email);
                    const filteredBookings = customerBookingFilter === 'all' 
                      ? customerBookings 
                      : customerBookings.filter(b => b.status === customerBookingFilter);

                    if (filteredBookings.length === 0) {
                      return <p>No {customerBookingFilter === 'all' ? 'bookings' : customerBookingFilter + ' bookings'} yet</p>;
                    }

                    return filteredBookings.map((b) => (
                      <div key={b.id} className='booking-card outgoing'>
                        <div className='request-header'>
                          <h4>{b.service_name}</h4>
                          <span className='status-badge' style={{ backgroundColor: getStatusColor(b.status), color: 'white', padding: '4px 8px', borderRadius: '4px' }}>
                            {getStatusIcon(b.status)} {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                          </span>
                        </div>
                        <p>offered by {b.owner_first_name} ({b.owner_email})</p>
                        <p>booked at {new Date(b.booked_at).toLocaleDateString()}</p>

                        <div className='booking-actions'>
                          {b.status === 'pending' && (
                            <button
                              onClick={() => handleBookingAction(b.id, 'cancel')}
                              disabled={actionLoading[b.id] === 'cancel'}
                              className='cancel-btn'
                            >
                              {actionLoading[b.id] === 'cancel' ? '⏳ Cancelling...' : '❌ Cancel'}</button>
                          )}

                          {/* Review button for confirmed bookings */}
                          {b.status === 'confirmed' && (
                            <button
                              onClick={() => openReviewModal(b.id, b.service_name)}
                              className="complete-btn"
                            >
                              📝 Service Complete?
                            </button>
                          )}

                          {/* Show review if already completed */}
                          {b.status === 'completed' && b.customer_rating && (
                            <div className="completed-review">
                              <p>Your review: ⭐ {b.customer_rating}/5</p>
                              {b.customer_review && <p>"{b.customer_review}"</p>}
                            </div>
                          )}

                          <button
                            onClick={() => window.open(`mailto:${b.owner_email}?subject=Booking: ${b.service_name}`)}
                            className="contact-btn"
                          >
                            ✉️ Contact Provider
                          </button>
                        </div>
                      </div>
                    ));
                  })()
                }
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className='messages-section'>
              <h2>Messages</h2>
              <div className='messages-list'>
                <p>No messages yet</p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className='history-section'>
              <h2>Transaction History</h2>
              <p>All your completed services and bookings</p>
              
              <div className='history-list'>
                {(() => {
                  // Get all completed transactions
                  const completedServiceRequests = allBookings.filter(b => 
                    b.owner_email === user.email && b.status === 'completed'
                  );
                  const completedBookings = allBookings.filter(b => 
                    b.customer_email === user.email && b.status === 'completed'
                  );

                  // Combine and sort by completion date
                  const allCompletedTransactions = [
                    ...completedServiceRequests.map(booking => ({
                      ...booking,
                      transaction_type: 'service_provided' as const,
                      credits_earned: myServices.find(s => s.name === booking.service_name)?.credit_required || 0
                    })),
                    ...completedBookings.map(booking => ({
                      ...booking,
                      transaction_type: 'service_received' as const,
                      credits_spent: allServices.find(s => s.name === booking.service_name)?.credit_required || 
                                    myServices.find(s => s.name === booking.service_name)?.credit_required || 0
                    }))
                  ].sort((a, b) => 
                    new Date(b.completed_at || b.booked_at).getTime() - 
                    new Date(a.completed_at || a.booked_at).getTime()
                  );

                  if (allCompletedTransactions.length === 0) {
                    return (
                      <div className="empty-state">
                        <p>No completed transactions yet</p>
                        <p>Complete services or bookings to see your history here</p>
                      </div>
                    );
                  }

                  return allCompletedTransactions.map((transaction) => (
                    <div key={`${transaction.transaction_type}-${transaction.id}`} className={`history-card ${transaction.transaction_type}`}>
                      <div className="history-header">
                        <h4>{transaction.service_name}</h4>
                        <div className="transaction-badges">
                          <span className={`transaction-type ${transaction.transaction_type}`}>
                            {transaction.transaction_type === 'service_provided' ? '💼 Service Provided' : '🛍️ Service Received'}
                          </span>
                          <span className="credits-badge">
                            {transaction.transaction_type === 'service_provided' 
                              ? `+${transaction.credits_earned} credits`
                              : `-${transaction.credits_spent} credits`
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div className="history-details">
                        <p>
                          <strong>
                            {transaction.transaction_type === 'service_provided' ? 'Customer:' : 'Provider:'}
                          </strong> 
                          {transaction.transaction_type === 'service_provided' 
                            ? `${transaction.customer_first_name} (${transaction.customer_email})`
                            : `${transaction.owner_first_name} (${transaction.owner_email})`
                          }
                        </p>
                        <p><strong>Completed:</strong> {new Date(transaction.completed_at || transaction.booked_at).toLocaleDateString()}</p>
                        
                        {/* Show rating and review for services you provided */}
                        {transaction.transaction_type === 'service_provided' && transaction.customer_rating && (
                          <div className="received-review">
                            <p><strong>Rating received:</strong> ⭐ {transaction.customer_rating}/5</p>
                            {transaction.customer_review && (
                              <p><strong>Review:</strong> "{transaction.customer_review}"</p>
                            )}
                          </div>
                        )}
                        
                        {/* Show rating and review for services you received */}
                        {transaction.transaction_type === 'service_received' && transaction.customer_rating && (
                          <div className="given-review">
                            <p><strong>Your rating:</strong> ⭐ {transaction.customer_rating}/5</p>
                            {transaction.customer_review && (
                              <p><strong>Your review:</strong> "{transaction.customer_review}"</p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="history-actions">
                        <button
                          onClick={() => window.open(`mailto:${
                            transaction.transaction_type === 'service_provided' 
                              ? transaction.customer_email 
                              : transaction.owner_email
                          }?subject=Follow-up: ${transaction.service_name}`)}
                          className="contact-btn small"
                        >
                          ✉️ Contact
                        </button>
                        
                        {transaction.transaction_type === 'service_provided' && (
                          <Link 
                            to={`/services/${myServices.find(s => s.name === transaction.service_name)?.id}`}
                            className="view-service-btn small"
                          >
                            👁️ View Service
                          </Link>
                        )}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Review Modal */}
          {showReviewModal && (
            <div className="modal-overlay" onClick={closeReviewModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Rate & Review: {reviewServiceName}</h3>
                  <button className="modal-close" onClick={closeReviewModal}>×</button>
                </div>
                
                <form onSubmit={handleReviewSubmit} className="review-form">
                  <div className="rating-section">
                    <label>Rating (required) *</label>
                    <div className="stars-container">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${star <= reviewData.rating ? 'filled' : ''}`}
                          onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                    <p className="rating-text">{reviewData.rating}/5 stars</p>
                  </div>
                  
                  <div className="review-section">
                    <label htmlFor="review">Review (optional)</label>
                    <textarea
                      id="review"
                      value={reviewData.review}
                      onChange={(e) => setReviewData(prev => ({ ...prev, review: e.target.value }))}
                      placeholder="Share your experience with this service..."
                      rows={4}
                      className="review-textarea"
                    />
                  </div>
                  
                  <div className="modal-actions">
                    <button type="button" onClick={closeReviewModal} className="cancel-btn">
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      Submit Review & Complete
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}