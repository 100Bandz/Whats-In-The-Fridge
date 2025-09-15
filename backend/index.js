import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { OpenAI } from 'openai';
import db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api/recipes/generate', async (req, res) => {
  const { ingredients } = req.body;

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: 'Ingredients must be a non-empty array.' });
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages: [
        {
          role: 'system',
          content: 'You are a creative chef. Always return valid JSON with recipe ideas.'
        },
        {
          role: 'user',
          content: `Create 3 recipes using only these ingredients: ${ingredients.join(', ')}.
          Return JSON in this format exactly:
          [
            {
              "name": "Meal Name",
              "steps": []
            }
          ]`
        },
      ],
    });

    let recipes;
    try {
      recipes = JSON.parse(response.choices[0].message.content);
    } catch (parseErr) {
      console.error('Failed to parse OpenAI response:', parseErr);
      return res.status(500).json({ error: 'OpenAI returned invalid JSON.' });
    }

    res.json({ recipes });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to generate recipes.' });
  }
});

app.get('/', (req, res) => {
  res.send('Recipe Generator Backend is running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
