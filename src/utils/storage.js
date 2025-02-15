import { put, del } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import path from 'path-browserify';

// Upload file to Vercel Blob
export async function uploadFile(file, progressCallback = () => {}) {
  try {
    // Generate unique filename
    const ext = path.extname(file.name);
    const uniqueFileName = `${uuidv4()}${ext}`;

    // Create blob
    const { url } = await put(uniqueFileName, file, {
      access: 'public',
      handleUploadUrl: '/api/upload-handler',
    });

    // Simulate progress since Vercel Blob doesn't provide progress events
    progressCallback(50);
    
    // Return the public URL
    progressCallback(100);
    return {
      url,
      key: uniqueFileName
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Delete file from Vercel Blob
export async function deleteFile(fileName) {
  try {
    await del(fileName);
    return { message: 'File deleted successfully' };
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

// Get public URL for a file
export function getPublicUrl(url) {
  return url;
}
