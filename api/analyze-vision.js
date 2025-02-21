import fetch from 'node-fetch';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const makeRequest = async (imageUrls, prompt, retries = MAX_RETRIES) => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_VISION_MODEL || 'google/gemini-2.0-pro-exp-02-05:free',
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `${prompt}\nProvide a clear and factual description focusing on visible elements. Respond in a concise paragraph without assumptions or interpretations.`
              },
              ...imageUrls.map(url => ({
                type: "image_url",
                image_url: url
              }))
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return makeRequest(imageUrls, prompt, retries - 1);
      }
      
      const errorData = await response.json();
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData.error || errorData.message}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return makeRequest(imageUrls, prompt, retries - 1);
    }
    throw error;
  }
};

export const analyzeVisionHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrls, prompt } = req.body;
    
    if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
      return res.status(400).json({ error: 'Image URLs array is required' });
    }

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required and must be a string' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    const result = await makeRequest(imageUrls, prompt);
    
    return res.status(200).json({
      result: result.choices[0].message.content,
      model: process.env.OPENROUTER_VISION_MODEL || 'google/gemini-2.0-pro-exp-02-05:free'
    });
  } catch (error) {
    console.error('analyzeVisionHandler error:', error);
    
    const statusCode = error.message.includes('API request failed') ? 502 : 500;
    
    return res.status(statusCode).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
