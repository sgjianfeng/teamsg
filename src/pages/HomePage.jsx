import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDeviceType } from '../utils/deviceDetect';
import './HomePage.css';

function HomePage() {
  const [deviceType, setDeviceType] = useState('desktop');

  useEffect(() => {
    setDeviceType(getDeviceType());
    
    const handleResize = () => {
      setDeviceType(getDeviceType());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`home-page ${deviceType}`}>
      <div className="hero">
        <div className="hero-content">
          <h1>Vision Singapore</h1>
          <p>Where visions become reality</p>
        </div>
      </div>

      <div className="vision-description">
        <p>Partnering with AI to transform your vision into reality</p>
      </div>

      <div className="industries-section">
        <div className="industry-container">
          <div className="industry-info">
            <h2><Link to="/food">Food & Beverage</Link></h2>
            <p>Experience Singapore's vibrant food paradise - from Michelin-starred restaurants to beloved hawker centers, blending traditional flavors with modern innovation in a world-renowned culinary destination</p>
          </div>
          <div className="industry-companies">
            <div className="grid-container">
              <div className="company-card">
                <div className="company-logo">M</div>
                <div className="company-details">
                  <h3>Meow BBQ</h3>
                  <p>Modern Chinese BBQ restaurant bringing innovative dining concepts to Singapore's vibrant food scene</p>
                  <div className="featured-product">
                    <span>Signature dish:</span> Premium Beef Platter
                  </div>
                </div>
              </div>
              {/* More company cards can be added here in the future */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
