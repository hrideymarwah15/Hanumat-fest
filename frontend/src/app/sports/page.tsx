'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { api } from '@/lib/api'
import { Navbar, Footer } from '@/components/layout'
import { SportCard } from '@/components/shared'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Search, Loader2, Trophy, Users, Calendar } from 'lucide-react'

// Static sports data as fallback
const staticSports = [
  { id: 1, name: 'Cricket', slug: 'cricket', is_team_event: true, team_size_min: 11, team_size_max: 15, fees: 2000, is_registration_open: true, category: 'outdoor' },
  { id: 2, name: 'Football', slug: 'football', is_team_event: true, team_size_min: 11, team_size_max: 18, fees: 2000, is_registration_open: true, category: 'outdoor' },
  { id: 3, name: 'Basketball', slug: 'basketball', is_team_event: true, team_size_min: 5, team_size_max: 12, fees: 1500, is_registration_open: true, category: 'outdoor' },
  { id: 4, name: 'Volleyball', slug: 'volleyball', is_team_event: true, team_size_min: 6, team_size_max: 12, fees: 1000, is_registration_open: true, category: 'outdoor' },
  { id: 5, name: 'Badminton', slug: 'badminton', is_team_event: false, fees: 300, is_registration_open: true, category: 'indoor' },
  { id: 6, name: 'Table Tennis', slug: 'table-tennis', is_team_event: false, fees: 300, is_registration_open: true, category: 'indoor' },
  { id: 7, name: 'Lawn Tennis', slug: 'lawn-tennis', is_team_event: false, fees: 500, is_registration_open: true, category: 'outdoor' },
  { id: 8, name: 'Chess', slug: 'chess', is_team_event: false, fees: 200, is_registration_open: true, category: 'indoor' },
]

export default function SportsPage() {
  const [sports, setSports] = useState<any[]>(staticSports)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'team' | 'individual'>('all')

  useEffect(() => {
    const fetchSports = async () => {
      setLoading(true)
      try {
        const res = await api.get<{ sports: any[] }>('/sports')
        if (res.sports && res.sports.length > 0) {
          setSports(res.sports)
        }
      } catch (error) {
        console.error('Failed to fetch sports, using static data', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSports()
  }, [])

  const filteredSports = sports.filter(sport => {
    const matchesSearch = sport.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || 
      (filter === 'team' && sport.is_team_event) || 
      (filter === 'individual' && !sport.is_team_event)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen flex flex-col bg-[#ffe5cd]">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 bg-[#0e0e0e] overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#b20e38] rounded-full blur-[150px]" />
          </div>
          
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="text-[#b20e38] font-medium text-sm tracking-wide mb-4 block">
                8 SPORTS • ₹1,50,000+ PRIZES
              </span>
              <h1 className="font-heading text-5xl md:text-7xl text-white mb-6">
                CHOOSE YOUR ARENA
              </h1>
              <p className="text-white/60 text-lg">
                From the cricket pitch to the chess board, find your game and compete for glory at Hanumant 2026.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Row */}
        <section className="py-8 bg-white border-b border-black/5">
          <div className="container">
            <div className="grid grid-cols-3 gap-8">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-[#b20e38]/10 rounded-lg flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[#b20e38]" />
                </div>
                <div>
                  <div className="font-heading text-2xl text-[#0e0e0e]">₹1.5L+</div>
                  <p className="text-xs text-[#0e0e0e]/50">Total Prizes</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-[#b20e38]/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-[#b20e38]" />
                </div>
                <div>
                  <div className="font-heading text-2xl text-[#0e0e0e]">8</div>
                  <p className="text-xs text-[#0e0e0e]/50">Sports Events</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-[#b20e38]/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[#b20e38]" />
                </div>
                <div>
                  <div className="font-heading text-2xl text-[#0e0e0e]">7-8 Feb</div>
                  <p className="text-xs text-[#0e0e0e]/50">Event Dates</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 bg-[#ffe5cd] sticky top-16 z-40">
          <div className="container">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0e0e0e]/40" />
                <Input 
                  placeholder="Search sports..." 
                  className="pl-11 h-12 bg-white border-none shadow-sm font-body"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              {/* Filter Buttons */}
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All Sports' },
                  { value: 'team', label: 'Team Events' },
                  { value: 'individual', label: 'Individual' },
                ].map((item) => (
                  <Button
                    key={item.value}
                    variant={filter === item.value ? 'default' : 'outline'}
                    onClick={() => setFilter(item.value as any)}
                    className={
                      filter === item.value
                        ? 'bg-[#b20e38] hover:bg-[#8a0b2b] text-white'
                        : 'bg-white border-none shadow-sm text-[#0e0e0e]/70 hover:text-[#0e0e0e]'
                    }
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Sports Grid */}
        <section className="py-12 bg-[#ffe5cd]">
          <div className="container">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#b20e38]" />
              </div>
            ) : filteredSports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredSports.map((sport, index) => (
                  <motion.div
                    key={sport.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SportCard sport={sport} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="py-20 text-center">
                  <Trophy className="w-12 h-12 text-[#b20e38]/30 mx-auto mb-4" />
                  <h3 className="font-heading text-2xl text-[#0e0e0e] mb-2">No Sports Found</h3>
                  <p className="text-[#0e0e0e]/60">
                    Try adjusting your search or filter criteria.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Prize Table */}
        <section className="py-20 bg-white">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-[#b20e38] font-medium text-sm tracking-wide mb-4 block">
                REWARDS
              </span>
              <h2 className="font-heading text-5xl text-[#0e0e0e]">
                PRIZE MONEY
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <div className="bg-[#0e0e0e] rounded-2xl overflow-hidden">
                <div className="grid grid-cols-3 text-sm font-medium text-white/60 p-4 border-b border-white/10">
                  <div>Sport</div>
                  <div className="text-center">1st Prize</div>
                  <div className="text-center">2nd Prize</div>
                </div>
                {[
                  { name: 'Cricket', first: '₹20,000', second: '₹10,000' },
                  { name: 'Football', first: '₹20,000', second: '₹10,000' },
                  { name: 'Basketball', first: '₹12,000', second: '₹6,000' },
                  { name: 'Volleyball', first: '₹10,000', second: '₹5,000' },
                  { name: 'Badminton', first: '₹2,500 × 2', second: '₹1,500 × 2' },
                  { name: 'Table Tennis', first: '₹5,000', second: '₹2,500' },
                  { name: 'Lawn Tennis', first: '₹5,000', second: '₹2,500' },
                  { name: 'Chess', first: '₹3,000', second: '₹1,500' },
                ].map((item, i) => (
                  <div 
                    key={item.name}
                    className={`grid grid-cols-3 p-4 ${i !== 7 ? 'border-b border-white/10' : ''}`}
                  >
                    <div className="text-white font-medium">{item.name}</div>
                    <div className="text-center text-[#b20e38] font-semibold">{item.first}</div>
                    <div className="text-center text-white/80">{item.second}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
