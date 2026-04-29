// components/Itinerary/ItineraryPage.js — Full itinerary view
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { tripService } from '../../services/tripService';

function DayCard({ day, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl font-body text-sm font-medium whitespace-nowrap transition-all duration-200 ${
        isActive
          ? 'bg-sand text-ink shadow-md shadow-sand/30'
          : 'bg-white/[0.05] border border-white/10 text-cream/70 hover:border-sand/30 hover:text-cream'
      }`}
    >
      Day {day.day}
      {day.theme && <span className="ml-2 text-xs opacity-70 hidden sm:inline">· {day.theme}</span>}
    </button>
  );
}

function TimeSlot({ icon, label, data }) {
  if (!data) return null;
  return (
    <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-sand/20 transition-all">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <span className="text-sand font-body text-xs font-semibold tracking-widest uppercase">{icon} {label}</span>
          <h4 className="font-display text-xl text-cream mt-1">{data.activity}</h4>
        </div>
        <div className="text-right flex-shrink-0">
          {data.duration && <span className="block font-body text-cream/40 text-xs">{data.duration}</span>}
          {data.cost && <span className="block font-body text-sand text-sm font-semibold mt-0.5">{data.cost}</span>}
        </div>
      </div>
      {data.description && (
        <p className="font-body text-cream/60 text-sm leading-relaxed mb-3">{data.description}</p>
      )}
      {data.tips && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-sand/10 border border-sand/20">
          <span className="text-sand text-sm flex-shrink-0">💡</span>
          <p className="font-body text-sand/80 text-xs leading-relaxed">{data.tips}</p>
        </div>
      )}
    </div>
  );
}

function MealRow({ label, meal }) {
  if (!meal) return null;
  return (
    <div className="flex items-start gap-4 py-3 border-b border-white/5 last:border-0">
      <span className="font-body text-cream/40 text-xs w-20 flex-shrink-0 pt-0.5">{label}</span>
      <div className="flex-1">
        <span className="font-body text-cream font-semibold text-sm">{meal.name}</span>
        {meal.priceRange && <span className="ml-2 text-sand font-body text-sm">{meal.priceRange}</span>}
        {meal.description && <p className="font-body text-cream/50 text-xs mt-0.5">{meal.description}</p>}
      </div>
    </div>
  );
}

export default function ItineraryPage() {
  const { id }     = useParams();
  const location   = useLocation();
  const navigate   = useNavigate();

  const [trip, setTrip]           = useState(location.state?.trip || null);
  const [itinerary, setItinerary] = useState(location.state?.itinerary || null);
  const [activeDay, setActiveDay] = useState(0);
  const [loading, setLoading]     = useState(!location.state?.itinerary);
  const [regenerating, setRegen]  = useState(false);
  const [downloading, setDown]    = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (!itinerary) {
      tripService.getOne(id)
        .then(res => { setTrip(res.data.trip); setItinerary(res.data.itinerary); })
        .catch(() => setError('Failed to load itinerary'))
        .finally(() => setLoading(false));
    }
  }, [id, itinerary]);

  const handleRegenerate = async () => {
    setRegen(true);
    try {
      const { data } = await tripService.regenerate(id);
      setItinerary(data.itinerary);
      setActiveDay(0);
    } catch {
      setError('Failed to regenerate. Please try again.');
    } finally {
      setRegen(false);
    }
  };

  const handleDownload = async () => {
    setDown(true);
    try {
      await tripService.downloadPDF(id, `WanderLux-${trip.destination}-${trip.days}days.pdf`);
    } catch {
      setError('Failed to download PDF.');
    } finally {
      setDown(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-ink flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-sand border-t-transparent rounded-full animate-spin" />
        <span className="text-cream/60 font-body text-sm">Loading itinerary...</span>
      </div>
    </div>
  );

  if (error && !itinerary) return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-6">
      <div className="text-center">
        <p className="text-red-400 font-body mb-4">{error}</p>
        <Link to="/dashboard" className="text-sand font-body text-sm hover:underline">← Back to trips</Link>
      </div>
    </div>
  );

  if (!itinerary) return null;

  const days = itinerary.days || [];
  const currentDay = days[activeDay];

  return (
    <div className="min-h-screen bg-ink pb-16 font-body">
      {/* Header */}
      <div className="sticky top-16 z-30 bg-ink/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link to="/dashboard" className="text-cream/40 hover:text-sand font-body text-sm transition-colors">
                  ← My Trips
                </Link>
              </div>
              <h1 className="font-display text-2xl text-cream">
                {itinerary.destination}
                {itinerary.country && <span className="text-cream/40 font-body text-base font-normal ml-2">· {itinerary.country}</span>}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleRegenerate}
                disabled={regenerating}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20
                           text-cream/70 font-body text-sm hover:border-sand/40 hover:text-cream
                           disabled:opacity-50 transition-all duration-200"
              >
                {regenerating ? (
                  <span className="w-3.5 h-3.5 border border-cream/50 border-t-transparent rounded-full animate-spin" />
                ) : '🔄'}
                {regenerating ? 'Regenerating...' : 'Regenerate'}
              </button>

              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sand text-ink
                           font-body text-sm font-semibold hover:bg-sand-dark
                           disabled:opacity-50 transition-all duration-200"
              >
                {downloading ? (
                  <span className="w-3.5 h-3.5 border-2 border-ink/40 border-t-ink rounded-full animate-spin" />
                ) : '📄'}
                {downloading ? 'Generating...' : 'Download PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-8">

        {/* Trip Overview Banner */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-sand/15 to-sky/10 border border-sand/20">
          <p className="font-body text-cream/70 leading-relaxed mb-4">{itinerary.summary}</p>
          <div className="flex flex-wrap gap-4 text-sm font-body">
            {itinerary.bestTimeToVisit && (
              <span className="text-cream/60">🗓️ Best time: <strong className="text-cream">{itinerary.bestTimeToVisit}</strong></span>
            )}
            {itinerary.currency && (
              <span className="text-cream/60">💱 Currency: <strong className="text-cream">{itinerary.currency}</strong></span>
            )}
            {itinerary.language && (
              <span className="text-cream/60">🗣️ Language: <strong className="text-cream">{itinerary.language}</strong></span>
            )}
            <span className="text-cream/60">📅 Duration: <strong className="text-cream">{trip?.days} days</strong></span>
          </div>
        </div>

        {/* Budget Overview */}
        {itinerary.estimatedTotalBudget && (
          <div className="mb-8 grid grid-cols-3 gap-4">
            {[
              { label: 'Budget', val: itinerary.estimatedTotalBudget.budget },
              { label: 'Moderate', val: itinerary.estimatedTotalBudget.moderate },
              { label: 'Luxury', val: itinerary.estimatedTotalBudget.luxury },
            ].map((b, i) => (
              <div key={b.label} className={`p-4 rounded-2xl text-center border transition-all ${
                i === 1 ? 'border-sand/40 bg-sand/10' : 'border-white/10 bg-white/[0.03]'
              }`}>
                <span className="font-body text-cream/50 text-xs block mb-1">{b.label}</span>
                <span className={`font-display text-lg ${i === 1 ? 'text-sand' : 'text-cream'}`}>{b.val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Day Selector */}
        <div className="mb-6 flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {days.map((day, i) => (
            <DayCard key={day.day} day={day} isActive={i === activeDay} onClick={() => setActiveDay(i)} />
          ))}
        </div>

        {/* Active Day Content */}
        {currentDay && (
          <div className="animate-fade-in">
            {/* Day Header */}
            <div className="mb-6 p-6 rounded-2xl bg-white/[0.04] border border-white/10">
              <div className="flex items-center gap-4 mb-2">
                <span className="w-10 h-10 rounded-xl bg-sand/20 flex items-center justify-center font-display text-sand font-bold">
                  {currentDay.day}
                </span>
                <div>
                  <h2 className="font-display text-2xl text-cream">{currentDay.theme}</h2>
                  {currentDay.description && (
                    <p className="font-body text-cream/50 text-sm mt-0.5">{currentDay.description}</p>
                  )}
                </div>
              </div>

              {/* Daily budget */}
              {currentDay.dailyBudget && (
                <div className="mt-4 flex flex-wrap gap-4 pt-4 border-t border-white/10">
                  {[
                    { label: 'Activities', val: currentDay.dailyBudget.activities },
                    { label: 'Food', val: currentDay.dailyBudget.food },
                    { label: 'Transport', val: currentDay.dailyBudget.transport },
                    { label: 'Daily Total', val: currentDay.dailyBudget.total },
                  ].map(item => (
                    <div key={item.label}>
                      <span className="font-body text-cream/40 text-xs block">{item.label}</span>
                      <span className="font-body text-cream font-semibold text-sm">{item.val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Activities */}
            <div className="grid gap-4 mb-6">
              <TimeSlot icon="🌅" label="Morning" data={currentDay.morning} />
              <TimeSlot icon="☀️" label="Afternoon" data={currentDay.afternoon} />
              <TimeSlot icon="🌙" label="Evening" data={currentDay.evening} />
            </div>

            {/* Meals */}
            {currentDay.meals && (
              <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 mb-6">
                <h3 className="font-display text-lg text-cream mb-4">🍽️ Where to Eat</h3>
                <MealRow label="Breakfast" meal={currentDay.meals.breakfast} />
                <MealRow label="Lunch" meal={currentDay.meals.lunch} />
                <MealRow label="Dinner" meal={currentDay.meals.dinner} />
              </div>
            )}

            {/* Accommodation */}
            {currentDay.accommodation && (
              <div className="p-6 rounded-2xl bg-white/[0.04] border border-white/10 mb-6">
                <h3 className="font-display text-lg text-cream mb-3">🏨 Where to Stay</h3>
                <p className="font-body text-cream/70 text-sm">
                  <strong className="text-cream">Area: </strong>{currentDay.accommodation.area}
                </p>
                {currentDay.accommodation.suggestion && (
                  <p className="font-body text-cream/70 text-sm mt-1">
                    <strong className="text-cream">Suggestion: </strong>{currentDay.accommodation.suggestion}
                  </p>
                )}
                {currentDay.accommodation.estimatedCost && (
                  <p className="font-body text-sand font-semibold text-sm mt-1">
                    Est. {currentDay.accommodation.estimatedCost}/night
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Essential Tips */}
        {itinerary.essentialTips && itinerary.essentialTips.length > 0 && (
          <div className="mt-8 p-6 rounded-2xl bg-white/[0.04] border border-white/10">
            <h3 className="font-display text-xl text-cream mb-4">💡 Essential Travel Tips</h3>
            <ul className="space-y-2">
              {itinerary.essentialTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-sand mt-2 flex-shrink-0" />
                  <span className="font-body text-cream/70 text-sm leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Transportation */}
        {itinerary.transportation && (
          <div className="mt-4 p-6 rounded-2xl bg-white/[0.04] border border-white/10">
            <h3 className="font-display text-xl text-cream mb-4">🚌 Getting Around</h3>
            {itinerary.transportation.fromAirport && (
              <div className="mb-3">
                <span className="font-body text-sand text-xs font-semibold tracking-widest uppercase">Airport Transfer</span>
                <p className="font-body text-cream/70 text-sm mt-1">{itinerary.transportation.fromAirport}</p>
              </div>
            )}
            {itinerary.transportation.localTransport && (
              <div className="mb-3">
                <span className="font-body text-sand text-xs font-semibold tracking-widest uppercase">Local Transport</span>
                <p className="font-body text-cream/70 text-sm mt-1">{itinerary.transportation.localTransport}</p>
              </div>
            )}
            {itinerary.transportation.tips && (
              <div>
                <span className="font-body text-sand text-xs font-semibold tracking-widest uppercase">Tips</span>
                <p className="font-body text-cream/70 text-sm mt-1">{itinerary.transportation.tips}</p>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 font-body text-sm">⚠️ {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
