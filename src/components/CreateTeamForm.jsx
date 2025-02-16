import { useState } from 'react';
import './CreateTeamForm.css';

export default function CreateTeamForm({ onSubmit, onCancel }) {
  const [step, setStep] = useState('form'); // 'form' or 'summary'
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.id.trim() || !formData.name.trim()) {
      setError('ID and Name are required');
      return;
    }

    // Show summary before final submission
    setStep('summary');
  };

  const handleConfirm = () => {
    // Prepare team creation data with default groups
    const teamData = {
      ...formData,
      groups: {
        admins: {
          name: 'Admins',
          roles: ['admin', 'member']
        },
        members: {
          name: 'Members',
          roles: ['admin', 'member']
        }
      },
      creator: {
        isTeamCreator: true,
        isGroupCreator: true,
        roles: {
          admins: 'admin',
          members: 'admin'
        }
      }
    };

    onSubmit(teamData);
  };

  if (step === 'summary') {
    return (
      <div className="create-team-form">
        <h2>Team Summary</h2>
        <div className="summary-content">
          <div className="summary-item">
            <label>Team ID:</label>
            <p>{formData.id}</p>
          </div>
          <div className="summary-item">
            <label>Display Name:</label>
            <p>{formData.name}</p>
          </div>
          <div className="summary-item">
            <label>Description:</label>
            <p>{formData.description}</p>
          </div>
          <div className="summary-item">
            <label>Default Groups:</label>
            <ul>
              <li>Admins (admin, member roles)</li>
              <li>Members (admin, member roles)</li>
            </ul>
          </div>
          <div className="summary-item">
            <label>Your Roles:</label>
            <ul>
              <li>Team Creator</li>
              <li>Group Creator</li>
              <li>Admin in Admins group</li>
              <li>Admin in Members group</li>
            </ul>
          </div>
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => setStep('form')} className="secondary-button">
            Back to Edit
          </button>
          <button type="button" onClick={handleConfirm} className="primary-button">
            Confirm & Create
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="create-team-form">
      <h2>Create New Team</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-group">
        <label htmlFor="id">Team ID (unique identifier)</label>
        <input
          type="text"
          id="id"
          name="id"
          value={formData.id}
          onChange={handleChange}
          placeholder="Enter unique team ID"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="name">Display Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter team display name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter team description"
          rows={4}
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="secondary-button">
          Cancel
        </button>
        <button type="submit" className="primary-button">
          Continue to Summary
        </button>
      </div>
    </form>
  );
}
