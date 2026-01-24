'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Navbar, Footer } from '@/components/layout'
import {
  Trophy,
  Users,
  Calendar,
  ArrowRight,
  Target,
  Medal,
  ChevronRight,
  MapPin,
  Clock,
  ChevronDown
} from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { ScrollBackgroundGallery } from '@/components/shared/ScrollBackgroundGallery'

// Background images for scroll-based gallery
const backgroundImages = [
  { src: '/sports/DSC00347.JPG', alt: 'Cricket - Hanumant 2026', section: 'hero' },
  { src: '/sports/DSC00543.JPG', alt: 'Basketball - Hanumant 2026', section: 'stats' },
  { src: '/sports/DSC00556.JPG', alt: 'Volleyball - Hanumant 2026', section: 'about' },
  { src: '/sports/DSC00406.JPG', alt: 'Football - Hanumant 2026', section: 'sports' },
  { src: '/sports/DSC00569.JPG', alt: 'Athletics - Hanumant 2026', section: 'cta' },
]

// Sports data with prize money
const sportsData = [
  { name: 'Cricket', slug: 'cricket', prize: { first: '₹20,000', second: '₹10,000' }, isTeam: true, icon: '🏏', image: '/sports/DSC00347.JPG' },
  { name: 'Football', slug: 'football', prize: { first: '₹20,000', second: '₹10,000' }, isTeam: true, icon: '⚽', image: '/sports/DSC00406.JPG' },
  { name: 'Basketball', slug: 'basketball', prize: { first: '₹12,000', second: '₹6,000' }, isTeam: true, icon: '🏀', image: '/sports/DSC00543.JPG' },
  { name: 'Volleyball', slug: 'volleyball', prize: { first: '₹10,000', second: '₹5,000' }, isTeam: true, icon: '🏐', image: '/sports/DSC00556.JPG' },
  { name: 'Badminton', slug: 'badminton', prize: { first: '₹2,500', second: '₹1,500' }, isTeam: false, icon: '🏸', image: '/sports/DSC00569.JPG' },
  { name: 'Table Tennis', slug: 'table-tennis', prize: { first: '₹5,000', second: '₹2,500' }, isTeam: false, icon: '🏓', image: '/sports/DSC00347.JPG' },
  { name: 'Lawn Tennis', slug: 'lawn-tennis', prize: { first: '₹5,000', second: '₹2,500' }, isTeam: false, icon: '🎾', image: '/sports/DSC00406.JPG' },
  { name: 'Chess', slug: 'chess', prize: { first: '₹3,000', second: '₹1,500' }, isTeam: false, icon: '♟️', image: '/sports/DSC00543.JPG' },
]

// Animated counter with intersection observer
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  
  useEffect(() => {
    if (!inView) return
    
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    
    return () => clearInterval(timer)
  }, [value, inView])
  
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>
}

export default function HomePage() {
  const [stats, setStats] = useState({ registrations: 0, colleges: 0, sports: 8 })
  const [hoveredSport, setHoveredSport] = useState<string | null>(null)
  const sections = ['hero', 'stats', 'about', 'sports', 'cta']

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get<{ registrations: number; colleges: number; sports: number }>('/analytics/public-stats')
        setStats({
          registrations: res.registrations || 150,
          colleges: res.colleges || 20,
          sports: res.sports || 8
        })
      } catch {
        setStats({ registrations: 150, colleges: 20, sports: 8 })
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Scroll-based Background Gallery */}
      <ScrollBackgroundGallery 
        images={backgroundImages}
        sections={sections}
        enableParallax={true}
        enableZoom={true}
      />

      <Navbar />

      <main className="flex-1 relative z-10">
        {/* Hero Section - Full Viewport 100vh */}
        <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Center Content */}
          <div className="container relative z-10 px-4">
            <div className="max-w-5xl mx-auto text-center">
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-8"
              >
                <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-white font-medium text-sm tracking-wide px-4 py-2 rounded-full border border-white/20">
                  RISHIHOOD UNIVERSITY PRESENTS
                </span>
              </motion.div>
              
              {/* Main Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-heading text-white text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] leading-[0.85] tracking-tight mb-6"
                style={{ textShadow: '0 4px 30px rgba(0,0,0,0.8), 0 2px 10px rgba(178,14,56,0.5)' }}
              >
                HANUMANT
              </motion.h1>
              
              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-10"
              >
                <h2 className="text-2xl md:text-3xl text-white font-body font-semibold">
                  Rishihood's Premier Inter-University Sports Festival
                </h2>
              </motion.div>
              
              {/* Description - Max 2 lines */}
              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-lg md:text-xl text-white/90 max-w-3xl mx-auto mb-12 font-body leading-relaxed"
              >
                Where India's finest collegiate athletes compete for glory, championships, and over ₹1.5 Lakh in prizes across 8 major sports.
              </motion.p>
              
              {/* CTA Buttons - Primary Register, Secondary Explore */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-5 justify-center items-center"
              >
                <Link href="/signup">
                  <Button 
                    size="lg" 
                    data-cursor
                    data-cursor-text="GO!"
                    className="bg-[#b20e38] hover:bg-[#8a0b2b] text-white font-bold text-xl h-16 px-14 rounded-full shadow-2xl shadow-[#b20e38]/60 hover:shadow-[#b20e38]/80 transition-all duration-300 hover:scale-110 animate-pulse-slow"
                  >
                    Register Now
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </Link>
                <Link href="/sports">
                  <Button 
                    size="sm" 
                    variant="link" 
                    data-cursor
                    data-cursor-text="VIEW"
                    className="text-white/80 hover:text-white font-medium text-base underline underline-offset-4 transition-colors"
                  >
                    View Sports
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
          >
            <div className="flex flex-col items-center gap-2 text-white/60">
              <span className="text-xs tracking-widest uppercase font-medium">Scroll to explore</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center p-1.5"
              >
                <motion.div 
                  animate={{ y: [0, 12, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-1.5 h-3 bg-white rounded-full shadow-lg" 
                />
              </motion.div>
              <ChevronDown className="w-5 h-5 opacity-60" />
            </div>
          </motion.div>
        </section>

        {/* Facts Strip - Quick Scannable Info */}
        <section className="py-8 relative overflow-hidden border-y border-white/10">
          <div className="container relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { icon: Calendar, label: 'Event Dates', value: 'February 7-8, 2026' },
                { icon: MapPin, label: 'Location', value: 'Rishihood University, Sonipat' },
                { icon: Trophy, label: 'Total Prizes', value: '₹1,50,000+' },
                { icon: Target, label: 'Sports Events', value: '8 Major Sports' },
              ].map((fact, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10"
                >
                  <fact.icon className="w-6 h-6 text-[#b20e38] mx-auto mb-2" />
                  <p className="text-white/50 text-xs uppercase tracking-wider mb-1">{fact.label}</p>
                  <p className="text-white font-semibold text-sm">{fact.value}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section - Glassmorphism */}
        <section id="stats" className="py-20 relative overflow-hidden">
          <div className="container relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { value: stats.registrations, suffix: '+', label: 'Registrations', color: 'text-white' },
                { value: stats.colleges, suffix: '+', label: 'Colleges', color: 'text-white' },
                { value: stats.sports, suffix: '', label: 'Sports Events', color: 'text-[#b20e38]' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl"
                >
                  <div className={`text-5xl md:text-7xl font-heading mb-2 ${stat.color}`}>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-white/70 text-sm md:text-base tracking-wide">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section - Modern Grid */}
        <section id="about" className="py-24 relative">
          <div className="container relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center lg:text-left"
              >
                <span className="inline-block text-white bg-[#b20e38] px-4 py-1.5 rounded-full font-medium text-sm tracking-widest mb-4 uppercase shadow-lg">
                  About The Fest
                </span>
                <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
                  COMPETE AT<br />
                  <span className="text-[#b20e38]">RISHIHOOD</span>
                </h2>
                <p className="text-white/90 text-lg leading-relaxed mb-6 backdrop-blur-sm bg-black/20 p-4 rounded-lg">
                  Two days of elite inter-university competition. Top athletes from across India. Eight sports. Championship-level facilities. Real stakes.
                </p>
                <p className="text-white/90 text-lg leading-relaxed mb-8 backdrop-blur-sm bg-black/20 p-4 rounded-lg">
                  This is where university sports champions are made. Register your team or compete solo. Prove yourself on national ground.
                </p>
                <Link href="/about">
                  <Button variant="link" className="text-white bg-[#b20e38] px-6 py-2 rounded-full text-lg font-semibold group hover:bg-white hover:text-[#b20e38] transition-all shadow-lg">
                    Learn More About Us
                    <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="grid grid-cols-2 gap-4"
              >
                {[
                  { icon: Trophy, title: 'Championship', desc: 'Elite competition' },
                  { icon: Target, title: 'Performance', desc: 'Measured results' },
                  { icon: Medal, title: 'Recognition', desc: 'Win your category' },
                  { icon: Users, title: 'Team Spirit', desc: 'Represent your college' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-md group hover:shadow-2xl transition-all duration-300 h-full hover:bg-white">
                      <CardContent className="p-6">
                        <div className="w-14 h-14 bg-[#b20e38]/10 rounded-2xl flex items-center justify-center text-[#b20e38] mb-4 group-hover:bg-[#b20e38] group-hover:text-white transition-all duration-300">
                          <item.icon className="w-7 h-7" />
                        </div>
                        <h3 className="font-heading text-2xl text-[#0e0e0e] mb-1">{item.title}</h3>
                        <p className="text-[#0e0e0e]/50 text-sm">{item.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Sports Section - Interactive Cards */}
        <section id="sports" className="py-24 relative">
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16 max-w-3xl mx-auto"
            >
              <span className="inline-block text-white bg-[#b20e38] px-4 py-1.5 rounded-full font-medium text-sm tracking-widest mb-4 uppercase shadow-lg">
                Compete & Win
              </span>
              <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl text-white mb-4" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
                CHAMPIONSHIP EVENTS
              </h2>
              <p className="text-white/90 text-lg backdrop-blur-sm bg-black/20 p-4 rounded-lg">
                8 competitive sports. ₹1,50,000 in prize money. Choose your category. Win your bracket.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {sportsData.map((sport, index) => (
                <motion.div
                  key={sport.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredSport(sport.slug)}
                  onMouseLeave={() => setHoveredSport(null)}
                >
                  <Link href={`/sports/${sport.slug}`}>
                    <Card 
                      data-cursor
                      data-cursor-text={sport.icon}
                      className={`border-none shadow-lg bg-white/95 backdrop-blur-md group cursor-pointer h-full overflow-hidden transition-all duration-500 ${
                      hoveredSport === sport.slug ? 'shadow-2xl scale-105' : 'hover:shadow-xl'
                    }`}>
                      <div className="relative h-32 overflow-hidden">
                        <Image
                          src={sport.image}
                          alt={sport.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-3 left-3 text-4xl">{sport.icon}</div>
                      </div>
                      <CardContent className="p-5">
                        <h3 className="font-heading text-2xl text-[#0e0e0e] mb-2 group-hover:text-[#b20e38] transition-colors">
                          {sport.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-[#0e0e0e]/50 mb-4">
                          <Users className="w-4 h-4" />
                          <span>{sport.isTeam ? 'Team Event' : 'Individual'}</span>
                        </div>
                        <div className="border-t border-black/5 pt-4 space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#0e0e0e]/50">1st Prize</span>
                            <span className="font-bold text-[#b20e38]">{sport.prize.first}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-[#0e0e0e]/50">2nd Prize</span>
                            <span className="font-semibold text-[#0e0e0e]">{sport.prize.second}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-14"
            >
              <Link href="/sports">
                <Button 
                  size="lg"
                  data-cursor
                  data-cursor-text="EXPLORE"
                  className="bg-[#b20e38] hover:bg-[#8a0b2b] text-white font-semibold text-lg h-14 px-12 rounded-full shadow-2xl shadow-[#b20e38]/50 hover:shadow-[#b20e38]/70 hover:scale-105 transition-all duration-300"
                >
                  View All Sports
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* CTA Section - Full Width */}
        <section id="cta" className="py-32 relative overflow-hidden">
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                className="w-20 h-20 bg-[#b20e38] rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#b20e38]/50"
              >
                <Trophy className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="font-heading text-5xl md:text-7xl lg:text-8xl text-white mb-6 leading-tight" style={{ textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}>
                REGISTER YOUR<br />
                <span className="text-[#b20e38]">TEAM NOW</span>
              </h2>
              <p className="text-white/80 text-lg md:text-xl mb-12 max-w-2xl mx-auto backdrop-blur-sm bg-black/20 p-6 rounded-lg">
                Slots are limited. Registration closes February 1st. Compete against India's top university athletes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button 
                    size="lg" 
                    data-cursor
                    data-cursor-text="JOIN"
                    className="bg-[#b20e38] hover:bg-[#ff4d6d] text-white font-semibold text-lg h-16 px-12 rounded-full shadow-2xl shadow-[#b20e38]/50 hover:shadow-[#b20e38]/70 hover:scale-105 transition-all duration-300"
                  >
                    Register Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    data-cursor
                    data-cursor-text="CHAT"
                    className="border-2 border-white/30 bg-white/10 backdrop-blur-md hover:bg-white hover:text-[#0e0e0e] text-white font-semibold text-lg h-16 px-12 rounded-full hover:scale-105 transition-all duration-300"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
