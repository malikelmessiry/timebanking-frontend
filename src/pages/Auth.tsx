import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';
import { loginUser } from '../services/api';

export default function Auth() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  const handleLogin = async (username: string, password: string) => {
    try {
      const result = await loginUser({ username, password });
      console.log('Login successful:', result);

       // Store token in localStorage (or use a more secure method)
      localStorage.setItem('authToken', result.token);

      // Redirect to dashboard or home page after successful login
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  const handleSignup = (userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    console.log('Signup attempt:', userData);
  };

  const switchToLogin = () => {
    setActiveTab('login');
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-container">
        <div className="auth-tabs">
          <button
            className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Log In
          </button>
          <button
            className={`tab-button ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'login' ? (
            <div>
              <h2>Welcome Back</h2>
              <LoginForm onSubmit={handleLogin} />
              <div className="forgot-links">
                <p><a href="/forgot-login">Forgot login info?</a></p>
              </div>
            </div>
          ) : (
            <div>
              <h2>Create Account</h2>
                <SignUpForm onSubmit={handleSignup} switchToLogin={switchToLogin} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
