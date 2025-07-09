import express from 'express';
import dotenv from 'dotenv';
import { getYoutubeDownloadUrl } from './services/youtubeService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World');
});

// YouTube download API
app.get('/api/youtube', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }
  try {
    const data = await getYoutubeDownloadUrl(videoUrl);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch video', details: err });
  }
});

app.listen(port, () => {
  console.log(`App is listening on port: ${port}`);
});
