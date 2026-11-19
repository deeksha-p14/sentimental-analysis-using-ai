import React from 'react';
import { Tag, Compass, Info } from 'lucide-react';

interface AdditionalAnalysisProps {
  tone: string;
  keyIndicators: string[];
  explanation: string;
}

export const AdditionalAnalysis: React.FC<AdditionalAnalysisProps> = ({
  tone,
  keyIndicators,
  explanation,
}) => {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-subtle-light dark:border-neutral-800 dark:bg-neutral-900/60 dark:shadow-subtle-dark">
      <div className="flex items-center justify-between pb-3.5 border-b border-neutral-100 dark:border-neutral-800/80">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
          Detailed Analysis
        </h2>
        <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
          Contextual indicators
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {/* 1. Overall Tone */}
        <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:w-28 shrink-0">
            <Compass className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
            <span>Overall Tone</span>
          </div>
          <div className="text-xs font-medium text-neutral-800 dark:text-neutral-200 capitalize">
            {tone}
          </div>
        </div>

        {/* 2. Key Indicators */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:w-28 shrink-0 pt-0.5">
            <Tag className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
            <span>Key Indicators</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {keyIndicators.length > 0 ? (
              keyIndicators.map((phrase, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-300 font-mono"
                >
                  "{phrase}"
                </span>
              ))
            ) : (
              <span className="text-xs text-neutral-400">No specific indicators extracted</span>
            )}
          </div>
        </div>

        {/* 3. Brief AI Explanation */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-3 pt-1 border-t border-neutral-100 dark:border-neutral-800/60">
          <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:w-28 shrink-0 pt-0.5">
            <Info className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500" />
            <span>Explanation</span>
          </div>
          <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
            {explanation}
          </p>
        </div>
      </div>
    </div>
  );
};
