'use client';
import Link from 'next/link';

export default function WorkspaceNavbar({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <nav className="navbar-glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <i className="fas fa-arrow-left text-white text-sm" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl">{title}</h1>
              <p className="text-purple-300 text-xs font-mono">{subtitle}</p>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
