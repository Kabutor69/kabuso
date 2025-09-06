import { Loader2, Music, Volume2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="bg-yellow-500 p-6 rounded-2xl animate-pulse shadow-2xl shadow-yellow-500/20">
            <Music className="w-16 h-16 text-black" />
          </div>
          <Loader2 className="absolute -top-2 -right-2 w-8 h-8 text-yellow-400 animate-spin" />
          <div className="absolute -bottom-2 -left-2 w-6 h-6 text-yellow-400 animate-bounce">
            <Volume2 className="w-full h-full" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-yellow-400 mb-2 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
          Loading Kabuso
        </h2>
        <p className="text-gray-400 mb-4">Preparing your music experience...</p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
