import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { MeshFeature } from '../types';
const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/chat', async (req, res) => {
  try {
    const { context, question }: { context: MeshFeature[]; question: string } = req.body;

    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: 'You are a helpful assistant that analyzes population mesh data and answers questions.',
      },
      {
        role: 'user',
        content: `Here is the mesh data:\n${JSON.stringify(context, null, 2)}\n\nNow answer the following question:\n${question}`
      }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
    });

    const message = completion.choices[0].message.content || 'No reply.';
    res.json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error calling OpenAI.' });
  }
});

export default router;
