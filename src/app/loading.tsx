import { Loader2, Music, Volume2, Headphones } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-cyan-400 flex items-center justify-center">
      <div className="text-center max-w-lg mx-auto px-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl p-16 border border-gray-700/50 shadow-2xl">
          {/* Animated Logo */}
          <div className="relative mb-12">
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-8 rounded-3xl shadow-2xl shadow-cyan-500/30 mx-auto w-32 h-32 flex items-center justify-center">
              <Music className="w-16 h-16 text-black" />
            </div>
            
            {/* Rotating loader around logo */}
            <div className="absolute inset-0 w-32 h-32 mx-auto">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2" />
              <Volume2 className="w-6 h-6 text-cyan-400 animate-bounce absolute bottom-0 left-0" style={{ animationDelay: '0.5s' }} />
              <Headphones className="w-6 h-6 text-cyan-400 animate-bounce absolute bottom-0 right-0" style={{ animationDelay: '1s' }} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent mb-6">
            Kabuso
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-gray-300 mb-8 font-medium">Loading your music experience...</p>
          
          {/* Progress indicators */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }}></div>
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }}></div>
          </div>

          {/* Loading bar */}
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>

          {/* Status text */}
          <p className="text-sm text-gray-500 mt-6">Initializing audio engine...</p>
        </div>
      </div>
    </div>
  );
}
