import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../services/api';

interface User {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  time_credits: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
    <div className='dashboard'>
      <h1>TimeBank Dashboard</h1>
      <div className='user-welcome'>
        <h2>Hello, {user.username}</h2>
        <p>Welcome back to your TimeBank account TESTTTT</p>

        <div className='dashboard-stats'>
          <div className='stat-card'>
            <h3>Time Credits</h3>
            <p>{user.time_credits || 0} hours</p>
          </div>

          <div className='stat-card'>
            <h3>Username</h3>
            <p>{user.username}</p>
          </div>

          <div className='stat-card'>
            <h3>Email</h3>
            <p>{user.email}</p>
          </div>

        </div>
      </div>
    </div>
  );
}