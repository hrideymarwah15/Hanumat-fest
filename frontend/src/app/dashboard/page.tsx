'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSports } from '@/context/SportsContext';
import { AnimatedBackground, GlowOrbs } from '@/components/ui/AnimatedBackground';
import { supabase } from '@/lib/supabase';

interface Registration {
  id: string;
  sport_id: string;
  status: string;
  created_at: string;
  sports?: {
    name: string;
    icon?: string;
  };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  created_at: string;
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut, refreshProfile } = useAuth();
  const { sports, sportColors } = useSports();

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch registrations
        const { data: regs } = await supabase
          .from('registrations')
          .select(`
            id,
            sport_id,
            status,
            created_at,
            sports (name, icon)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (regs) setRegistrations(regs as Registration[]);

        // Fetch payments
        const { data: pays } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (pays) setPayments(pays);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
      refreshProfile();
    }
  }, [user, refreshProfile]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from('.dashboard-card', {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'expo.out',
        delay: 0.2,
      });
    });

    return () => ctx.revert();
  }, [loading]);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSportIcon = (sportName: string) => {
    const iconMap: { [key: string]: string } = {
      'Cricket': '🏏',
      'Football': '⚽',
      'Basketball': '🏀',
      'Volleyball': '🏐',
      'Table Tennis': '🏓',
      'Badminton': '🏸',
      'Chess': '♟️',
      'E-Sports': '🎮',
      'Athletics': '🏃',
      'Swimming': '🏊',
      'Kabaddi': '🤼',
      'Kho Kho': '🏃‍♂️',
    };
    return iconMap[sportName] || '🏆';
  };

  const getSportColor = (sportName: string) => {
    return sportColors[sportName] || '#b20e38';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const totalPaid = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <AnimatedBackground variant="gradient" />
        <div className="loader" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="relative min-h-screen bg-background">
      <AnimatedBackground variant="grid" />
      <GlowOrbs colors={['#b20e38', '#22c55e', '#3b82f6']} count={4} />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 glass border-r border-white/5 p-6 hidden lg:flex flex-col z-50">
        <Link href="/" className="text-xl font-black tracking-tighter mb-10">
          <span className="gradient-text">HANUMAT</span>
          <span className="text-white/80">FEST</span>
        </Link>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', icon: '📊', label: 'Overview' },
            { id: 'sports', icon: '🏆', label: 'My Sports' },
            { id: 'payments', icon: '💳', label: 'Payments' },
            { id: 'settings', icon: '⚙️', label: 'Settings' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-primary/20 text-white'
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-sm">
              {profile?.name ? getInitials(profile.name) : user.email?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white text-sm truncate">
                {profile?.name || 'User'}
              </p>
              <p className="text-white/50 text-xs truncate">
                {profile?.college || user.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-40 glass border-b border-white/5 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-white/50 text-sm">
                Welcome back, {profile?.name?.split(' ')[0] || 'Athlete'}!
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/sports"
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/20 text-primary hover:bg-primary/30 transition-colors text-sm font-medium"
              >
                <span>+</span> Register Sport
              </Link>
              <button
                onClick={handleLogout}
                className="text-white/50 hover:text-white text-sm transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[
                    { label: 'Registered Sports', value: registrations.length.toString(), icon: '🏆', color: '#22c55e' },
                    { label: 'Pending Registrations', value: registrations.filter(r => r.status === 'pending').length.toString(), icon: '⏳', color: '#f97316' },
                    { label: 'Total Paid', value: `₹${totalPaid}`, icon: '💰', color: '#3b82f6' },
                    { label: 'Available Sports', value: sports.length.toString(), icon: '🎯', color: '#8b5cf6' },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      className="dashboard-card glass-card p-6 hover-lift"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-3xl">{stat.icon}</span>
                        <span 
                          className="text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-full"
                          style={{ backgroundColor: `${stat.color}20`, color: stat.color }}
                        >
                          Live
                        </span>
                      </div>
                      <p 
                        className="text-4xl font-black font-scoreboard mb-1"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </p>
                      <p className="text-white/50 text-sm">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* My Sports */}
                  <div className="lg:col-span-2">
                    <div className="dashboard-card glass-card p-6">
                      <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span>🏆</span> My Sports
                      </h2>
                      <div className="space-y-4">
                        {registrations.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-white/40 mb-4">No sports registered yet</p>
                            <Link
                              href="/sports"
                              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                            >
                              Browse Sports
                            </Link>
                          </div>
                        ) : (
                          <>
                            {registrations.slice(0, 3).map((reg) => (
                              <div
                                key={reg.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  <div 
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                    style={{ backgroundColor: `${getSportColor(reg.sports?.name || '')}20` }}
                                  >
                                    {reg.sports?.icon || getSportIcon(reg.sports?.name || '')}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-white">{reg.sports?.name || 'Sport'}</p>
                                    <p className="text-white/50 text-sm">Registered: {formatDate(reg.created_at)}</p>
                                  </div>
                                </div>
                                <span 
                                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                                    reg.status === 'confirmed'
                                      ? 'bg-green-500/20 text-green-400'
                                      : reg.status === 'pending'
                                      ? 'bg-yellow-500/20 text-yellow-400'
                                      : 'bg-red-500/20 text-red-400'
                                  }`}
                                >
                                  {reg.status}
                                </span>
                              </div>
                            ))}
                          </>
                        )}
                        <Link
                          href="/sports"
                          className="block text-center p-4 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:border-primary/50 transition-colors"
                        >
                          + Register for more sports
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="dashboard-card glass-card p-6">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span>⚡</span> Quick Actions
                    </h2>
                    <div className="space-y-3">
                      <Link
                        href="/sports"
                        className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
                      >
                        <span className="text-xl">🏆</span>
                        <span className="text-white font-medium">Browse Sports</span>
                      </Link>
                      <Link
                        href="/schedule"
                        className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                      >
                        <span className="text-xl">📅</span>
                        <span className="text-white font-medium">View Schedule</span>
                      </Link>
                      <button
                        onClick={() => setActiveTab('settings')}
                        className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <span className="text-xl">⚙️</span>
                        <span className="text-white font-medium">Edit Profile</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sports' && (
              <motion.div
                key="sports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="dashboard-card glass-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>🏆</span> My Registrations
                    </h2>
                    <Link
                      href="/sports"
                      className="px-4 py-2 rounded-xl bg-primary/20 text-primary text-sm font-medium hover:bg-primary/30 transition-colors"
                    >
                      + Add Sport
                    </Link>
                  </div>
                  
                  {registrations.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="text-6xl mb-4 block">🏅</span>
                      <p className="text-white/40 mb-4">You haven't registered for any sports yet</p>
                      <Link
                        href="/sports"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors"
                      >
                        Explore Sports
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {registrations.map((reg) => (
                        <div
                          key={reg.id}
                          className="flex items-center justify-between p-5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                              style={{ backgroundColor: `${getSportColor(reg.sports?.name || '')}20` }}
                            >
                              {reg.sports?.icon || getSportIcon(reg.sports?.name || '')}
                            </div>
                            <div>
                              <p className="font-semibold text-white text-lg">{reg.sports?.name || 'Sport'}</p>
                              <p className="text-white/50 text-sm">Registered on {formatDate(reg.created_at)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span 
                              className={`px-4 py-2 rounded-full text-xs font-semibold uppercase ${
                                reg.status === 'confirmed'
                                  ? 'bg-green-500/20 text-green-400'
                                  : reg.status === 'pending'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {reg.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'payments' && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="dashboard-card glass-card p-6">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span>💳</span> Payment History
                  </h2>
                  
                  {payments.length === 0 ? (
                    <div className="text-center py-12">
                      <span className="text-6xl mb-4 block">💸</span>
                      <p className="text-white/40">No payments yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-white/50 text-sm">
                            <th className="pb-4 font-medium">Amount</th>
                            <th className="pb-4 font-medium">Status</th>
                            <th className="pb-4 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment) => (
                            <tr key={payment.id} className="border-t border-white/5">
                              <td className="py-4 font-medium text-white">₹{payment.amount}</td>
                              <td className="py-4">
                                <span 
                                  className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                                    payment.status === 'completed'
                                      ? 'bg-green-500/20 text-green-400'
                                      : payment.status === 'pending'
                                      ? 'bg-yellow-500/20 text-yellow-400'
                                      : 'bg-red-500/20 text-red-400'
                                  }`}
                                >
                                  {payment.status}
                                </span>
                              </td>
                              <td className="py-4 text-white/70">{formatDate(payment.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="dashboard-card glass-card p-6 max-w-2xl">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span>⚙️</span> Profile Settings
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-6 p-6 rounded-xl bg-white/5">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white text-2xl">
                        {profile?.name ? getInitials(profile.name) : user.email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{profile?.name || 'User'}</h3>
                        <p className="text-white/50">{user.email}</p>
                        <p className="text-white/50">{profile?.college || 'No college set'}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                        <input
                          type="email"
                          value={user.email || ''}
                          disabled
                          className="input-glass opacity-50 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Name</label>
                        <input
                          type="text"
                          value={profile?.name || ''}
                          disabled
                          className="input-glass opacity-50 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">Phone</label>
                        <input
                          type="text"
                          value={profile?.phone || ''}
                          disabled
                          className="input-glass opacity-50 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white/70 mb-2">College</label>
                        <input
                          type="text"
                          value={profile?.college || ''}
                          disabled
                          className="input-glass opacity-50 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <p className="text-white/40 text-sm">
                      Contact support to update your profile information.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/5 p-4 z-50">
        <div className="flex justify-around">
          {[
            { id: 'overview', icon: '📊' },
            { id: 'sports', icon: '🏆' },
            { id: 'payments', icon: '💳' },
            { id: 'settings', icon: '⚙️' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`p-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-primary/20 text-white'
                  : 'text-white/50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
