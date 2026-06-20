'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar-glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-project-diagram text-white text-sm sm:text-lg" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-base sm:text-xl truncate">Automata Theory</h1>
              <p className="text-purple-300 text-[10px] sm:text-xs font-mono hidden sm:block">Platform v2.0</p>
            </div>
          </Link>

          <button className="lg:hidden p-2 text-gray-300 hover:text-white transition" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'} text-xl`} />
          </button>

          <div className="hidden lg:flex items-center space-x-6">
            <a href="/#topics" className="text-gray-300 hover:text-purple-400 transition duration-200">Topics</a>
            <a href="/#about" className="text-gray-300 hover:text-purple-400 transition duration-200">About</a>
            <a href="/#topics" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition duration-200">
              Get Started
            </a>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-white/10 space-y-3 pb-2">
            <a href="/#topics" className="block text-gray-300 hover:text-purple-400 transition duration-200 py-2" onClick={() => setMenuOpen(false)}>Topics</a>
            <a href="/#about" className="block text-gray-300 hover:text-purple-400 transition duration-200 py-2" onClick={() => setMenuOpen(false)}>About</a>
            <a href="/#topics" className="block text-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition duration-200" onClick={() => setMenuOpen(false)}>
              Get Started
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
