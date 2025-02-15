import * as blobClient from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import path from 'path-browserify';

// Upload file to Vercel Blob
export async function uploadFile(file, progressCallback = () => {}) {
  try {
    // Generate unique filename
    const ext = path.extname(file.name);
    const uniqueFileName = `${uuidv4()}${ext}`;

    // Simulate initial progress
    progressCallback(10);

    // Get upload URL from API
    const response = await fetch('/api/get-upload-url');
    if (!response.ok) {
      throw new Error(`Failed to get upload URL: ${response.statusText}`);
    }
    const { url, clientPayload } = await response.json();
    
    progressCallback(30);

    // Upload file directly to Vercel Blob
    const uploadResult = await blobClient.put(uniqueFileName, file, {
      access: 'public',
      handleUploadUrl: url,
      clientPayload
    });

    // Return the public URL
    progressCallback(100);
    return {
      url: uploadResult.url,
      key: uniqueFileName
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Get public URL for a file
export function getPublicUrl(url) {
  return url;
}
