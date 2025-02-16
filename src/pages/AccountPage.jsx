import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import CreateTeamForm from '../components/CreateTeamForm';
import './AccountPage.css';

// Mock data for demonstration
const mockTeams = [
  {
    id: 1,
    name: 'Engineering Team',
    description: 'Main development team for our core products',
    createdAt: '2024-01-15',
    messagesCount: 1234,
    groupsCount: 15
  },
  {
    id: 2,
    name: 'Design Team',
    description: 'UI/UX design and product design team',
    createdAt: '2024-01-20',
    messagesCount: 856,
    groupsCount: 8
  },
  {
    id: 3,
    name: 'Marketing Team',
    description: 'Digital marketing and brand management',
    createdAt: '2024-02-01',
    messagesCount: 432,
    groupsCount: 12
  }
];

function AccountPage() {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClick = () => {
    setIsCreating(true);
    setSelectedTeam(null);
  };

  const handleCreateCancel = () => {
    setIsCreating(false);
  };

  const handleCreateSubmit = (teamData) => {
    // TODO: Implement actual team creation with Supabase
    console.log('Creating team:', teamData);
    
    // Add the new team to mock data for now
    const newTeam = {
      id: teamData.id,
      name: teamData.name,
      description: teamData.description,
      createdAt: new Date().toISOString().split('T')[0],
      messagesCount: 0,
      groupsCount: 2 // Admins and Members groups
    };
    mockTeams.push(newTeam);
    
    setIsCreating(false);
    setSelectedTeam(newTeam);
  };

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
            {[...mockTeams]
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map(team => (
              <div
                key={team.id}
                className="team-item"
                onClick={() => setSelectedTeam(team)}
              >
                <h3>{team.name}</h3>
                <p>{team.description}</p>
                <div className="team-meta">
                  <span>Messages: {team.messagesCount}</span>
                  <span>Groups: {team.groupsCount}</span>
                </div>
                <div className="team-created">
                  Created {team.createdAt}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="team-content">
          {isCreating ? (
            <CreateTeamForm 
              onSubmit={handleCreateSubmit}
              onCancel={handleCreateCancel}
            />
          ) : selectedTeam ? (
            <>
              <h2>{selectedTeam.name}</h2>
              <div style={{ marginTop: '20px' }}>
                <p><strong>Description:</strong> {selectedTeam.description}</p>
                <p><strong>Created:</strong> {selectedTeam.createdAt}</p>
                <p><strong>Total Messages:</strong> {selectedTeam.messagesCount}</p>
                <p><strong>Total Groups:</strong> {selectedTeam.groupsCount}</p>
              </div>
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
