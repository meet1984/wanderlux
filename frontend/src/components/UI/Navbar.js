// components/UI/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isHome = location.pathname === '/';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled || !isHome
        ? 'bg-ink/95 backdrop-blur-md border-b border-white/10 py-3'
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-sand flex items-center justify-center">
            <span className="text-ink font-display font-bold text-sm">W</span>
          </div>
          <span className="font-display font-bold text-xl text-cream tracking-wide">
            WanderLux
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link
                to="/plan"
                className="text-cream/70 hover:text-sand font-body text-sm tracking-wide transition-colors"
              >
                Plan Trip
              </Link>
              <Link
                to="/dashboard"
                className="text-cream/70 hover:text-sand font-body text-sm tracking-wide transition-colors"
              >
                My Trips
              </Link>
              <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                <span className="text-cream/50 font-body text-sm">
                  Hi, {user.name.split(' ')[0]}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg border border-sand/30 text-sand font-body text-sm
                             hover:bg-sand hover:text-ink transition-all duration-200"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-cream/70 hover:text-sand font-body text-sm tracking-wide transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-lg bg-sand text-ink font-body font-semibold text-sm
                           hover:bg-sand-dark transition-all duration-200"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-cream/80 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="space-y-1.5">
            <span className={`block w-6 h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-ink/98 border-t border-white/10 px-6 py-4 flex flex-col gap-4">
          {user ? (
            <>
              <Link to="/plan" className="text-cream/80 font-body text-sm py-2" onClick={() => setMenuOpen(false)}>Plan Trip</Link>
              <Link to="/dashboard" className="text-cream/80 font-body text-sm py-2" onClick={() => setMenuOpen(false)}>My Trips</Link>
              <button onClick={handleLogout} className="text-sand font-body text-sm py-2 text-left">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-cream/80 font-body text-sm py-2" onClick={() => setMenuOpen(false)}>Sign In</Link>
              <Link to="/register" className="text-sand font-body text-sm py-2" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
