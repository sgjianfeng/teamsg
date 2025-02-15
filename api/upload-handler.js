import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(request) {
  try {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const form = await request.formData();
    const file = form.get('file');

    if (!file) {
      return new Response('File is required', { status: 400 });
    }

    // Generate unique filename
    const uniqueId = uuidv4();
    const ext = file.name.split('.').pop();
    const filename = `${uniqueId}.${ext}`;

    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    });

    return new Response(
      JSON.stringify({
        url: blob.url
      }), 
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
