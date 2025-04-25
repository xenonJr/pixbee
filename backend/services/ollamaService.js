const { spawn } = require('child_process');

function runOllamaStoryGen(prompt) {
  return new Promise((resolve, reject) => {
    console.log('🟡 Starting Ollama story generation...');
    
    const ollama = spawn('ollama', ['run', 'mistral']);

    let result = '';
    ollama.stdout.on('data', (data) => {
      console.log('📥 Output from Ollama chunk:', data.toString());
      result += data.toString();
    });

    ollama.stderr.on('data', (data) => {
      console.error('❗ Error from Ollama:', data.toString());
    });

    ollama.on('close', (code) => {
      console.log(`✅ Ollama exited with code ${code}`);
      if (code !== 0) return reject(new Error(`Ollama exited with code ${code}`));
      resolve({ storyText: result.trim() });
    });

    // Write the prompt
    ollama.stdin.write(`Write a 3-scene children's story based on this: ${prompt}\n`);
    ollama.stdin.end();
  });
}

module.exports = { runOllamaStoryGen };
