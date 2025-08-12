import { Link } from 'react-router-dom';
import '../styles/Home.css';

import doodle1 from '../assets/Doodle Images/Cartwheel Joy with Blue Star.png';
import doodle2 from '../assets/Doodle Images/Business.png';
import doodle3 from '../assets/Doodle Images/Dog Sitting Chat.png';
import doodle4 from '../assets/Doodle Images/HandyPerson.png';
import doodle5 from '../assets/Doodle Images/Malik the Illustrator.png';
import doodle6 from '../assets/Doodle Images/Mixing:Mastering.png';
import doodle7 from '../assets/Doodle Images/Musician.png';
import doodle8 from '../assets/Doodle Images/PC Artist.png';
import doodle9 from '../assets/Doodle Images/Photog.png';
import doodle10 from '../assets/Doodle Images/Pottery.png';

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-container">
          <h1 className="hero-title">Welcome to TimeBank</h1>
          <p className="hero-subtitle">Trade your time, share your skills, grow your community</p>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="features-container">
          <h2 className="features-title">How the TimeBank Works</h2>
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
            Join our community members that are sharing their time and skills
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

      {/* Doodle Images - scattered, not behind text/containers */}
      <img
        src={doodle1}
        alt="Decorative doodle 1"
        className="home-doodle"
        style={{
          position: 'absolute',
          top: '80px',
          right: '180px',
          width: '120px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <img
        src={doodle2}
        alt="Decorative doodle 2"
        className="home-doodle"
        style={{
          position: 'absolute',
          top: '120px',
          left: '60px',
          width: '100px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <img
        src={doodle3}
        alt="Decorative doodle 3"
        className="home-doodle"
        style={{
          position: 'absolute',
          top: '400px',
          left: '100px',
          width: '110px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <img
        src={doodle4}
        alt="Decorative doodle 4"
        className="home-doodle"
        style={{
          position: 'absolute',
          top: '600px',
          right: '80px',
          width: '90px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <img
        src={doodle5}
        alt="Decorative doodle 5"
        className="home-doodle"
        style={{
          position: 'absolute',
          top: '200px',
          right: '60px',
          width: '100px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <img
        src={doodle6}
        alt="Decorative doodle 6"
        className="home-doodle"
        style={{
          position: 'absolute',
          top: '500px',
          left: '34vw', // moved a little to the left
          width: '90px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <img
        src={doodle7}
        alt="Decorative doodle 7"
        className="home-doodle"
        style={{
          position: 'absolute',
          bottom: '60px',
          left: '5vw',
          width: '100px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <img
        src={doodle8}
        alt="Decorative doodle 8"
        className="home-doodle"
        style={{
          position: 'absolute',
          top: '300px',
          left: '70vw',
          width: '110px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <img
        src={doodle9}
        alt="Decorative doodle 9"
        className="home-doodle"
        style={{
          position: 'absolute',
          bottom: '60px',
          right: '10vw',
          width: '100px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <img
        src={doodle10}
        alt="Decorative doodle 10"
        className="home-doodle"
        style={{
          position: 'absolute',
          top: '850px',
          left: '50vw',
          width: '90px',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
    </div>
  );
}
