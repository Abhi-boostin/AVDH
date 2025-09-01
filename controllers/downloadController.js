const { spawn } = require('child_process');
const { promisify } = require('util');
const { exec } = require('child_process');

const execAsync = promisify(exec);

class DownloadController {
    constructor() {
        this.possibleCommands = [
            'yt-dlp',           
            'python3 -m yt_dlp', 
            'python -m yt_dlp',  
            './yt-dlp',         
            'yt-dlp.exe'        
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
            
            const ytdlpCmd = await this.findWorkingYtdlp();
            
            const infoCommand = `${ytdlpCmd} --print "%(title)s.%(ext)s" "${url}"`;
            const { stdout: filename } = await execAsync(infoCommand);
            const cleanFilename = filename.trim().replace(/[<>:"/\\|?*]/g, '_');
            
            res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
            res.setHeader('Content-Type', 'application/octet-stream');
            
            const args = ytdlpCmd.split(' ');
            const command = args[0];
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
            
            ytdlpProcess.on('close', (code) => {
                if (code !== 0 && !res.headersSent) {
                    res.status(500).json({
                        success: false,
                        error: 'Download failed',
                        message: `Process exited with code ${code}`
                    });
                }
            });
            
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'yt-dlp not available',
                message: error.message
            });
        }
    }
}

module.exports = new DownloadController();
