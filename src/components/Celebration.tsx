import React, { useEffect, useState } from 'react';
import { ConfettiCanvas } from './ConfettiCanvas';

interface CelebrationProps {
  score: number;
  onDismiss?: () => void;
}

interface Particle {
  id: number;
  icon: string;
  left: number;
  animationDuration: number;
  size: number;
  delay: number;
}

export const Celebration: React.FC<CelebrationProps> = ({ score, onDismiss }) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  let message = "Congratulations!";
  if (score === 100) {
    message = "🎉 PERFECT SCORE! 100% MASTER! 🏆✨";
  } else if (score >= 90) {
    message = "Outstanding! You're a Genius! 🌟";
  } else if (score >= 80) {
    message = "Excellent Work! You're Amazing! 💫";
  } else if (score >= 70) {
    message = "Great Job! Well Done! 👍";
  } else if (score >= 60) {
    message = "Good Effort! Keep Going! 💪";
  } else if (score >= 50) {
    message = "Not Bad! Try Harder Next Time! ✨";
  } else {
    message = "Keep Practicing! You'll Improve! 🌱";
  }

  useEffect(() => {
    const emojis = ['🌸', '🎉', '🎊', '⭐', '✨', '💐', '🏆', '🎈', '🥇', '💫'];
    const count = Math.min(60, Math.max(25, Math.floor(score * 0.65)));
    const generated: Particle[] = [];

    for (let i = 0; i < count; i++) {
      generated.push({
        id: i,
        icon: emojis[Math.floor(Math.random() * emojis.length)],
        left: Math.random() * 95,
        animationDuration: Math.random() * 2.5 + 2.5,
        size: Math.random() * 16 + 18,
        delay: Math.random() * 1.5,
      });
    }

    setParticles(generated);
  }, [score]);

  return (
    <div 
      className="celebration-container"
      id="celebration-container"
      role="status"
      aria-live="assertive"
      aria-label={`Celebration: Score is ${score} percent. ${message}`}
      onClick={onDismiss}
    >
      <div className="celebration-overlay" />

      {/* Lightweight canvas-based confetti explosion effect on 100% perfect score */}
      {score >= 90 && (
        <ConfettiCanvas 
          durationMs={5500} 
          particleCount={score === 100 ? 260 : 160} 
        />
      )}
      
      {/* Dynamic confetti / celebration flowers */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="celebration-item"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDuration: `${p.animationDuration}s`,
            animationDelay: `${p.delay}s`,
          }}
          aria-hidden="true"
        >
          {p.icon}
        </span>
      ))}

      <div className="congrats-message" id="congrats-message">
        {message}
      </div>
      <div className="celebration-score" id="celebration-score">
        {score}%
      </div>
    </div>
  );
};
