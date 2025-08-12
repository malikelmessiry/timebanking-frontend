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
  
  // error handling
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    const interestsArray = parseInterests(interests); // convert interests to array

    const formData = {
      email,
      password,
      password2: confirmPassword,  
      first_name: firstName,      
      last_name: lastName,        
      street,
      city,
      state,
      zip_code: zipCode,
      bio: bio || '',
      skills: skills || '',       
      interests: interestsArray, 
    };

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
      return; 
    }

    try {
      await onSubmit(formData); 
    } catch (error: any) {
      console.error("Registration failed", error);
      setErrors([error.message]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit}>
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

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName">
            first name <span className="required-asterisk">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="lastName">
            last name <span className="required-asterisk">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group full-width">
        <label htmlFor="email">
          email <span className="required-asterisk">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="form-group full-width">
        <label htmlFor="address">
          address <span className="required-asterisk">*</span>
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={street}
          onChange={(e) => setStreet(e.target.value)}  // Fix: was setCity
          placeholder="123 Main St"
          required
        />
      </div>

      {/* City, State, Zip in three columns */}
      <div className="form-row three-col">
        <div className="form-group">
          <label htmlFor="city">
            city <span className="required-asterisk">*</span>
          </label>
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
          <label htmlFor="state">
            state <span className="required-asterisk">*</span>
          </label>
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
          <label htmlFor="zipCode">
            zip code <span className="required-asterisk">*</span>
          </label>
          <input
            type="text"
            id="zipCode"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="12345"
            required
          />
        </div>
      </div>

      {/* Password fields in a row */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="password">
            password <span className="required-asterisk">*</span>
          </label>
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
          <label htmlFor="confirmPassword">
            confirm password <span className="required-asterisk">*</span>
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Bio - full width */}
      <div className="form-group full-width">
        <label htmlFor="bio">bio</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself (optional)"
          rows={3}
        />
      </div>

      {/* Skills and Interests */}
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="skills">skills</label>
          <textarea
            id="skills"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Describe your skills and abilities"
            rows={3}
          />
          <small className="hint">
            💡 Describe your skills in your own words
          </small>
          <small className="example">
            Example: I'm great at cooking Italian food and teaching math to kids
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="interests">interests</label>
          <textarea
            id="interests"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="music, sports, reading, photography"
            rows={3}
          />
          <small className="hint">
            Enter your interests separated by commas
          </small>
          <small className="example">
            Example: music, sports, reading, travel
          </small>
        </div>
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
