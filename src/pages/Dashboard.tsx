import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserProfile, getAllServices, getMyServices, deleteService, getBookings, confirmBooking, cancelBooking, completeBooking } from '../services/api';
import type { Service, Booking } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';

interface User {
  id?: number; 
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

  const navigate = useNavigate();

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
    } else if (user && !user.email) {
      console.error('User profile missing email:', user);
      setServicesError('User profile is missing email. Please log out and log back in.');
    }
  }, [user]);

  const loadAllServicesData = async () => {
    if (!user || !user.email) { 
      setServicesError('User email is required to load services');
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

      console.log('🔍 Loading services for user email:', user.email);

      const [allServicesData, myServicesData, bookings] = await Promise.all([
        getAllServices(token),
        getMyServices(token, user.email),
        getBookings(token)
      ]);

      console.log('All services loaded:', allServicesData.length);
      console.log('My services loaded:', myServicesData.length);
      console.log('Bookings loaded:', bookings.length);

      setAllServices(allServicesData);
      setMyServices(myServicesData);
      setAllBookings(bookings);
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

  const handleBookingAction = async (bookingId: number, action: 'confirm' | 'cancel' | 'complete') => {
    if (!bookingId) return;

    setActionLoading(prev => ({ ...prev, [bookingId]: action }));

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Please log in again');
      }

      let updatedBooking: Booking;
    
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

      console.log(`Booking action completed:`, updatedBooking);

      // Update bookings list
      setAllBookings(prev => 
        prev.map(booking => 
          booking.id === bookingId ? updatedBooking : booking
        )
      );

      // Show success message
      const actionText = action === 'complete' ? 'completed' : `${action}ed`;
      alert(`🎉 Booking ${actionText} successfully!\n\nBooking ID: #${updatedBooking.id}\nNew Status: ${updatedBooking.status}`);

    } catch (error: any) {
      console.error(`❌ Failed to ${action} booking:`, error);
      alert(`❌ Failed to ${action} booking\n\n${error.message}`);
    } finally {
      setActionLoading(prev => {
        const newState = { ...prev };
        delete newState[bookingId];
        return newState;
      });
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
        <h1>TimeBank Dashboard</h1>
        
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
                    <h3>Total Services</h3>
                    <p>{allServices.length}</p>
                  </div>

                  <div className='stat-card'>
                    <h3>Pending Requests</h3>
                    <p>2</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                  <h3>Quick Actions</h3>
                  <Link to="/services/create" className="action-btn">+ Offer New Service</Link>
                  <Link to="/services" className="action-btn">Browse All Services</Link>
                  <button onClick={() => setActiveTab('services')} className="action-btn">
                    Manage My Services
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className='services-section'>
              <h2>My Services</h2>
              
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
                        <span className='rate'>{service.credit_required} credits</span>
                        <span className={`status ${service.is_available ? 'available' : 'unavailable'}`}>
                          {service.is_available ? 'Available' : 'Unavailable'}
                        </span>
                        <span className='sessions'>
                          {service.remaining_sessions}/{service.total_sessions} sessions left
                        </span>
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
                <h3>Recent Requests</h3>
                <div className='booking-filters'>
                  <button>Pending</button>
                  <button>Accepted</button>
                  <button>Completed</button>
                  <button>Cancelled</button>
                </div>
                
                <div className='service-requests-list'>
                  {/* This would be populated with real request data */}
                  <div className='booking-card incoming'>
                    <div className="request-header">
                      <h4>Service Request</h4>
                      <span className="service-badge">Your Service</span>
                    </div>
                    <p>No pending requests</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className='bookings-section'>
              <h2>My Bookings</h2>
              <p className="section-description">Services you've booked from others</p>
              
              <div className='booking-filters'>
                <button>Pending</button>
                <button>Confirmed</button>
                <button>Completed</button>
                <button>Cancelled</button>
              </div>
              
              <div className='bookings-list'>
                <div className='booking-card outgoing'>
                  <div className="request-header">
                    <h4>No bookings yet</h4>
                    <span className="client-badge">You booked</span>
                  </div>
                  <p>Browse services to make your first booking</p>
                  <div className='booking-actions'>
                    <Link to="/services">Browse Services</Link>
                  </div>
                </div>
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
              <div className='history-list'>
                <p>No transaction history yet</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
