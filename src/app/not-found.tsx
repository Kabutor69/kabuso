import type { Metadata } from "next";
import Link from "next/link";

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
    <div className="min-h-screen bg-black text-cyan-300 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-900/60 border border-gray-800 rounded-2xl p-8 text-center">
        <div className="text-5xl font-black gradient-text mb-3">404</div>
        <h1 className="text-xl font-bold mb-2">Page not found</h1>
        <p className="text-gray-400 text-sm mb-6">The page you are looking for doesn 27t exist or was moved.</p>
        <Link href="/" className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-2 rounded-lg font-semibold inline-block">Go home</Link>
      </div>
    </div>
  );
}
