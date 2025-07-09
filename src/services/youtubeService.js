import youtubedl from 'youtube-dl-exec';

export async function getYoutubeDownloadUrl(videoUrl) {
  try {
    // Get direct download URL (best quality by default)
    const output = await youtubedl(videoUrl, {
      dumpSingleJson: true, // Get all video info as JSON
      noCheckCertificates: true,
      preferFreeFormats: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
    });

    // You can access formats, title, etc. from output
    // Example: Return the best video+audio format URL
    const bestFormat = output.formats.find(f => f.format_id === output.format_id) || output.formats[0];

    return {
      title: output.title,
      url: bestFormat.url,
    };
  } catch (err) {
    throw err.stderr || err.message || 'Unknown error';
  }
}
