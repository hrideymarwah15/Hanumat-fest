'use client';

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const timeline = [
  { year: '2020', title: 'The Beginning', description: 'HanumatFest started as a small inter-department competition.' },
  { year: '2021', title: 'Going Online', description: 'Adapted to virtual competitions during the pandemic.' },
  { year: '2022', title: 'Regional Growth', description: 'Expanded to include colleges from 5 states.' },
  { year: '2023', title: 'National Stage', description: '50+ colleges participated in our largest event yet.' },
  { year: '2024', title: 'The Future', description: 'Aiming for 100+ colleges and international participation.' },
];

const team = [
  { name: 'Rahul Sharma', role: 'Event Director', image: '👨‍💼' },
  { name: 'Priya Patel', role: 'Sports Coordinator', image: '👩‍💼' },
  { name: 'Amit Kumar', role: 'Technical Head', image: '👨‍💻' },
  { name: 'Sneha Gupta', role: 'Marketing Lead', image: '👩‍🎨' },
];

const stats = [
  { value: '50+', label: 'Colleges' },
  { value: '5000+', label: 'Athletes' },
  { value: '6', label: 'Sports' },
  { value: '₹2L+', label: 'Prize Pool' },
];

export default function AboutPage() {
  const heroRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from('.about-hero-text', {
        y: 80,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: 'expo.out',
        delay: 0.3,
      });

      gsap.from('.timeline-item', {
        x: -50,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: timelineRef.current,
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      });

      gsap.from('.stat-item', {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.stats-section',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });

      gsap.from('.team-card', {
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 0.8,
        ease: 'expo.out',
        scrollTrigger: {
          trigger: '.team-section',
          start: 'top 70%',
          toggleActions: 'play none none reverse',
        },
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <div className="noise" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-tighter">
            <span className="gradient-text">HANUMAT</span>
            <span className="text-white/80">FEST</span>
          </Link>
          <div className="hidden md:flex items-center gap-2">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="/sports" className="nav-link">Sports</Link>
            <Link href="/about" className="nav-link active">About</Link>
            <Link href="/login" className="btn-primary ml-4 py-2 px-6 text-sm">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section ref={heroRef} className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="gradient-orb gradient-orb-primary w-[700px] h-[700px] top-0 right-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />

        <motion.div style={{ y, opacity }} className="relative z-10 text-center px-6 max-w-4xl">
          <p className="about-hero-text hero-subtitle text-white/60 mb-6">Our Story</p>
          <h1 className="about-hero-text hero-title mb-8">
            <span className="text-white">WHERE</span>
            <br />
            <span className="gradient-text">LEGENDS</span>
            <br />
            <span className="text-white">ARE BORN</span>
          </h1>
          <p className="about-hero-text text-xl text-white/60 max-w-2xl mx-auto">
            HanumatFest is more than a sports festival. Its a celebration of athleticism, 
            teamwork, and the competitive spirit that drives us all.
          </p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="stats-section py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="stat-item text-center">
                <p className="text-5xl md:text-6xl font-black font-scoreboard gradient-text mb-2">
                  {stat.value}
                </p>
                <p className="text-white/50 uppercase tracking-wider text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-32 relative">
        <div className="gradient-orb w-[500px] h-[500px] -left-1/4 top-0" style={{ background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)' }} />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
            >
              <p className="hero-subtitle text-primary mb-4">Our Mission</p>
              <h2 className="section-title text-white mb-6">
                EMPOWERING<br />
                <span className="gradient-text">ATHLETES</span>
              </h2>
              <p className="text-lg text-white/60 mb-6">
                We believe every student athlete deserves a platform to showcase their talent. 
                HanumatFest provides that stage, bringing together the best from colleges across the nation.
              </p>
              <p className="text-lg text-white/60">
                Through fair competition, we foster sportsmanship, build lasting connections, 
                and create memories that last a lifetime.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-card p-8 md:p-12 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/30 to-transparent rounded-full blur-3xl" />
                <blockquote className="relative z-10">
                  <p className="text-2xl md:text-3xl font-light text-white/90 italic mb-6">
                    Sports have the power to change the world. It has the power to inspire, 
                    to unite people in a way that little else does.
                  </p>
                  <footer className="text-white/50">
                    — <cite className="not-italic font-semibold">Nelson Mandela</cite>
                  </footer>
                </blockquote>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-32 relative">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="hero-subtitle text-primary mb-4">Our Journey</p>
            <h2 className="section-title text-white">
              THE <span className="gradient-text">EVOLUTION</span>
            </h2>
          </div>

          <div ref={timelineRef} className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/50 to-transparent" />
            
            {timeline.map((item, i) => (
              <div 
                key={i} 
                className={`timeline-item relative flex items-center mb-12 ${
                  i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className="absolute left-4 md:left-1/2 w-3 h-3 bg-primary rounded-full transform -translate-x-1/2" />
                
                <div className={`ml-12 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                  <span className="text-4xl font-black font-scoreboard gradient-text">{item.year}</span>
                  <h3 className="text-xl font-bold text-white mt-2 mb-2">{item.title}</h3>
                  <p className="text-white/60">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="team-section py-32 relative">
        <div className="gradient-orb gradient-orb-primary w-[600px] h-[600px] -right-1/4 top-1/4" />
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="hero-subtitle text-primary mb-4">The Team</p>
            <h2 className="section-title text-white">
              MEET THE <span className="gradient-text">ORGANIZERS</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={i}
                className="team-card glass-card p-8 text-center hover-lift"
                whileHover={{ scale: 1.02 }}
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-4xl">
                  {member.image}
                </div>
                <h3 className="text-lg font-bold text-white mb-1">{member.name}</h3>
                <p className="text-white/50 text-sm">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          >
            <h2 className="section-title mb-6">
              <span className="text-white">BE PART OF</span>
              <br />
              <span className="gradient-text">HISTORY</span>
            </h2>
            <p className="text-xl text-white/60 mb-10">
              Join us in creating the biggest inter-college sports festival. 
              Your journey to glory starts here.
            </p>
            <Link href="/signup" className="btn-primary text-lg px-12 py-5">
              Register Now
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
