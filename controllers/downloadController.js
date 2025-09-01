const { exec } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const { promisify } = require('util');

const execAsync = promisify(exec);

class DownloadController {
    constructor() {
        this.downloadsDir = path.join(__dirname, '../downloads');
        // Full path to yt-dlp.exe
        this.ytdlpPath = 'C:\\Users\\Abhimanyu\\AppData\\Local\\Packages\\PythonSoftwareFoundation.Python.3.13_qbz5n2kfra8p0\\LocalCache\\local-packages\\Python313\\Scripts\\yt-dlp.exe';
    }

    downloadMedia = async (req, res) => {
        try {
            const { url } = req.body;
            const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
            const outputPath = path.join(this.downloadsDir, `${fileId}.%(ext)s`);

            // Simple yt-dlp command with full path - downloads best quality automatically
            const command = `"${this.ytdlpPath}" -o "${outputPath}" "${url}"`;
            
            await execAsync(command);
            
            // Find the downloaded file
            const files = await fs.readdir(this.downloadsDir);
            const downloadedFile = files.find(file => file.startsWith(fileId));
            
            if (!downloadedFile) {
                throw new Error('Download failed');
            }

            // Auto cleanup after 1 hour
            setTimeout(async () => {
                try {
                    await fs.unlink(path.join(this.downloadsDir, downloadedFile));
                } catch (error) {}
            }, 60 * 60 * 1000);

            res.json({
                success: true,
                filename: downloadedFile,
                downloadUrl: `/downloads/${downloadedFile}`
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Download failed',
                message: error.message
            });
        }
    }
}

module.exports = new DownloadController();
