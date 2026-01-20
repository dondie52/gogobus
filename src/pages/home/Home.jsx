import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SearchForm from '../../components/home/SearchForm';
import PopularRoutes from '../../components/home/PopularRoutes';
import { logError } from '../../utils/logger';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activePromo, setActivePromo] = useState(0);

  // Hero slides with Botswana bus imagery
  const heroSlides = [
    {
      id: 1,
      title: 'GABORONE TO FRANCISTOWN',
      subtitle: 'Express Service',
      highlight: 'FROM P150',
      origin: 'Gaborone',
      destination: 'Francistown',
      destinations: ['Palapye', 'Serowe', 'Mahalapye', 'Nata'],
      schedule: 'Daily Departures',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&q=80',
      color: '#1B4D4A'
    },
    {
      id: 2,
      title: 'MAUN DELTA EXPRESS',
      subtitle: 'Gateway to the Okavango',
      highlight: 'NEW ROUTE',
      origin: 'Gaborone',
      destination: 'Maun',
      destinations: ['Nata', 'Kasane', 'Shorobe'],
      schedule: 'Mon, Wed, Fri, Sun',
      image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=1200&q=80',
      color: '#22C55E'
    },
    {
      id: 3,
      title: 'KASANE SAFARI LINK',
      subtitle: 'Chobe National Park',
      highlight: '20% OFF',
      origin: 'Gaborone',
      destination: 'Kasane',
      destinations: ['Victoria Falls', 'Livingstone'],
      schedule: 'Every Day',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80',
      color: '#F5A623'
    }
  ];

  // Partner bus companies
  const partners = [
    { name: 'Seabelo Express', initials: 'SE', color: '#2563EB' },
    { name: 'Maun Coaches', initials: 'MC', color: '#059669' },
    { name: 'Eagle Liner', initials: 'EL', color: '#DC2626' },
    { name: 'Cross Country', initials: 'CC', color: '#7C3AED' },
    { name: 'Intercape', initials: 'IC', color: '#0891B2' },
    { name: 'BotswanaRail', initials: 'BR', color: '#EA580C' }
  ];

  // Features
  const features = [
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
          <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
          <path d="M6 15H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      title: 'Flexible Payments',
      description: 'Pay with Orange Money, MyZaka, or bank cards. We have you fully covered.'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M22 16.92V19.92C22 20.4704 21.5504 21 21 21H20C14.477 21 10 16.523 10 11V10C10 9.44957 10.5496 9 11.1 9H14.1C14.6504 9 15.1 9.44957 15.1 10C15.1 10.8267 15.2733 11.6133 15.6 12.32L14.8 13.12C14.4134 13.5066 14.4134 14.1334 14.8 14.52L16.48 16.2C16.8666 16.5866 17.4934 16.5866 17.88 16.2L18.68 15.4C19.3867 15.7267 20.1733 15.9 21 15.9C21.5504 15.9 22 16.3496 22 16.9V16.92Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 2V4M10 2V4M18 2V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M3 8H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <rect x="3" y="4" width="18" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
        </svg>
      ),
      title: 'Great Customer Care',
      description: 'Get excellent customer service available 7:00 AM to 9:00 PM, via phone, chat or email.'
    },
    {
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      title: 'Enjoy Convenience',
      description: 'Book anytime from the convenience of your office, home, school, or market.'
    }
  ];

  useEffect(() => {
    // #region agent log
    // #endregion
    const loadUserProfile = async () => {
      if (user?.id) {
        try {
          const profile = await profileService.getProfile(user.id);
          setUserProfile(profile);
        } catch (error) {
          // #region agent log
          // #endregion
          logError('Failed to load user profile', error);
        }
      }
      setLoading(false);
      setTimeout(() => setIsLoaded(true), 100);
    };
    loadUserProfile();
    return () => {
      // #region agent log
      // #endregion
    };
  }, [user]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate hero slides
  useEffect(() => {
    const heroTimer = setInterval(() => {
      setActivePromo((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(heroTimer);
  }, [heroSlides.length]);

  const handleSearch = (searchData) => {
    // #region agent log
    // #endregion
    try {
      const params = new URLSearchParams({
        from: searchData.origin,
        to: searchData.destination,
        date: searchData.date,
        passengers: searchData.passengers?.toString() || '1',
      });
      navigate(`/search?${params.toString()}`);
    } catch (error) {
      // #region agent log
      // #endregion
      throw error;
    }
  };

  const handleBookNow = (slide) => {
    // Use origin and destination from slide data, or try to parse from title as fallback
    let origin, destination;
    
    if (slide.origin && slide.destination) {
      origin = slide.origin;
      destination = slide.destination;
    } else {
      // Fallback: try to parse from title (e.g., "GABORONE TO FRANCISTOWN")
      const parts = slide.title.split(/\s+TO\s+/i);
      if (parts.length === 2) {
        origin = parts[0].trim().charAt(0) + parts[0].trim().slice(1).toLowerCase();
        destination = parts[1].trim().charAt(0) + parts[1].trim().slice(1).toLowerCase();
      } else {
        // If we can't parse, don't navigate
        return;
      }
    }
    
    const today = new Date().toISOString().split('T')[0];
    handleSearch({
      origin,
      destination,
      date: today,
      passengers: 1,
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getGreetingEmoji = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return '☀️';
    if (hour < 17) return '🌤️';
    return '🌙';
  };

  const formatDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingLogo}>
            <span className={styles.logoText}>GOGOBUS</span>
          </div>
          <LoadingSpinner size="large" />
          <p className={styles.loadingText}>Finding the best routes for you...</p>
        </div>
      </div>
    );
  }

  const nameParts = userProfile?.full_name?.split(' ') || [];
  const firstName = nameParts[0] || 'Traveler';
  const currentSlide = heroSlides[activePromo];

  return (
    <div className={styles.homeScreen}>
      <div className={`${styles.homeContent} ${isLoaded ? styles.loaded : ''}`}>
        
        {/* Compact Header */}
        <header className={styles.homeHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.logoContainer}>
              <div className={styles.logoIcon}>
                <svg viewBox="0 0 32 32" fill="none">
                  <rect x="4" y="8" width="24" height="16" rx="4" fill="#F5A623"/>
                  <rect x="7" y="11" width="6" height="4" rx="1" fill="#1B4D4A"/>
                  <rect x="15" y="11" width="6" height="4" rx="1" fill="#1B4D4A"/>
                  <circle cx="10" cy="24" r="3" fill="#1B4D4A"/>
                  <circle cx="22" cy="24" r="3" fill="#1B4D4A"/>
                </svg>
              </div>
              <span className={styles.logoName}>GOGOBUS</span>
            </div>
          </div>
          
          <div className={styles.headerRight}>
            <button className={styles.notificationBtn} onClick={() => navigate('/notifications')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className={styles.notificationBadge}>3</span>
            </button>

            <button 
              type="button"
              className={styles.userAvatar} 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/profile');
              }}
              aria-label="Go to profile"
            >
              {userProfile?.avatar_url ? (
                <img src={userProfile.avatar_url} alt="Avatar" className={styles.avatarImage} />
              ) : (
                <div className={styles.avatarInitial}>
                  {firstName.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
          </div>
        </header>

        {/* Greeting Section */}
        <div className={styles.greetingSection}>
          <div className={styles.dateDisplay}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {formatDate()}
          </div>
          <h1 className={styles.greeting}>
            {getGreeting()}, {firstName} <span className={styles.greetingEmoji}>{getGreetingEmoji()}</span>
          </h1>
          <p className={styles.greetingSubtext}>Where would you like to travel today?</p>
        </div>

        {/* Hero Banner with Bus Image */}
        <div className={styles.heroSection}>
          <div className={styles.heroCarousel}>
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className={`${styles.heroSlide} ${index === activePromo ? styles.activeSlide : ''}`}
              >
                {/* Background Image */}
                <div 
                  className={styles.heroBackground}
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className={styles.heroOverlay}></div>
                </div>
                
                {/* Content */}
                <div className={styles.heroContent}>
                  <div className={styles.heroLeft}>
                    <span className={styles.heroHighlight} style={{ background: slide.color }}>
                      {slide.highlight}
                    </span>
                    <h2 className={styles.heroTitle}>{slide.title}</h2>
                    <p className={styles.heroSubtitle}>{slide.subtitle}</p>
                    
                    <div className={styles.heroDestinations}>
                      {slide.destinations.map((dest, i) => (
                        <span key={i} className={styles.heroDest}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2"/>
                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          {dest}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className={styles.heroRight}>
                    <div className={styles.heroSchedule}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                        <path d="M16 2V6M8 2V6M3 10H21" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      {slide.schedule}
                    </div>
                    <button 
                      className={styles.heroBookBtn}
                      onClick={() => handleBookNow(slide)}
                    >
                      Book Now
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Slide Indicators */}
          <div className={styles.heroIndicators}>
            {heroSlides.map((_, index) => (
              <button
                key={index}
                className={`${styles.heroIndicator} ${index === activePromo ? styles.activeIndicator : ''}`}
                onClick={() => setActivePromo(index)}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <button className={styles.quickActionBtn} onClick={() => navigate('/tickets')}>
            <div className={styles.quickActionIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M15 5V7M15 11V13M15 17V19M5 5C3.89543 5 3 5.89543 3 7V10C4.10457 10 5 10.8954 5 12C5 13.1046 4.10457 14 3 14V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V14C19.8954 14 19 13.1046 19 12C19 10.8954 19.8954 10 21 10V7C21 5.89543 20.1046 5 19 5H5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>My Tickets</span>
          </button>
          
          <button className={styles.quickActionBtn} onClick={() => navigate({ pathname: '/tickets', search: '?tab=past' })}>
            <div className={styles.quickActionIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span>History</span>
          </button>
          
          <button className={styles.quickActionBtn} onClick={() => navigate('/profile/saved-routes')}>
            <div className={styles.quickActionIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69365 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69365 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22249 22.4518 8.5C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Favorites</span>
          </button>
          
          <button className={styles.quickActionBtn} onClick={() => navigate('/help')}>
            <div className={styles.quickActionIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="17" r="1" fill="currentColor"/>
              </svg>
            </div>
            <span>Help</span>
          </button>
        </div>

        {/* Features Section */}
        <section className={styles.featuresSection}>
          <h3 className={styles.featuresSectionTitle}>Why Choose GOGOBUS?</h3>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  {feature.icon}
                </div>
                <h4 className={styles.featureTitle}>{feature.title}</h4>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Search Section */}
        <section className={styles.searchSection}>
          <div className={styles.searchCard}>
            <div className={styles.searchHeader}>
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Find Your Bus
              </h2>
              <div className={styles.paymentMethods}>
                <span>Pay via</span>
                <div className={styles.paymentIcons}>
                  <span className={styles.paymentIcon}>💳</span>
                  <span className={styles.paymentIcon}>📱</span>
                  <span className={styles.paymentIcon}>🏦</span>
                </div>
              </div>
            </div>
            <SearchForm onSearch={handleSearch} />
          </div>
        </section>

        {/* Popular Routes Section */}
        <section className={styles.popularSection}>
          <div className={styles.sectionHeader}>
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Popular Routes
            </h2>
            <button className={styles.viewAllBtn} onClick={() => navigate('/routes')}>
              View All
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <PopularRoutes onRouteSelect={handleSearch} />
        </section>

        {/* Partners Section */}
        <section className={styles.partnersSection}>
          <div className={styles.partnersSectionHeader}>
            <span className={styles.partnersLabel}>Trusted By</span>
            <h3 className={styles.partnersSectionTitle}>Our Partners</h3>
            <p className={styles.partnersSubtitle}>Leading bus operators across Botswana</p>
          </div>
          <div className={styles.partnersTrack}>
            <div className={styles.partnersGrid}>
              {partners.map((partner, index) => (
                <div key={index} className={styles.partnerCard}>
                  <div 
                    className={styles.partnerLogo} 
                    style={{ '--partner-color': partner.color }}
                  >
                    <span className={styles.partnerInitials}>{partner.initials}</span>
                  </div>
                  <span className={styles.partnerName}>{partner.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.partnersBadge}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>All operators are licensed & verified</span>
          </div>
        </section>

        {/* App Download CTA */}
        <section className={styles.downloadSection}>
          <div className={styles.downloadContent}>
            <div className={styles.downloadText}>
              <h3>Download the App</h3>
              <p>Get the GOGOBUS app for faster bookings and exclusive deals</p>
            </div>
            <div className={styles.downloadButtons}>
              <button className={styles.storeBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                App Store
              </button>
              <button className={styles.storeBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                </svg>
                Google Play
              </button>
            </div>
          </div>
        </section>

        {/* Bottom Spacing for Navigation */}
        <div className={styles.bottomSpacer}></div>
      </div>
    </div>
  );
};

export default Home;