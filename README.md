# 🎵 Kabuso 

> **Free Music Streaming Platform** - Stream millions of songs without subscriptions or ads

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![YouTube API](https://img.shields.io/badge/YouTube-Data%20API%20v3-red?style=flat&logo=youtube)](https://developers.google.com/youtube/v3)

A modern, fast, and beautiful music streaming platform built with Next.js and YouTube Data API v3. Discover trending music, search your favorites, and enjoy unlimited streaming.

## ✨ Features

- 🎵 **Free Music Streaming** - Stream any song from YouTube
- 🔍 **Smart Search** - Find songs, artists, and genres instantly
- 🔥 **Trending Music** - Discover what's popular right now
- ❤️ **Favorites** - Save your favorite songs locally
- 🎧 **High-Quality Audio** - Best available quality streaming
- 📱 **Responsive Design** - Perfect on desktop and mobile
- 🎛️ **Advanced Player** - Queue, shuffle, repeat modes
- ⚡ **Lightning Fast** - Intelligent caching and optimization

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd kabuso-new
npm install
```

### 2. Get YouTube API Key
1. Go to [Google Cloud Console](https://console.developers.google.com/)
2. Create a project and enable YouTube Data API v3
3. Create an API key

### 3. Setup Environment
```bash
# Create .env.local file
echo "YOUTUBE_API_KEY=your_api_key_here" > .env.local
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and enjoy! 🎶

## 🛠️ Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **YouTube Data API v3** - Official Google API
- **ytdl-core** - Audio streaming
- **Lucide React** - Beautiful icons

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── search/        # Search songs
│   │   ├── trending/      # Trending music
│   │   ├── stream/        # Audio streaming
│   │   ├── related/       # Related tracks
│   │   ├── artist/        # Artist search
│   │   └── genre/         # Genre search
│   ├── search/            # Search page
│   ├── favorites/         # Favorites page
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── TrackCard.tsx      # Music track display
│   ├── Playbar.tsx        # Music player
│   ├── Navbar.tsx         # Navigation
│   └── ErrorBoundary.tsx  # Error handling
├── context/               # React contexts
│   ├── AudioContext.tsx   # Audio state
│   └── FavoritesContext.tsx # Favorites
├── lib/                   # Utilities
│   ├── youtube.ts         # YouTube API service
│   └── searchService.ts   # Search with caching
└── hooks/                 # Custom hooks
    └── useApi.ts          # API management
```

## 🎯 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/search?q={query}&type={all\|artist\|genre}` | Search songs |
| `GET /api/trending` | Get trending music |
| `GET /api/stream/{id}` | Stream audio |
| `GET /api/related/{id}` | Get related tracks |
| `GET /api/artist?artist={name}` | Search by artist |
| `GET /api/genre?genre={name}` | Search by genre |
| `GET /api/video/{id}` | Get video metadata |

## 🎨 Key Features

### 🔍 Smart Search
- **Multi-type search** - All, Artist, Genre
- **Search history** - Persistent across sessions
- **Real-time results** - Instant search with debouncing
- **Play all** - Queue entire search results

### 🎵 Music Player
- **High-quality streaming** - Best available audio
- **Queue management** - Add, remove, reorder
- **Playback modes** - Normal, repeat, shuffle
- **Volume control** - Mute/unmute support
- **Progress seeking** - Jump to any position

### ❤️ Favorites System
- **Local storage** - No account required
- **Visual feedback** - Heart animations
- **Play all favorites** - Queue management
- **Persistent** - Survives browser restarts

### 📱 Mobile Optimized
- **Touch-friendly** - Swipe gestures
- **Responsive design** - Works on all screens
- **PWA ready** - Install as app
- **Fast loading** - Optimized performance

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add `YOUTUBE_API_KEY` environment variable
4. Deploy! ✨

### Other Platforms
- **Netlify** - Static hosting
- **Railway** - Full-stack hosting
- **Docker** - Container deployment

## ⚡ Performance

- **Intelligent Caching** - 5x faster repeated searches
- **Request Cancellation** - No memory leaks
- **Lazy Loading** - Images load on demand
- **Error Boundaries** - Crash-resistant app
- **TypeScript** - Compile-time error catching

## 🛡️ Error Handling

- **Global Error Boundary** - Catches app crashes
- **API Error Recovery** - Automatic retry logic
- **User-Friendly Messages** - Clear error descriptions
- **Graceful Degradation** - App keeps working

## 📱 Mobile Features

- **Touch Controls** - Swipe to navigate
- **Mobile Player** - Optimized for small screens
- **Responsive Grid** - Adapts to screen size
- **Fast Loading** - Optimized for mobile networks

## ⚠️ Important Notes

- **API Key Required** - Get free YouTube Data API v3 key
- **Rate Limits** - Respects YouTube API quotas
- **Educational Use** - Please respect copyright laws
- **No Account Needed** - Works without registration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is for educational purposes. Please respect YouTube's Terms of Service.

## 🙏 Acknowledgments

- **YouTube** - For the vast music library
- **Google** - For the YouTube Data API
- **Next.js Team** - For the amazing framework
- **All Contributors** - For making this possible

---

**Made with ❤️ by Kabutor**

*Enjoy unlimited music streaming!* 🎶
