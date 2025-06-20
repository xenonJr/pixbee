// storyController.js
import { runOllamaStoryGen } from '../services/ollamaService.js';

async function generateStory(req, res) {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const story = await runOllamaStoryGen(prompt);
    res.json(story);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Story generation failed' });
  }
}

export { generateStory };