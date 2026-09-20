import React, { useEffect, useRef } from 'react';

interface ConfettiCanvasProps {
  durationMs?: number;
  particleCount?: number;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  angle: number;
  angularVelocity: number;
  color: string;
  shape: 'rect' | 'circle' | 'ribbon';
  tilt: number;
  tiltVelocity: number;
  opacity: number;
}

export const ConfettiCanvas: React.FC<ConfettiCanvasProps> = ({
  durationMs = 5000,
  particleCount = 180,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let isRunning = true;
    const startTime = performance.now();

    // Set canvas dimensions
    const resizeCanvas = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = [
      '#f59e0b', // Amber / Gold
      '#ec4899', // Pink
      '#8b5cf6', // Purple
      '#3b82f6', // Blue
      '#10b981', // Emerald
      '#ef4444', // Red
      '#06b6d4', // Cyan
      '#f97316', // Orange
      '#eab308', // Yellow
      '#ffffff', // Sparkle white
    ];

    const shapes: ('rect' | 'circle' | 'ribbon')[] = ['rect', 'circle', 'ribbon'];
    const particles: Particle[] = [];

    // Create 3 origin points: Left cannon, Center blast, Right cannon
    const origins = [
      { x: window.innerWidth * 0.15, y: window.innerHeight * 0.85, baseVx: 9, baseVy: -22 },
      { x: window.innerWidth * 0.5, y: window.innerHeight * 0.8, baseVx: 0, baseVy: -25 },
      { x: window.innerWidth * 0.85, y: window.innerHeight * 0.85, baseVx: -9, baseVy: -22 },
    ];

    for (let i = 0; i < particleCount; i++) {
      const origin = origins[i % origins.length];
      const spread = (Math.random() - 0.5) * 16;
      const vyJitter = (Math.random() - 0.5) * 8;
      const size = Math.random() * 8 + 6;

      particles.push({
        x: origin.x + (Math.random() - 0.5) * 40,
        y: origin.y + (Math.random() - 0.5) * 40,
        w: size,
        h: size * (Math.random() > 0.4 ? 1.4 : 0.8),
        vx: origin.baseVx + spread,
        vy: origin.baseVy + vyJitter,
        angle: Math.random() * 360,
        angularVelocity: (Math.random() - 0.5) * 0.3,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        tilt: Math.random() * 10,
        tiltVelocity: (Math.random() * 0.1) + 0.05,
        opacity: 1,
      });
    }

    const gravity = 0.48;
    const drag = 0.982;

    const render = (now: number) => {
      if (!isRunning || !ctx || !canvas) return;

      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Apply physics
        p.vx *= drag;
        p.vy = p.vy * drag + gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.angularVelocity;
        p.tilt += p.tiltVelocity;

        // Fade out during last 25% of duration or when below screen
        if (progress > 0.75) {
          p.opacity = Math.max(0, 1 - (progress - 0.75) / 0.25);
        }

        if (p.opacity > 0 && p.y < canvas.height + 40) {
          aliveCount++;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.angle * Math.PI) / 180);
          ctx.fillStyle = p.color;

          if (p.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === 'ribbon') {
            ctx.beginPath();
            ctx.rect(-p.w / 2, -p.h, p.w, p.h * 1.8);
            ctx.fill();
          } else {
            // Rectangle with slight 3D wobble
            const wobbleW = Math.cos(p.tilt) * p.w;
            ctx.fillRect(-wobbleW / 2, -p.h / 2, wobbleW, p.h);
          }

          ctx.restore();
        }
      }

      if (progress < 1 && aliveCount > 0) {
        animId = requestAnimationFrame(render);
      } else {
        if (onComplete) onComplete();
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [durationMs, particleCount, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      id="confetti-canvas"
      className="fixed inset-0 pointer-events-none z-[1100]"
      aria-hidden="true"
    />
  );
};
