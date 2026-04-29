// App.js — Root component with routing, error boundary, and toast
import React, { createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/UI/ErrorBoundary';
import Navbar from './components/UI/Navbar';
import ProtectedRoute from './components/UI/ProtectedRoute';
import NotFoundPage from './components/UI/NotFoundPage';
import LandingPage from './components/Landing/LandingPage';
import PlannerPage from './components/Landing/PlannerPage';
import { LoginPage, RegisterPage } from './components/Auth/AuthPage';
import DashboardPage from './components/Dashboard/DashboardPage';
import ItineraryPage from './components/Itinerary/ItineraryPage';
import { useToast, ToastContainer } from './hooks/useToast';

// Global toast context so any component can fire toasts
export const ToastContext = createContext(null);
export const useGlobalToast = () => useContext(ToastContext);

function AppShell() {
  const { toasts, toast } = useToast();

  return (
    <ToastContext.Provider value={toast}>
      <Navbar />
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />

        <Route path="/plan"      element={
          <ProtectedRoute><PlannerPage /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/itinerary/:id" element={
          <ProtectedRoute><ItineraryPage /></ProtectedRoute>
        } />

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer toasts={toasts} />
    </ToastContext.Provider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
