'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

export function AnimatedBackground({ 
  variant = 'particles',
  className = '' 
}: { 
  variant?: 'particles' | 'gradient' | 'grid' | 'waves';
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (variant !== 'particles') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles: Particle[] = [];
    const colors = ['#b20e38', '#22c55e', '#3b82f6', '#f97316', '#8b5cf6'];

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.opacity;
        ctx.fill();

        // Draw connections
        particles.slice(i + 1).forEach((other) => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = particle.color;
            ctx.globalAlpha = (1 - distance / 150) * 0.15;
            ctx.stroke();
          }
        });
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, [variant]);

  if (variant === 'particles') {
    return (
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none z-0 ${className}`}
        style={{ opacity: 0.6 }}
      />
    );
  }

  if (variant === 'gradient') {
    return (
      <div className={`fixed inset-0 pointer-events-none z-0 ${className}`}>
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(178, 14, 56, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(34, 197, 94, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(178, 14, 56, 0.15) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>
    );
  }

  if (variant === 'grid') {
    return (
      <div className={`fixed inset-0 pointer-events-none z-0 grid-bg ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>
    );
  }

  if (variant === 'waves') {
    return (
      <div className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}>
        <svg
          className="absolute bottom-0 w-full h-64 opacity-10"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <motion.path
            fill="currentColor"
            className="text-primary"
            animate={{
              d: [
                'M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z',
                'M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,144C672,139,768,181,864,197.3C960,213,1056,203,1152,186.7C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z',
              ],
            }}
            transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          />
        </svg>
      </div>
    );
  }

  return null;
}

export function GlowOrbs({ colors = ['#b20e38', '#8b5cf6', '#22c55e'], count }: { colors?: string[]; count?: number }) {
  const orbCount = count || colors.length;
  const orbColors = Array.from({ length: orbCount }, (_, i) => colors[i % colors.length]);
  
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {orbColors.map((color, i) => (
        <motion.div
          key={i}
          className="absolute w-96 h-96 rounded-full blur-3xl"
          style={{ backgroundColor: color, opacity: 0.1 }}
          initial={{
            x: `${(i + 1) * 25}%`,
            y: `${(i + 1) * 20}%`,
          }}
          animate={{
            x: [`${(i + 1) * 25}%`, `${(i + 2) * 20}%`, `${(i + 1) * 25}%`],
            y: [`${(i + 1) * 20}%`, `${(i + 3) * 15}%`, `${(i + 1) * 20}%`],
          }}
          transition={{
            duration: 15 + i * 5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

export function NoiseOverlay({ opacity = 0.03 }: { opacity?: number }) {
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        opacity,
      }}
    />
  );
}
