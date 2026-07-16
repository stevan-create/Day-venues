// server.js
// Simple backend that keeps your Anthropic API key private,
// and does the venue search on the friend's behalf.

const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.warn('⚠️  ANTHROPIC_API_KEY is not set. Set it before deploying.');
}

app.post('/api/search', async (req, res) => {
  const { location } = req.body;
  if (!location || typeof location !== 'string') {
    return res.status(400).json({ error: 'Missing location' });
  }

  const prompt = `Find small, local live-music venues or cafés in and around "${location}" that either host live music during working-day daytime hours (roughly 9am-5pm) OR are open during those hours and have a music/gig-friendly atmosphere. Use web search to find real, current places.

Return ONLY a JSON array (no markdown, no preamble, no code fences), where each item has:
- "name": venue name
- "type": one of "Daytime Live Music", "Open Daytime / Music Vibe", "Evening Only (FYI)"
- "hours": short hours summary relevant to daytime
- "note": one punchy sentence, max 18 words, on what to expect

Include at most 6 venues, prioritizing genuine daytime live-music options first. If you find none doing scheduled daytime live music, say so honestly in the note field rather than inventing one.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
        tools: [{ type: 'web_search_20250305', name: 'web_search' }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Anthropic API error:', errText);
      return res.status(502).json({ error: 'Upstream API error' });
    }

    const data = await response.json();
    const textBlocks = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');

    const cleaned = textBlocks.replace(/```json|```/g, '').trim();
    const match = cleaned.match(/\[[\s\S]*\]/);
    const venues = JSON.parse(match ? match[0] : cleaned);

    res.json({ venues });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed. Try again.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Venue finder running on port ${PORT}`));
