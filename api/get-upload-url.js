import { getUploadUrl } from '@vercel/blob';

// Remove runtime export as it's not needed for Edge Functions
export default async function handler(request) {
  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { url, clientPayload } = await getUploadUrl({
      access: 'public',
    });

    return new Response(JSON.stringify({ url, clientPayload }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting upload URL:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
