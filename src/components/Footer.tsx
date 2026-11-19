import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-neutral-200/60 py-6 text-center text-xs text-neutral-400 dark:border-neutral-800/60 dark:text-neutral-500">
      <div className="flex items-center justify-center gap-1.5">
        <span>Powered by</span>
        <span className="font-medium text-neutral-600 dark:text-neutral-400">
          Gemini AI
        </span>
      </div>
    </footer>
  );
};
