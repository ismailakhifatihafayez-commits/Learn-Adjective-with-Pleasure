import React from 'react';
import { Home, LayoutGrid, ArrowLeft, ArrowRight, ArrowUp, Moon, Sun } from 'lucide-react';
import { playTapSound } from '../utils/speech';

interface FloatingNavProps {
  onGoHome: () => void;
  onGoMainSections: () => void;
  onGoBackward: () => void;
  onGoForward: () => void;
  onScrollToTop: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  onGoHome,
  onGoMainSections,
  onGoBackward,
  onGoForward,
  onScrollToTop,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <nav
      className="floating-nav"
      id="floating-nav"
      aria-label="Quick Actions Navigation"
    >
      {/* Dark mode toggle */}
      <button
        type="button"
        onClick={() => {
          playTapSound();
          onToggleDarkMode();
        }}
        className="floating-btn shadow-lg hover:scale-105 active:scale-95"
        style={{
          background: isDarkMode ? '#334155' : 'var(--secondary-gradient)',
        }}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode (battery saver)"}
        title={isDarkMode ? "Light Mode" : "Dark Mode"}
      >
        {isDarkMode ? <Sun size={20} className="text-amber-300" /> : <Moon size={20} className="text-purple-100" />}
      </button>

      {/* Home Page button */}
      <button
        type="button"
        id="home-page-btn"
        onClick={() => {
          playTapSound();
          onGoHome();
        }}
        className="floating-btn shadow-lg hover:scale-105 active:scale-95"
        aria-label="Go to Home Welcome Screen"
        title="Home Page"
      >
        <Home size={20} />
      </button>

      {/* Main Section button */}
      <button
        type="button"
        id="main-section-btn"
        onClick={() => {
          playTapSound();
          onGoMainSections();
        }}
        className="floating-btn shadow-lg hover:scale-105 active:scale-95"
        aria-label="Go to Main 5 Sections Menu"
        title="Main Sections"
      >
        <LayoutGrid size={20} />
      </button>

      {/* Backward button */}
      <button
        type="button"
        id="backward-btn"
        onClick={() => {
          playTapSound();
          onGoBackward();
        }}
        className="floating-btn shadow-lg hover:scale-105 active:scale-95"
        aria-label="Navigate to Previous Page"
        title="Backward"
      >
        <ArrowLeft size={20} />
      </button>

      {/* Forward button */}
      <button
        type="button"
        id="forward-btn"
        onClick={() => {
          playTapSound();
          onGoForward();
        }}
        className="floating-btn shadow-lg hover:scale-105 active:scale-95"
        aria-label="Navigate to Next Page"
        title="Forward"
      >
        <ArrowRight size={20} />
      </button>

      {/* Back to Top button */}
      <button
        type="button"
        id="back-to-top"
        onClick={() => {
          playTapSound();
          onScrollToTop();
        }}
        className="floating-btn back-to-top shadow-xl hover:scale-105 active:scale-95"
        aria-label="Scroll back to top of page"
        title="Back to Top"
      >
        <ArrowUp size={22} />
      </button>
    </nav>
  );
};
