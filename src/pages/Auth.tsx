import { useState } from 'react';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';

export default function Auth() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const handleLogin = (email: string, password: string) => {
    console.log('Login attempt:', { email, password });
    // Handle login logic here
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
    // Handle signup logic here
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
              <SignUpForm onSubmit={handleSignup} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
