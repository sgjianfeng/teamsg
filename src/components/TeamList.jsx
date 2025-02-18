import PropTypes from 'prop-types';
import './TeamList.css';

function TeamList({ 
  teams, 
  loading, 
  error, 
  selectedTeam, 
  onTeamSelect, 
  onCreateClick 
}) {
  return (
    <div className="team-list">
      <div className="team-toolbar">
        <button className="tool-button">
          🔍 Search
        </button>
        <button className="tool-button" onClick={onCreateClick}>
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
            <button onClick={onCreateClick} className="primary-button">
              Create Your First Team
            </button>
          </div>
        ) : (
          [...teams].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map(team => (
            <div
              key={team.id}
              className={`team-item ${selectedTeam?.id === team.id ? 'selected' : ''}`}
              onClick={() => onTeamSelect(team)}
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
  );
}

TeamList.propTypes = {
  teams: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  selectedTeam: PropTypes.object,
  onTeamSelect: PropTypes.func.isRequired,
  onCreateClick: PropTypes.func.isRequired
};

export default TeamList;
