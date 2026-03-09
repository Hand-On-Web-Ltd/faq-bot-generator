# FAQ Bot Generator

Got a list of frequently asked questions? Upload them here and get a working chatbot in seconds. The bot uses OpenAI embeddings to understand what people are really asking, even when they don't use the exact same words as your FAQ.

Perfect for customer support pages, dental practices, law firms, or any business that answers the same questions over and over.

## How It Works

1. Upload your FAQs (JSON or paste them in)
2. The server creates embeddings for each question
3. When someone asks something, it finds the closest matching FAQ
4. Returns the answer with a confidence score

No training needed. No ML knowledge required. Just your questions and answers.

## Setup

```bash
git clone https://github.com/Hand-On-Web-Ltd/faq-bot-generator.git
cd faq-bot-generator
npm install
cp .env.example .env
# Add your OpenAI API key to .env
npm start
```

Open `http://localhost:3000` — you'll see two panels:
- **Left:** Upload and manage your FAQs
- **Right:** Test the chatbot with real questions

## FAQ Format

Your JSON should look like this:

```json
[
  {
    "question": "What are your opening hours?",
    "answer": "We're open Monday to Friday, 9am to 5pm."
  }
]
```

A sample FAQ file for a dental practice is included so you can try it straight away.

## Environment Variables

| Variable | What it is |
|----------|-----------|
| `OPENAI_API_KEY` | Your OpenAI API key |
| `PORT` | Server port (default: 3000) |

## Tech Stack

- Node.js + Express
- OpenAI Embeddings API (text-embedding-3-small)
- Cosine similarity for matching
- Vanilla JS frontend

## About Hand On Web
We build AI chatbots, voice agents, and automation tools for businesses.
- 🌐 [handonweb.com](https://www.handonweb.com)
- 📧 outreach@handonweb.com
- 📍 Chester, UK

## Licence
MIT
