import { upload, del } from '@vercel/blob/client';
import { v4 as uuidv4 } from 'uuid';
import path from 'path-browserify';

const handleUploadUrl = import.meta.env.DEV 
  ? '/src/api/upload-handler'  // 开发环境
  : '/api/upload-handler';     // 生产环境

// Upload file to Vercel Blob
export async function uploadFile(file, progressCallback = () => {}) {
  try {
    // Generate unique filename
    const ext = path.extname(file.name);
    const uniqueFileName = `${uuidv4()}${ext}`;

    // Upload to Vercel Blob
    const { url } = await upload(uniqueFileName, file, {
      access: 'public',
      handleUploadUrl,
      clientPayload: { filename: uniqueFileName },
      token: import.meta.env.VITE_BLOB_READ_WRITE_TOKEN // 添加token
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
