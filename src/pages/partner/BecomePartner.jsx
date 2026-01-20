import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './BecomePartner.module.css';

const BecomePartner = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  // Auto-rotate steps for visual interest
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const benefits = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'Expand Your Reach',
      description: 'Connect with thousands of travelers across Botswana looking for reliable bus services.'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M8 21H16M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      title: 'Smart Dashboard',
      description: 'Manage bookings, routes, and schedules from a powerful operator dashboard.'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      title: 'Real-Time Updates',
      description: 'Keep passengers informed with live tracking and instant notifications.'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'Secure Payments',
      description: 'Receive payments directly with our secure, automated payment processing system.'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: 'Dedicated Support',
      description: '24/7 partner support to help you optimize operations and grow your business.'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M18 9L13 14L9 10L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="18" cy="9" r="2" fill="currentColor"/>
        </svg>
      ),
      title: 'Analytics & Insights',
      description: 'Access detailed reports on bookings, revenue, and passenger trends.'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Apply Online',
      description: 'Fill out our quick application form with your company details and fleet information.'
    },
    {
      number: '02',
      title: 'Verification',
      description: 'Our team reviews your application and verifies your operating licenses and safety certifications.'
    },
    {
      number: '03',
      title: 'Onboarding',
      description: 'Get set up with training, dashboard access, and personalized support from our partner team.'
    },
    {
      number: '04',
      title: 'Go Live',
      description: 'Start receiving bookings and grow your business with GoGoBus travelers.'
    }
  ];

  const testimonials = [
    {
      quote: "Joining GoGoBus was the best decision for our business. We've seen a 40% increase in bookings since partnering with them.",
      author: 'Thabo Molefe',
      company: 'Kalahari Express',
      avatar: 'TM'
    },
    {
      quote: "The dashboard makes managing our routes so easy. Real-time updates keep our passengers happy and informed.",
      author: 'Boitumelo Phiri',
      company: 'Delta Coaches',
      avatar: 'BP'
    },
    {
      quote: "Professional support team and reliable payment processing. GoGoBus truly understands what operators need.",
      author: 'Kagiso Ndaba',
      company: 'Northern Star Transport',
      avatar: 'KN'
    }
  ];

  const stats = [
    { value: '500+', label: 'Active Routes' },
    { value: '50K+', label: 'Monthly Passengers' },
    { value: '25+', label: 'Partner Operators' },
    { value: '4.8', label: 'Average Rating' }
  ];

  const handleApply = () => {
    // Navigate to partner application or open a modal
    // For now, we'll just navigate to a hypothetical apply page
    navigate('/partner/apply');
  };

  return (
    <div className={`${styles.partnerPage} ${isLoaded ? styles.loaded : ''}`}>
      {/* Background decorations */}
      <div className={styles.bgDecorations}>
        <div className={styles.bgCircle1}></div>
        <div className={styles.bgCircle2}></div>
        <div className={styles.bgPattern}></div>
      </div>

      {/* Header / Navigation */}
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Back</span>
        </button>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🚌</span>
          <span className={styles.logoText}>GoGoBus</span>
          <span className={styles.partnerBadge}>Partners</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.badgePulse}></span>
            Now accepting new partners
          </div>
          <h1 className={styles.heroTitle}>
            Grow Your Bus Business with <span className={styles.highlight}>GoGoBus</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Join Botswana's leading bus booking platform and reach thousands of travelers looking for reliable transportation. Simple onboarding, powerful tools, exceptional support.
          </p>
          <div className={styles.heroCtas}>
            <button className={styles.primaryCta} onClick={handleApply}>
              <span>Become a Partner</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className={styles.secondaryCta} onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}>
              Learn More
            </button>
          </div>
        </div>
        
        {/* Hero Image / Illustration */}
        <div className={styles.heroVisual}>
          <div className={styles.busIllustration}>
            <div className={styles.busBody}>
              <div className={styles.busWindow}></div>
              <div className={styles.busWindow}></div>
              <div className={styles.busWindow}></div>
              <div className={styles.busDoor}></div>
            </div>
            <div className={styles.busWheels}>
              <div className={styles.wheel}></div>
              <div className={styles.wheel}></div>
            </div>
            <div className={styles.busRoad}></div>
          </div>
          <div className={styles.floatingStats}>
            <div className={styles.floatingStat}>
              <span className={styles.statIcon}>📈</span>
              <span>+40% Bookings</span>
            </div>
            <div className={styles.floatingStat}>
              <span className={styles.statIcon}>⭐</span>
              <span>4.8 Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard} style={{ '--delay': `${index * 0.1}s` }}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefitsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Why Partner With Us</span>
          <h2 className={styles.sectionTitle}>Everything You Need to Succeed</h2>
          <p className={styles.sectionSubtitle}>
            We provide the tools, technology, and support to help your bus business thrive
          </p>
        </div>
        
        <div className={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className={styles.benefitCard}
              style={{ '--delay': `${index * 0.1}s` }}
            >
              <div className={styles.benefitIcon}>{benefit.icon}</div>
              <h3 className={styles.benefitTitle}>{benefit.title}</h3>
              <p className={styles.benefitDescription}>{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={styles.howItWorksSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Getting Started</span>
          <h2 className={styles.sectionTitle}>How It Works</h2>
          <p className={styles.sectionSubtitle}>
            Join our network in just a few simple steps
          </p>
        </div>

        <div className={styles.stepsContainer}>
          <div className={styles.stepsLine}></div>
          {steps.map((step, index) => (
            <div 
              key={index} 
              className={`${styles.stepCard} ${activeStep === index ? styles.activeStep : ''}`}
              style={{ '--delay': `${index * 0.15}s` }}
              onClick={() => setActiveStep(index)}
            >
              <div className={styles.stepNumber}>
                <span>{step.number}</span>
              </div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonialsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Partner Stories</span>
          <h2 className={styles.sectionTitle}>What Our Partners Say</h2>
        </div>

        <div className={styles.testimonialsGrid}>
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className={styles.testimonialCard}
              style={{ '--delay': `${index * 0.1}s` }}
            >
              <div className={styles.quoteIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 7H7C5.89543 7 5 7.89543 5 9V13C5 14.1046 5.89543 15 7 15H9V17C9 18.1046 8.10457 19 7 19H6C5.44772 19 5 19.4477 5 20C5 20.5523 5.44772 21 6 21H7C9.20914 21 11 19.2091 11 17V9C11 7.89543 10.1046 7 9 7H11ZM21 7H17C15.8954 7 15 7.89543 15 9V13C15 14.1046 15.8954 15 17 15H19V17C19 18.1046 18.1046 19 17 19H16C15.4477 19 15 19.4477 15 20C15 20.5523 15.4477 21 16 21H17C19.2091 21 21 19.2091 21 17V9C21 7.89543 20.1046 7 19 7H21Z"/>
                </svg>
              </div>
              <p className={styles.testimonialQuote}>{testimonial.quote}</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}>{testimonial.avatar}</div>
                <div className={styles.authorInfo}>
                  <span className={styles.authorName}>{testimonial.author}</span>
                  <span className={styles.authorCompany}>{testimonial.company}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className={styles.previewSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTag}>Operator Dashboard</span>
          <h2 className={styles.sectionTitle}>Powerful Tools at Your Fingertips</h2>
        </div>
        
        <div className={styles.dashboardPreview}>
          <div className={styles.previewMockup}>
            <div className={styles.mockupHeader}>
              <div className={styles.mockupDots}>
                <span></span><span></span><span></span>
              </div>
              <span className={styles.mockupTitle}>GoGoBus Operator Dashboard</span>
            </div>
            <div className={styles.mockupContent}>
              <div className={styles.mockupSidebar}>
                <div className={styles.sidebarItem}></div>
                <div className={styles.sidebarItem}></div>
                <div className={styles.sidebarItem}></div>
                <div className={styles.sidebarItem}></div>
              </div>
              <div className={styles.mockupMain}>
                <div className={styles.mockupChart}></div>
                <div className={styles.mockupCards}>
                  <div className={styles.mockupCard}></div>
                  <div className={styles.mockupCard}></div>
                  <div className={styles.mockupCard}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Grow Your Business?</h2>
          <p className={styles.ctaSubtitle}>
            Join the GoGoBus partner network today and start reaching more travelers across Botswana.
          </p>
          <button className={styles.ctaButton} onClick={handleApply}>
            <span>Request Operator Account</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <p className={styles.ctaNote}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Free to join • No hidden fees • Quick approval
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>© 2025 GoGoBus. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <a href="/terms">Terms</a>
            <a href="/privacy">Privacy</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BecomePartner;
