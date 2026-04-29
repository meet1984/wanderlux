// components/Dashboard/DashboardPage.js — User trip history
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { tripService } from '../../services/tripService';

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 animate-pulse">
      <div className="h-4 bg-white/10 rounded-lg w-2/3 mb-3" />
      <div className="h-3 bg-white/10 rounded-lg w-1/3 mb-6" />
      <div className="h-10 bg-white/10 rounded-xl w-full mb-2" />
      <div className="h-10 bg-white/10 rounded-xl w-full" />
    </div>
  );
}

function TripCard({ trip, onDelete, onView }) {
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDown]  = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete your ${trip.destination} trip?`)) return;
    setDeleting(true);
    try {
      await tripService.delete(trip.id);
      onDelete(trip.id);
    } catch {
      alert('Failed to delete trip');
      setDeleting(false);
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    setDown(true);
    try {
      await tripService.downloadPDF(
        trip.id,
        `WanderLux-${trip.destination}-${trip.days}days.pdf`
      );
    } catch {
      alert('Failed to download PDF');
    } finally {
      setDown(false);
    }
  };

  const date = new Date(trip.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <div
      className="group p-6 rounded-2xl bg-white/[0.03] border border-white/10
                 hover:border-sand/30 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer
                 flex flex-col"
      onClick={() => onView(trip.id)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-xl text-cream mb-1 truncate">{trip.destination}</h3>
          {trip.country && (
            <span className="font-body text-cream/40 text-xs">{trip.country}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 ml-3 flex-shrink-0">
          <span className="px-2.5 py-1 rounded-full bg-sand/15 text-sand font-body text-xs font-semibold">
            {trip.days} days
          </span>
        </div>
      </div>

      {/* Summary */}
      {trip.summary && (
        <p className="font-body text-cream/50 text-sm leading-relaxed mb-4 flex-1 line-clamp-2">
          {trip.summary}
        </p>
      )}

      {/* Date */}
      <div className="flex items-center gap-2 mb-5">
        <span className="font-body text-cream/30 text-xs">📅 {date}</span>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-3 gap-2" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => onView(trip.id)}
          className="py-2.5 rounded-xl bg-sand/10 border border-sand/20 text-sand
                     font-body text-xs font-semibold hover:bg-sand hover:text-ink
                     transition-all duration-200"
        >
          View
        </button>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-cream/70
                     font-body text-xs hover:border-white/20 hover:text-cream
                     disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-1"
        >
          {downloading ? (
            <span className="w-3 h-3 border border-cream/50 border-t-transparent rounded-full animate-spin" />
          ) : '📄'}
          PDF
        </button>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-cream/40
                     font-body text-xs hover:border-red-500/30 hover:text-red-400
                     disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-1"
        >
          {deleting ? (
            <span className="w-3 h-3 border border-red-400/50 border-t-transparent rounded-full animate-spin" />
          ) : '🗑️'}
          Delete
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const [trips, setTrips]         = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const fetchTrips = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await tripService.getAll(page);
      setTrips(data.trips);
      setPagination(data.pagination);
    } catch {
      setError('Failed to load trips');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrips(1); }, [fetchTrips]);

  const handleDelete = (id) => {
    setTrips(prev => prev.filter(t => t.id !== id));
    setPagination(p => ({ ...p, total: p.total - 1 }));
  };

  const handleView = (id) => navigate(`/itinerary/${id}`);

  return (
    <div className="min-h-screen bg-ink pb-16 pt-24 px-6 font-body">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-80 h-80 bg-sand/6 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="font-display text-4xl text-cream mb-2">
              My Trips
            </h1>
            <p className="font-body text-cream/50 text-sm">
              Welcome back, {user?.name?.split(' ')[0]} ·{' '}
              <span className="text-sand">{pagination.total} trips planned</span>
            </p>
          </div>
          <Link
            to="/plan"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sand text-ink
                       font-body font-bold text-sm hover:bg-sand-dark transition-all duration-200
                       hover:shadow-lg hover:shadow-sand/30 whitespace-nowrap"
          >
            ✈️ New Trip
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 font-body text-sm">⚠️ {error}</p>
          </div>
        )}

        {/* Trips Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-24">
            <span className="text-6xl block mb-6 animate-float inline-block">✈️</span>
            <h2 className="font-display text-3xl text-cream mb-3">No trips yet</h2>
            <p className="font-body text-cream/50 mb-8 max-w-sm mx-auto">
              Plan your first AI-powered adventure and it'll appear here.
            </p>
            <Link
              to="/plan"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-sand text-ink
                         font-body font-bold hover:bg-sand-dark transition-all duration-200"
            >
              Plan Your First Trip
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {trips.map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => fetchTrips(pagination.page - 1)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-cream/70 font-body text-sm
                             hover:border-sand/30 disabled:opacity-40 disabled:cursor-not-allowed
                             transition-all duration-200"
                >
                  ← Previous
                </button>
                <span className="font-body text-cream/50 text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  disabled={pagination.page === pagination.totalPages}
                  onClick={() => fetchTrips(pagination.page + 1)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-cream/70 font-body text-sm
                             hover:border-sand/30 disabled:opacity-40 disabled:cursor-not-allowed
                             transition-all duration-200"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
