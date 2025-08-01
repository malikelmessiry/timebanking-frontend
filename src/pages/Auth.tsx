import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';
import { loginUser, registerUser } from '../services/api';

export default function Auth() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();

  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      const result = await loginUser(data);
      console.log('Login successful:', result);

      // Store token in localStorage
      localStorage.setItem('authToken', result.token);

      // Redirect to dashboard after successful login
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      // Let LoginForm handle error display
      throw error;
    }
  };

  const handleSignup = async (userData: any) => {
    try {
      console.log('Signup attempt:', userData);
      
      // Call the registration API
      const result = await registerUser(userData);
      console.log('Registration successful:', result);

      // If backend returns token on registration, store it and redirect
      if (result.token) {
        localStorage.setItem('authToken', result.token);
        navigate('/dashboard');
      } else {
        // Otherwise, switch to login tab for user to sign in
        setActiveTab('login');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      // Re-throw so SignUpForm can handle the error
      throw error;
    }
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
