# AVDH - All Video Downloader Hub 🎮

**Retro 8-bit style media downloader with clean architecture!**

## ✨ What it does
- Paste any video/audio URL
- Analyze and detect platform automatically
- Download in multiple quality options
- Supports 1700+ platforms via yt-dlp
- **Retro 8-bit aesthetic** with pixel fonts and scanlines!

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start server**
   ```bash
   npm run dev
   ```

3. **Open browser**
   Go to `http://localhost:3000`

4. **Use it**
   - Paste any URL (YouTube, SoundCloud, TikTok, etc.)
   - Click "Analyze URL" to get media info
   - Choose quality: Video (1080p/720p) or Audio (MP3)
   - Download instantly!

## 📁 Project Structure
```
AVDH/
├── server.js              # Main server file
├── package.json           # Dependencies
├── controllers/           # Business logic
│   └── downloadController.js
├── routes/                # API endpoints
│   └── downloadRoutes.js
├── middleware/            # Request validation
│   └── validator.js
├── utils/                 # Platform detection
│   └── platformDetector.js
├── downloads/             # Temporary files
└── public/                # Frontend
    └── index.html         # Retro 8-bit UI
```

## 🔧 How it works
1. **Analyze**: `/api/analyze` gets media info without downloading
2. **Platform Detection**: Automatically detects YouTube, TikTok, SoundCloud, etc.
3. **Download**: `/api/download` with quality options (1080p, 720p, MP3)
4. **Serve**: Files served from `/downloads` directory

## 🌐 Supported Platforms
- **YouTube, Vimeo, TikTok**
- **SoundCloud, Bandcamp**
- **Instagram, Twitter, Facebook**
- **And 1700+ more!**

## 🎨 Retro Features
- **Pixel Fonts**: Authentic 8-bit typography
- **Scanlines**: CRT monitor effect
- **Glitch Animation**: Retro glitch effects
- **Pixel Borders**: Chunky pixelated borders
- **Retro Sounds**: 8-bit button click sounds

## 💡 Architecture Benefits
- **Clean Separation**: Controllers, routes, middleware
- **Easy to Extend**: Add new features easily
- **Validation**: Input validation and error handling
- **Platform Detection**: Smart URL analysis
- **Quality Options**: Multiple download formats

## 🚀 API Endpoints

### Analyze URL
```http
POST /api/analyze
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=..."
}
```

### Download Media
```http
POST /api/download
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=...",
  "type": "video",
  "quality": "1080p"
}
```

## 🎯 That's it!
Clean architecture + retro aesthetics = Awesome AVDH! 🎮

---

**Made with ❤️ for retro gaming nostalgia**
