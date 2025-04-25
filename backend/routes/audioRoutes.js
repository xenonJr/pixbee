const express = require('express');
const router = express.Router();
const { generateAudio } = require('../controllers/audioController');

router.post('/generate', generateAudio);

module.exports = router;
