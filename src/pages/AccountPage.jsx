import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CreateTeamForm from '../components/CreateTeamForm';
import { TeamModel } from '../db/models';
import { MessageModel } from '../db/models';
import './AccountPage.css';

// 示例消息数据，后续将替换为实际数据
const mockMessages = [
  {
    id: 1,
    title: 'Team Meeting Summary',
    text: 'Discussed Q1 goals and project timelines. Key decisions: 1) Launch new feature by March, 2) Hire two more developers.',
    medias: ['meeting-notes.pdf'],
    actions: ['approve', 'comment'],
    teamId: 1,
    groupId: 1,
    type: 'meeting',
    createdAt: '2024-02-15'
  },
  {
    id: 2,
    title: 'Project Update: Mobile App',
    text: 'Sprint 3 completed. All planned features implemented. QA testing starts next week.',
    medias: ['sprint-report.xlsx', 'demo-video.mp4'],
    actions: ['review', 'comment'],
    teamId: 1,
    groupId: 2,
    type: 'update',
    createdAt: '2024-02-14'
  },
  {
    id: 3,
    title: 'Welcome New Team Members',
    text: 'Please welcome Sarah and Mike who are joining our frontend team next week!',
    medias: [],
    actions: ['welcome', 'comment'],
    teamId: 1,
    groupId: 1,
    type: 'announcement',
    createdAt: '2024-02-13'
  }
];

const STORAGE_KEY = 'selectedTeamId';

function AccountPage() {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(() => {
    // Initialize selectedTeam from localStorage on component mount
    const storedTeamId = localStorage.getItem(STORAGE_KEY);
    if (storedTeamId) {
      return { id: storedTeamId }; // Temporary object until teams load
    }
    return null;
  });
  const [isCreating, setIsCreating] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [activeView, setActiveView] = useState('details'); // 'details' or 'messages'

  // Load teams
  useEffect(() => {
    let mounted = true;

    async function loadTeams() {
      if (!currentUser) {
        if (mounted) {
          setLoading(false);
        }
        return;
      }
      
      try {
        setError(null);
        const { data, error } = await TeamModel.getUserTeams(currentUser.id);
        if (error) throw error;
        
        if (mounted) {
          const loadedTeams = data || [];
          setTeams(loadedTeams);

          // If we have a temporary selectedTeam, find and set the full team object
          if (selectedTeam && !selectedTeam.name) {
            const fullTeam = loadedTeams.find(t => t.id.toString() === selectedTeam.id.toString());
            if (fullTeam) {
              setSelectedTeam(fullTeam);
              setSearchParams({ teamId: fullTeam.id.toString() }, { replace: true });
            }
          }
        }
      } catch (err) {
        console.error('Error loading teams:', err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadTeams();
    return () => { mounted = false; };
  }, [currentUser]);

  // Handle team selection from URL
  useEffect(() => {
    if (loading || !teams.length) return;

    const teamId = searchParams.get('teamId');
    if (!teamId) return;

    // Only update if the team ID is different from current selection
    if (!selectedTeam || selectedTeam.id.toString() !== teamId) {
      const team = teams.find(t => t.id.toString() === teamId);
      if (team) {
        console.log('Setting team from URL:', team);
        setSelectedTeam(team);
        localStorage.setItem(STORAGE_KEY, team.id.toString());
      }
    }
  }, [teams, searchParams, loading]);

  // Reset selected message when team changes
  useEffect(() => {
    setSelectedMessage(null);
  }, [selectedTeam]);

  const handleCreateClick = () => {
    setError(null);
    setIsCreating(true);
    setSelectedTeam(null);
    setSearchParams({});
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleCreateCancel = () => {
    setIsCreating(false);
  };

  const handleCreateSubmit = async (result) => {
    if (result.error) {
      console.error('Error creating team:', result.error);
      setError(result.error);
      // Don't close the form if there's an error
      return;
    }
    
    // On success, update UI state
    setError(null);
    const newTeam = result.data;
    setTeams(prevTeams => [newTeam, ...prevTeams]); // Add to beginning of array
    setSelectedTeam(newTeam);
    setSearchParams({ teamId: newTeam.id.toString() });
    localStorage.setItem(STORAGE_KEY, newTeam.id.toString());
    setIsCreating(false);
  };

  const handleTeamSelect = (team) => {
    console.log('Selecting team:', team);
    setSelectedTeam(team);
    setSearchParams({ teamId: team.id.toString() });
    localStorage.setItem(STORAGE_KEY, team.id.toString());
  };

  if (!currentUser) {
    return (
      <div className="account-page">
        <div className="empty-state">
          <h3>Please log in to view your teams</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="content-container">
        <div className="team-list">
          <div className="team-toolbar">
            <button className="tool-button">
              🔍 Search
            </button>
            <button className="tool-button" onClick={handleCreateClick}>
              ➕ Create
            </button>
            <button className="tool-button">
              🔗 Join
            </button>
          </div>

          <div className="team-items">
            {loading ? (
              <div className="loading">Loading your teams...</div>
            ) : error ? (
              <div className="error-state">
                <p>Error: {error}</p>
                <button onClick={() => window.location.reload()} className="primary-button">
                  Retry
                </button>
              </div>
            ) : teams.length === 0 ? (
              <div className="empty-state">
                <p>You don't have any teams yet.</p>
                <button onClick={handleCreateClick} className="primary-button">
                  Create Your First Team
                </button>
              </div>
            ) : (
              [...teams].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(team => (
                <div
                  key={team.id}
                  className={`team-item ${selectedTeam?.id === team.id ? 'selected' : ''}`}
                  onClick={() => handleTeamSelect(team)}
                >
                  <h3>{team.name}</h3>
                  <p>{team.description}</p>
                  <div className="team-meta">
                    <span>Messages: {team.messages?.length || 0}</span>
                    <span>Groups: {team.groups?.length || 0}</span>
                  </div>
                  <div className="team-created">
                    Created {new Date(team.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="team-content">
          {error && (
            <div className="error-banner">
              {error}
            </div>
          )}
          
          {isCreating ? (
            <CreateTeamForm 
              onSubmit={handleCreateSubmit}
              onCancel={handleCreateCancel}
            />
          ) : selectedTeam && selectedTeam.name ? (
            <>
              <div className="team-header">
                <h2>{selectedTeam.name}</h2>
                <div className="team-nav">
                  <button 
                    className={`nav-button ${activeView === 'details' ? 'active' : ''}`}
                    onClick={() => setActiveView('details')}
                  >
                    Details
                  </button>
                  <button 
                    className={`nav-button ${activeView === 'messages' ? 'active' : ''}`}
                    onClick={() => setActiveView('messages')}
                  >
                    Messages
                  </button>
                </div>
              </div>

              {activeView === 'details' ? (
                <div className="team-details">
                  <p><strong>Description:</strong> {selectedTeam.description}</p>
                  <p><strong>Created:</strong> {new Date(selectedTeam.created_at).toLocaleDateString()}</p>
                  <p><strong>Your Roles:</strong> {selectedTeam.roles?.join(', ')}</p>
                  <h3>Groups</h3>
                  <ul className="group-list">
                    {selectedTeam.groups?.map(group => (
                      <li key={group.id} className="group-item">
                        <span className="group-name">{group.name}</span>
                        <span className="group-role">({group.role})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="messages-container">
                  <div className="message-list">
                    {mockMessages
                      .filter(msg => msg.teamId === selectedTeam.id)
                      .map(message => (
                        <div 
                          key={message.id}
                          className={`message-item ${selectedMessage?.id === message.id ? 'selected' : ''}`}
                          onClick={() => setSelectedMessage(message)}
                        >
                          <h4>{message.title}</h4>
                          <p>{message.text.substring(0, 100)}...</p>
                          <div className="message-meta">
                            <span>{message.type}</span>
                            <span>{message.createdAt}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="message-content">
                    {selectedMessage ? (
                      <div className="message-detail">
                        <h3>{selectedMessage.title}</h3>
                        <div className="message-info">
                          <span>Type: {selectedMessage.type}</span>
                          <span>Created: {selectedMessage.createdAt}</span>
                        </div>
                        <p className="message-text">{selectedMessage.text}</p>
                        {selectedMessage.medias?.length > 0 && (
                          <div className="message-media">
                            <h4>Attachments:</h4>
                            <ul>
                              {selectedMessage.medias.map((media, index) => (
                                <li key={index}>{media}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="message-actions">
                          {selectedMessage.actions?.map((action, index) => (
                            <button key={index} className="action-button">
                              {action}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="empty-state">
                        <h3>Select a message to view details</h3>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <h3>Select a team to view details</h3>
              <p>Click on any team from the list to see more information</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccountPage;
