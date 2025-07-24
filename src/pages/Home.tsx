import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1>Welcome to Community TimeBanking</h1>
        <p>Trade your time, share your skills, grow your community</p>
        <div className="auth-buttons">
          <Link to="/auth" className="btn btn-primary btn-large">
            Join the TimeBank
          </Link>
        </div>
      </div>
      <div className="features">
        <h2>How TimeBank Works</h2>
        <div className="feature-grid">
          <div className="feature">
            <h3>Offer Services</h3>
            <p>Share your skills and earn time credits</p>
          </div>
          <div className="feature">
            <h3>Request Help</h3>
            <p>Find community members who can help you</p>
          </div>
          <div className="feature">
            <h3>Build Community</h3>
            <p>Connect with neighbors and build lasting relationships</p>
          </div>
        </div>
      </div>
    </div>
  );
}
