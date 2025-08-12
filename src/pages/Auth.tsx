import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';
import { loginUser, registerUser } from '../services/api';
import '../styles/Auth.css';

export default function Auth() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [successMessage, setSuccessMessage] = useState<string>(''); 
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
      throw error;
    }
  };

  const handleSignup = async (userData: any) => {
    try {
      console.log('Signup attempt:', userData);
      
      // Call the registration API
      const result = await registerUser(userData);
      console.log('Registration successful:', result);

      // Show success message and switch to login
      setSuccessMessage('Registration successful! Please log in with your new account.');
      setActiveTab('login');
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);

    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const switchToLogin = () => {
    setActiveTab('login');
    setSuccessMessage(''); 
  };

  const switchToSignup = () => {
    setActiveTab('signup');
    setSuccessMessage(''); 
  };

  return (
    <div className="auth-page-wrapper">
      <div className={`auth-container ${activeTab === 'signup' ? 'signup-active' : ''}`}>
        <div className="auth-tabs">
          <button
            className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
            onClick={switchToLogin}
          >
            Log In
          </button>
          <button
            className={`tab-button ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={switchToSignup}
          >
            Sign Up
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            {successMessage}
          </div>
        )}

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
