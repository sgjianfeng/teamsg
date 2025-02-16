import { getUploadUrl } from '@vercel/blob';
import { json } from '@vercel/edge';

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { url, clientPayload } = await getUploadUrl({
      access: 'public',
    });

    return json({ url, clientPayload });
  } catch (error) {
    console.error('Error getting upload URL:', error);
    return json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
