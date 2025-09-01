const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');
const validator = require('../middleware/validator');

// Test endpoint
router.get('/test', async (req, res) => {
    try {
        const { exec } = require('child_process');
        const { promisify } = require('util');
        const execAsync = promisify(exec);
        
        const result = await execAsync('yt-dlp --version');
        res.json({
            success: true,
            message: 'yt-dlp is working',
            version: result.stdout
        });
    } catch (error) {
        res.json({
            success: false,
            error: error.message
        });
    }
});

router.post('/download', validator.validateUrl, downloadController.downloadMedia.bind(downloadController));

module.exports = router;
