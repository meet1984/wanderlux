// components/UI/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-sand/8 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 text-center">
        <p className="font-display text-8xl text-sand/20 font-bold mb-4">404</p>
        <h1 className="font-display text-3xl text-cream mb-3">Page not found</h1>
        <p className="font-body text-cream/50 mb-8">
          Looks like this destination doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sand text-ink
                     font-body font-semibold hover:bg-sand-dark transition-all duration-200"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
