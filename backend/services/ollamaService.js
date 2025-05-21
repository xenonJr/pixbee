// ollamaService.js
import { spawn } from 'child_process';

function runOllamaStoryGen(prompt) {
  return new Promise((resolve, reject) => {
    const ollama = spawn('ollama', ['run', 'mistral']);

    let result = '';
    ollama.stdout.on('data', (data) => {
      result += data.toString();
    });

    ollama.stderr.on('data', (data) => {
     // console.error('Ollama stderr:', data.toString());
    });

    ollama.on('close', (code) => {
      if (code !== 0) return reject(new Error(`Ollama exited with code ${code}`));
      
      try {
        console.log('Raw Ollama output:', result);  
        const parsed = JSON.parse(result);
        resolve(parsed);
      } catch (e) {
        console.error('❌ JSON Parse Error:', e);
        console.error('Received raw text:', result);
        reject(new Error('Failed to parse story JSON'));
      }
    });

    const structuredPrompt = `
You are a children's story writer.
Write a short story with exactly 3 scenes based on this idea: "${prompt}"

Return the result in the following JSON format only:

{
  "title": "Story Title",
  "scenes": [
    {
      "narration": "Narration text for scene 1",
      "visualPrompt": "Visual description for scene 1"
    },
    {
      "narration": "Narration text for scene 2",
      "visualPrompt": "Visual description for scene 2"
    },
    {
      "narration": "Narration text for scene 3",
      "visualPrompt": "Visual description for scene 3"
    }
  ]
}
`;

    ollama.stdin.write(structuredPrompt);
    ollama.stdin.end();
  });
}

export { runOllamaStoryGen };