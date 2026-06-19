'use client';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="navbar-glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <i className="fas fa-project-diagram text-white text-lg" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">Automata Theory</h1>
              <p className="text-purple-300 text-xs font-mono">Platform v2.0</p>
            </div>
          </Link>
          <div className="flex items-center space-x-6">
            <a href="/#topics" className="text-gray-300 hover:text-purple-400 transition duration-200">Topics</a>
            <a href="/#about" className="text-gray-300 hover:text-purple-400 transition duration-200">About</a>
            <a href="/#topics" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition duration-200">
              Get Started
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
