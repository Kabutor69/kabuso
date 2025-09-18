"use client";
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen bg-black text-cyan-300 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-red-400">Something went wrong</h2>
          <p className="text-gray-400 mb-6">
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={resetError}
              className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AudioErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 m-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-red-400 font-semibold">Audio Error</h3>
              <p className="text-red-300 text-sm">
                {error?.message || 'Failed to load audio'}
              </p>
            </div>
            <button
              onClick={resetError}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export function SearchErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="text-center py-12">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-400 mb-2">Search failed</h3>
            <p className="text-red-300 text-sm mb-4">
              {error?.message || 'Unable to search for music'}
            </p>
            <button 
              onClick={resetError}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary;
