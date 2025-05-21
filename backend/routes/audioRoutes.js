// audioRoutes.js
import express from 'express';
import { generateAudio } from '../controllers/audioController.js';

const router = express.Router();

router.post('/generate', generateAudio);

export default router;