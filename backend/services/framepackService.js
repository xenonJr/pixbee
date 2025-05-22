// framepackService.js with fallback mechanism
import { Client } from '@gradio/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to wait for a specified time
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Function to check if a new MP4 file has appeared in the output directory
async function waitForNewVideo(outputPath, timeout = 120000, checkInterval = 2000) {
  const startTime = Date.now();
  
  // Get initial MP4 files
  const initialFiles = fs.existsSync(outputPath) 
    ? fs.readdirSync(outputPath).filter(file => file.endsWith('.mp4')) 
    : [];
  
  // Get initial timestamps
  const initialFileStats = initialFiles.map(file => {
    const filePath = path.join(outputPath, file);
    return {
      name: file,
      path: filePath,
      timestamp: fs.statSync(filePath).ctime.getTime()
    };
  });
  
  console.log(`Initially found ${initialFiles.length} MP4 files in output directory`);
  
  // Keep checking until timeout
  while (Date.now() - startTime < timeout) {
    await wait(checkInterval);
    
    if (!fs.existsSync(outputPath)) {
      console.log('Output directory does not exist, waiting...');
      continue;
    }
    
    // Get current MP4 files
    const currentFiles = fs.readdirSync(outputPath).filter(file => file.endsWith('.mp4'));
    
    // If no files initially, any file is new
    if (initialFiles.length === 0 && currentFiles.length > 0) {
      console.log('New MP4 file detected (no initial files)');
      return true;
    }
    
    // Check for new files
    for (const file of currentFiles) {
      const filePath = path.join(outputPath, file);
      const stats = fs.statSync(filePath);
      const timestamp = stats.ctime.getTime();
      
      // Check if this file is newer than all initial files
      const isNew = initialFileStats.every(initialFile => timestamp > initialFile.timestamp);
      
      if (isNew) {
        console.log(`New MP4 file detected: ${file}`);
        return true;
      }
    }
    
    console.log('No new MP4 files detected yet, continuing to wait...');
  }
  
  console.log('Timeout reached, no new MP4 files detected');
  return false;
}

async function generateVideo(imagePath, sceneId) {
  console.log('🎬 Generating video for scene:', sceneId);
  console.log('🖼️ Using image:', imagePath);
  
  // Path to Framepack output folder where videos are saved
  const framepackOutputPath = 'G:\\pinokio\\api\\Frame-Pack.git\\app\\outputs';
  
  try {
    // First attempt: try using the API
    try {
      console.log('Attempting to use Framepack API...');
      const client = await Client.connect("http://127.0.0.1:42003/");
      
      // Read the image file as binary data
      const fullImagePath = path.join(__dirname, '..', imagePath.replace(/^\//, ''));
      if (!fs.existsSync(fullImagePath)) {
        throw new Error(`Image file not found: ${fullImagePath}`);
      }
      
      const imageFile = fs.readFileSync(fullImagePath);
      
      // Call the API with the image
      await client.predict("/process", {
        input_image: imageFile,
        prompt: "Cinematic, detailed, high quality animation", 
        n_prompt: "Blurry, low quality, distorted",
        seed: 42,
        total_second_length: 2,
        latent_window_size: 9,
        steps: 25,
        cfg: 10,
        gs: 10,
        rs: 0,
        gpu_memory_preservation: 6,
        use_teacache: true,
      });
      
      console.log('✅ API call successful, waiting for video to appear...');
    } catch (apiError) {
      console.error('❌ API call failed:', apiError);
      console.log('Continuing with fallback approach...');
      
      // We'll continue with the fallback approach even if the API call fails
    }
    
    // Wait for a new video to appear in the output directory
    console.log(`Waiting for new video to appear in ${framepackOutputPath}...`);
    const newVideoAppeared = await waitForNewVideo(framepackOutputPath, 720000); // Wait up to 3 minutes
    
    if (!newVideoAppeared) {
      console.error('❌ No new video appeared within the timeout period');
      throw new Error('No new video appeared within the timeout period');
    }
    
    // Create videos directory if it doesn't exist
    const outputDir = path.join(__dirname, '..', 'videos');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    
    // Check if the directory exists
    if (!fs.existsSync(framepackOutputPath)) {
      console.error(`Framepack output directory not found: ${framepackOutputPath}`);
      throw new Error('Framepack output directory not found');
    }
    
    // Get all MP4 files in the directory
    const files = fs.readdirSync(framepackOutputPath)
      .filter(file => file.endsWith('.mp4'));
    
    if (files.length === 0) {
      console.error('No MP4 files found in Framepack output directory');
      throw new Error('No MP4 files found in Framepack output directory');
    }
    
    // Get file stats to find the most recently created MP4 file
    const fileStats = files.map(file => {
      const filePath = path.join(framepackOutputPath, file);
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
    console.log(`Most recent video file: ${mostRecentFile.name} (created at ${mostRecentFile.stats.ctime.toISOString()})`);
    
    // Copy the file with a new name based on sceneId
    const videoPath = path.join(outputDir, `${sceneId}.mp4`);
    console.log(`Copying from ${mostRecentFile.path} to ${videoPath}`);
    fs.copyFileSync(mostRecentFile.path, videoPath);
    console.log('✅ Video file copied successfully');
    
    return `/videos/${sceneId}.mp4`;
  } catch (error) {
    console.error('❌ Video generation error:', error);
    throw new Error('Failed to generate video: ' + error.message);
  }
}

export { generateVideo };