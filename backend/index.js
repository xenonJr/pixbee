// index.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import storyRoutes from './routes/storyRoutes.js';
import audioRoutes from './routes/audioRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import videoRoutes from './routes/videoRoutes.js'; // Add this line

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.use('/audio', express.static(path.join(__dirname, 'audio')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/videos', express.static(path.join(__dirname, 'videos'))); // Add this line

app.use('/api/story', storyRoutes);
app.use('/api/audio', audioRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/video', videoRoutes); // Add this line

app.listen(3000, () => {
  console.log('Pixbee backend running at http://localhost:3000');
});