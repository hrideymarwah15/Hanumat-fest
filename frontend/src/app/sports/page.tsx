'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useSports, Sport } from '@/context/SportsContext';
import { AnimatedBackground, GlowOrbs } from '@/components/ui/AnimatedBackground';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Fallback sports data if backend is unavailable
const fallbackSports = [
  {
    id: 'cricket',
    name: 'Cricket',
    description: 'Experience the thrill of leather on willow as top college teams battle for cricket supremacy.',
    max_team_size: 11,
    registration_fee: 500,
    icon: '🏏',
    is_team_sport: true,
    color: '#22c55e',
  },
  {
    id: 'football',
    name: 'Football',
    description: 'The beautiful game comes alive with fast-paced 7-a-side football action.',
    max_team_size: 7,
    registration_fee: 400,
    icon: '⚽',
    is_team_sport: true,
    color: '#3b82f6',
  },
  {
    id: 'basketball',
    name: 'Basketball',
    description: 'High-flying dunks and three-pointers in intense 5v5 basketball showdowns.',
    max_team_size: 5,
    registration_fee: 350,
    icon: '🏀',
    is_team_sport: true,
    color: '#f97316',
  },
  {
    id: 'volleyball',
    name: 'Volleyball',
    description: 'Spike your way to victory in thrilling 6v6 volleyball matches.',
    max_team_size: 6,
    registration_fee: 300,
    icon: '🏐',
    is_team_sport: true,
    color: '#eab308',
  },
  {
    id: 'badminton',
    name: 'Badminton',
    description: 'Lightning-fast reflexes and precision shots in singles and doubles categories.',
    max_team_size: 2,
    registration_fee: 200,
    icon: '🏸',
    is_team_sport: false,
    color: '#06b6d4',
  },
  {
    id: 'esports',
    name: 'E-Sports',
    description: 'Digital warriors compete in Valorant and BGMI for esports glory.',
    max_team_size: 5,
    registration_fee: 250,
    icon: '🎮',
    is_team_sport: true,
    color: '#8b5cf6',
  },
];

function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass py-4' : 'py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tighter">
          <span className="gradient-text">HANUMAT</span>
          <span className="text-white/80">FEST</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-2">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/sports" className="nav-link active">Sports</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/login" className="btn-primary ml-4 py-2 px-6 text-sm">
            Register
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from('.sports-hero-title', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        ease: 'expo.out',
        delay: 0.3,
      });

      gsap.from('.sports-hero-subtitle', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        delay: 0.6,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-[70vh] flex items-center justify-center overflow-hidden">
      <AnimatedBackground variant="particles" />
      <GlowOrbs colors={['#b20e38', '#22c55e', '#3b82f6']} count={4} />

      <motion.div style={{ y, opacity }} className="relative z-10 text-center px-6">
        <h1 className="hero-title mb-6 overflow-hidden">
          <span className="sports-hero-title block text-white">CHOOSE YOUR</span>
          <span className="sports-hero-title block gradient-text">BATTLEFIELD</span>
        </h1>
        <p className="sports-hero-subtitle text-xl md:text-2xl text-white/60 max-w-2xl mx-auto">
          Multiple sports. Unlimited glory. Find your arena and compete with the best.
        </p>
      </motion.div>

      <motion.div 
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <span className="text-xs uppercase tracking-widest text-white/40 mb-2">Explore</span>
        <div className="scroll-indicator-line">
          <div className="scroll-indicator-dot" />
        </div>
      </motion.div>
    </section>
  );
}

interface SportCardProps {
  sport: Sport & { color?: string };
  index: number;
}

function SportCard({ sport, index }: SportCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isEven = index % 2 === 0;
  const number = String(index + 1).padStart(2, '0');
  
  const colorMap: { [key: string]: string } = {
    'Cricket': '#22c55e',
    'Football': '#3b82f6',
    'Basketball': '#f97316',
    'Volleyball': '#eab308',
    'Badminton': '#06b6d4',
    'E-Sports': '#8b5cf6',
    'Table Tennis': '#ec4899',
    'Chess': '#a855f7',
    'Athletics': '#ef4444',
    'Swimming': '#14b8a6',
    'Kabaddi': '#f97316',
    'Kho Kho': '#84cc16',
  };
  
  const color = sport.color || colorMap[sport.name] || '#b20e38';
  const colorRgb = hexToRgb(color);

  function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '178, 14, 56';
  }

  const iconMap: { [key: string]: string } = {
    'Cricket': '🏏',
    'Football': '⚽',
    'Basketball': '🏀',
    'Volleyball': '🏐',
    'Badminton': '🏸',
    'E-Sports': '🎮',
    'Table Tennis': '🏓',
    'Chess': '♟️',
    'Athletics': '🏃',
    'Swimming': '🏊',
    'Kabaddi': '🤼',
    'Kho Kho': '🏃‍♂️',
  };
  
  const icon = sport.icon || iconMap[sport.name] || '🏆';

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !cardRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        x: isEven ? -100 : 100,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      gsap.from(cardRef.current?.querySelectorAll('.card-content') || [], {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    return () => ctx.revert();
  }, [isEven]);

  return (
    <section className="py-16 md:py-24 relative">
      <div 
        className="gradient-orb w-[500px] h-[500px]"
        style={{
          background: `radial-gradient(circle, rgba(${colorRgb}, 0.3) 0%, transparent 70%)`,
          right: isEven ? '-15%' : 'auto',
          left: isEven ? 'auto' : '-15%',
          top: '20%',
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <div
          ref={cardRef}
          className={`relative flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12`}
        >
          {/* Icon/Visual */}
          <div className="flex-shrink-0 relative">
            <div 
              className="w-48 h-48 md:w-64 md:h-64 rounded-3xl glass-card flex items-center justify-center relative overflow-hidden group"
              style={{ boxShadow: `0 0 60px rgba(${colorRgb}, 0.2)` }}
            >
              <div 
                className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                style={{ background: `linear-gradient(135deg, ${color} 0%, transparent 70%)` }}
              />
              <span className="text-7xl md:text-8xl">{icon}</span>
              <div 
                className="absolute -bottom-4 -right-4 text-9xl font-black opacity-5"
                style={{ color }}
              >
                {number}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={`flex-1 ${isEven ? 'md:text-left' : 'md:text-right'} text-center`}>
            {/* Number & Name */}
            <div className={`card-content flex items-center gap-4 mb-4 ${isEven ? 'md:justify-start' : 'md:justify-end'} justify-center`}>
              <span 
                className="text-5xl md:text-6xl font-black font-scoreboard"
                style={{ color }}
              >
                {number}
              </span>
              <div className="h-px w-12 bg-white/20" />
            </div>

            <h2 
              className="card-content text-4xl md:text-6xl font-black uppercase mb-4"
              style={{ color }}
            >
              {sport.name}
            </h2>

            <p className="card-content text-lg text-white/60 mb-8 max-w-lg">
              {sport.description || `Experience the excitement of ${sport.name} at HanumatFest. Compete against top colleges and showcase your skills.`}
            </p>

            {/* Stats */}
            <div className={`card-content flex gap-8 mb-8 ${isEven ? 'md:justify-start' : 'md:justify-end'} justify-center`}>
              <div>
                <p className="text-3xl font-black font-scoreboard" style={{ color }}>
                  {sport.max_team_size || 5}
                </p>
                <p className="text-sm uppercase tracking-wider text-white/50">
                  {sport.is_team_sport ? 'Team Size' : 'Players'}
                </p>
              </div>
              <div>
                <p className="text-3xl font-black font-scoreboard" style={{ color }}>
                  ₹{sport.registration_fee || 500}
                </p>
                <p className="text-sm uppercase tracking-wider text-white/50">Entry Fee</p>
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color }}>
                  {sport.is_team_sport ? 'Team Sport' : 'Individual'}
                </p>
                <p className="text-sm uppercase tracking-wider text-white/50">Format</p>
              </div>
            </div>

            {/* CTA */}
            <div className={`card-content ${isEven ? 'md:text-left' : 'md:text-right'}`}>
              <Link
                href={`/sports/${sport.id}`}
                className="inline-flex items-center gap-3 group"
              >
                <span 
                  className="px-8 py-4 rounded-full font-bold uppercase tracking-wider text-sm text-white transition-all hover:scale-105"
                  style={{ backgroundColor: color }}
                >
                  Register Now
                </span>
                <span 
                  className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-transform group-hover:translate-x-2"
                  style={{ borderColor: color, color }}
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickNav({ sports }: { sports: (Sport & { color?: string })[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  
  const colorMap: { [key: string]: string } = {
    'Cricket': '#22c55e',
    'Football': '#3b82f6',
    'Basketball': '#f97316',
    'Volleyball': '#eab308',
    'Badminton': '#06b6d4',
    'E-Sports': '#8b5cf6',
    'Table Tennis': '#ec4899',
    'Chess': '#a855f7',
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[data-sport-section]');
      const scrollPos = window.scrollY + window.innerHeight / 2;
      
      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const bottom = top + rect.height;
        
        if (scrollPos >= top && scrollPos < bottom) {
          setActiveIndex(index);
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3">
      {sports.map((sport, index) => {
        const color = sport.color || colorMap[sport.name] || '#b20e38';
        return (
          <button
            key={sport.id}
            onClick={() => {
              const element = document.querySelector(`[data-sport-section="${sport.id}"]`);
              element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeIndex === index ? 'scale-125' : 'opacity-50 hover:opacity-100'
            }`}
            style={{ backgroundColor: activeIndex === index ? color : 'rgba(255,255,255,0.3)' }}
            title={sport.name}
          />
        );
      })}
    </div>
  );
}

export default function SportsPage() {
  const { sports: backendSports, loading, error } = useSports();
  
  // Use backend sports if available, otherwise fallback
  const displaySports = backendSports.length > 0 ? backendSports : fallbackSports;

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <AnimatedBackground variant="gradient" />
        <div className="loader" />
      </main>
    );
  }

  return (
    <main className="relative bg-background text-foreground min-h-screen">
      <div className="noise" />
      <Navigation />
      <QuickNav sports={displaySports as (Sport & { color?: string })[]} />

      <HeroSection />

      {error && (
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
            Using cached sports data. Some information may not be up to date.
          </div>
        </div>
      )}

      <section className="py-8">
        {displaySports.map((sport, index) => (
          <div key={sport.id} data-sport-section={sport.id}>
            <SportCard sport={sport as Sport & { color?: string }} index={index} />
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="gradient-orb gradient-orb-primary w-[600px] h-[600px] top-0 left-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          >
            <h2 className="section-title mb-6">
              <span className="text-white">CANT</span>{' '}
              <span className="gradient-text">DECIDE?</span>
            </h2>
            <p className="text-xl text-white/60 mb-10">
              No worries! You can register for multiple sports. Build your legacy across different arenas.
            </p>
            <Link href="/signup" className="btn-primary text-lg px-12 py-5">
              Start Registration
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-xl font-black tracking-tighter">
            <span className="gradient-text">HANUMAT</span>
            <span className="text-white/80">FEST</span>
          </Link>
          <p className="text-white/30 text-sm">
            © 2025 HanumatFest. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
