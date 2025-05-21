// videoRoutes.js
import express from 'express';
import { generateSceneVideo } from '../controllers/videoController.js';

const router = express.Router();

router.post('/generate', generateSceneVideo);

export default router;