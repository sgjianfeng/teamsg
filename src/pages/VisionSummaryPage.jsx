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
  
  const [mode, setMode] = useState('personal');
  const [id, setId] = useState('');
  const [userTeams, setUserTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [showTeamDropdown, setShowTeamDropdown] = useState(false);
  const [visionMatches, setVisionMatches] = useState([]);
  const [selectedMatches, setSelectedMatches] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [error, setError] = useState(null);

  // Load vision supporter matches
  useEffect(() => {
    if (vision) {
      setLoadingMatches(true);
      setError(null);
      TeamModel.searchByVisionSupport(vision, currentPage)
        .then(({ data, error: searchError }) => {
          if (searchError) {
            console.error('Error fetching vision matches:', searchError);
            setError(searchError);
          } else {
            setVisionMatches(prev => currentPage === 1 ? data : [...prev, ...data]);
            setHasMore(data.length === 5);
          }
        })
        .catch(err => {
          console.error('Error in vision search:', err);
          setError(err.message);
        })
        .finally(() => setLoadingMatches(false));
    }
  }, [vision, currentPage]);

  // Convert File objects to URLs if needed
  if (images && images.length > 0 && images[0] instanceof File) {
    images = images.map(image => URL.createObjectURL(image));
  }

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const toggleMatchSelection = (teamId) => {
    setSelectedMatches(prev => {
      const newSet = new Set(prev);
      if (newSet.has(teamId)) {
        newSet.delete(teamId);
      } else {
        newSet.add(teamId);
      }
      return newSet;
    });
  };

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

  const renderMatches = () => {
    if (error) {
      return (
        <div className="status-message error">
          <p>Error: {error}</p>
          <button 
            className="retry-button" 
            onClick={() => {
              setError(null);
              setCurrentPage(1);
              setVisionMatches([]);
            }}
          >
            Try Again
          </button>
          {process.env.NODE_ENV === 'development' && (
            <pre className="error-details">
              {JSON.stringify({ error }, null, 2)}
            </pre>
          )}
        </div>
      );
    }

    if (loadingMatches) {
      return (
        <div className="status-message loading">
          <div>
            Matching...
            <div className="loading-subtext">This may take a few moments</div>
          </div>
        </div>
      );
    }

    if (!loadingMatches && visionMatches.length === 0) {
      return (
        <div className="match-results">
          <div className="status-message">
            No vision matches found.
          </div>
        </div>
      );
    }

    return (
      <div className="match-results">
        <div className="matches-list">
          {visionMatches.map(team => (
            <div key={team.id} className="match-item">
              <input
                type="checkbox"
                checked={selectedMatches.has(team.id)}
                onChange={() => toggleMatchSelection(team.id)}
              />
              <div className="match-details">
                <div className="match-header">
                  <span className="team-id">{team.id}</span>
                  <span className="team-name">{team.name}</span>
                </div>
                <p className="team-description">{team.description}</p>
                <div className="match-content">
                  <div className="vision-text-comparison">
                    <div className="vision-preview">
                      <strong>Vision:</strong>
                      <p>{vision}</p>
                    </div>
                    <div className="supporter-match">
                      <strong>Vision Support:</strong>
                      <p>{team.team_tag_assignments.find(tag => tag.tag_name === 'vision-supporter')?.description}</p>
                    </div>
                  </div>
                  <div className="similarity-score">
                    <label>Match Score:</label>
                    <div className="score-bar">
                      <div 
                        className="score-fill" 
                        style={{ width: `${Math.round(team.similarity * 100)}%` }}
                      />
                    </div>
                    <span className="score-value">{Math.round(team.similarity * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {hasMore && (
          <button 
            className="load-more-button"
            onClick={handleLoadMore}
            disabled={loadingMatches}
          >
            {loadingMatches ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>
    );
  };

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

        {/* Vision Text Matching Section */}
        <div className="vision-matches">
          <h2>Vision Supporter Matches</h2>
          {renderMatches()}
        </div>

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
