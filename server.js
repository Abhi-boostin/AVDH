const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

const downloadRoutes = require('./routes/downloadRoutes');

const app = express();

// Ensure downloads directory exists
const downloadsDir = path.join(__dirname, 'downloads');
fs.ensureDirSync(downloadsDir);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Serve downloads directory
app.use('/downloads', express.static('downloads'));

// Routes
app.use('/api', downloadRoutes);

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('🎮 AVDH Server running on port', PORT);
    console.log('📥 Ready to download from 1700+ platforms!');
}); 