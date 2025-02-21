import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
import { getEmbeddingHandler } from './get-embedding.js';
import { analyzeVisionHandler } from './analyze-vision.js';
import { extractKeywordsHandler } from './extract-keywords.js';

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'development' 
    ? ['http://localhost:5174', 'http://localhost:5173'] 
    : process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Check OpenRouter API connectivity and model availability
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.VERCEL_URL || 'http://localhost:3000'
      }
    });

    if (!response.ok) {
      throw new Error('OpenRouter API connection failed');
    }

    const models = await response.json();
    const embeddingModel = process.env.OPENROUTER_EMBEDDING_MODEL || 'deepseek/deepseek-r1-distill-llama-70b:free';

    // Check model availability
    const modelInfo = models.data.find(m => m.id === embeddingModel);

    const isHealthy = !!modelInfo;
    const status = isHealthy ? 'healthy' : 'degraded';

    res.json({
      status,
      models: {
        embedding: {
          available: isHealthy,
          model: embeddingModel,
          error: !modelInfo ? 'Model not found' : null
        }
      },
      services: {
        openrouter: 'connected'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      models: {
        embedding: { available: false, error: 'Service unavailable' }
      }
    });
  }
});

// API routes
// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

app.post('/api/get-embedding', (req, res, next) => {
  console.log('Starting get-embedding handler with text:', req.body.text);
  getEmbeddingHandler(req, res).catch(next);
});

app.post('/api/analyze-vision', (req, res, next) => {
  console.log('Starting analyze-vision handler');
  analyzeVisionHandler(req, res).catch(next);
});

app.post('/api/extract-keywords', (req, res, next) => {
  console.log('Starting extract-keywords handler with text:', req.body.text);
  extractKeywordsHandler(req, res).catch(next);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasOpenRouterKey: !!process.env.OPENROUTER_API_KEY,
      model: process.env.OPENROUTER_EMBEDDING_MODEL
    }
  });

  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
