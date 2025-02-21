import fetch from 'node-fetch';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const translateToEnglish = async (text, retries = MAX_RETRIES) => {
  try {
    console.log('Translating text:', text);
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000',
        'Content-Type': 'application/json',
        'HTTP-User-Agent': '@teamsg/1.0.0'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          {
            role: "system",
            content: "You are a direct translator. Translate text to English using simple words. Return ONLY the English translation, no explanations or additional text."
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.1,
        max_tokens: 100
      })
    });

    const responseData = await response.json();
    console.log('Translation API response:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error('Translation API error:', responseData);
      if (response.status === 429 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return translateToEnglish(text, retries - 1);
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const translated = responseData.choices?.[0]?.message?.content?.trim() || text;
    console.log('Translation result:', translated);
    return translated;
  } catch (error) {
    console.error('translateToEnglish error:', error);
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return translateToEnglish(text, retries - 1);
    }
    throw error;
  }
};

const extractKeywords = async (text, retries = MAX_RETRIES) => {
  try {
    console.log('\n=== Text Processing ===');
    console.log('Original text:', text);

    // Always translate first
    const englishText = await translateToEnglish(text);
    console.log('Translated to English:', englishText);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000',
        'Content-Type': 'application/json',
        'HTTP-User-Agent': '@teamsg/1.0.0'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: [
          {
            role: "system",
            content: "Extract key words from the text (3-4 unique words). Return ONLY space-separated words with NO duplicates, no punctuation, no explanations."
          },
          {
            role: "user",
            content: `Example input: "find good customers for my business"
Example output: find customers business good

Input: ${englishText}
Return ONLY keywords:`
          }
        ],
        temperature: 0.1,
        max_tokens: 50
      })
    });

    const responseData = await response.json();
    console.log('Keywords API response:', JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error('Keywords API error:', responseData);
      if (response.status === 429 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return extractKeywords(text, retries - 1);
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const keywords = responseData.choices?.[0]?.message?.content?.trim() || '';
    console.log('Extracted keywords:', keywords);
    console.log('===================\n');
    return keywords;
  } catch (error) {
    console.error('extractKeywords error:', error);
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return extractKeywords(text, retries - 1);
    }
    throw error;
  }
};

export const extractKeywordsHandler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required and must be a string' });
    }

    console.log('\n[Extract Keywords Request]');
    console.log('Input text:', text);

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    const keywords = await extractKeywords(text);
    console.log('[Extract Keywords Response]');
    console.log('Final keywords:', keywords, '\n');
    return res.status(200).json({ keywords });
  } catch (error) {
    console.error('extractKeywordsHandler error:', error);
    return res.status(500).json({ error: error.message });
  }
};
