import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDeviceType } from '../utils/deviceDetect';
import VisionInputForm from '../components/VisionInputForm';
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

  const industryHighlights = [
    { title: 'Local Flavors', description: 'Traditional hawker delights' },
    { title: 'Fine Dining', description: 'Michelin-starred experiences' },
    { title: 'Fusion Cuisine', description: 'Modern culinary innovation' },
    { title: 'Street Food', description: 'Authentic local tastes' }
  ];

  return (
    <div className={`home-page ${deviceType}`}>
      {/* Vision Section */}
      <section className="vision-section">
        <div className="vision-header">
          <h1>Vision Singapore</h1>
          <p>Partnering with AI to transform your vision into reality</p>
        </div>
        <VisionInputForm />
      </section>

      {/* Industries Section */}
      <section className="industries-section">
        <div className="industries-container">
          {/* Food & Beverage Industry */}
          <div className="industry-row">
            <h2 className="industry-title">Food & Beverage</h2>
            
            <div className="industry-content">
              {/* Left: Industry Highlights Grid */}
              <div className="industry-highlights">
                <div className="highlights-grid">
                  {industryHighlights.map((highlight, index) => (
                    <div key={index} className="highlight-card">
                      <h3>{highlight.title}</h3>
                      <p>{highlight.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Companies */}
              <div className="industry-companies">
                <div className="companies-grid">
                  <Link to="/food/meowbbq" className="company-card">
                    <div className="company-logo">
                      <img src="/images/companies/meowbbq-logo.svg" alt="Meow BBQ Logo" />
                    </div>
                    <div className="company-details">
                      <h3>Meow BBQ</h3>
                      <p className="company-mission">
                        Modern Chinese BBQ restaurant bringing innovative dining concepts to Singapore's vibrant food scene
                      </p>
                      <div className="company-highlight">
                        <span>Signature:</span> Premium Beef Platter
                      </div>
                    </div>
                  </Link>
                  {/* More company cards will be added here */}
                </div>
              </div>
            </div>
          </div>

          {/* More industries will be added here */}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
