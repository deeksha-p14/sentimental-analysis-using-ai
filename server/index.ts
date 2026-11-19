import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { analyzeSentimentWithGemini } from './gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from project root, or parent, or home dir
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(os.homedir(), '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '100kb' }));

// Health / Status endpoint
app.get('/api/status', (_req: Request, res: Response) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey && apiKey.trim().length > 0 && !apiKey.includes('your_')),
    model: 'gemini-3.8-flash',
  });
});

// Analyze endpoint
app.post('/api/analyze', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Please provide valid, non-empty text to analyze.',
      });
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 20000) {
      return res.status(400).json({
        error: 'INPUT_TOO_LONG',
        message: 'Text exceeds the maximum allowed length of 20,000 characters.',
      });
    }

    const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();

    if (!apiKey || apiKey === 'your_gemini_api_key_here' || apiKey.length < 10) {
      return res.status(400).json({
        error: 'API_KEY_NOT_CONFIGURED',
        message:
          'GEMINI_API_KEY is not configured on the server. Please set your Gemini API key in the .env file in the sentiment-analysis directory.',
      });
    }

    const result = await analyzeSentimentWithGemini(trimmedText, apiKey);
    return res.json(result);
  } catch (error: any) {
    const message = error?.message || 'An unexpected error occurred during sentiment analysis.';
    console.error('[SentimentAnalysis API Error]:', message);
    return res.status(500).json({
      error: 'ANALYSIS_ERROR',
      message: message.replace(/(?:key=[A-Za-z0-9_-]+|AIza[A-Za-z0-9_-]+)/g, '[REDACTED]'),
    });
  }
});

import fs from 'fs';

// Static file serving when built
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  console.log(`[Server] Sentiment Analysis API server listening on http://localhost:${PORT}`);
  console.log(`[Server] Gemini API Key configured: ${hasKey ? 'YES' : 'NO (add to .env)'}`);
});
