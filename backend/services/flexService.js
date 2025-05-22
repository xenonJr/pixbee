// flexService.js
import { Client } from '@gradio/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function generateImage(visualPrompt, sceneId) {
  console.log('🎨 Generating image for scene:', sceneId);
  console.log('🖼️ Visual prompt:', visualPrompt);
  
  try {
    // Path to Pinokio output folder where images are being saved
    const pinokioOutputPath = 'G:\\pinokio\\api\\flux-webui.git\\output';
    
    // Check if the directory exists
    if (!fs.existsSync(pinokioOutputPath)) {
      console.error(`Pinokio output directory not found: ${pinokioOutputPath}`);
      throw new Error('Pinokio output directory not found');
    }
    
    console.log('📂 Getting initial file list...');
    // Get initial files and their timestamps BEFORE calling the API
    const initialFiles = fs.readdirSync(pinokioOutputPath);
    const initialFileTimestamps = new Map();
    
    initialFiles.forEach(file => {
      const filePath = path.join(pinokioOutputPath, file);
      try {
        const stats = fs.statSync(filePath);
        initialFileTimestamps.set(file, stats.ctime.getTime());
      } catch (error) {
        console.log(`Error getting stats for file ${file}:`, error.message);
      }
    });
    
    console.log(`📊 Found ${initialFiles.length} initial files`);
    
    // Connect to the Flex API
    console.log('🔌 Connecting to Flex API...');
    const client = await Client.connect("http://127.0.0.1:7860/");
    
    // Call the API with the visual prompt
    console.log('📤 Sending request to Flex API...');
    const apiStartTime = Date.now();
    
    await client.predict("/infer", {
      prompt: visualPrompt,
      checkpoint: "black-forest-labs/FLUX.1-schnell",
      seed: 0,
      guidance_scale: 3,
      num_images_per_prompt: 1,
      randomize_seed: true,
      width: 768,
      height: 768,
      num_inference_steps: 4,
    });
    
    const apiEndTime = Date.now();
    console.log(`✅ API call completed in ${(apiEndTime - apiStartTime) / 1000}s`);
    console.log('⏳ Waiting for image file to appear...');
    
    // Wait for new image to appear (with timeout)
    const maxWaitTime = 5 * 60 * 1000; // 5 minutes
    const checkInterval = 3000; // Check every 3 seconds
    const startWaitTime = Date.now();
    
    let newImageFound = false;
    let mostRecentFile = null;
    
    while (!newImageFound && (Date.now() - startWaitTime) < maxWaitTime) {
      await wait(checkInterval);
      
      try {
        // Get current files
        const currentFiles = fs.readdirSync(pinokioOutputPath);
        console.log(`🔍 Checking for new files... (${Math.round((Date.now() - startWaitTime) / 1000)}s elapsed)`);
        
        // Check for completely new files
        const newFiles = currentFiles.filter(file => !initialFileTimestamps.has(file));
        
        if (newFiles.length > 0) {
          console.log(`🆕 Found ${newFiles.length} new files: ${newFiles.join(', ')}`);
          // Get the most recent of the new files
          const newFileStats = newFiles.map(file => {
            const filePath = path.join(pinokioOutputPath, file);
            return {
              name: file,
              path: filePath,
              stats: fs.statSync(filePath)
            };
          });
          
          newFileStats.sort((a, b) => b.stats.ctime.getTime() - a.stats.ctime.getTime());
          mostRecentFile = newFileStats[0];
          newImageFound = true;
          break;
        }
        
        // Also check for modified existing files
        for (const file of currentFiles) {
          if (initialFileTimestamps.has(file)) {
            const filePath = path.join(pinokioOutputPath, file);
            const stats = fs.statSync(filePath);
            const currentTimestamp = stats.ctime.getTime();
            const initialTimestamp = initialFileTimestamps.get(file);
            
            if (currentTimestamp > initialTimestamp) {
              console.log(`📝 File ${file} was modified`);
              mostRecentFile = {
                name: file,
                path: filePath,
                stats: stats
              };
              newImageFound = true;
              break;
            }
          }
        }
        
      } catch (error) {
        console.error('Error checking for new files:', error.message);
        await wait(1000); // Wait a bit before retrying
      }
    }
    
    if (!newImageFound) {
      console.error('❌ Timeout: No new image file appeared within 5 minutes');
      throw new Error('Image generation timed out - no new file detected');
    }
    
    console.log(`🎉 New image detected: ${mostRecentFile.name} (created at ${mostRecentFile.stats.ctime.toISOString()})`);
    
    // Create directory if it doesn't exist
    const outputDir = path.join(__dirname, '..', 'images');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    
    const imagePath = path.join(outputDir, `${sceneId}.png`);
    
    // Copy the file
    console.log(`📋 Copying from ${mostRecentFile.path} to ${imagePath}`);
    fs.copyFileSync(mostRecentFile.path, imagePath);
    console.log('✅ Image file copied successfully');
    
    return `/images/${sceneId}.png`;
  } catch (error) {
    console.error('❌ Image generation error:', error);
    throw new Error('Failed to generate image: ' + error.message);
  }
}

export { generateImage };