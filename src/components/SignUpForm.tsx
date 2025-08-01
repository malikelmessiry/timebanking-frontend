import { useState } from "react";
import { validateRegistrationData, parseInterests } from "../utilities/validation";

interface SignUpFormProps {
  onSubmit: (userData: any) => Promise<void>; 
  switchToLogin: () => void;
}

export default function SignUpForm({ onSubmit, switchToLogin }: SignUpFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [street, setStreet] = useState('');       
  const [city, setCity] = useState('');           
  const [state, setState] = useState('');         
  const [zipCode, setZipCode] = useState('');     
  const [bio, setBio] = useState('');            
  const [skills, setSkills] = useState(''); 
  const [interests, setInterests] = useState('');
  
  // Add error handling
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    const formData = {
      email,
      password,
      password2: confirmPassword,  
      first_name: firstName,      
      last_name: lastName,        
      street,
      city,
      state,
      zip_code: zipCode,          // Backend expects zip_code
      bio: bio || '',
      skills: skills || '',
      interests: parseInterests(interests), // Convert to array
    };

    // Frontend validation first
    const validation = validateRegistrationData({
      email,
      password,
      password2: confirmPassword,
      first_name: firstName,
      last_name: lastName,
      street,
      city,
      state,
      zip_code: zipCode,
      interests,
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsLoading(false);
      return; // Don't send to backend if validation fails
    }

    try {
      await onSubmit(formData);  // Let the parent handle the API call
      // Success is handled by parent component
    } catch (error: any) {
      console.error("Registration failed", error);
      setErrors([error.message]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="signup-form">
      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="error-messages">
          {errors.map((error, index) => (
            <div key={index} className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          ))}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="firstName">First Name *</label>
        <input
          type="text"
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="lastName">Last Name *</label>
        <input
          type="text"
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
    
      <div className="form-group">
        <label htmlFor="email">Email *</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password *</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <small className="password-hint">
          Must be at least 8 characters long and not entirely numeric
        </small>
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password *</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="street">Street Address *</label>
        <input
          type="text"  // Fix: was type="street"
          id="street"
          value={street}
          onChange={(e) => setStreet(e.target.value)}  // Fix: was setCity
          placeholder="123 Main St"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="city">City *</label>
        <input
          type="text"
          id="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter your city"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="state">State *</label>
        <input
          type="text"
          id="state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="CA"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="zipCode">ZIP Code *</label>
        <input
          type="text"
          id="zipCode"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="12345"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="interests">Interests</label>
        <input
          type="text"
          id="interests"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="reading, gardening, cooking (separate with commas)"
        />
        <small className="hint">Optional - separate with commas</small>
      </div>

      <div className="form-group">
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself (optional)"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="skills">Skills</label>
        <textarea
          id="skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="What skills do you have to offer? (e.g., tutoring, gardening, cooking)"
          rows={3}
        />
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </button>

      <p>
        Already have an account?{' '}
        <button type="button" onClick={switchToLogin} className="link-button">
          Sign in here
        </button>
      </p>
    </form>
  );
}
