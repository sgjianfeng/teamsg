import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useNavigate } from 'react-router-dom';
import policiesSQL from '../db/migrations/apply_policies.sql?raw';
import initDatabaseSQL from '../db/migrations/init_database.sql?raw';
import teamTagsSQL from '../db/migrations/02_add_team_tags.sql?raw';
import fullTextSearchSQL from '../db/migrations/03_add_full_text_search.sql?raw';
import './DatabaseSetupPage.css';

const setupInstructions = `
# Database Setup Instructions

1. Copy and run the initialization SQL in Supabase SQL Editor to create database tables
2. Copy and run the policies SQL in Supabase SQL Editor to set up access policies
3. Copy and run the team tags SQL in Supabase SQL Editor to add tag support
4. Copy and run the full text search SQL in Supabase SQL Editor to enable text search capabilities

Note: Run the SQL scripts in order. Each script builds on the previous one.
`;

export default function DatabaseSetupPage() {
  const navigate = useNavigate();
  const [copiedInit, setCopiedInit] = useState(false);
  const [copiedPolicies, setCopiedPolicies] = useState(false);
  const [copiedTags, setCopiedTags] = useState(false);
  const [copiedSearch, setCopiedSearch] = useState(false);

  return (
    <div className="database-setup-page">
      <nav className="setup-nav">
        <div className="nav-actions">
          <button onClick={() => navigate('/')} className="back-button">
            ← Back to Home
          </button>
          <div className="button-group">
            <div className="sql-buttons">
              <button
                className="primary-button"
                onClick={() => {
                  navigator.clipboard.writeText(initDatabaseSQL);
                  setCopiedInit(true);
                  setTimeout(() => setCopiedInit(false), 2000);
                }}
              >
                Copy Init SQL
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  navigator.clipboard.writeText(policiesSQL);
                  setCopiedPolicies(true);
                  setTimeout(() => setCopiedPolicies(false), 2000);
                }}
              >
                Copy Policy SQL
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  navigator.clipboard.writeText(teamTagsSQL);
                  setCopiedTags(true);
                  setTimeout(() => setCopiedTags(false), 2000);
                }}
              >
                Copy Tags SQL
              </button>
              <button
                className="primary-button"
                onClick={() => {
                  navigator.clipboard.writeText(fullTextSearchSQL);
                  setCopiedSearch(true);
                  setTimeout(() => setCopiedSearch(false), 2000);
                }}
              >
                Copy Search SQL
              </button>
            </div>
          </div>
        </div>

        {copiedInit && <div className="success-notification">Database init SQL copied!</div>}
        {copiedPolicies && <div className="success-notification">Policy SQL copied!</div>}
        {copiedTags && <div className="success-notification">Team tags SQL copied!</div>}
        {copiedSearch && <div className="success-notification">Full text search SQL copied!</div>}
      </nav>

      <div className="markdown-content">
        <ReactMarkdown>{setupInstructions}</ReactMarkdown>
      </div>

      <div className="sql-sections">
        <div className="sql-section">
          <h3>1. Database Initialization SQL</h3>
          <div className="sql-copy-section">
            <pre onClick={() => {
              navigator.clipboard.writeText(initDatabaseSQL);
              setCopiedInit(true);
              setTimeout(() => setCopiedInit(false), 2000);
            }}>
              {initDatabaseSQL}
            </pre>
          </div>
        </div>

        <div className="sql-section">
          <h3>2. Database Policies SQL</h3>
          <div className="sql-copy-section">
            <pre onClick={() => {
              navigator.clipboard.writeText(policiesSQL);
              setCopiedPolicies(true);
              setTimeout(() => setCopiedPolicies(false), 2000);
            }}>
              {policiesSQL}
            </pre>
          </div>
        </div>

        <div className="sql-section">
          <h3>3. Team Tags SQL</h3>
          <div className="sql-copy-section">
            <pre onClick={() => {
              navigator.clipboard.writeText(teamTagsSQL);
              setCopiedTags(true);
              setTimeout(() => setCopiedTags(false), 2000);
            }}>
              {teamTagsSQL}
            </pre>
          </div>
        </div>

        <div className="sql-section">
          <h3>4. Full Text Search SQL</h3>
          <div className="sql-copy-section">
            <pre onClick={() => {
              navigator.clipboard.writeText(fullTextSearchSQL);
              setCopiedSearch(true);
              setTimeout(() => setCopiedSearch(false), 2000);
            }}>
              {fullTextSearchSQL}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
