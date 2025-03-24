const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();

// Configure CORS with specific options
app.use(cors({
  origin: true, // Allow all origins
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Parse JSON bodies
app.use(express.json());

const COHERE_API_KEY = process.env.COHERE_API_KEY;

// Health check endpoint for Render
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'TextSavy API is running' });
});

app.post('/api/translate', async (req, res) => {
  try {
    const { text, language } = req.body;
    const response = await fetch("https://api.cohere.ai/v2/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-r-plus",
        prompt: `Translate the following text to ${language}:\n\n${text}\n\nONLY OUTPUT THE TRANSLATED TEXT`,
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    res.json({ text: data.generations[0].text.trim() });
  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/modify', async (req, res) => {
  try {
    const { text, prompt } = req.body;
    const response = await fetch("https://api.cohere.ai/v2/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-r-plus",
        prompt: prompt.replace("{{text}}", text),
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    res.json({ text: data.generations[0].text.trim() });
  } catch (error) {
    console.error('Modification error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});