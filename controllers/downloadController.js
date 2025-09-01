const { spawn } = require('child_process');
const { promisify } = require('util');
const { exec } = require('child_process');

const execAsync = promisify(exec);

class DownloadController {
    constructor() {
        // Try different yt-dlp commands until one works
        this.possibleCommands = [
            'yt-dlp',           // System PATH
            'python3 -m yt_dlp', // Python module
            'python -m yt_dlp',  // Python (Windows)
            './yt-dlp',         // Local binary
            'yt-dlp.exe'        // Windows binary
        ];
    }

    async findWorkingYtdlp() {
        for (const cmd of this.possibleCommands) {
            try {
                await execAsync(`${cmd} --version`);
                return cmd;
            } catch (error) {
                continue;
            }
        }
        throw new Error('yt-dlp not found. Please install it: pip install yt-dlp');
    }

    downloadMedia = async (req, res) => {
        try {
            const { url } = req.body;
            
            // Find working yt-dlp command
            const ytdlpCmd = await this.findWorkingYtdlp();
            
            // Get filename
            const infoCommand = `${ytdlpCmd} --print "%(title)s.%(ext)s" "${url}"`;
            const { stdout: filename } = await execAsync(infoCommand);
            const cleanFilename = filename.trim().replace(/[<>:"/\\|?*]/g, '_');
            
            // Set download headers
            res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
            res.setHeader('Content-Type', 'application/octet-stream');
            
            // Stream directly to user
            const args = ytdlpCmd.split(' ');
            const command = args;
            const baseArgs = args.slice(1);
            const fullArgs = [...baseArgs, '--format', 'best[height<=1080]/best', '--output', '-', url];
            
            const ytdlpProcess = spawn(command, fullArgs);
            ytdlpProcess.stdout.pipe(res);
            
            ytdlpProcess.on('error', (error) => {
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        error: 'Download failed',
                        message: error.message
                    });
                }
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'yt-dlp not available',
                message: 'Run: npm run setup'
            });
        }
    }
}

module.exports = new DownloadController();
