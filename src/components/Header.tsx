import React, { useEffect, useState } from 'react';
import { Sun, Moon, MessageSquareText } from 'lucide-react';

export const Header: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (isDark) {
      document.documentElement.classList.add('dark');
      meta?.setAttribute('content', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      meta?.setAttribute('content', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    // Add temporary transition class for smooth visual switch
    document.documentElement.classList.add('theme-transition');
    setIsDark((prev) => !prev);
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 250);
  };

  return (
    <header className="w-full border-b border-neutral-200/80 bg-[#fafafc]/90 backdrop-blur-sm dark:border-neutral-800/80 dark:bg-[#0c0e14]/90 sticky top-0 z-40 transition-colors">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900 text-white shadow-sm dark:bg-neutral-100 dark:text-neutral-900">
            <MessageSquareText className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            Sentiment Analysis
          </span>
        </div>

        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 bg-white text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-1.5 focus-visible:ring-neutral-400 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:focus-visible:ring-neutral-600"
        >
          {isDark ? (
            <Sun className="h-4 w-4 transition-transform hover:rotate-45" aria-hidden="true" />
          ) : (
            <Moon className="h-4 w-4 transition-transform hover:-rotate-12" aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  );
};
