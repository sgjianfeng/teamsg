import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FileUploader from './FileUploader';
import './VisionInputForm.css';

function VisionInputForm() {
  const navigate = useNavigate();
  const [vision, setVision] = useState('');
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');

  const handleImageUpload = (files) => {
    if (images.length + files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    setImages([...images, ...files]);
    setError('');
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const { currentUser } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!vision.trim()) {
      setError('Please enter your vision');
      return;
    }

    const formData = {
      vision,
      images: images
    };

    if (!currentUser) {
      navigate('/login', {
        state: {
          returnPath: '/vision-summary',
          formData
        }
      });
      return;
    }

    navigate('/vision-summary', { 
      state: {
        vision,
        images: images.length > 0 ? images.map(image => URL.createObjectURL(image)) : []
      }
    });
  };

  return (
    <div className="vision-form-container">
      <form onSubmit={handleSubmit} className="vision-form">
        <div className="vision-input-wrapper">
          <div className="vision-input-group">
            <textarea
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              placeholder="Type your vision for Singapore..."
              rows={1}
            />
          </div>

          <div className="vision-upload-section">
            <FileUploader 
              onFileSelect={handleImageUpload}
              accept="image/*"
              multiple={true}
            />
            <button 
              type="submit" 
              className="submit-button"
              disabled={!vision.trim()}
            >
              Submit
            </button>
          </div>
        </div>

        {images.length > 0 && (
          <div className="image-preview-container">
            {images.map((image, index) => (
              <div key={index} className="image-preview">
                <img src={URL.createObjectURL(image)} alt={`Preview ${index + 1}`} />
                <button 
                  type="button" 
                  onClick={() => handleRemoveImage(index)}
                  className="remove-image"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
}

export default VisionInputForm;
