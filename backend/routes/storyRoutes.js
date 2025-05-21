// storyRoutes.js
import express from 'express';
import { generateStory } from '../controllers/storyController.js';

const router = express.Router();

router.post('/generate', generateStory);

export default router;