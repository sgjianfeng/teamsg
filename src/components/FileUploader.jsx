import { useState, useRef } from 'react';
import { uploadFile } from '../utils/blob-storage';
import './FileUploader.css';

export function FileUploader({ onUploadComplete, acceptedTypes = "*" }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setError(null);
      setUploading(true);
      setProgress(0);

      // Upload the file with progress tracking
      const result = await uploadFile(file, (progress) => {
        setProgress(progress);
      });

      onUploadComplete?.(result);
      setProgress(100);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.message);
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-uploader">
      <div className="upload-container">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
          accept={acceptedTypes}
          className="file-input"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="upload-button"
        >
          {uploading ? 'Uploading...' : 'Choose File'}
        </button>
      </div>

      {uploading && (
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">{Math.round(progress)}%</span>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
}
