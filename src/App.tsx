import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TextInput } from './components/TextInput';
import { PrimaryResult } from './components/PrimaryResult';
import { SentimentBreakdown } from './components/SentimentBreakdown';
import { AdditionalAnalysis } from './components/AdditionalAnalysis';
import { Footer } from './components/Footer';
import { SentimentAnalysisResponse, ServerStatusResponse } from './types';
import { AlertCircle, RotateCcw, Key } from 'lucide-react';

export const App: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SentimentAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);

  // Check server API status on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data: ServerStatusResponse) => {
        setHasApiKey(data.hasApiKey);
      })
      .catch((_err) => {
        // Backend not yet running or network issue
        setHasApiKey(null);
      });
  }, []);

  const handleAnalyze = async () => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Sentiment analysis failed. Please try again.');
      }

      setResult(data);
      // If success, server definitely has valid key
      setHasApiKey(true);
    } catch (err: any) {
      setError(err?.message || 'A network error occurred while communicating with the server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setResult(null);
    setError(null);
  };

  const handleSelectSample = (sampleText: string) => {
    setText(sampleText);
    setResult(null);
    setError(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#fafafc] transition-colors dark:bg-[#0c0e14]">
      {/* Top Header */}
      <Header />

      {/* Main Single-Page Content */}
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-6">
          {/* Hero Section */}
          <Hero />

          {/* Missing API Key Notice (only if explicitly reported by server) */}
          {hasApiKey === false && !result && (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
              <div className="flex items-start gap-2.5">
                <Key className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Gemini API Key Required</p>
                  <p className="leading-relaxed opacity-90">
                    Set your <code className="font-mono bg-amber-100/80 dark:bg-amber-900/60 px-1 py-0.5 rounded">GEMINI_API_KEY</code> in the <code className="font-mono bg-amber-100/80 dark:bg-amber-900/60 px-1 py-0.5 rounded">.env</code> file in the project folder to enable live AI classification.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Input Section */}
          <TextInput
            text={text}
            onChange={setText}
            onAnalyze={handleAnalyze}
            onClear={handleClear}
            isLoading={isLoading}
            hasResult={Boolean(result)}
            onSelectSample={handleSelectSample}
          />

          {/* Error Message with Retry */}
          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/90 p-4 text-xs text-rose-800 shadow-sm dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium">Analysis Failed</p>
                    <p className="leading-relaxed opacity-90">{error}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="inline-flex items-center gap-1 shrink-0 rounded-md border border-rose-300 bg-white px-2.5 py-1 text-xs font-medium text-rose-800 transition-colors hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-900/50 dark:text-rose-200 dark:hover:bg-rose-900"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          )}

          {/* Dynamic Results Sections */}
          {result && (
            <div className="mt-6 space-y-4 animate-in fade-in duration-300">
              {/* Primary Result Section */}
              <PrimaryResult
                sentiment={result.sentiment}
                confidence={result.confidence}
                description={result.description}
              />

              {/* Sentiment Breakdown */}
              <SentimentBreakdown probabilities={result.probabilities} />

              {/* Additional Analysis */}
              <AdditionalAnalysis
                tone={result.tone}
                keyIndicators={result.key_indicators}
                explanation={result.explanation}
              />
            </div>
          )}
        </div>
      </main>

      {/* Minimal Footer */}
      <Footer />
    </div>
  );
};
