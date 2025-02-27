import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useEffect } from 'react';
import { FaFlask, FaRocket, FaChartLine, FaBookOpen, FaLinkedin, FaEnvelope } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="hero-container">
      {/* Hero Section */}
      <header className="hero-section">
        <nav className="nav-container" aria-label="Main navigation">
          <div className="logo-container">
            <FaRocket className="logo-icon" />
            <span className="logo-text">JEEPreps</span>
          </div>
          <div className="nav-buttons">
            <Link to="/login" className="nav-login" aria-label="Login">Login</Link>
            <Link to="/register" className="nav-get-started" aria-label="Get started">Get Started</Link>
          </div>
        </nav>

        <div className="hero-content">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="main-heading"
          >
            Crack <span className="gradient-underline">JEE Mains</span> with Smart Practice
          </motion.h1>
          
          <p className="hero-description">
            Solve official JEE Mains questions from past years. Track your progress and boost your score.
          </p>

          <div className="cta-buttons">
            <Link to="/login" className="primary-cta" aria-label="Start free trial">
              <FaRocket className="cta-icon" />
              Start Solving Now
            </Link>
          </div>
        </div>


        <div className="hero-illustration">
          <div className="image-wrapper">
            <img 
              src="/images/ep-illn.jpg" 
              alt="Exam Interface Preview"
              className="preview-image"
            />
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="section-title">
            Solve Past JEE Questions & Boost Your Score
          </h2>

          <div className="features-grid">
            <FeatureCard 
              icon={<FaFlask className="feature-icon" />}
              title="Solve Real JEE Questions" 
              description="Practice official JEE Mains questions in a timed exam-like environment."
            />
            <FeatureCard 
              icon={<FaChartLine className="feature-icon" />}
              title="Know Your Strengths & Weaknesses"
              description="Track your progress with topic-wise analysis and performance insights. Focus on areas that need improvement."
            />
            <FeatureCard 
              icon={<FaBookOpen className="feature-icon" />}
              title="Personalized Insights"
              description="Get AI-powered performance analysis and tailored recommendations to maximize your score."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stats-grid">
            <StatItem number="900+" label="JEE Mains Questions" />
            <StatItem number="24/7" label="Instant Access" />
            <StatItem number="100+" label="Aspirants Joined" />
          </div>
        </div>
      </section>

      {/* Built By Section */}
      <section className="built-by-section">
        <div className="built-by-container">
          <h2 className="built-title">✅ Why This Works for JEE Aspirants?</h2>
          <p className="built-description">
            Created by <strong style={{ color: "#2563eb", fontSize: "1.2rem" }}>Aaryan Shah</strong>, an <strong>IIT (BHU)</strong> graduate who cracked <strong>JEE Mains & Advanced.</strong> 
          </p>
          <p>This platform brings you <strong>real JEE Mains questions</strong>, <strong>AI-driven performance insights</strong>, and <strong>smart analytics</strong> to improve faster.</p>

          {/* Social Links with Additional Text */}
          <p className="counseling-text">
            <p>Connect with Aaryan for FREE Counselling:</p>
          </p>
          <div className="social-links">
            <a href="https://www.linkedin.com/in/aaryan2shah/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FaLinkedin className="social-icon linkedin" />
            </a>
            <a href="mailto:shahaaryan.milan.mst20@iitbhu.ac.in" target="_blank" rel="noopener noreferrer" aria-label="Email">
              <FaEnvelope className="social-icon email" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="final-cta-section">
        <div className="final-cta-container">
          <h2 className="cta-title">Solve Real JEE Questions & Boost Your Score Today!</h2>
          <p className="cta-subtitle">
            Get instant access to real JEE Mains questions with detailed solutions. Track progress, improve faster!
          </p>
          <Link to="/login" className="final-cta-button" aria-label="Get started free">
            Start Solving Now!
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 }
      }}
      className="feature-card"
    >
      <div className="icon-container">{icon}</div>
      <h3 className="feature-title">{title}</h3>
      <p className="feature-description">{description}</p>
    </motion.div>
  );
};

const StatItem = ({ number, label }) => (
  <div className="stat-item">
    <div className="stat-number">{number}</div>
    <div className="stat-label">{label}</div>
  </div>
);

FeatureCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
};

StatItem.propTypes = {
  number: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired
};

export default LandingPage;
