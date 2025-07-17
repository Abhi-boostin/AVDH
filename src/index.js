import express from 'express';
import dotenv from 'dotenv';
import { streamVideo } from './services/download.js';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;
app.use(express.static('public'));
app.get('/', (req, res) => {
  res.send('Hello World');
});
app.get('/api/download', (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing url query parameter' });
  }
  streamVideo(videoUrl, res);
});

app.listen(port, () => {
  console.log(`App is listening on port: ${port}`);
});
