import { Link, useNavigate } from 'react-router-dom';
import SignUpForm from '../components/SignUpForm';

export default function Signup() {
  const navigate = useNavigate();

  const handleSignup = (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    // TODO: Implement actual signup logic with API call
    console.log('Signup attempt:', userData);
    
    // For now, just navigate to login page
    // navigate('/login');
    alert('Signup functionality to be implemented with backend!');
  };

  return (
    <div className="signup-page">
      <div className="auth-container">
        <h1>Sign Up for TimeBank</h1>
        <SignUpForm onSubmit={handleSignup} />
        <p>
          Already have an account? <Link to="/login">Log in here</Link>
        </p>
      </div>
    </div>
  );
}
