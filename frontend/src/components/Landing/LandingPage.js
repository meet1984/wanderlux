// components/Landing/LandingPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const destinations = [
  { name: 'Kyoto', emoji: '⛩️', tag: 'Cultural' },
  { name: 'Santorini', emoji: '🏛️', tag: 'Romantic' },
  { name: 'Bali', emoji: '🌴', tag: 'Nature' },
  { name: 'New York', emoji: '🗽', tag: 'Urban' },
  { name: 'Patagonia', emoji: '🏔️', tag: 'Adventure' },
  { name: 'Marrakech', emoji: '🕌', tag: 'Exotic' },
];

const features = [
  {
    icon: '🤖',
    title: 'AI-Powered Planning',
    desc: 'Google Gemini crafts a personalized day-by-day itinerary in seconds.',
  },
  {
    icon: '🗺️',
    title: 'Complete Itineraries',
    desc: 'Every attraction, restaurant, transport tip, and budget — all in one place.',
  },
  {
    icon: '📄',
    title: 'PDF Download',
    desc: 'Export your entire trip plan as a beautifully formatted PDF to take offline.',
  },
  {
    icon: '🔄',
    title: 'Unlimited Regeneration',
    desc: 'Not happy? Regenerate your itinerary until it\'s perfect for you.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = () => navigate(user ? '/plan' : '/register');

  return (
    <div className="bg-ink min-h-screen font-body overflow-x-hidden">

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sand/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-sky/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sand/5 rounded-full blur-3xl" />

          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-5"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto pt-24">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sand/30 bg-sand/10 mb-8 animate-fade-in">
            <span className="text-sand text-sm">✨</span>
            <span className="text-sand font-body text-sm tracking-wide">AI-Powered Travel Planning</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl text-cream leading-tight mb-6 animate-fade-up">
            Your Dream Trip,{' '}
            <span className="text-sand italic">Planned</span>
            {' '}in Seconds
          </h1>

          <p className="font-body text-cream/60 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Tell us where you want to go. WanderLux AI generates a complete, personalized
            day-by-day itinerary — restaurants, attractions, budget, and more.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={handleCTA}
              className="group px-8 py-4 rounded-2xl bg-sand text-ink font-body font-bold text-lg
                         hover:bg-sand-dark transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-sand/30
                         transition-all duration-300"
            >
              Plan My Trip Free
              <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
            </button>
            <button
              onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 rounded-2xl border border-white/20 text-cream font-body font-medium text-lg
                         hover:border-sand/40 hover:bg-white/5 transition-all duration-300"
            >
              See How It Works
            </button>
          </div>

          {/* Floating destination chips */}
          <div className="mt-20 flex flex-wrap justify-center gap-3 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {destinations.map((d) => (
              <div
                key={d.name}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10
                           hover:border-sand/30 hover:bg-white/10 transition-all cursor-pointer"
                onClick={handleCTA}
              >
                <span>{d.emoji}</span>
                <span className="text-cream/80 font-body text-sm">{d.name}</span>
                <span className="text-cream/40 font-body text-xs">{d.tag}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
          <span className="text-cream/30 font-body text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-cream/30 to-transparent" />
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sand font-body text-sm tracking-widest uppercase mb-4">How It Works</p>
            <h2 className="font-display text-4xl md:text-5xl text-cream">
              Travel planning, <span className="text-sand italic">reimagined</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group p-6 rounded-2xl bg-white/[0.03] border border-white/10
                           hover:border-sand/30 hover:bg-white/[0.06] transition-all duration-300"
              >
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-display text-xl text-cream mb-3">{f.title}</h3>
                <p className="font-body text-cream/50 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps ─────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl text-cream">
              Three steps to your <span className="text-sand italic">perfect trip</span>
            </h2>
          </div>
          <div className="space-y-6">
            {[
              { step: '01', title: 'Choose Your Destination', desc: 'Enter any city, country, or region — from Tokyo to Tuscany.' },
              { step: '02', title: 'Set Your Preferences', desc: 'Select trip duration, budget level, travel style, and interests.' },
              { step: '03', title: 'Get Your Itinerary', desc: 'AI generates a complete plan. Save it, download the PDF, or regenerate.' },
            ].map((s) => (
              <div
                key={s.step}
                className="flex items-start gap-8 p-8 rounded-2xl bg-white/[0.03] border border-white/10
                           hover:border-sand/20 transition-all duration-300"
              >
                <span className="font-display text-5xl text-sand/20 font-bold flex-shrink-0 leading-none">{s.step}</span>
                <div>
                  <h3 className="font-display text-2xl text-cream mb-2">{s.title}</h3>
                  <p className="font-body text-cream/50 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-sand/20 to-sky/10 border border-sand/20">
            <h2 className="font-display text-4xl md:text-5xl text-cream mb-6">
              Ready to explore the world?
            </h2>
            <p className="font-body text-cream/60 text-lg mb-8">
              Join thousands of travelers planning smarter with WanderLux AI.
            </p>
            <button
              onClick={handleCTA}
              className="px-10 py-4 rounded-2xl bg-sand text-ink font-body font-bold text-lg
                         hover:bg-sand-dark transition-all duration-300 hover:shadow-xl hover:shadow-sand/30"
            >
              Start Planning — It's Free
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <p className="font-body text-cream/30 text-sm">
          © 2025 WanderLux · AI-powered travel planning
        </p>
      </footer>
    </div>
  );
}
