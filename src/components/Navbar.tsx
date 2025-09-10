"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Home, Music, Heart } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  
  const linkClasses = (path: string) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
      pathname === path
        ? "bg-cyan-500 text-black shadow-lg"
        : "text-cyan-400 hover:bg-gray-800 hover:text-cyan-300"
    }`;

  const iconClass = "w-4 h-4";

  return (
    <nav className="w-full bg-gradient-to-r from-black/95 to-gray-900/95 border-b border-gray-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
      
      <Link href="/" className="flex items-center gap-2 group">
        {/* <div className="bg-cyan-500 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-200">
          <Music className="w-6 h-6 text-black" />
        </div> */}
        <div>
          <h1 className="text-xl font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors">
            Kabuso
          </h1>
          <p className="text-xs text-gray-500 hidden sm:block">Free Music Streaming</p>
        </div>
      </Link>

      {/* Navigation Links */}
      <div className="flex gap-3">
        <Link href="/" className={linkClasses("/")}>
          <Home className={iconClass} />
          <span className="hidden sm:inline">Home</span>
        </Link>
        <Link href="/search" className={linkClasses("/search")}>
          <Search className={iconClass} />
          <span className="hidden sm:inline">Search</span>
        </Link>
        <Link href="/favorites" className={linkClasses("/favorites")}>
          <Heart className={iconClass} />
          <span className="hidden sm:inline">Favorites</span>
        </Link>
      </div>

    </nav>
  );
}
