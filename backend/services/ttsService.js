// ttsService.js
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateWav = (text, sceneId) => {
    return new Promise((resolve, reject) => {
      const outputDir = path.join(__dirname, '..', 'audio');
      if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  
      const outputPath = path.join(outputDir, `${sceneId}.wav`);
      console.log('🎙 Generating audio for scene:', sceneId);
      console.log('📜 Narration:', text);
      console.log('📁 Output path:', outputPath);
  
      const pythonProcess = spawn('tts-env\\Scripts\\python.exe', [
        path.join(__dirname, '..', 'generate_audio.py'),
        text,
        outputPath
      ]);
  
      pythonProcess.stdout.on('data', data => {
        console.log('✅ PYTHON OUT:', data.toString());
      });
  
      pythonProcess.stderr.on('data', data => {
        console.error('❌ PYTHON ERR:', data.toString());
      });
  
      pythonProcess.on('close', code => {
        console.log('🔚 Python exited with code:', code);
        if (code !== 0) return reject(new Error('TTS script failed'));
        resolve(outputPath);
      });
    });
};

export { generateWav };