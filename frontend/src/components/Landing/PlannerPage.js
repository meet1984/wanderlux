// components/Landing/PlannerPage.js — Trip generation form
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripService } from '../../services/tripService';

const INTERESTS = ['Culture', 'Food', 'Nature', 'Adventure', 'History', 'Shopping', 'Nightlife', 'Art', 'Architecture', 'Beaches'];
const BUDGETS = [
  { value: 'budget', label: 'Budget', desc: 'Hostels, local food, free attractions', icon: '💰' },
  { value: 'moderate', label: 'Moderate', desc: 'Mid-range hotels, mix of dining', icon: '💳' },
  { value: 'luxury', label: 'Luxury', desc: 'Premium hotels, fine dining, exclusives', icon: '✨' },
];
const STYLES = [
  { value: 'relaxed', label: 'Relaxed', desc: 'Slow travel, fewer activities', icon: '🌿' },
  { value: 'balanced', label: 'Balanced', desc: 'Mix of sightseeing and downtime', icon: '⚖️' },
  { value: 'packed', label: 'Full Throttle', desc: 'Maximum sights, every hour counts', icon: '⚡' },
];

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6 pt-20">
      <div className="max-w-2xl w-full text-center">
        <div className="mb-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-sand/20 flex items-center justify-center">
            <span className="text-3xl animate-float inline-block">🌍</span>
          </div>
          <h2 className="font-display text-3xl text-cream mb-3">Crafting your itinerary...</h2>
          <p className="font-body text-cream/50">Our AI is researching the best experiences for your trip.</p>
        </div>

        {/* Animated steps */}
        <div className="space-y-3 max-w-sm mx-auto">
          {[
            '🔍 Researching top attractions',
            '🍜 Finding the best restaurants',
            '🚌 Planning transportation routes',
            '💰 Calculating budget estimates',
            '📋 Formatting your itinerary',
          ].map((step, i) => (
            <div
              key={step}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10"
              style={{ animation: `fadeIn 0.5s ease-out ${i * 0.3}s both` }}
            >
              <span className="text-sm">{step}</span>
              <div className="ml-auto w-4 h-4 border border-sand border-t-transparent rounded-full animate-spin" />
            </div>
          ))}
        </div>

        <p className="mt-8 font-body text-cream/30 text-sm">This usually takes 15-30 seconds</p>
      </div>
    </div>
  );
}

export default function PlannerPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    destination: '',
    days: 5,
    budget: 'moderate',
    travelStyle: 'balanced',
    interests: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const toggleInterest = (interest) => {
    setForm(p => ({
      ...p,
      interests: p.interests.includes(interest)
        ? p.interests.filter(i => i !== interest)
        : [...p.interests, interest],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.destination.trim()) { setError('Please enter a destination'); return; }

    setError('');
    setLoading(true);

    try {
      const { data } = await tripService.create(
        form.destination.trim(),
        form.days,
        { budget: form.budget, travelStyle: form.travelStyle, interests: form.interests }
      );
      navigate(`/itinerary/${data.trip.id}`, { state: { itinerary: data.itinerary, trip: data.trip } });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate itinerary. Please try again.');
      setLoading(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-ink px-6 pt-24 pb-16">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-sand/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-sky/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl md:text-5xl text-cream mb-4">
            Plan Your <span className="text-sand italic">Perfect Trip</span>
          </h1>
          <p className="font-body text-cream/50 text-base">
            Tell us about your dream destination and we'll handle the rest.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Destination */}
          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10">
            <label className="font-body text-cream/80 text-sm font-semibold tracking-wide block mb-3">
              📍 Where do you want to go?
            </label>
            <input
              type="text"
              value={form.destination}
              onChange={e => setForm(p => ({ ...p, destination: e.target.value }))}
              placeholder="e.g., Kyoto, Japan · Amalfi Coast · New York City"
              className="w-full px-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/10 font-body
                         text-cream text-lg placeholder:text-cream/30 focus:outline-none focus:border-sand/50
                         transition-all duration-200"
            />
          </div>

          {/* Days */}
          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <label className="font-body text-cream/80 text-sm font-semibold tracking-wide">
                📅 How many days?
              </label>
              <span className="font-display text-3xl text-sand">{form.days}</span>
            </div>
            <input
              type="range"
              min="1"
              max="14"
              value={form.days}
              onChange={e => setForm(p => ({ ...p, days: parseInt(e.target.value) }))}
              className="w-full accent-sand cursor-pointer"
            />
            <div className="flex justify-between font-body text-cream/30 text-xs mt-2">
              <span>1 day</span>
              <span>7 days</span>
              <span>14 days</span>
            </div>
          </div>

          {/* Budget */}
          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10">
            <label className="font-body text-cream/80 text-sm font-semibold tracking-wide block mb-4">
              💼 Budget Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {BUDGETS.map(b => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, budget: b.value }))}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                    form.budget === b.value
                      ? 'border-sand bg-sand/10 text-cream'
                      : 'border-white/10 bg-white/[0.03] text-cream/60 hover:border-white/20'
                  }`}
                >
                  <div className="text-xl mb-2">{b.icon}</div>
                  <div className="font-body font-semibold text-sm">{b.label}</div>
                  <div className="font-body text-xs text-cream/40 mt-1 hidden sm:block">{b.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Travel Style */}
          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10">
            <label className="font-body text-cream/80 text-sm font-semibold tracking-wide block mb-4">
              🧭 Travel Style
            </label>
            <div className="grid grid-cols-3 gap-3">
              {STYLES.map(s => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, travelStyle: s.value }))}
                  className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                    form.travelStyle === s.value
                      ? 'border-sand bg-sand/10 text-cream'
                      : 'border-white/10 bg-white/[0.03] text-cream/60 hover:border-white/20'
                  }`}
                >
                  <div className="text-xl mb-2">{s.icon}</div>
                  <div className="font-body font-semibold text-sm">{s.label}</div>
                  <div className="font-body text-xs text-cream/40 mt-1 hidden sm:block">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10">
            <label className="font-body text-cream/80 text-sm font-semibold tracking-wide block mb-4">
              🎯 Interests <span className="text-cream/40 font-normal">(optional)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full font-body text-sm border transition-all duration-200 ${
                    form.interests.includes(interest)
                      ? 'border-sand bg-sand/15 text-sand'
                      : 'border-white/10 bg-white/[0.03] text-cream/60 hover:border-white/20 hover:text-cream/80'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 font-body text-sm">⚠️ {error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-sand text-ink font-body font-bold text-lg
                       hover:bg-sand-dark transform hover:-translate-y-0.5
                       hover:shadow-xl hover:shadow-sand/30
                       transition-all duration-300 flex items-center justify-center gap-3"
          >
            <span>✈️</span>
            Generate My Itinerary
          </button>
        </form>
      </div>
    </div>
  );
}
