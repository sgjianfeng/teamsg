import { useState, useEffect } from 'react';
import { GroupModel } from '../db/models/group';
import { useAuth } from '../contexts/AuthContext';
import './GroupList.css';

function GroupList({ team }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    let mounted = true;

    async function loadGroups() {
      if (!team?.id || !currentUser) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: loadError } = await GroupModel.getByTeamId(team.id);
        if (loadError) throw loadError;

        if (mounted) {
          setGroups(data || []);
        }
      } catch (err) {
        console.error('Error loading groups:', err);
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadGroups();
    return () => { mounted = false; };
  }, [team, currentUser]);

  if (loading) {
    return <div className="groups-loading">Loading groups...</div>;
  }

  if (error) {
    return <div className="groups-error">{error}</div>;
  }

  if (!groups.length) {
    return (
      <div className="groups-empty">
        <h3>No groups found</h3>
        <p>There are no groups in this team yet.</p>
      </div>
    );
  }

  return (
    <div className="groups-list">
      <h3>Team Groups</h3>
      {groups.map(group => (
        <div key={group.id} className="group-card">
          <div className="group-header">
            <h4>{group.name}</h4>
            <span className="member-count">
              {group.members?.length || 0} members
            </span>
          </div>
          <div className="group-members">
            {group.members?.map(member => {
              const isCurrentUser = member.user_id === currentUser?.id;
              return (
                <div 
                  key={member.id} 
                  className={`member-item ${isCurrentUser ? 'current-user' : ''}`}
                >
                  <span className="member-role">{member.role}</span>
                  {isCurrentUser && <span className="current-user-marker">(You)</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default GroupList;
