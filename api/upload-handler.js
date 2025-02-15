import { handleUpload } from '@vercel/blob/client';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  try {
    const response = await handleUpload({
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return response;
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to upload to Vercel Blob' }), 
      { status: 500 }
    );
  }
}
