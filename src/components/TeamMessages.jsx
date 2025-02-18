import { useState } from 'react';
import PropTypes from 'prop-types';
import './TeamMessages.css';

function TeamMessages({ messages }) {
  const [selectedMessage, setSelectedMessage] = useState(null);

  if (!messages?.length) {
    return (
      <div className="empty-state">
        <h3>No messages yet</h3>
        <p>Messages will appear here once they are created</p>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="message-list">
        {messages.map(message => (
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
  );
}

TeamMessages.propTypes = {
  messages: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    medias: PropTypes.arrayOf(PropTypes.string),
    actions: PropTypes.arrayOf(PropTypes.string),
    type: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired
  }))
};

export default TeamMessages;
