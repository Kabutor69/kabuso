import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "../context/AudioContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import ErrorBoundary from "../components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kabuso - Free Music Streaming",
  description: "Stream millions of songs for free. Discover trending music, search your favorites, and enjoy unlimited streaming with Kabuso.",
  keywords: ["music streaming", "free music", "youtube music", "songs", "trending", "kabuso"],
  authors: [{ name: "Kabuso Team" }],
  creator: "Kabuso",
  publisher: "Kabuso",
  openGraph: {
    title: "Kabuso - Free Music Streaming",
    description: "Stream millions of songs for free. Discover trending music and enjoy unlimited streaming.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kabuso - Free Music Streaming",
    description: "Stream millions of songs for free",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#06b6d4",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#06b6d4" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Kabuso" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-cyan-400 overflow-x-hidden`}
      >
        <ErrorBoundary>
          <AudioProvider>
            <FavoritesProvider>
              {children}
            </FavoritesProvider>
          </AudioProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
