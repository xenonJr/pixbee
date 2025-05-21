// imageRoutes.js
import express from 'express';
import { generateSceneImage } from '../controllers/imageController.js';

const router = express.Router();

router.post('/generate', generateSceneImage);

export default router;