'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSports, Sport } from '@/context/SportsContext';
import { AnimatedBackground, GlowOrbs } from '@/components/ui/AnimatedBackground';
import { supabase, supabaseAdmin } from '@/lib/supabase';

interface SportDetails extends Sport {
  color?: string;
  rules_list?: string[];
  prizes?: { position: string; prize: string }[];
  schedule?: { round: string; date: string; matches: string }[];
  coordinators?: { name: string; phone: string; role: string }[];
}

// Extended sport data with more details
const extendedSportData: { [key: string]: Partial<SportDetails> } = {
  cricket: {
    color: '#22c55e',
    rules_list: [
      'T20 Format - 20 overs per side',
      'Each team must have minimum 11 players',
      'Maximum 15 players allowed per squad',
      'ICC T20 rules will be followed',
      'Decision of umpires will be final',
      'Team captain must attend the pre-tournament meeting',
      'All players must carry valid college ID',
    ],
    prizes: [
      { position: '1st', prize: '₹15,000 + Trophy + Certificates' },
      { position: '2nd', prize: '₹10,000 + Trophy + Certificates' },
      { position: '3rd', prize: '₹5,000 + Certificates' },
      { position: 'Best Batsman', prize: '₹2,000 + Medal' },
      { position: 'Best Bowler', prize: '₹2,000 + Medal' },
    ],
    schedule: [
      { round: 'Group Stage', date: 'Day 1', matches: '8 matches' },
      { round: 'Quarter Finals', date: 'Day 2', matches: '4 matches' },
      { round: 'Semi Finals', date: 'Day 2', matches: '2 matches' },
      { round: 'Finals', date: 'Day 3', matches: '1 match' },
    ],
    coordinators: [
      { name: 'Coordinator', phone: '+91 98765 43210', role: 'Head Coordinator' },
    ],
  },
  football: {
    color: '#3b82f6',
    rules_list: [
      '7-a-side format',
      'Match duration: 30 minutes each half',
      'FIFA rules apply',
      'Rolling substitutions allowed',
      'Yellow and red card rules apply',
      'All players must wear proper football shoes',
    ],
    prizes: [
      { position: '1st', prize: '₹12,000 + Trophy' },
      { position: '2nd', prize: '₹8,000 + Trophy' },
      { position: '3rd', prize: '₹4,000' },
    ],
  },
  basketball: {
    color: '#f97316',
    rules_list: [
      '5v5 full court format',
      '4 quarters of 10 minutes each',
      'NBA rules apply',
      'Shot clock: 24 seconds',
      'Maximum 12 players per team',
    ],
    prizes: [
      { position: '1st', prize: '₹10,000 + Trophy' },
      { position: '2nd', prize: '₹6,000 + Trophy' },
      { position: '3rd', prize: '₹3,000' },
    ],
  },
  volleyball: {
    color: '#eab308',
    rules_list: [
      '6v6 indoor format',
      'Best of 5 sets',
      'Rally scoring system',
      'FIVB rules apply',
      'Maximum 14 players per team',
    ],
    prizes: [
      { position: '1st', prize: '₹8,000 + Trophy' },
      { position: '2nd', prize: '₹5,000 + Trophy' },
    ],
  },
  badminton: {
    color: '#06b6d4',
    rules_list: [
      'Singles and doubles categories',
      'Best of 3 games',
      '21 points per game',
      'BWF rules apply',
      'Players must bring own rackets',
    ],
    prizes: [
      { position: '1st Singles', prize: '₹5,000 + Trophy' },
      { position: '1st Doubles', prize: '₹4,000 + Trophy' },
    ],
  },
  esports: {
    color: '#8b5cf6',
    rules_list: [
      'Valorant: 5v5 format',
      'BGMI: 4-person squads',
      'Online qualifiers',
      'LAN finals for top teams',
      'Anti-cheat software mandatory',
    ],
    prizes: [
      { position: '1st Valorant', prize: '₹10,000 + Gaming Gear' },
      { position: '1st BGMI', prize: '₹8,000 + Gaming Gear' },
    ],
  },
};

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
};

export default function SportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, loading: authLoading } = useAuth();
  const { getSport, sports, loading: sportsLoading } = useSports();
  const [sport, setSport] = useState<SportDetails | null>(null);
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'success' | 'error' | 'already'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      // Abort any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    const fetchSport = async () => {
      // Try to get from context first
      const foundSport = getSport(slug);
      
      // If found in context
      if (foundSport) {
        const extendedData = extendedSportData[slug.toLowerCase()] || {};
        setSport({
          ...foundSport,
          ...extendedData,
          color: extendedData.color || colorMap[foundSport.name || ''] || '#b20e38',
        });
        return;
      }
      
      // If not found, try to fetch directly
      if (!sportsLoading) {
        const { data } = await supabase
          .from('sports')
          .select('*')
          .or(`id.eq.${slug},name.ilike.${slug}`)
          .single();
        
        if (data) {
          const sportData = data as Sport;
          const extendedData = extendedSportData[slug.toLowerCase()] || {};
          setSport({
            ...sportData,
            ...extendedData,
            color: extendedData.color || colorMap[sportData.name || ''] || '#b20e38',
          } as SportDetails);
        }
      }
    };

    if (slug) {
      fetchSport();
    }
  }, [slug, getSport, sportsLoading, sports]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from('.sport-detail-header', {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'expo.out',
        delay: 0.2,
      });

      gsap.from('.sport-detail-card', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'expo.out',
        delay: 0.4,
      });
    });

    return () => ctx.revert();
  }, [sport]);

  const handleRegister = async () => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(`/sports/${slug}`));
      return;
    }
    if (!sport || !sport.id) {
      if (isMountedRef.current) {
        setRegistrationStatus('error');
        setErrorMessage('Sport not found. Please try again later.');
      }
      return;
    }
    if (!user.id) {
      if (isMountedRef.current) {
        setRegistrationStatus('error');
        setErrorMessage('User not found. Please log in again.');
      }
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    if (isMountedRef.current) {
      setIsRegistering(true);
      setRegistrationStatus('idle');
      setErrorMessage('');
    }

    try {
      // Check if already registered
      const { data: existing, error: checkError } = await supabase
        .from('registrations')
        .select('id')
        .eq('user_id', user.id)
        .eq('sport_id', sport.id)
        .maybeSingle();

      if (!isMountedRef.current) return;

      if (checkError) {
        setRegistrationStatus('error');
        setErrorMessage('Error checking registration. Please try again.');
        setIsRegistering(false);
        return;
      }

      if (existing) {
        setRegistrationStatus('already');
        setIsRegistering(false);
        return;
      }

      // Create registration
      const { error } = await supabaseAdmin
        .from('registrations')
        .insert([
          {
            user_id: user.id,
            sport_id: sport.id,
            status: 'pending',
          },
        ]);

      if (!isMountedRef.current) return;

      if (error) {
        setRegistrationStatus('error');
        setErrorMessage(error.message || 'Failed to register. Please try again.');
        setIsRegistering(false);
        return;
      }

      setRegistrationStatus('success');
      setTimeout(() => {
        if (isMountedRef.current) {
          router.push('/dashboard');
        }
      }, 2000);
    } catch (err: any) {
      // Silently ignore AbortErrors (happens when user navigates away)
      if (err?.name === 'AbortError') {
        return;
      }
      
      if (!isMountedRef.current) return;
      
      setRegistrationStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Failed to register. Please try again.');
    } finally {
      if (isMountedRef.current) {
        setIsRegistering(false);
      }
    }
  };

  const hexToRgb = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result 
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '178, 14, 56';
  };

  if (sportsLoading || !sport) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <AnimatedBackground variant="gradient" />
        <div className="loader" />
      </main>
    );
  }

  const color = sport.color || '#b20e38';
  const colorRgb = hexToRgb(color);
  const icon = sport.icon || iconMap[sport.name] || '🏆';

  return (
    <main className="relative min-h-screen bg-background">
      <AnimatedBackground variant="particles" />
      <GlowOrbs colors={[color, '#b20e38', '#22c55e']} count={4} />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/sports" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
            <span>←</span>
            <span className="text-sm uppercase tracking-wider">Back to Sports</span>
          </Link>
          <Link href="/" className="text-xl font-black tracking-tighter">
            <span className="gradient-text">HANUMAT</span>
            <span className="text-white/80">FEST</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div 
          className="gradient-orb w-[600px] h-[600px]"
          style={{
            background: `radial-gradient(circle, rgba(${colorRgb}, 0.4) 0%, transparent 70%)`,
            left: '50%',
            top: '0',
            transform: 'translateX(-50%)',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* Icon */}
            <div 
              className="sport-detail-header w-48 h-48 md:w-64 md:h-64 rounded-3xl glass-card flex items-center justify-center"
              style={{ boxShadow: `0 0 80px rgba(${colorRgb}, 0.3)` }}
            >
              <span className="text-8xl md:text-9xl">{icon}</span>
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 
                className="sport-detail-header text-5xl md:text-7xl font-black uppercase mb-4"
                style={{ color }}
              >
                {sport.name}
              </h1>
              <p className="sport-detail-header text-xl text-white/60 mb-8 max-w-xl">
                {sport.description || `Experience the excitement of ${sport.name} at HanumatFest. Compete against top colleges and showcase your skills.`}
              </p>
              
              {/* Quick Stats */}
              <div className="sport-detail-header flex flex-wrap gap-6 justify-center md:justify-start mb-8">
                <div className="text-center">
                  <p className="text-3xl font-black font-scoreboard" style={{ color }}>
                    {sport.max_team_size || 5}
                  </p>
                  <p className="text-sm uppercase tracking-wider text-white/50">
                    {sport.is_team_sport ? 'Team Size' : 'Players'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-black font-scoreboard" style={{ color }}>
                    ₹{sport.registration_fee || 500}
                  </p>
                  <p className="text-sm uppercase tracking-wider text-white/50">Entry Fee</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold" style={{ color }}>
                    {sport.is_team_sport ? 'Team' : 'Individual'}
                  </p>
                  <p className="text-sm uppercase tracking-wider text-white/50">Format</p>
                </div>
              </div>

              {/* CTA */}
              <div className="sport-detail-header">
                <button
                  onClick={handleRegister}
                  disabled={isRegistering || registrationStatus === 'success' || registrationStatus === 'already'}
                  className="px-10 py-4 rounded-full font-bold uppercase tracking-wider text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 mx-auto md:mx-0"
                  style={{ backgroundColor: color }}
                >
                  {isRegistering ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Registering...
                    </>
                  ) : registrationStatus === 'success' ? (
                    '✓ Registered!'
                  ) : registrationStatus === 'already' ? (
                    'Already Registered'
                  ) : user ? (
                    'Register Now'
                  ) : (
                    'Login to Register'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Status Messages */}
      <AnimatePresence>
        {(registrationStatus === 'success' || registrationStatus === 'error' || registrationStatus === 'already') && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto px-6 mb-8"
          >
            <div className={`p-4 rounded-xl ${
              registrationStatus === 'success'
                ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                : registrationStatus === 'already'
                ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {registrationStatus === 'success' && 'Registration successful! Redirecting to dashboard...'}
              {registrationStatus === 'already' && 'You have already registered for this sport.'}
              {registrationStatus === 'error' && (errorMessage || 'Failed to register. Please try again.')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {['overview', 'rules', 'prizes', 'schedule'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full font-semibold uppercase tracking-wider text-sm transition-all ${
                  activeTab === tab
                    ? 'text-white'
                    : 'text-white/50 hover:text-white bg-white/5'
                }`}
                style={activeTab === tab ? { backgroundColor: color } : {}}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid md:grid-cols-2 gap-6"
              >
                <div className="sport-detail-card glass-card p-8">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>📋</span> About
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    {sport.description || `Join us for an exciting ${sport.name} tournament at HanumatFest. 
                    Compete against top college teams and showcase your skills in this thrilling competition.
                    Whether you're a seasoned player or just starting out, this is your chance to shine!`}
                  </p>
                </div>

                {sport.coordinators && sport.coordinators.length > 0 && (
                  <div className="sport-detail-card glass-card p-8">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span>📞</span> Coordinators
                    </h3>
                    <div className="space-y-4">
                      {sport.coordinators.map((coord, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                          <div>
                            <p className="font-semibold text-white">{coord.name}</p>
                            <p className="text-sm text-white/50">{coord.role}</p>
                          </div>
                          <a 
                            href={`tel:${coord.phone.replace(/\s/g, '')}`}
                            className="text-sm hover:underline"
                            style={{ color }}
                          >
                            {coord.phone}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'rules' && (
              <motion.div
                key="rules"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="sport-detail-card glass-card p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span>📜</span> Rules & Regulations
                  </h3>
                  <ul className="space-y-4">
                    {(sport.rules_list || [
                      'Official rules of the sport will apply',
                      'All participants must carry valid college ID',
                      'Decision of officials will be final',
                      'Teams must report 30 minutes before their match',
                      'Unsportsmanlike conduct will result in disqualification',
                    ]).map((rule, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <span 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {i + 1}
                        </span>
                        <span className="text-white/70 pt-1">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {activeTab === 'prizes' && (
              <motion.div
                key="prizes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="sport-detail-card glass-card p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span>🏆</span> Prizes & Awards
                  </h3>
                  <div className="space-y-4">
                    {(sport.prizes || [
                      { position: '1st Place', prize: 'Cash Prize + Trophy' },
                      { position: '2nd Place', prize: 'Cash Prize + Trophy' },
                      { position: '3rd Place', prize: 'Cash Prize + Certificate' },
                    ]).map((prize, i) => (
                      <div 
                        key={i} 
                        className={`flex items-center justify-between p-5 rounded-xl ${
                          i === 0 ? 'bg-yellow-500/10 border border-yellow-500/20' :
                          i === 1 ? 'bg-gray-500/10 border border-gray-500/20' :
                          i === 2 ? 'bg-orange-500/10 border border-orange-500/20' :
                          'bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-3xl">
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🏅'}
                          </span>
                          <span className="font-semibold text-white">{prize.position}</span>
                        </div>
                        <span style={{ color }} className="font-bold">{prize.prize}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'schedule' && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="sport-detail-card glass-card p-8">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span>📅</span> Tournament Schedule
                  </h3>
                  <div className="space-y-4">
                    {(sport.schedule || [
                      { round: 'Preliminary Rounds', date: 'TBA', matches: 'Group Stage' },
                      { round: 'Quarter Finals', date: 'TBA', matches: 'Knockout' },
                      { round: 'Semi Finals', date: 'TBA', matches: 'Knockout' },
                      { round: 'Finals', date: 'TBA', matches: 'Grand Finale' },
                    ]).map((item, i) => (
                      <div key={i} className="flex items-center gap-6">
                        <div className="w-24 text-sm text-white/50">{item.date}</div>
                        <div className="flex-1 p-4 rounded-xl bg-white/5 flex items-center gap-4">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <div>
                            <p className="font-semibold text-white">{item.round}</p>
                            <p className="text-sm text-white/50">{item.matches}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 relative">
        <div 
          className="gradient-orb w-[400px] h-[400px]"
          style={{
            background: `radial-gradient(circle, rgba(${colorRgb}, 0.3) 0%, transparent 70%)`,
            left: '50%',
            transform: 'translateX(-50%)',
            top: '0',
          }}
        />
        
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-black uppercase mb-4">
            Ready to <span style={{ color }}>Compete</span>?
          </h2>
          <p className="text-white/60 mb-8">
            Don't miss your chance to be part of the biggest sports fest. Register now!
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleRegister}
              disabled={isRegistering || registrationStatus === 'success'}
              className="px-8 py-4 rounded-full font-bold uppercase tracking-wider text-white transition-all hover:scale-105 disabled:opacity-50"
              style={{ backgroundColor: color }}
            >
              {user ? 'Register Now' : 'Login to Register'}
            </button>
            <Link
              href="/sports"
              className="px-8 py-4 rounded-full font-bold uppercase tracking-wider text-white/70 border border-white/20 hover:bg-white/5 transition-all"
            >
              Browse Sports
            </Link>
          </div>
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
