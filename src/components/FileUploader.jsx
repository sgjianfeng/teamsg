import { useRef } from 'react';
import './FileUploader.css';

function FileUploader({ onFileSelect, accept = "*", multiple = false }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    onFileSelect?.(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="file-uploader">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        accept={accept}
        multiple={multiple}
        className="file-input"
      />
      <button 
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="file-button"
        title="Add photos"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8.5 13.5l3 3L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 5h6m-3-3v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <path d="M17 9a4 4 0 11-8 0 4 4 0 018 0z" stroke="currentColor" strokeWidth="2"/>
        </svg>
        <span className="file-button-text">Add Photos</span>
      </button>
    </div>
  );
}

export default FileUploader;
