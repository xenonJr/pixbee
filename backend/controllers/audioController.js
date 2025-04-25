const { generateWav } = require('../services/ttsService');

async function generateAudio(req, res) {
  const { narration, sceneId } = req.body;

  if (!narration || !sceneId) {
    return res.status(400).json({ error: 'Narration and sceneId are required' });
  }

  try {
    const filePath = await generateWav(narration, sceneId);
    res.json({ success: true, file: `/audio/${sceneId}.wav` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Audio generation failed' });
  }
}

module.exports = { generateAudio };
