import { Link } from 'react-router-dom';
import '../styles/Home.css';
import doodle1 from '../assets/Doodle Images/Cartwheel Joy with Blue Star.png'; // adjust path as needed

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-container">
          <h1 className="hero-title fredericka-the-great-regular">Welcome to TimeBank</h1>
          <p className="hero-subtitle">Trade your time, share your skills, grow your community</p>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="features-container">
          <h2 className="features-title">How TimeBank Works</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Offer Services</h3>
              <p className="feature-description">Share your skills and earn time credits</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3 className="feature-title">Request Help</h3>
              <p className="feature-description">Find community members who can help you</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌱</div>
              <h3 className="feature-title">Build Community</h3>
              <p className="feature-description">Connect with neighbors and build lasting relationships</p>
            </div>
          </div>
        </div>
      </div>

      {/* Community Section */}
      <div className="community-section">
        <div className="community-container">
          <p className="community-description">
            Join thousands of community members already sharing their time and skills
          </p>
        </div>
      </div>

      <div className="cta-section">
        <div className="cta-container">
          <Link to="/auth" className="hero-cta">
            Join the TimeBank
          </Link>
        </div>
      </div>

      <img
        src={doodle1}
        alt="Decorative doodle"
        className="home-doodle"
        style={{
          position: 'absolute',
          top: '80px',
          right: '180px',
          width: '120px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    </div>
  );
}
