import React from 'react';
import { SentimentProbabilities } from '../types';

interface SentimentBreakdownProps {
  probabilities: SentimentProbabilities;
}

export const SentimentBreakdown: React.FC<SentimentBreakdownProps> = ({ probabilities }) => {
  const bars = [
    {
      key: 'positive',
      label: 'Positive',
      value: probabilities.positive,
      barColor: 'bg-emerald-500 dark:bg-emerald-400',
      textColor: 'text-emerald-700 dark:text-emerald-300',
    },
    {
      key: 'neutral',
      label: 'Neutral',
      value: probabilities.neutral,
      barColor: 'bg-slate-400 dark:bg-slate-500',
      textColor: 'text-slate-600 dark:text-slate-300',
    },
    {
      key: 'negative',
      label: 'Negative',
      value: probabilities.negative,
      barColor: 'bg-rose-500 dark:bg-rose-400',
      textColor: 'text-rose-700 dark:text-rose-300',
    },
  ];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-subtle-light dark:border-neutral-800 dark:bg-neutral-900/60 dark:shadow-subtle-dark">
      {/* Section Title */}
      <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100 dark:border-neutral-800/80">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
          Sentiment Breakdown
        </h2>
        <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
          Estimated probabilities
        </span>
      </div>

      {/* Probability Bars */}
      <div className="mt-4 space-y-3.5">
        {bars.map((bar) => {
          const clampedValue = Math.min(100, Math.max(0, bar.value));
          return (
            <div key={bar.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">
                  {bar.label}
                </span>
                <span className="font-mono font-medium text-neutral-600 dark:text-neutral-400">
                  {clampedValue.toFixed(1)}%
                </span>
              </div>

              {/* Progress Bar Container */}
              <div
                className="h-2 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800"
                role="progressbar"
                aria-valuenow={clampedValue}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${bar.label} sentiment probability`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${bar.barColor}`}
                  style={{ width: `${clampedValue}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
