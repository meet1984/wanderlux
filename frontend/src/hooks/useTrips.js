// hooks/useTrips.js — Reusable trip data fetching hook
import { useState, useEffect, useCallback } from 'react';
import { tripService } from '../services/tripService';

export function useTrips(initialPage = 1) {
  const [trips, setTrips]           = useState([]);
  const [pagination, setPagination] = useState({ page: initialPage, totalPages: 1, total: 0 });
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const fetch = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await tripService.getAll(page);
      setTrips(data.trips);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(initialPage); }, [fetch, initialPage]);

  const removeTrip = useCallback((id) => {
    setTrips(prev => prev.filter(t => t.id !== id));
    setPagination(p => ({ ...p, total: Math.max(0, p.total - 1) }));
  }, []);

  return { trips, pagination, loading, error, refetch: fetch, removeTrip };
}
