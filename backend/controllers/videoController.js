// videoController.js
import { generateVideo } from '../services/framepackService.js';

async function generateSceneVideo(req, res) {
  const { imagePath, sceneId } = req.body;

  if (!imagePath || !sceneId) {
    return res.status(400).json({ error: 'Image path and sceneId are required' });
  }

  try {
    const videoPath = await generateVideo(imagePath, sceneId);
    res.json({ success: true, file: videoPath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Video generation failed', details: err.message });
  }
}

export { generateSceneVideo };