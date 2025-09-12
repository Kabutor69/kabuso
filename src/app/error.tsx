"use client";
import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-cyan-400 flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 backdrop-blur-sm">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-4">
            Oops! Something went wrong
          </h1>
          <p className="text-red-300 mb-6">
            {error.message || "An unexpected error occurred while loading the page."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors font-semibold shadow-lg hover:shadow-red-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-cyan-400 px-6 py-3 rounded-lg transition-colors font-semibold"
            >
              <Home className="w-4 h-4" />
              Go home
            </Link>
          </div>
          {error.digest && (
            <p className="text-xs text-gray-500 mt-4">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
