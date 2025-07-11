// service/download.js
import youtubedl from 'youtube-dl-exec';

/**
 * Streams video from a supported URL using yt-dlp.
 * @param {string} videoUrl - The URL of the video to download.
 * @param {object} res - The Express response object to stream data to.
 */
export function streamVideo(videoUrl, res) {
  // Set headers for file download
  res.setHeader('Content-Disposition', 'attachment; filename="video.mp4"');
  res.setHeader('Content-Type', 'video/mp4');

  // Spawn yt-dlp process and pipe output to response
  const subprocess = youtubedl.exec(videoUrl, {
    format: 'bestvideo+bestaudio/best',
    output: '-', // Output to stdout
  });

  subprocess.stdout.pipe(res);

  subprocess.stderr.on('data', (data) => {
    console.error(`yt-dlp error: ${data}`);
  });

  subprocess.on('error', (err) => {
    res.status(500).json({ error: 'Failed to download video', details: err.message });
  });
}