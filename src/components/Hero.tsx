import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="text-center pt-8 pb-6 sm:pt-12 sm:pb-8">
      {/* Subtle small label */}
      <div className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100/70 px-2.5 py-0.5 text-[11px] font-medium tracking-wider text-neutral-600 uppercase dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400 mb-3.5">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" aria-hidden="true" />
        AI-POWERED ANALYSIS
      </div>

      {/* Main heading */}
      <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-100">
        Sentiment Analysis
      </h1>

      {/* Subtitle */}
      <p className="mt-2 text-sm text-neutral-500 sm:text-base dark:text-neutral-400 max-w-md mx-auto">
        Discover the emotion behind words using AI.
      </p>
    </section>
  );
};
