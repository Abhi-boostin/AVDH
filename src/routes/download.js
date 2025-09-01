import express from 'express';
import downloadController from '../controllers/downloadController.js';
import { validateUrl } from '../middlewares/validator.js';
import { downloadLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Initiate download (stream or file-based)
router.post('/', validateUrl, downloadLimiter, downloadController.initiateDownload);

// Download with custom options
router.post('/custom', validateUrl, downloadLimiter, downloadController.downloadWithOptions);

// Get download status
router.get('/status/:fileId', downloadController.getDownloadStatus);

export default router; 