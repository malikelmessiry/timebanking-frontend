import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserProfile } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Dashboard.css';

interface User {
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
        <p>Failed to load user profile</p>
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
                    <h3>Active Services</h3>
                    <p>3</p>
                  </div>

                  <div className='stat-card'>
                    <h3>Pending Requests</h3>
                    <p>2</p>
                  </div>

                  <div className='stat-card'>
                    <h3>Unread Messages</h3>
                    <p>1</p>
                  </div>
                </div>

                {/* OPTIONAL: Quick Actions */}
                <div className="quick-actions">
                  <h3>Quick Actions</h3>
                  <button onClick={() => setActiveTab('services')}>
                    Manage Services
                  </button>
                  <button onClick={() => setActiveTab('bookings')}>
                    View Bookings
                  </button>
                  <Link to="/discover">Find Services</Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className='services-section'>
              <h2>My Services</h2>
              
              {/* Services you offer */}
              <div className="section-header">
                <h3>Services I Offer</h3>
                <button className='add-service-btn'>+ Offer New Service</button>
              </div>
              
              <div className='services-list'>
                <div className='service-card'>
                  <h3>Math Tutoring</h3>
                  <p>Help with Algebra and Calculus</p>
                  <span className='rate'>1 hour</span>
                  <div className='service-actions'>
                    <button>Edit</button>
                    <button>Pause</button>
                  </div>
                </div>
              </div>

              {/* Booking requests for your services */}
              <div className="service-requests-section">
                <h3>Booking Requests for My Services</h3>
                <div className='booking-filters'>
                  <button>All</button>
                  <button>Pending</button>
                  <button>Accepted</button>
                  <button>Completed</button>
                  <button>Cancelled</button>
                </div>
                
                <div className='service-requests-list'>
                  <div className='booking-card incoming'>
                    <div className="request-header">
                      <h4>Math Tutoring Request</h4>
                      <span className="service-badge">Your Service</span>
                    </div>
                    <p>from Dehui H.</p>
                    <span className='date'>Sep 5, 2025 - 3:00 PM</span>
                    <span className='status pending'>Awaiting your response</span>
                    <div className='booking-actions'>
                      <button className='accept'>Accept</button>
                      <button className='decline'>Decline</button>
                      <button>Message</button>
                    </div>
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
                <button>All</button>
                <button>Pending</button>
                <button>Confirmed</button>
                <button>Completed</button>
                <button>Cancelled</button>
              </div>
              
              <div className='bookings-list'>
                <div className='booking-card outgoing'>
                  <div className="request-header">
                    <h4>Tarot Reading</h4>
                    <span className="client-badge">You booked</span>
                  </div>
                  <p>with Natasha</p>
                  <span className='date'>Sep 2, 2025 - 8:00 AM</span>
                  <span className='status pending'>Pending approval</span>
                  <div className='booking-actions'>
                    <button>Message</button>
                    <button>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className='messages-section'>
              <h2>Messages</h2>
              <div className='messages-list'>
                <div className='message-card'>
                  <h3>Natasha Gaye</h3>
                  <p>Hi! Looking forward to our reading...</p>
                  <span className='time'>2 hours ago</span>
                  <span className='unread'>•</span>
                </div>
                {/* more message cards */}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className='history-section'>
              <h2>Transaction History</h2>
              <div className='history-list'>
                <div className='history-card'>
                  <h3>Yoga Class</h3>
                  <p>with Mikaela B.</p>
                  <span className='date'>June 3, 2025</span>
                  <span className='credits spent'>-1 hour</span>
                </div>
                {/* more history cards */}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
