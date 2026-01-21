'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Hero3DScene = dynamic(
  () => import('@/components/3d/Hero3D').then((mod) => mod.Hero3DScene),
  { ssr: false }
);

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const sports = [
  { id: 'cricket', name: 'Cricket', number: '01', color: '#22c55e', gradient: 'gradient-cricket', teams: 32, prize: '₹50K' },
  { id: 'football', name: 'Football', number: '02', color: '#3b82f6', gradient: 'gradient-football', teams: 24, prize: '₹40K' },
  { id: 'basketball', name: 'Basketball', number: '03', color: '#f97316', gradient: 'gradient-basketball', teams: 16, prize: '₹30K' },
  { id: 'volleyball', name: 'Volleyball', number: '04', color: '#eab308', gradient: 'gradient-volleyball', teams: 20, prize: '₹25K' },
  { id: 'badminton', name: 'Badminton', number: '05', color: '#06b6d4', gradient: 'gradient-badminton', teams: 48, prize: '₹20K' },
  { id: 'esports', name: 'E-Sports', number: '06', color: '#8b5cf6', gradient: 'gradient-esports', teams: 64, prize: '₹35K' },
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
          <Link href="/sports" className="nav-link">Sports</Link>
          <Link href="/about" className="nav-link">About</Link>
          <Link href="/schedule" className="nav-link">Schedule</Link>
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
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !titleRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.hero-title-line', {
        y: 120,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'expo.out',
        delay: 0.5,
      });

      gsap.from('.hero-subtitle', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        delay: 1,
      });

      gsap.from('.hero-cta', {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'expo.out',
        delay: 1.2,
      });

      gsap.from('.hero-stat', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'expo.out',
        delay: 1.4,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen flex items-center overflow-hidden">
      <Suspense fallback={<div className="absolute inset-0 bg-background" />}>
        <Hero3DScene className="opacity-60" />
      </Suspense>

      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <motion.div 
        style={{ y, opacity, scale }}
        className="relative z-10 max-w-7xl mx-auto px-6 w-full"
      >
        <div className="max-w-4xl">
          <motion.p 
            className="hero-subtitle text-white/60 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            March 15-20, 2025 • Hybrid Event
          </motion.p>

          <h1 ref={titleRef} className="hero-title mb-8 overflow-hidden">
            <span className="hero-title-line block text-white">THE ULTIMATE</span>
            <span className="hero-title-line block gradient-text">SPORTS</span>
            <span className="hero-title-line block text-white">FESTIVAL</span>
          </h1>

          <p className="hero-subtitle text-white/60 max-w-xl mb-10">
            Where champions are made. 6 sports, 200+ teams, one epic competition.
          </p>

          <div className="hero-cta flex flex-wrap gap-4 mb-16">
            <Link href="/signup" className="btn-primary">
              Register Now
            </Link>
            <Link 
              href="/sports" 
              className="px-8 py-4 rounded-full border border-white/20 font-semibold uppercase tracking-wider text-sm hover:bg-white/5 transition-colors"
            >
              Explore Sports
            </Link>
          </div>

          <div className="flex flex-wrap gap-12">
            {[
              { value: '6', label: 'Sports' },
              { value: '200+', label: 'Teams' },
              { value: '₹2L+', label: 'Prize Pool' },
              { value: '5K+', label: 'Athletes' },
            ].map((stat, i) => (
              <div key={i} className="hero-stat">
                <p className="text-4xl md:text-5xl font-black font-scoreboard gradient-text">
                  {stat.value}
                </p>
                <p className="text-sm uppercase tracking-wider text-white/50 mt-1">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <span className="text-xs uppercase tracking-widest text-white/40 mb-2">Scroll</span>
        <div className="scroll-indicator-line">
          <div className="scroll-indicator-dot" />
        </div>
      </motion.div>
    </section>
  );
}

function SportChapter({ sport, index }: { sport: typeof sports[0]; index: number }) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isEven = index % 2 === 0;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from(contentRef.current?.querySelectorAll('.sport-content') || [], {
        y: 100,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="sport-section py-32 relative"
      style={{ '--current-color': sport.color } as React.CSSProperties}
    >
      <div 
        className="sport-number text-white select-none"
        style={{ 
          right: isEven ? '5%' : 'auto', 
          left: isEven ? 'auto' : '5%',
          top: '50%',
          transform: 'translateY(-50%)'
        }}
      >
        {sport.number}
      </div>

      <div 
        className="gradient-orb w-[600px] h-[600px]"
        style={{
          background: `radial-gradient(circle, ${sport.color}40 0%, transparent 70%)`,
          right: isEven ? '-10%' : 'auto',
          left: isEven ? 'auto' : '-10%',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />

      <div ref={contentRef} className={`relative z-10 max-w-7xl mx-auto px-6 flex items-center ${isEven ? 'justify-start' : 'justify-end'}`}>
        <div className={`max-w-xl ${isEven ? '' : 'text-right'}`}>
          <div className="sport-content inline-flex items-center gap-3 mb-6">
            <span 
              className="text-6xl font-black font-scoreboard"
              style={{ color: sport.color }}
            >
              {sport.number}
            </span>
            <div className="h-px w-16 bg-white/20" />
          </div>

          <h2 
            className={`sport-content section-title mb-6 ${sport.gradient} gradient-text-sport`}
          >
            {sport.name}
          </h2>

          <div className={`sport-content flex gap-8 mb-8 ${isEven ? '' : 'justify-end'}`}>
            <div>
              <p className="text-3xl font-black font-scoreboard" style={{ color: sport.color }}>
                {sport.teams}
              </p>
              <p className="text-sm uppercase tracking-wider text-white/50">Teams</p>
            </div>
            <div>
              <p className="text-3xl font-black font-scoreboard" style={{ color: sport.color }}>
                {sport.prize}
              </p>
              <p className="text-sm uppercase tracking-wider text-white/50">Prize</p>
            </div>
          </div>

          <motion.div className="sport-content">
            <Link
              href={`/sports/${sport.id}`}
              className="inline-flex items-center gap-3 group"
            >
              <span 
                className="px-6 py-3 rounded-full font-semibold uppercase tracking-wider text-sm text-white transition-all hover:scale-105"
                style={{ backgroundColor: sport.color }}
              >
                View Details
              </span>
              <span 
                className="w-12 h-12 rounded-full flex items-center justify-center border-2 transition-transform group-hover:translate-x-2"
                style={{ borderColor: sport.color, color: sport.color }}
              >
                →
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.cta-content', {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-40 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/10 to-background" />
      <div className="gradient-orb gradient-orb-primary w-[800px] h-[800px] -top-1/4 -left-1/4" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="cta-content">
          <p className="hero-subtitle text-white/60 mb-6">
            Limited Spots Available
          </p>
          <h2 className="section-title mb-8">
            <span className="text-white">READY TO</span>
            <br />
            <span className="gradient-text">COMPETE?</span>
          </h2>
          <p className="text-xl text-white/60 mb-12 max-w-2xl mx-auto">
            Join thousands of athletes competing for glory. Registration closes March 10, 2025.
          </p>
          <Link href="/signup" className="btn-primary text-lg px-12 py-5">
            Register Your Team
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <Link href="/" className="text-3xl font-black tracking-tighter inline-block mb-4">
              <span className="gradient-text">HANUMAT</span>
              <span className="text-white/80">FEST</span>
            </Link>
            <p className="text-white/50 max-w-md">
              The ultimate inter-college sports festival. Where champions are made and legends are born.
            </p>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-white/80 mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link href="/sports" className="text-white/50 hover:text-white transition-colors">Sports</Link>
              <Link href="/schedule" className="text-white/50 hover:text-white transition-colors">Schedule</Link>
              <Link href="/about" className="text-white/50 hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="text-white/50 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-white/80 mb-4">Contact</h4>
            <div className="flex flex-col gap-2 text-white/50">
              <a href="mailto:info@hanumatfest.com" className="hover:text-white transition-colors">
                info@hanumatfest.com
              </a>
              <a href="tel:+919876543210" className="hover:text-white transition-colors">
                +91 98765 43210
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5">
          <p className="text-white/30 text-sm">
            © 2025 HanumatFest. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-white/30 hover:text-white transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-white/30 hover:text-white transition-colors text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative bg-background text-foreground">
      <div className="noise" />
      <Navigation />

      <AnimatePresence mode="wait">
        {isLoaded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <HeroSection />

            <section className="py-32 relative">
              <div className="max-w-5xl mx-auto px-6 text-center">
                <motion.h2 
                  className="text-2xl md:text-4xl font-light leading-relaxed text-white/80"
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  viewport={{ once: true }}
                >
                  HanumatFest brings together the{' '}
                  <span className="gradient-text font-bold">best athletes</span>{' '}
                  from colleges across the nation. Six days of{' '}
                  <span className="gradient-text font-bold">intense competition</span>,{' '}
                  unforgettable moments, and the spirit of sportsmanship.
                </motion.h2>
              </div>
            </section>

            {sports.map((sport, index) => (
              <SportChapter key={sport.id} sport={sport} index={index} />
            ))}

            <CTASection />
            <Footer />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
