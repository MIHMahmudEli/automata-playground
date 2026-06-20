'use client';
import Link from 'next/link';

export default function WorkspaceNavbar({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <nav className="navbar-glass fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
              <i className="fas fa-arrow-left text-white text-xs sm:text-sm" />
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-bold text-sm sm:text-xl truncate">{title}</h1>
              <p className="text-purple-300 text-[10px] sm:text-xs font-mono hidden sm:block">{subtitle}</p>
            </div>
          </Link>
        </div>
      </div>
    </nav>
  );
}
