require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static('public'));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Store FAQs with their embeddings
let faqStore = {
  items: [],
  embeddings: []
};

// Create embedding for a piece of text
async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  return response.data[0].embedding;
}

// Cosine similarity between two vectors
function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Upload FAQs
app.post('/api/faqs', async (req, res) => {
  try {
    const { faqs } = req.body;

    if (!Array.isArray(faqs) || faqs.length === 0) {
      return res.status(400).json({ error: 'Send an array of {question, answer} objects.' });
    }

    console.log(`Processing ${faqs.length} FAQs...`);

    // Create embeddings for all questions
    const embeddings = [];
    for (const faq of faqs) {
      const embedding = await getEmbedding(faq.question);
      embeddings.push(embedding);
    }

    faqStore = {
      items: faqs,
      embeddings
    };

    console.log(`Loaded ${faqs.length} FAQs with embeddings.`);
    res.json({ message: `Loaded ${faqs.length} FAQs. The bot is ready.`, count: faqs.length });
  } catch (err) {
    console.error('FAQ upload error:', err.message);
    res.status(500).json({ error: 'Failed to process FAQs. Check your API key.' });
  }
});

// Ask a question
app.post('/api/ask', async (req, res) => {
  try {
    const { question } = req.body;

    if (faqStore.items.length === 0) {
      return res.json({
        answer: "No FAQs loaded yet. Upload some questions and answers first, then try again.",
        confidence: 0,
        matchedQuestion: null
      });
    }

    // Get embedding for the user's question
    const questionEmbedding = await getEmbedding(question);

    // Find the best match
    let bestScore = -1;
    let bestIndex = 0;

    for (let i = 0; i < faqStore.embeddings.length; i++) {
      const score = cosineSimilarity(questionEmbedding, faqStore.embeddings[i]);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    const confidence = Math.round(bestScore * 100);
    const matched = faqStore.items[bestIndex];

    if (confidence < 50) {
      res.json({
        answer: "I'm not sure about that one. It doesn't match any of the FAQs closely enough. Maybe try asking in a different way?",
        confidence,
        matchedQuestion: null
      });
    } else {
      res.json({
        answer: matched.answer,
        confidence,
        matchedQuestion: matched.question
      });
    }
  } catch (err) {
    console.error('Ask error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

// Get current FAQs
app.get('/api/faqs', (req, res) => {
  res.json(faqStore.items);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`FAQ bot running on http://localhost:${PORT}`);
});
