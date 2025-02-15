import { createEdgeRouter } from '@vercel/edge';
import { handleUpload } from '@vercel/blob/client';

export const config = {
  runtime: 'edge',
};

const router = createEdgeRouter();

router.post(async (request) => {
  try {
    const response = await handleUpload({
      request,
      token: process.env.BLOB_READ_WRITE_TOKEN,
      options: {
        access: 'public',
      }
    });

    return response;
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to upload to Vercel Blob',
        details: error.message 
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
});

export default router;
