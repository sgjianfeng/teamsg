export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://teamsg.vercel.app', // Replace with your actual domain
        'X-Title': 'TeamSG'
      },
      body: JSON.stringify({
        model: 'deepseek-ai/deepseek-coder-6.7b',
        input: text
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json({ embedding: data.data[0].embedding });
  } catch (error) {
    console.error('Error getting embedding:', error);
    return res.status(500).json({ error: error.message });
  }
}
