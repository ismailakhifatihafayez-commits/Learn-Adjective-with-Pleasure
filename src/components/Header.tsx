import React, { useEffect, useState } from 'react';
import { LogOut, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { playTapSound } from '../utils/speech';

interface HeaderProps {
  onLogout: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLogout,
  isDarkMode,
  onToggleDarkMode,
  audioEnabled,
  onToggleAudio,
}) => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header 
      className="header-section text-white p-4 sm:p-6 rounded-2xl mx-3 sm:mx-4 mt-3 mb-5 shadow-xl transition-all duration-300"
      style={{
        background: isDarkMode
          ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #0f172a 100%)'
          : 'var(--primary-gradient)',
      }}
    >
      <div 
        className="bismillah text-center text-sm sm:text-base font-semibold mb-4 text-purple-100"
        lang="ar"
      >
        بسم الله الرحمن الرحيم - বিসমিল্লাহ হিররাহমানির রাহিম
      </div>

      <div className="header-content flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Profile Avatar */}
        <div className="flex-shrink-0">
          <img
            src="https://i.imgur.com/akJtZZb.jpeg"
            alt="Profile of Md. Ismail Hossain"
            className="header-image w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white/80 dark:border-indigo-400/80 shadow-md mx-auto"
          />
        </div>

        {/* Title */}
        <div className="header-title text-center md:text-left flex-grow px-2 sm:px-4">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight drop-shadow-sm">
            Quiz on Adjectives for sharpening your knowledge
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 dark:text-indigo-200 mt-1">
            Master Trainer of English of Primary Education
          </p>
        </div>

        {/* Clock & Action Controls */}
        <div className="flex flex-col items-center gap-2.5 w-full md:w-auto">
          {/* Clock */}
          <div 
            className="digital-clock text-base sm:text-lg font-mono font-bold bg-white/20 dark:bg-black/30 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30 shadow-inner flex items-center justify-center min-w-[120px]"
            role="timer"
            aria-live="off"
            aria-label={`Current local time is ${time}`}
          >
            {time || '00:00:00'}
          </div>

          {/* Quick Action Bar: Dark Mode, Audio, Logout */}
          <div className="flex items-center gap-2 w-full justify-center">
            {/* Dark mode button */}
            <button
              type="button"
              onClick={() => {
                playTapSound();
                onToggleDarkMode();
              }}
              className="touch-target px-3 py-2 rounded-xl bg-white/20 dark:bg-black/40 hover:bg-white/30 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm border border-white/25"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode to save battery"}
              title={isDarkMode ? "Light Mode" : "Dark Mode (Battery Saver)"}
            >
              {isDarkMode ? (
                <>
                  <Sun size={17} className="text-amber-300" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon size={17} className="text-purple-200" />
                  <span>Dark</span>
                </>
              )}
            </button>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => {
                playTapSound();
                onToggleAudio();
              }}
              className={`touch-target px-3 py-2 rounded-xl font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm border ${
                audioEnabled
                  ? 'bg-emerald-600/80 border-emerald-400 text-white'
                  : 'bg-white/20 dark:bg-black/40 border-white/25 text-white'
              }`}
              aria-label={audioEnabled ? "Voice audio pronunciation enabled" : "Enable voice audio pronunciation"}
              title={audioEnabled ? "Audio Enabled" : "Enable Audio"}
            >
              {audioEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
              <span>{audioEnabled ? "Audio On" : "Audio"}</span>
            </button>

            {/* Logout button */}
            <button
              type="button"
              onClick={() => {
                playTapSound();
                onLogout();
              }}
              className="touch-target logout-btn px-4 py-2 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 border border-white/30"
              style={{ background: 'var(--secondary-gradient)' }}
              aria-label="Logout from account"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
