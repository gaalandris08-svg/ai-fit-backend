
import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json({ limit: '1mb' }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const INSTRUCTIONS = `
You are the AI assistant inside AI FIT.

You are a genuinely intelligent, friendly, general-purpose AI.
You can talk about ANY topic, not only fitness.

You can help with:
- School, science and technology
- Cars, travel and hobbies
- Writing, languages and everyday questions
- Fitness, workouts and nutrition

Rules:
- Respond in the same language as the user.
- Be natural, helpful and conversational.
- Understand follow-up questions.
- Use previous messages as conversation context.
- Never give generic replies when a specific answer is possible.
- Explain complex topics clearly.
- Be honest if you are uncertain.
- Keep simple answers concise.

Fitness:
- Give useful workout and nutrition guidance.
- Use the user's profile when relevant.
- Never recommend dangerous diets or unsafe training.
- Do not diagnose medical conditions.

Your identity is AI FIT AI Assistant.
`;

app.get('/', (req, res) => {
  res.json({ status: 'AI FIT backend is running!' });
});

app.post('/chat', async (req, res) => {
  try {
    const { messages, profile } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'No messages provided.'
      });
    }

    const history = messages
      .filter(m =>
        m &&
        ['user', 'assistant'].includes(m.role) &&
        typeof m.content === 'string'
      )
      .slice(-20);

    const profileContext = profile
      ? `
User profile:
Goal: ${profile.goal || 'Not specified'}
Experience: ${profile.experience || 'Not specified'}
Age: ${profile.age || 'Not specified'}
Height: ${profile.height || 'Not specified'}
Weight: ${profile.weight || 'Not specified'}
Training days: ${profile.days || 'Not specified'}
Equipment: ${profile.equipment || 'Not specified'}
`
      : 'No profile provided.';

    const response = await client.responses.create({
      model: 'gpt-6-luna',
      instructions: INSTRUCTIONS + '\n' + profileContext,
      input: history,
      max_output_tokens: 900
    });

    const reply = response.output_text?.trim();

    if (!reply) {
      throw new Error('Empty AI response.');
    }

    res.json({ reply });

  } catch (error) {
    console.error('AI FIT error:', error);

    res.status(500).json({
      error: 'AI assistant could not respond.'
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('AI FIT backend running on port ' + PORT);
});
