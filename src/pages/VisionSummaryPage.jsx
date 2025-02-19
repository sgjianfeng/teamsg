import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './VisionSummaryPage.css';

function VisionSummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { vision, images } = location.state || {};

  useEffect(() => {
    if (!vision) {
      navigate('/');
    }
  }, [vision, navigate]);

  if (!vision) {
    return null;
  }

  return (
    <div className="vision-summary-page">
      <div className="vision-summary-container">
        <h1>Your Vision Summary</h1>
        
        <div className="vision-text">
          <h2>Your Vision</h2>
          <p>{vision}</p>
        </div>

        {images && images.length > 0 && (
          <div className="vision-images">
            <h2>Supporting Images</h2>
            <div className="image-grid">
              {images.map((imageUrl, index) => (
                <div key={index} className="vision-image">
                  <img src={imageUrl} alt={`Vision support ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="action-buttons">
          <button onClick={() => navigate('/')} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default VisionSummaryPage;