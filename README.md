# Kabuso - Free Music Streaming Platform

A modern, free music streaming platform built with Next.js and ytdl-core. Stream millions of songs from YouTube Music without any subscriptions or ads.

## ✨ Features

- 🎵 **Free Music Streaming** - Stream any song from YouTube Music
- 🔍 **Advanced Search** - Find songs, artists, and albums instantly
- 🔥 **Trending Music** - Discover what's popular right now
- ❤️ **Favorites System** - Save your favorite songs locally
- 🎧 **High-Quality Audio** - Stream in the best available quality
- 📱 **Responsive Design** - Works perfectly on desktop and mobile
- 🎛️ **Advanced Player** - Full-featured music player with queue management
- 🔄 **Playback Modes** - Normal, repeat, repeat-one, and shuffle
- 📊 **Queue Management** - Add, remove, and reorder songs
- 🎨 **Modern UI** - Beautiful dark theme with smooth animations

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- npm 9.0.0 or higher

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd kabuso-new
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Built With

- **Next.js 15** - React framework for production
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **ytdl-core** - YouTube video/audio downloader
- **youtube-sr** - YouTube search library
- **Lucide React** - Beautiful icons
- **React Context** - State management

## 📁 Project Structure

```
kabuso-new/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   │   ├── search/     # Search endpoint
│   │   │   ├── trending/   # Trending songs
│   │   │   ├── stream/     # Audio streaming
│   │   │   └── related/    # Related tracks
│   │   ├── favorites/      # Favorites page
│   │   ├── search/         # Search page
│   │   └── page.tsx        # Homepage
│   ├── components/         # React components
│   │   ├── Navbar.tsx      # Navigation bar
│   │   └── Playbar.tsx     # Music player
│   ├── context/            # React contexts
│   │   ├── AudioContext.tsx    # Audio state management
│   │   └── FavoritesContext.tsx # Favorites management
│   └── app/                # App configuration
├── public/                 # Static assets
└── package.json           # Dependencies
```

## 🎯 API Endpoints

- `GET /api/search?q={query}` - Search for songs
- `GET /api/trending` - Get trending songs
- `GET /api/stream/{id}` - Stream audio for a video ID
- `GET /api/related/{id}` - Get related tracks

## 🎨 Features Overview

### Homepage
- Trending music discovery
- Beautiful hero section
- Quick action cards
- Responsive grid layout

### Search
- Real-time search with debouncing
- Search history
- Advanced filtering
- Play all results

### Favorites
- Local storage persistence
- Add/remove favorites
- Play all favorites
- Visual feedback

### Music Player
- Full-featured audio controls
- Queue management
- Volume control
- Progress seeking
- Playback modes (normal, repeat, shuffle)

## 🔧 Configuration

The app uses environment variables for configuration. Create a `.env.local` file:

```env
# Optional: Custom API configurations
NEXT_PUBLIC_APP_NAME=Kabuso
NEXT_PUBLIC_APP_DESCRIPTION=Free Music Streaming
```

## 📱 Mobile Support

Kabuso is fully responsive and optimized for mobile devices:
- Touch-friendly controls
- Mobile-optimized player
- Responsive navigation
- Swipe gestures support

## 🎵 How It Works

1. **Search**: Uses youtube-sr to search YouTube for music
2. **Streaming**: ytdl-core extracts and streams audio directly
3. **Caching**: Trending results are cached for better performance
4. **Storage**: Favorites and settings are stored locally

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## ⚠️ Disclaimer

This application is for educational purposes only. Please respect YouTube's Terms of Service and copyright laws. The developers are not responsible for any misuse of this software.

## 🙏 Acknowledgments

- YouTube Music for the vast music library
- ytdl-core developers for the excellent library
- Next.js team for the amazing framework
- All contributors and users

---

**Made with ❤️ by the Kabutor**