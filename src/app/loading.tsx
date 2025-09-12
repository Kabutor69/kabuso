import { Loader2, Music, Volume2, Headphones } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen bg-black text-cyan-300 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="h-8 w-40 bg-gray-800 rounded mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-xl p-3 border border-gray-800 bg-gray-900/60 animate-pulse">
              <div className="w-full aspect-square rounded-lg mb-3 bg-gray-800" />
              <div className="h-4 w-3/4 mb-2 bg-gray-800 rounded" />
              <div className="h-3 w-1/2 bg-gray-800 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
