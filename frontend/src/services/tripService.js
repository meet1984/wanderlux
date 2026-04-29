// services/tripService.js — Trip API calls
import api from './api';

export const tripService = {
  create: (destination, days, preferences) =>
    api.post('/trips', { destination, days, preferences }),

  getAll: (page = 1) =>
    api.get(`/trips?page=${page}`),

  getOne: (id) =>
    api.get(`/trips/${id}`),

  delete: (id) =>
    api.delete(`/trips/${id}`),

  regenerate: (id) =>
    api.post(`/trips/${id}/regenerate`),

  downloadPDF: async (id, filename) => {
    const response = await api.get(`/trips/${id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || 'WanderLux-Itinerary.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
