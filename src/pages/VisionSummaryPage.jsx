import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { TeamModel } from '../db/models/team';
import './VisionSummaryPage.css';

function VisionSummaryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  let { vision, images } = location.state || {};
  
  const [mode, setMode] = useState('personal'); // 'personal' or 'team'
  const [id, setId] = useState('');
  const [userTeams, setUserTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);

  // Convert File objects to URLs if needed (when coming from login flow)
  if (images && images.length > 0 && images[0] instanceof File) {
    images = images.map(image => URL.createObjectURL(image));
  }

  // Fetch user's teams when in team mode
  useEffect(() => {
    if (mode === 'team' && currentUser) {
      setIsLoading(true);
      TeamModel.getUserTeams(currentUser.id)
        .then(({ data, error }) => {
          if (error) console.error('Error fetching teams:', error);
          else setUserTeams(data || []);
        })
        .finally(() => setIsLoading(false));
    }
  }, [mode, currentUser]);

  // Filter teams based on search input
  useEffect(() => {
    if (mode === 'team' && id.trim()) {
      const filtered = userTeams.filter(team => 
        team.id.toLowerCase().includes(id.toLowerCase()) ||
        team.name.toLowerCase().includes(id.toLowerCase())
      );
      setFilteredTeams(filtered);
      setShowTeamDropdown(true);
    } else {
      setFilteredTeams([]);
      setShowTeamDropdown(false);
    }
  }, [id, userTeams, mode]);

  const handleTeamSelect = (team) => {
    setId(team.id);
    setShowTeamDropdown(false);
  };

  useEffect(() => {
    if (!vision || !currentUser) {
      navigate('/');
    }
  }, [vision, currentUser, navigate]);

  if (!vision) {
    return null;
  }

  return (
    <div className="vision-summary-page">
      <div className="vision-summary-container">
        <h1>Vision Summary</h1>
        <div className="divider"></div>
        
        <div className="vision-header">
          <div className="vision-input-row">
            <p className="vision-purpose">
              Vision on behalf of:
            </p>
            <div className="toggle-container">
              <button 
                className={`toggle-button ${mode === 'personal' ? 'active' : ''}`}
                onClick={() => {
                  setMode('personal');
                  setId('');
                }}
              >
                Personal
              </button>
              <button 
                className={`toggle-button ${mode === 'team' ? 'active' : ''}`}
                onClick={() => {
                  setMode('team');
                  setId('');
                }}
              >
                Team
              </button>
            </div>

            <div className="input-container">
              <input
                type="text"
                placeholder={mode === 'personal' ? "Enter Personal ID" : "Search or Enter Team ID"}
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="id-input"
              />
              {mode === 'team' && showTeamDropdown && filteredTeams.length > 0 && (
                <div className="team-dropdown">
                  {filteredTeams.map(team => (
                    <div 
                      key={team.id}
                      className="team-option"
                      onClick={() => handleTeamSelect(team)}
                    >
                      <span className="team-id">{team.id}</span>
                      <span className="team-name">{team.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
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
