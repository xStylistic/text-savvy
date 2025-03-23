


import express, { json } from 'express';
import fetch from 'node-fetch'; // Install this: npm install node-fetch
const app = express();
const port = process.env.PORT || 8000;

// Use built-in middleware to parse JSON
app.use(json());

app.get('/', (req, res) => {
  res.send("Hello from Express proxy!");
});

app.post('/cohere', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }
  
  try {
    const response = await fetch('https://api.cohere.ai/v2/generate', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer <API_KEY>', // Replace with your actual Cohere API key
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'command',
        prompt: prompt,
        temperature: 0.7,
        max_tokens: 100
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `Cohere API error: ${errorText}` });
    }
    
    const data = await response.json();
    const text = data.generations && data.generations[0] && data.generations[0].text
      ? data.generations[0].text.trim()
      : "";
    res.json({ text });
  } catch (error) {
    console.error('Error calling Cohere API:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});