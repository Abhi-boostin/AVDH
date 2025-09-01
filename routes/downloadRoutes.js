const express = require('express');
const router = express.Router();
const downloadController = require('../controllers/downloadController');
const validator = require('../middleware/validator');

// Fix: Bind the method to preserve 'this' context
router.post('/download', validator.validateUrl, downloadController.downloadMedia.bind(downloadController));

module.exports = router;
