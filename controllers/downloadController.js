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
            console.log('🔍 Testing yt-dlp commands...');
            for (const cmd of this.possibleCommands) {
                try {
                    console.log(`Trying: ${cmd}`);
                    await execAsync(`${cmd} --version`);
                    console.log(`✅ Found working command: ${cmd}`);
                    return cmd;
                } catch (error) {
                    console.log(`❌ ${cmd} failed:`, error.message);
                    continue;
                }
            }
            throw new Error('yt-dlp not found. Please install it: pip install yt-dlp');
        }

        downloadMedia = async (req, res) => {
            try {
                const { url } = req.body;
                console.log('📥 Download request for:', url);
                
                // Find working yt-dlp command
                const ytdlpCmd = await this.findWorkingYtdlp();
                console.log('🔧 Using command:', ytdlpCmd);
                
                // Get filename
                console.log('📋 Getting video info...');
                const infoCommand = `${ytdlpCmd} --print "%(title)s.%(ext)s" "${url}"`;
                const { stdout: filename } = await execAsync(infoCommand);
                const cleanFilename = filename.trim().replace(/[<>:"/\\|?*]/g, '_');
                console.log('📄 Filename:', cleanFilename);
                
                // Set download headers
                res.setHeader('Content-Disposition', `attachment; filename="${cleanFilename}"`);
                res.setHeader('Content-Type', 'application/octet-stream');
                
                // Stream directly to user
                const args = ytdlpCmd.split(' ');
                const command = args[0]; // FIXED BUG
                const baseArgs = args.slice(1);
                const fullArgs = [...baseArgs, '--format', 'best[height<=1080]/best', '--output', '-', url];
                
                console.log('🚀 Starting download with args:', fullArgs);
                
                const ytdlpProcess = spawn(command, fullArgs);
                
                ytdlpProcess.stderr.on('data', (data) => {
                    console.error('yt-dlp stderr:', data.toString());
                });
                
                ytdlpProcess.stdout.pipe(res);
                
                ytdlpProcess.on('error', (error) => {
                    console.error('❌ Process error:', error);
                    if (!res.headersSent) {
                        res.status(500).json({
                            success: false,
                            error: 'Download failed',
                            message: error.message
                        });
                    }
                });
                
                ytdlpProcess.on('close', (code) => {
                    console.log('Process closed with code:', code);
                    if (code !== 0 && !res.headersSent) {
                        res.status(500).json({
                            success: false,
                            error: 'Download failed',
                            message: `Process exited with code ${code}`
                        });
                    }
                });
                
            } catch (error) {
                console.error('❌ Controller error:', error);
                res.status(500).json({
                    success: false,
                    error: 'yt-dlp not available',
                    message: error.message
                });
            }
        }
    }

    module.exports = new DownloadController();
