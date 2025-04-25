const express = require('express');
const cors = require('cors');
const storyRoutes = require('./routes/storyRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/story', storyRoutes);

app.listen(3000, () => {
  console.log('Pixbee backend running at http://localhost:3000');
});
