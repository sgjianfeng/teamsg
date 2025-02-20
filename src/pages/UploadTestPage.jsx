import FileUploader from '../components/FileUploader';

function UploadTestPage() {
  const handleUploadComplete = (result) => {
    console.log('Upload completed:', result);
    alert(`File uploaded successfully!\nURL: ${result.url}`);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>File Upload Test</h1>
      <p>Upload any file to test the Vercel Blob storage integration.</p>
      
      <FileUploader 
        onUploadComplete={handleUploadComplete}
        acceptedTypes="image/*,video/*,.pdf,.doc,.docx"
      />

      <div style={{ marginTop: '2rem' }}>
        <h3>Instructions:</h3>
        <ul>
          <li>Click "Choose File" to select a file</li>
          <li>Watch the progress bar during upload</li>
          <li>Once complete, you'll see the file's URL</li>
          <li>The file will be automatically stored in Vercel Blob storage</li>
        </ul>
      </div>
    </div>
  );
}

export default UploadTestPage;
