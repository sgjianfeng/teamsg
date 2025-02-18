import { useAuth } from '../contexts/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TeamList from '../components/TeamList';
import TeamDetails from '../components/TeamDetails';
import TeamMessages from '../components/TeamMessages';
import CreateTeamForm from '../components/CreateTeamForm';
import { TeamModel } from '../db/models';
import './AccountPage.css';

// Mock messages data - will be replaced with actual API data later
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
const CREATE_MARKER = 'creating';

function AccountPage() {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(() => {
    const storedTeamId = localStorage.getItem(STORAGE_KEY);
    return storedTeamId ? { id: storedTeamId } : null;
  });
  const [isCreating, setIsCreating] = useState(() => searchParams.get('view') === CREATE_MARKER);
  const [activeView, setActiveView] = useState('details');

  useEffect(() => {
    let mounted = true;
    
    async function loadTeams() {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        setError(null);
        const { data, error: loadError } = await TeamModel.getUserTeams(currentUser.id);
        if (loadError) throw loadError;
        
        if (mounted) {
          const loadedTeams = data || [];
          setTeams(loadedTeams);

          if (selectedTeam && !selectedTeam.name && !isCreating) {
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
  }, [currentUser, isCreating, selectedTeam]);

  useEffect(() => {
    if (loading || !teams.length) return;
    
    if (searchParams.get('view') === CREATE_MARKER) {
      setIsCreating(true);
      setSelectedTeam(null);
      return;
    }

    const teamId = searchParams.get('teamId');
    if (!teamId) return;

    if (!selectedTeam || selectedTeam.id.toString() !== teamId) {
      const team = teams.find(t => t.id.toString() === teamId);
      if (team) {
        setSelectedTeam(team);
        localStorage.setItem(STORAGE_KEY, team.id.toString());
      }
    }
  }, [teams, searchParams, loading]);

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setIsCreating(false);
    setSearchParams({ teamId: team.id.toString() });
    localStorage.setItem(STORAGE_KEY, team.id.toString());
  };

  const handleCreateClick = () => {
    setError(null);
    setIsCreating(true);
    setSelectedTeam(null);
    setSearchParams({ view: CREATE_MARKER });
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleCreateCancel = () => {
    setIsCreating(false);
    const storedTeamId = localStorage.getItem(STORAGE_KEY);
    if (storedTeamId) {
      const team = teams.find(t => t.id.toString() === storedTeamId);
      if (team) {
        setSelectedTeam(team);
        setSearchParams({ teamId: team.id.toString() });
      } else {
        setSearchParams({});
      }
    } else {
      setSearchParams({});
    }
  };

  const handleCreateSubmit = async (result) => {
    if (result.error) {
      setError(result.error);
      return;
    }
    
    setError(null);
    const newTeam = result.data;
    setTeams(prevTeams => [newTeam, ...prevTeams]);
    setSelectedTeam(newTeam);
    setIsCreating(false);
    setSearchParams({ teamId: newTeam.id.toString() });
    localStorage.setItem(STORAGE_KEY, newTeam.id.toString());
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
        <TeamList
          teams={teams}
          loading={loading}
          error={error}
          selectedTeam={selectedTeam}
          onTeamSelect={handleTeamSelect}
          onCreateClick={handleCreateClick}
        />

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
                <TeamDetails team={selectedTeam} />
              ) : (
                <TeamMessages 
                  messages={mockMessages.filter(msg => msg.teamId === selectedTeam.id)} 
                />
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
