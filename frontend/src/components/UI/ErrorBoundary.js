// components/UI/ErrorBoundary.js — React error boundary
import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ink flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <span className="text-5xl block mb-6">⚠️</span>
            <h2 className="font-display text-2xl text-cream mb-3">Something went wrong</h2>
            <p className="font-body text-cream/50 text-sm mb-6">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-sand text-ink font-body font-semibold text-sm
                         hover:bg-sand-dark transition-all duration-200"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
