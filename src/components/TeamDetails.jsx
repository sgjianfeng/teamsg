import PropTypes from 'prop-types';
import './TeamDetails.css';

function TeamDetails({ team }) {
  if (!team) {
    return (
      <div className="empty-state">
        <h3>Select a team to view details</h3>
        <p>Click on any team from the list to see more information</p>
      </div>
    );
  }

  return (
    <div className="team-details">
      <p><strong>Description:</strong> {team.description}</p>
      <p><strong>Created:</strong> {new Date(team.created_at).toLocaleDateString()}</p>
      <p><strong>Your Roles:</strong> {team.roles?.join(', ')}</p>
      
      <h3>Groups</h3>
      <ul className="group-list">
        {team.groups?.map(group => (
          <li key={group.id} className="group-item">
            <span className="group-name">{group.name}</span>
            <span className="group-role">({group.role})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

TeamDetails.propTypes = {
  team: PropTypes.shape({
    description: PropTypes.string,
    created_at: PropTypes.string,
    roles: PropTypes.arrayOf(PropTypes.string),
    groups: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired
    }))
  })
};

export default TeamDetails;
