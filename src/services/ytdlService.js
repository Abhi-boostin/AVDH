import youtubedl from 'youtube-dl-exec';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class YtdlService {
  constructor() {
    this.downloadDir = path.join(__dirname, '../downloads');
    this.ensureDownloadDir();
  }

  async ensureDownloadDir() {
    await fs.ensureDir(this.downloadDir);
  }

  // Check if URL is supported
  async isSupported(url) {
    try {
      const info = await youtubedl(url, {
        dumpSingleJson: true,
        noDownload: true,
        skipDownload: true
      });
      return { supported: true, info };
    } catch (error) {
      return { supported: false, error: error.message };
    }
  }

  // Get video/audio info without downloading
  async getMediaInfo(url) {
    try {
      const info = await youtubedl(url, {
        dumpSingleJson: true,
        noDownload: true
      });

      return {
        title: info.title,
        uploader: info.uploader,
        duration: info.duration,
        description: info.description,
        thumbnail: info.thumbnail,
        formats: info.formats,
        extractor: info.extractor,
        webpage_url: info.webpage_url,
        isAudio: this.isAudioPlatform(info.extractor)
      };
    } catch (error) {
      throw new Error(`Failed to get media info: ${error.message}`);
    }
  }

  // Download media
  async downloadMedia(url, options = {}) {
    const fileId = this.generateFileId();
    const isAudio = options.audioOnly || this.isAudioPlatform(options.extractor);
    
    const downloadOptions = {
      output: path.join(this.downloadDir, `${fileId}.%(ext)s`),
      ...(isAudio ? {
        extractAudio: true,
        audioFormat: 'mp3',
        audioQuality: 0
      } : {
        format: 'best[height<=720]'
      })
    };

    try {
      await youtubedl(url, downloadOptions);
      
      // Find the downloaded file
      const files = await fs.readdir(this.downloadDir);
      const downloadedFile = files.find(file => file.startsWith(fileId));
      
      if (!downloadedFile) {
        throw new Error('Download completed but file not found');
      }

      return {
        fileId,
        filename: downloadedFile,
        path: path.join(this.downloadDir, downloadedFile),
        isAudio
      };
    } catch (error) {
      throw new Error(`Download failed: ${error.message}`);
    }
  }

  // Stream media directly (for immediate downloads)
  async streamMedia(url, res, options = {}) {
    const isAudio = options.audioOnly || this.isAudioPlatform(options.extractor);
    
    // Set appropriate headers
    const contentType = isAudio ? 'audio/mpeg' : 'video/mp4';
    const extension = isAudio ? 'mp3' : 'mp4';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="download.${extension}"`);

    try {
      const subprocess = youtubedl.exec(url, {
        format: isAudio ? 'bestaudio' : 'best[height<=720]',
        output: '-', // Output to stdout
        ...(isAudio && {
          extractAudio: true,
          audioFormat: 'mp3',
          audioQuality: 0
        })
      });

      subprocess.stdout.pipe(res);

      subprocess.stderr.on('data', (data) => {
        console.error(`yt-dlp error: ${data}`);
      });

      subprocess.on('error', (err) => {
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to download media', details: err.message });
        }
      });

      subprocess.on('close', (code) => {
        if (code !== 0 && !res.headersSent) {
          res.status(500).json({ 
            error: `yt-dlp exited with code ${code}. The site may not be supported or there was a download error.` 
          });
        }
        console.error(`yt-dlp exited with code ${code}`);
      });
    } catch (error) {
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to start download', details: error.message });
      }
    }
  }

  // Determine if platform is audio-only
  isAudioPlatform(extractor) {
    const audioPlatforms = [
      'soundcloud',
      'bandcamp',
      'mixcloud',
      'spotify',
      'deezer',
      'audiomack',
      'reverbnation'
    ];
    return audioPlatforms.some(platform => 
      extractor.toLowerCase().includes(platform)
    );
  }

  generateFileId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  // Clean up old files
  async cleanupOldFiles(maxAge = 30 * 60 * 1000) { // 30 minutes default
    try {
      const files = await fs.readdir(this.downloadDir);
      const now = Date.now();
      
      for (const file of files) {
        const filePath = path.join(this.downloadDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          console.log(`Cleaned up old file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  }
}

export default new YtdlService(); 