import React, { useState } from 'react';
import { Moon, Sun, KeyRound, User, Eye, EyeOff } from 'lucide-react';
import { playTapSound, playSuccessBeep } from '../utils/speech';

interface LoginPageProps {
  onLoginSuccess: (username: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onError: (msg: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  isDarkMode,
  onToggleDarkMode,
  onError,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playTapSound();

    if (username.trim() === 'Bangladesh1971' && password.trim() === '2024') {
      playSuccessBeep();
      onLoginSuccess(username.trim());
    } else {
      onError('Invalid username or password. Please try again (Hint: Bangladesh1971 / 2024).');
    }
  };

  const handleQuickFill = () => {
    playTapSound();
    setUsername('Bangladesh1971');
    setPassword('2024');
  };

  return (
    <main 
      id="login-page" 
      className="login-container min-h-screen flex flex-col items-center justify-center p-4 relative pt-8 sm:pt-12 pb-12 transition-colors duration-300"
      style={{
        background: isDarkMode
          ? 'linear-gradient(135deg, #090d16 0%, #171c2b 50%, #0b0f19 100%)'
          : 'var(--login-gradient)',
      }}
    >
      {/* Dark Mode Quick Toggle in Top Right of Login */}
      <button
        type="button"
        onClick={onToggleDarkMode}
        className="touch-target fixed top-4 sm:top-6 right-4 sm:right-6 z-50 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-amber-400 p-2.5 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode (saves battery)"}
        title={isDarkMode ? "Light Mode" : "Dark Mode"}
      >
        {isDarkMode ? <Sun size={22} className="text-amber-400" /> : <Moon size={22} className="text-purple-700" />}
      </button>

      {/* Bismillah Header */}
      <div 
        className="bismillah text-center text-white text-base md:text-xl font-semibold mb-3 px-2 text-shadow"
        lang="ar"
      >
        بسم الله الرحمن الرحيم - বিসমিল্লাহ হিররাহমানির রাহিম
      </div>

      {/* Login Card */}
      <div 
        className="login-card w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8 text-center border border-white/40 dark:border-slate-700/60 backdrop-blur-sm transition-colors"
        style={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            : 'var(--login-card-gradient)',
        }}
      >
        <img
          src="https://i.imgur.com/akJtZZb.jpeg"
          alt="Md. Ismail Hossain Profile"
          className="login-image w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white dark:border-slate-600 mx-auto mb-4 shadow-md"
          loading="eager"
        />

        <h1 className="login-title text-2xl sm:text-3xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-indigo-600 to-pink-600 dark:from-purple-400 dark:via-pink-300 dark:to-amber-300">
          Welcome to Adjective Kingdom
        </h1>

        <p className="login-subtitle text-slate-700 dark:text-slate-300 text-sm sm:text-base mb-1">
          Thank you for choosing the webpage for sharpening your knowledge on Adjectives.
        </p>
        <p className="login-subtitle text-slate-600 dark:text-slate-400 text-xs sm:text-sm mb-6">
          The page is developed and designed by Md. Ismail Hossain.
        </p>

        {/* Accessible Login Form */}
        <form className="login-form space-y-4 text-left" onSubmit={handleSubmit} id="login-form">
          <div>
            <label 
              htmlFor="username" 
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1"
            >
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User size={18} />
              </span>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter Username (Bangladesh1971)"
                required
                autoComplete="username"
                className="touch-target w-full pl-10 pr-3 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 text-base"
              />
            </div>
          </div>

          <div>
            <label 
              htmlFor="password" 
              className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1"
            >
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <KeyRound size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password (2024)"
                required
                autoComplete="current-password"
                className="touch-target w-full pl-10 pr-12 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 dark:text-slate-400 hover:text-purple-600 focus:outline-none"
                aria-label={showPassword ? "Hide password text" : "Show password text"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="touch-target login-btn w-full bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-800 hover:to-indigo-700 text-white font-bold py-3.5 px-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 text-base tracking-wide mt-2"
          >
            Login
          </button>
        </form>

        {/* Demo fill helper for easy testing / mobile accessibility */}
        <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span className="text-slate-600 dark:text-slate-400">
            Username: <strong>Bangladesh1971</strong> | Pass: <strong>2024</strong>
          </span>
          <button
            type="button"
            onClick={handleQuickFill}
            className="touch-target text-purple-700 dark:text-purple-400 hover:underline font-semibold p-1"
            aria-label="Auto-fill credentials Bangladesh1971 and 2024"
          >
            Auto-fill credentials
          </button>
        </div>
      </div>

      <div className="login-footer mt-6 text-center text-white/90 text-xs sm:text-sm font-medium">
        <p>The page is developed and designed by Md. Ismail Hossain.</p>
      </div>
    </main>
  );
};
