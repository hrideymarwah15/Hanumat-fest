'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { useAuth } from '@/providers/auth-provider'
import { Navbar, Footer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { format } from 'date-fns'
import { Sport } from '@/types'

// Sport icons mapping
const sportIcons: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  basketball: '🏀',
  volleyball: '🏐',
  badminton: '🏸',
  'table-tennis': '🏓',
  'lawn-tennis': '🎾',
  chess: '♟️',
}

// Prize data
const prizeData: Record<string, { first: string; second: string }> = {
  cricket: { first: '₹20,000', second: '₹10,000' },
  football: { first: '₹20,000', second: '₹10,000' },
  basketball: { first: '₹12,000', second: '₹6,000' },
  volleyball: { first: '₹10,000', second: '₹5,000' },
  badminton: { first: '₹2,500', second: '₹1,500' },
  'table-tennis': { first: '₹5,000', second: '₹2,500' },
  'lawn-tennis': { first: '₹5,000', second: '₹2,500' },
  chess: { first: '₹3,000', second: '₹1,500' },
}

// Sport descriptions
const sportDescriptions: Record<string, string> = {
  cricket: 'Experience the thrill of leather on willow at Hanumant Cricket Championship. Teams compete in a fast-paced T20 format with professional umpiring and match analysis.',
  football: 'The beautiful game comes alive at Hanumant. 11-a-side matches played on our full-size turf pitch with FIFA-standard rules and qualified referees.',
  basketball: 'Fast breaks, slam dunks, and court supremacy. 5v5 basketball action following FIBA rules on our professional indoor court.',
  volleyball: 'Spikes, blocks, and team coordination at its finest. Indoor volleyball tournament with 6-player teams following FIVB regulations.',
  badminton: 'Singles and doubles categories with professional shuttlecocks and BWF-standard courts. Show your agility and precision.',
  'table-tennis': 'Lightning-fast reflexes meet strategic gameplay. Singles tournament with ITTF-approved equipment and rules.',
  'lawn-tennis': 'Serve, volley, and ace your way to victory on our well-maintained grass courts. Singles format with ATP/WTA rules.',
  chess: 'The ultimate battle of minds. FIDE-rated tournament with standard time controls and professional arbiters.',
}

// Default rules
const defaultRules = [
  'All participants must carry valid college ID',
  'Teams must report 30 minutes before scheduled match time',
  'Decision of referees/umpires will be final',
  'Unsportsmanlike conduct will result in immediate disqualification',
  'Equipment will be provided by organizers',
  'Specific sport rules will follow respective federation guidelines',
]

export default function SportDetailsPage() {
  const { slug } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [sport, setSport] = useState<Sport | null>(null)
  const [loading, setLoading] = useState(true)

  const slugStr = Array.isArray(slug) ? slug[0] : slug ?? ''
  const icon = sportIcons[slugStr] ?? '🏆'
  const prizes = prizeData[slugStr] ?? { first: 'TBA', second: 'TBA' }
  const description = sportDescriptions[slugStr] ?? 'Join us for this exciting sport at Hanumant 2026!'

  useEffect(() => {
    if (!slugStr) return
    
    const fetchSport = async () => {
      try {
        const res = await api.get<{ sport: Sport }>(`/sports/${slugStr}`)
        setSport(res.sport)
      } catch (error) {
        console.error('Failed to fetch sport details', error)
        // Use fallback data
        setSport({
          id: slugStr,
          name: slugStr.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          slug: slugStr,
          is_team_event: ['cricket', 'football', 'basketball', 'volleyball'].includes(slugStr),
          is_registration_open: true,
          fees: 500,
        } as Sport)
      } finally {
        setLoading(false)
      }
    }
    fetchSport()
  }, [slugStr])

  const handleRegister = () => {
    if (!user) {
      router.push(`/signup?redirect=/sports/${slugStr}`)
    } else {
      router.push(`/dashboard/registrations/new?sport=${slugStr}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#ffe5cd]">
        <Navbar />
        <main className="flex-1">
          <div className="bg-[#0e0e0e] py-20">
            <div className="container">
              <Skeleton className="h-12 w-64 bg-white/10 mb-4" />
              <Skeleton className="h-6 w-96 bg-white/10" />
            </div>
          </div>
          <div className="container py-12">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-48 w-full bg-white" />
                <Skeleton className="h-32 w-full bg-white" />
              </div>
              <Skeleton className="h-96 w-full bg-white" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!sport) {
    return (
      <div className="min-h-screen flex flex-col bg-[#ffe5cd]">
        <Navbar />
        <main className="container py-20 text-center">
          <h1 className="font-heading text-4xl text-[#0e0e0e] mb-4">Sport Not Found</h1>
          <p className="text-[#0e0e0e]/60 mb-8">The sport you're looking for doesn't exist.</p>
          <Link href="/sports">
            <Button className="bg-[#b20e38] hover:bg-[#8a0b2b]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sports
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#ffe5cd]">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Header */}
        <section className="relative bg-[#0e0e0e] py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#b20e38] rounded-full blur-[150px]" />
          </div>
          
          <div className="container relative z-10">
            <Link href="/sports" className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sports
            </Link>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-end gap-6"
            >
              <div className="text-8xl md:text-9xl">{icon}</div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  {sport.is_registration_open !== false && (
                    <span className="text-xs font-medium px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
                      Registration Open
                    </span>
                  )}
                  <span className="text-xs font-medium px-3 py-1 bg-white/10 text-white/60 rounded-full">
                    {sport.is_team_event ? 'Team Event' : 'Individual'}
                  </span>
                </div>
                <h1 className="font-heading text-5xl md:text-7xl text-white mb-2">{sport.name}</h1>
                <div className="flex flex-wrap gap-6 text-white/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#b20e38]" />
                    <span>7-8 February 2026</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#b20e38]" />
                    <span>{sport.venue || 'Rishihood University'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-none shadow-md bg-white">
                    <CardContent className="p-8">
                      <h2 className="font-heading text-3xl text-[#0e0e0e] mb-4">ABOUT</h2>
                      <p className="text-[#0e0e0e]/70 text-lg leading-relaxed">
                        {sport.description || description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Details Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="grid sm:grid-cols-2 gap-4"
                >
                  <Card className="border-none shadow-md bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-[#b20e38]/10 rounded-lg flex items-center justify-center">
                          <Users className="w-5 h-5 text-[#b20e38]" />
                        </div>
                        <span className="text-[#0e0e0e]/60">Format</span>
                      </div>
                      <div className="font-heading text-2xl text-[#0e0e0e]">
                        {sport.is_team_event 
                          ? `Team (${sport.team_size_min || 5}-${sport.team_size_max || 15} players)`
                          : 'Individual'}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-none shadow-md bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-[#b20e38]/10 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-[#b20e38]" />
                        </div>
                        <span className="text-[#0e0e0e]/60">Registration Deadline</span>
                      </div>
                      <div className="font-heading text-2xl text-[#0e0e0e]">
                        {sport.registration_deadline 
                          ? format(new Date(sport.registration_deadline), 'MMM d, yyyy')
                          : 'Feb 5, 2026'}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Rules */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-none shadow-md bg-white">
                    <CardContent className="p-8">
                      <h2 className="font-heading text-3xl text-[#0e0e0e] mb-6">RULES & REGULATIONS</h2>
                      <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="general" className="border-black/5">
                          <AccordionTrigger className="text-[#0e0e0e] font-semibold hover:no-underline">
                            General Rules
                          </AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-3">
                              {defaultRules.map((rule, i) => (
                                <li key={i} className="flex items-start gap-3 text-[#0e0e0e]/70">
                                  <CheckCircle2 className="w-5 h-5 text-[#b20e38] shrink-0 mt-0.5" />
                                  <span>{rule}</span>
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="specific" className="border-black/5">
                          <AccordionTrigger className="text-[#0e0e0e] font-semibold hover:no-underline">
                            Sport-Specific Rules
                          </AccordionTrigger>
                          <AccordionContent>
                            <p className="text-[#0e0e0e]/70">
                              {sport.rules || `Standard ${sport.name} rules as per the respective national/international federation will apply. Detailed rules will be shared with registered participants.`}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Registration Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="border-none shadow-lg bg-[#0e0e0e] text-white sticky top-24">
                    <CardContent className="p-8">
                      <h3 className="font-heading text-2xl mb-6">REGISTRATION</h3>
                      
                      <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                          <span className="text-white/60">Entry Fee</span>
                          <span className="font-heading text-3xl text-[#b20e38]">
                            ₹{sport.fees || 500}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center pb-4 border-b border-white/10">
                          <span className="text-white/60">Format</span>
                          <span className="font-medium">
                            {sport.is_team_event ? 'Team' : 'Individual'}
                          </span>
                        </div>
                        
                        {sport.is_team_event && (
                          <div className="flex justify-between items-center pb-4 border-b border-white/10">
                            <span className="text-white/60">Team Size</span>
                            <span className="font-medium">
                              {sport.team_size_min || 5}-{sport.team_size_max || 15} players
                            </span>
                          </div>
                        )}
                      </div>

                      <Button 
                        className="w-full h-14 text-lg bg-[#b20e38] hover:bg-[#8a0b2b] font-semibold"
                        onClick={handleRegister}
                        disabled={sport.is_registration_open === false}
                      >
                        {sport.is_registration_open === false 
                          ? 'Registration Closed' 
                          : user ? 'Register Now' : 'Sign Up to Register'}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                      
                      {!user && (
                        <p className="text-xs text-center text-white/40 mt-4">
                          Already have an account?{' '}
                          <Link href="/login" className="text-[#b20e38] hover:underline">
                            Login
                          </Link>
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Prize Money Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="border-none shadow-md bg-white">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <Trophy className="w-6 h-6 text-[#b20e38]" />
                        <h3 className="font-heading text-2xl text-[#0e0e0e]">PRIZES</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-[#ffe5cd] rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🥇</span>
                            <span className="font-medium text-[#0e0e0e]">1st Place</span>
                          </div>
                          <span className="font-heading text-2xl text-[#b20e38]">{prizes.first}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🥈</span>
                            <span className="font-medium text-[#0e0e0e]">2nd Place</span>
                          </div>
                          <span className="font-heading text-2xl text-[#0e0e0e]">{prizes.second}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
