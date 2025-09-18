# YouTube Data API v3 Configuration

## Setup Instructions

1. **Get YouTube Data API v3 Key**:
   - Go to [Google Cloud Console](https://console.developers.google.com/)
   - Create a new project or select existing one
   - Enable YouTube Data API v3
   - Create credentials (API Key)
   - Copy the API key

2. **Set Environment Variable**:
   ```bash
   # Create .env.local file in project root
   echo "YOUTUBE_API_KEY=your_actual_api_key_here" > .env.local
   ```

3. **Restart Development Server**:
   ```bash
   npm run dev
   ```

## API Endpoints

### Search APIs
- `GET /api/search?q=query&limit=20&type=all|artist|genre` - General search
- `GET /api/artist?artist=name&limit=20` - Search by artist
- `GET /api/genre?genre=name&limit=20` - Search by genre
- `GET /api/trending?limit=20` - Trending music
- `GET /api/related/[id]?q=query` - Related music

### Media APIs
- `GET /api/stream/[id]` - Audio stream (uses ytdl-core)
- `GET /api/video/[id]` - Video metadata

## Features

✅ **YouTube Data API v3 Integration**
- Official Google API (no bot detection)
- Accurate metadata (duration, views, thumbnails)
- Proper filtering (no shorts, minimum duration)

✅ **Enhanced Search Capabilities**
- General search
- Artist-specific search
- Genre-based search
- Trending music discovery
- Related music suggestions

✅ **Audio Streaming**
- High-quality audio extraction
- Proper MIME type handling
- Range request support

✅ **Type Safety**
- Full TypeScript support
- Proper error handling
- Build-time safety

## Migration Complete

The application has been successfully migrated from `youtube-sr` to Google's official YouTube Data API v3. All APIs are now using the official service and should work reliably in production without bot detection issues.
