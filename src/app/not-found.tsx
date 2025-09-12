import type { Metadata } from "next";
import Link from "next/link";
import { Home, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Page Not Found - Kabuso",
  description: "The page you\'re looking for doesn\'t exist. Return to Kabuso music streaming.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#06b6d4",
  colorScheme: "dark",
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-cyan-400 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-6">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-gray-700/50">
          <div className="text-8xl font-bold text-cyan-500 mb-6">404</div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent mb-4">
            Page Not Found
          </h1>
          <p className="text-gray-400 mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          
          <div className="space-y-3">
            <Link 
              href="/"
              className="flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-lg font-semibold transition-colors w-full shadow-lg hover:shadow-cyan-500/20"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
            
            <Link 
              href="/search"
              className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-cyan-400 px-6 py-3 rounded-lg font-semibold transition-colors w-full"
            >
              <Search className="w-5 h-5" />
              Search Music
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
