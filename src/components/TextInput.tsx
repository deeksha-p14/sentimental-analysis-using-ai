import React, { useRef } from 'react';
import { Loader2, Sparkles, X, CornerDownLeft } from 'lucide-react';

interface TextInputProps {
  text: string;
  onChange: (value: string) => void;
  onAnalyze: () => void;
  onClear: () => void;
  isLoading: boolean;
  hasResult: boolean;
  onSelectSample?: (sampleText: string) => void;
}

const SAMPLE_TEXTS = [
  {
    label: 'Positive',
    text: 'The customer support team was remarkably fast, courteous, and resolved our system outage within minutes. Genuinely impressed!',
  },
  {
    label: 'Negative',
    text: 'Battery drains completely after just two hours of minimal use, and customer support refused to honor the warranty.',
  },
  {
    label: 'Neutral',
    text: 'The product was delivered on Tuesday afternoon in a standard brown cardboard box without additional packaging.',
  },
];

export const TextInput: React.FC<TextInputProps> = ({
  text,
  onChange,
  onAnalyze,
  onClear,
  isLoading,
  hasResult,
  onSelectSample,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const trimmed = text.trim();
  const isEmpty = trimmed.length === 0;
  const charCount = text.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd+Enter or Ctrl+Enter submits
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isEmpty && !isLoading) {
        onAnalyze();
      }
    }
  };

  return (
    <div className="w-full">
      {/* Input container */}
      <div className="relative rounded-xl border border-neutral-200 bg-white shadow-sm transition-all focus-within:border-neutral-400 focus-within:ring-1 focus-within:ring-neutral-400 dark:border-neutral-800 dark:bg-neutral-900/80 dark:focus-within:border-neutral-700 dark:focus-within:ring-neutral-700">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={5}
          placeholder="Enter a review, comment or feedback to analyse..."
          className="w-full resize-y rounded-t-xl bg-transparent px-4 py-3.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none disabled:opacity-60 dark:text-neutral-100 dark:placeholder-neutral-500 min-h-[120px] max-h-[400px]"
          aria-label="Text to analyze sentiment"
        />

        {/* Action bar beneath textarea */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 px-3.5 py-2.5 dark:border-neutral-800/80">
          {/* Left: Character counter & hint */}
          <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500">
            <span className="font-mono">{charCount.toLocaleString()}</span>
            <span>characters</span>
            <span className="hidden sm:inline-block text-neutral-300 dark:text-neutral-700">·</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px]">
              <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1 py-0.5 text-[10px] font-mono text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400">
                Ctrl
              </kbd>
              +
              <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1 py-0.5 text-[10px] font-mono text-neutral-500 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400">
                Enter
              </kbd>
            </span>
          </div>

          {/* Right: Reset & Analyze buttons */}
          <div className="flex items-center gap-2">
            {(text.length > 0 || hasResult) && (
              <button
                type="button"
                onClick={onClear}
                disabled={isLoading}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-50 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
                title="Clear input and results"
              >
                <X className="h-3.5 w-3.5" />
                <span>Clear</span>
              </button>
            )}

            <button
              type="button"
              onClick={onAnalyze}
              disabled={isEmpty || isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-neutral-900 px-3.5 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 dark:disabled:bg-neutral-800 dark:disabled:text-neutral-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-400 dark:text-neutral-600" />
                  <span>Analysing sentiment...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400 dark:text-indigo-600" />
                  <span>Analyse with Gemini</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick sample chips */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
          Try a sample:
        </span>
        {SAMPLE_TEXTS.map((sample) => (
          <button
            key={sample.label}
            type="button"
            disabled={isLoading}
            onClick={() => onSelectSample?.(sample.text)}
            className="rounded-md border border-neutral-200 bg-neutral-50/80 px-2 py-0.5 text-[11px] text-neutral-600 transition-colors hover:border-neutral-300 hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900/60 dark:text-neutral-400 dark:hover:border-neutral-700 dark:hover:bg-neutral-850"
          >
            {sample.label}
          </button>
        ))}
      </div>
    </div>
  );
};
