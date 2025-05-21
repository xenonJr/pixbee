// flexService.js
import { Client } from '@gradio/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateImage(visualPrompt, sceneId) {
  console.log('🎨 Generating image for scene:', sceneId);
  console.log('🖼️ Visual prompt:', visualPrompt);
  
  try {
    // Connect to the Flex API
    const client = await Client.connect("http://127.0.0.1:7860/");
    
    // Call the API with the visual prompt
    await client.predict("/infer", {
      prompt: visualPrompt,
      checkpoint: "black-forest-labs/FLUX.1-schnell",
      seed: 0,
      guidance_scale: 3,
      num_images_per_prompt: 1,
      randomize_seed: true,
      width: 768,
      height: 768,
      num_inference_steps: 20,
    });
    
    console.log('✅ Image generation successful');
    
    // Create directory if it doesn't exist
    const outputDir = path.join(__dirname, '..', 'images');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    
    const imagePath = path.join(outputDir, `${sceneId}.png`);
    
    // Path to Pinokio output folder where images are being saved
    // Update this path to match your system
    const pinokioOutputPath = 'G:\\pinokio\\api\\flux-webui.git\\output';
    
    // Check if the directory exists
    if (!fs.existsSync(pinokioOutputPath)) {
      console.error(`Pinokio output directory not found: ${pinokioOutputPath}`);
      throw new Error('Pinokio output directory not found');
    }
    
    // Get all files in the directory
    const files = fs.readdirSync(pinokioOutputPath);
    
    if (files.length === 0) {
      console.error('No files found in Pinokio output directory');
      throw new Error('No files found in Pinokio output directory');
    }
    
    // Get file stats to find the most recently created file
    const fileStats = files.map(file => {
      const filePath = path.join(pinokioOutputPath, file);
      return {
        name: file,
        path: filePath,
        stats: fs.statSync(filePath)
      };
    });
    
    // Sort by creation time (most recent first)
    fileStats.sort((a, b) => b.stats.ctime.getTime() - a.stats.ctime.getTime());
    
    // Get the most recent file
    const mostRecentFile = fileStats[0];
    console.log(`Most recent file: ${mostRecentFile.name} (created at ${mostRecentFile.stats.ctime.toISOString()})`);
    
    // Copy the file
    console.log(`Copying from ${mostRecentFile.path} to ${imagePath}`);
    fs.copyFileSync(mostRecentFile.path, imagePath);
    console.log('✅ Image file copied successfully');
    
    return `/images/${sceneId}.png`;
  } catch (error) {
    console.error('❌ Image generation error:', error);
    throw new Error('Failed to generate image: ' + error.message);
  }
}

export { generateImage };