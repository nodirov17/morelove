
import React, { useEffect, useRef, useCallback } from 'react';

// Configuration constants for the heart animation
const SETTINGS = {
  particleCount: 1500,
  heartSize: 15,
  particleSize: 1.2,
  pulseSpeed: 0.05,
  color: 'rgba(255, 10, 50, 0.4)',
  glowColor: 'rgba(255, 0, 30, 0.8)',
  bloomOpacity: 0.15,
};

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  maxAge: number;
  targetX: number;
  targetY: number;
}

export const HeartCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Point[]>([]);
  const requestRef = useRef<number>();
  const timeRef = useRef<number>(0);

  // Heart parametric formula
  const heartFunction = (t: number) => {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    return { x, y };
  };

  const createParticle = useCallback((width: number, height: number): Point => {
    const t = Math.random() * Math.PI * 2;
    const { x, y } = heartFunction(t);
    
    // Position within the heart with some jitter
    const spread = Math.random();
    const targetX = width / 2 + x * SETTINGS.heartSize * spread;
    const targetY = height / 2 + y * SETTINGS.heartSize * spread;

    return {
      x: width / 2 + (Math.random() - 0.5) * 10,
      y: height / 2 + (Math.random() - 0.5) * 10,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      targetX,
      targetY,
      age: 0,
      maxAge: 100 + Math.random() * 200,
    };
  }, []);

  const initParticles = useCallback((width: number, height: number) => {
    particles.current = [];
    for (let i = 0; i < SETTINGS.particleCount; i++) {
      particles.current.push(createParticle(width, height));
    }
  }, [createParticle]);

  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    timeRef.current += SETTINGS.pulseSpeed;
    const pulse = Math.sin(timeRef.current) * 0.1 + 0.95;

    // Clear with slight persistence for motion blur effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Particles
    ctx.beginPath();
    particles.current.forEach((p, i) => {
      // Movement logic: seek target on heart path
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      
      // Heart pulse scaling
      const tx = (p.targetX - canvas.width / 2) * pulse + canvas.width / 2;
      const ty = (p.targetY - canvas.height / 2) * pulse + canvas.height / 2;
      
      const adx = tx - p.x;
      const ady = ty - p.y;

      p.vx += adx * 0.01;
      p.vy += ady * 0.01;
      p.vx *= 0.92;
      p.vy *= 0.92;
      p.x += p.vx;
      p.y += p.vy;

      p.age++;

      // Render
      const size = SETTINGS.particleSize * (1 - p.age / p.maxAge);
      if (size > 0) {
        ctx.moveTo(p.x, p.y);
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
      }

      // Reset old particles
      if (p.age >= p.maxAge) {
        particles.current[i] = createParticle(canvas.width, canvas.height);
      }
    });

    ctx.shadowBlur = 10;
    ctx.shadowColor = SETTINGS.glowColor;
    ctx.fillStyle = SETTINGS.color;
    ctx.fill();

    // Secondary Bloom Effect (Lines connecting points)
    if (Math.random() > 0.5) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 50, 50, ${Math.random() * 0.05})`;
        ctx.lineWidth = 0.5;
        for(let i=0; i<30; i++) {
            const p1 = particles.current[Math.floor(Math.random() * particles.current.length)];
            const p2 = particles.current[Math.floor(Math.random() * particles.current.length)];
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
        }
        ctx.stroke();
    }

    requestRef.current = requestAnimationFrame(animate);
  }, [createParticle]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        initParticles(window.innerWidth, window.innerHeight);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate, initParticles]);

  // Click interaction: explode
  const handleClick = (e: React.MouseEvent) => {
    particles.current.forEach(p => {
        const dx = p.x - e.clientX;
        const dy = p.y - e.clientY;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 200) {
            const angle = Math.atan2(dy, dx);
            const force = (200 - dist) * 0.1;
            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
        }
    });
  };

  return (
    <canvas 
      ref={canvasRef} 
      className="cursor-pointer"
      onClick={handleClick}
    />
  );
};
