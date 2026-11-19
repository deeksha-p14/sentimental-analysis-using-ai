import React from 'react';
import { Smile, Frown, Minus, CheckCircle2, AlertCircle, HelpCircle } from 'lucide-react';
import { SentimentType } from '../types';

interface PrimaryResultProps {
  sentiment: SentimentType;
  confidence: number;
  description: string;
}

export const PrimaryResult: React.FC<PrimaryResultProps> = ({
  sentiment,
  confidence,
  description,
}) => {
  const getSentimentConfig = (type: SentimentType) => {
    switch (type) {
      case 'Positive':
        return {
          label: 'POSITIVE',
          icon: Smile,
          statusIcon: CheckCircle2,
          containerBorder: 'border-emerald-200/80 dark:border-emerald-900/60',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
          dotBg: 'bg-emerald-500',
          confidenceBadge: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200/60 dark:border-emerald-900/50',
        };
      case 'Negative':
        return {
          label: 'NEGATIVE',
          icon: Frown,
          statusIcon: AlertCircle,
          containerBorder: 'border-rose-200/80 dark:border-rose-900/60',
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
          dotBg: 'bg-rose-500',
          confidenceBadge: 'text-rose-700 dark:text-rose-300 bg-rose-50/80 dark:bg-rose-950/40 border-rose-200/60 dark:border-rose-900/50',
        };
      case 'Neutral':
      default:
        return {
          label: 'NEUTRAL',
          icon: Minus,
          statusIcon: HelpCircle,
          containerBorder: 'border-slate-200/80 dark:border-slate-800/80',
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-900/80 dark:text-slate-300 dark:border-slate-800',
          dotBg: 'bg-slate-400 dark:bg-slate-500',
          confidenceBadge: 'text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-900/50 border-slate-200/60 dark:border-slate-800/60',
        };
    }
  };

  const config = getSentimentConfig(sentiment);
  const IconComponent = config.icon;

  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-subtle-light transition-all dark:bg-neutral-900/60 dark:shadow-subtle-dark ${config.containerBorder}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: Sentiment Badge & Indicator */}
        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold tracking-wider ${config.badgeBg}`}
          >
            <IconComponent className="h-4 w-4" aria-hidden="true" />
            <span>{config.label}</span>
          </div>

          {/* Model-estimated Confidence Score */}
          <div
            className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium font-mono ${config.confidenceBadge}`}
          >
            <span className="text-neutral-500 dark:text-neutral-400 font-sans font-normal">Confidence:</span>
            <span>{confidence.toFixed(1)}%</span>
          </div>
        </div>

        {/* Small model indicator */}
        <div className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono self-start sm:self-auto">
          Gemini 3.8 Flash
        </div>
      </div>

      {/* Description */}
      <p className="mt-3.5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        {description}
      </p>
    </div>
  );
};
