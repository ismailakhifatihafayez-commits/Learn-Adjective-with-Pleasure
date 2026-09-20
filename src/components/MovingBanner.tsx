import React, { useState } from 'react';
import { Pause, Play } from 'lucide-react';

export const MovingBanner: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const bannerText = "***For all classes of English and ICT private lessons, contact: Mobile- 01728-295215, 01609548368, WhatsApp: 01728-295215. E-mail: ismailhossain627@yahoo.com ***";

  return (
    <aside 
      className="moving-banner" 
      id="moving-banner"
      role="region"
      aria-label="Important Announcement"
    >
      {/* Accessible static version for screen readers */}
      <div className="sr-only">
        Important Announcement: {bannerText}
      </div>

      {/* Visual Marquee track with pause toggle option */}
      <div 
        className="banner-track" 
        id="banner-track"
        aria-hidden="true"
        style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
      >
        <span className="banner-text">{bannerText}</span>
        <span className="banner-text">{bannerText}</span>
        <span className="banner-text">{bannerText}</span>
        <span className="banner-text">{bannerText}</span>
      </div>

      {/* Pause/Play control for accessibility & reduced motion */}
      <button
        type="button"
        onClick={() => setIsPaused(prev => !prev)}
        className="touch-target absolute right-2 z-50 bg-black/40 hover:bg-black/70 text-white rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-white text-xs flex items-center justify-center"
        aria-label={isPaused ? "Resume announcement scrolling" : "Pause announcement scrolling"}
        title={isPaused ? "Play" : "Pause"}
      >
        {isPaused ? <Play size={15} /> : <Pause size={15} />}
      </button>
    </aside>
  );
};
