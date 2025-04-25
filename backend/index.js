const express = require('express');
const cors = require('cors');
const storyRoutes = require('./routes/storyRoutes');
const audioRoutes = require('./routes/audioRoutes');



const app = express();
app.use(cors());
app.use(express.json());

const path = require('path');
app.use('/audio', express.static(path.join(__dirname, 'audio')));

app.use('/api/story', storyRoutes);
app.use('/api/audio', audioRoutes);

app.listen(3000, () => {
  console.log('Pixbee backend running at http://localhost:3000');
});
