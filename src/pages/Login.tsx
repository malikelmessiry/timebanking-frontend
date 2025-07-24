import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (email: string, password: string) => {
    // TODO: Implement actual login logic with API call
    console.log('Login attempt:', { email, password });
    
    // For now, just navigate to dashboard (you'll create this later)
    // navigate('/dashboard');
    alert('Login functionality to be implemented with backend!');
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <h1>Log In to TimeBank</h1>
        <LoginForm onSubmit={handleLogin} />
        <p>
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}
