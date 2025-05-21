// imageController.js
import { generateImage } from '../services/flexService.js';

async function generateSceneImage(req, res) {
  const { visualPrompt, sceneId } = req.body;

  if (!visualPrompt || !sceneId) {
    return res.status(400).json({ error: 'Visual prompt and sceneId are required' });
  }

  try {
    const imagePath = await generateImage(visualPrompt, sceneId);
    res.json({ success: true, file: imagePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Image generation failed', details: err.message });
  }
}

export { generateSceneImage };