import { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate } from "react-router-dom";

interface SignUpFormProps {
  onSubmit: (userData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => void;
  switchToLogin: () => void;
}

export default function SignUpForm({ onSubmit, switchToLogin }: SignUpFormProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');           
  const [state, setState] = useState('');         
  const [zipCode, setZipCode] = useState('');     
  const [bio, setBio] = useState('');            
  const [skills, setSkills] = useState(''); 
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const userData = {
        username,
        password,
        password2: confirmPassword,
        email,
        city,
        state,
        zip_code: zipCode,
        bio,
        skills
        // first_name: firstName,
        // last_name: lastName
      };

      const res = await registerUser(userData);
      console.log("User registered:", res);

      // Show success message
      alert('Registration successful! Please log in.');

      // Redirect to login tab
      switchToLogin();

      onSubmit?.({
        firstName,
        lastName,
        username,
        email,
        password,
        confirmPassword
      });
    } catch (err) {
      console.error("Registration failed", err);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="signup-form">
      <div className="form-group">
        <label htmlFor="firstName">First Name:</label>
        <input
          type="text"
          id="firstName"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="lastName">Last Name:</label>
        <input
          type="text"
          id="lastName"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="city">City:</label>
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
        <label htmlFor="state">State:</label>
        <input
          type="text"
          id="state"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="Enter your state"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="zipCode">Zip Code:</label>
        <input
          type="text"
          id="zipCode"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          placeholder="Enter your zip code"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="bio">Bio:</label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself (optional)"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="skills">Skills:</label>
        <textarea
          id="skills"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          placeholder="What skills do you have to offer? (e.g., tutoring, gardening, cooking)"
          rows={3}
        />
      </div>


      <button type="submit">Sign Up</button>
    </form>
  );
}
