import express from 'express';
import analyzeController from '../controllers/analyzeController.js';
import { validateUrl } from '../middlewares/validator.js';
import { analyzeLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Analyze URL for media information
router.post('/', validateUrl, analyzeLimiter, analyzeController.analyzeUrl);

// Get list of supported platforms
router.get('/platforms', analyzeController.getSupportedPlatforms);

export default router; 