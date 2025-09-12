"use client";

import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body className="min-h-screen bg-black text-cyan-300 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-gray-900/60 border border-gray-800 rounded-2xl p-6 text-center">
          <div className="text-2xl font-bold gradient-text mb-2">Something went wrong</div>
          <p className="text-gray-400 text-sm mb-4 break-words">{error?.message || "Unexpected error"}</p>
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => reset()} className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 rounded-lg font-semibold">Try again</button>
            <Link href="/" className="px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-800">Go home</Link>
          </div>
        </div>
      </body>
    </html>
  );
}
