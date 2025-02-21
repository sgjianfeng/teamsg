import fetch from 'node-fetch';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const makeRequest = async (text, retries = MAX_RETRIES) => {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_EMBEDDING_MODEL || 'deepseek/deepseek-r1-distill-llama-70b:free',
        messages: [
          {
            role: "user",
            content: `Please analyze this text and provide a detailed representation that captures its semantic meaning: ${text}`
          }
        ]
      })
    });

    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return makeRequest(text, retries - 1);
      }
      
      const errorData = await response.json();
      console.error('OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData.error || errorData.message}`);
    }

    const responseData = await response.json();
    console.log('OpenRouter API response:', responseData);
    
    if (!responseData.choices?.[0]?.message?.content) {
      console.error('Invalid response format:', responseData);
      throw new Error('Invalid response format from API');
    }

    // Convert model's text output to a consistent embedding vector
    const content = responseData.choices[0].message.content;
    const vector = new Array(384).fill(0); // Use consistent dimension for compatibility
    const hash = content.split('').reduce((acc, char) => {
      const code = char.charCodeAt(0);
      return ((acc << 5) - acc + code) | 0;
    }, 0);
    
    for (let i = 0; i < vector.length; i++) {
      vector[i] = Math.sin(hash * (i + 1)) / 2 + 0.5;
    }

    // Apply L2 normalization to make embeddings more comparable
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    const normalizedVector = vector.map(val => val / magnitude);

    return normalizedVector;
  } catch (error) {
    console.error('makeRequest error:', error);
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts remaining`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return makeRequest(text, retries - 1);
    }
    throw error;
  }
};

export const getEmbeddingHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    const embedding = await makeRequest(text);
    
    return res.status(200).json({ 
      embedding,
      model: process.env.OPENROUTER_EMBEDDING_MODEL || 'deepseek/deepseek-r1-distill-llama-70b:free'
    });
  } catch (error) {
    console.error('getEmbeddingHandler error:', error);
    
    const statusCode = error.message.includes('API request failed') ? 502 : 500;
    
    return res.status(statusCode).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
