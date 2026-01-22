'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar, Footer } from '@/components/layout'
import {
  Trophy,
  Users,
  Calendar,
  ArrowRight,
  Medal,
  Activity,
  Timer
} from 'lucide-react'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'

function FeaturedSportsLoader() {
  const [sports, setSports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSports = async () => {
      try {
        const res = await api.get<{ sports: any[] }>('/sports?limit=3')
        setSports(res.sports || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchSports()
  }, [])

  if (loading) {
    return (
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[1, 2, 3].map(i => <Skeleton key={i} className="h-[300px] w-full rounded-xl" />)}
       </div>
    )
  }

  if (sports.length === 0) {
      return (
          <div className="text-center py-12 text-muted-foreground">
              <p>No sports scheduled yet.</p>
          </div>
      )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {sports.map((sport, index) => (
        <motion.div
          key={sport.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          viewport={{ once: true }}
        >
          <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-muted h-full flex flex-col">
            <div className="h-48 w-full bg-muted relative relative bg-gradient-to-br from-primary/10 to-primary/5">
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
                  {sport.category}
                </span>
              </div>
            </div>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span className="line-clamp-1">{sport.name}</span>
                <span className="text-lg font-bold text-primary whitespace-nowrap">₹{sport.fees}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{sport.is_team_event ? 'Team' : 'Individual'}</span>
                </div>
                {sport.registration_deadline && (
                    <div className="flex items-center gap-1">
                      <Timer className="h-4 w-4" />
                      <span>Ends {new Date(sport.registration_deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</span>
                    </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Link href={`/sports/${sport.slug || sport.id}`} className="w-full">
                <Button className="w-full group-hover:bg-primary/90">Register Now</Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

const stats = [
  { label: 'Total Registrations', value: '150+', icon: Users, color: 'text-blue-500' },
  { label: 'Active Sports', value: '12', icon: Trophy, color: 'text-yellow-500' },
  { label: 'Participating Colleges', value: '15', icon: Medal, color: 'text-purple-500' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          {/* Background Elements */}
          <div className="absolute inset-0 z-0 bg-background">
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
            <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          </div>

          <div className="container relative z-10 mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium shadow-sm bg-background/50 backdrop-blur-sm mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse" />
              Registration Open for 2024
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent dark:from-white dark:via-gray-400 dark:to-white"
            >
              Unleash Your <br className="hidden sm:block" />
              <span className="text-primary italic">Competitive Spirit</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              Join the ultimate university sports festival. Compete in 12+ sports,
              represent your college, and claim glory.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/sports">
                <Button size="lg" className="w-full sm:w-auto text-lg h-12 px-8 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  Explore Sports <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-12 px-8 rounded-full backdrop-blur-sm bg-background/50 hover:bg-accent/50">
                  Learn More
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="border-none shadow-none bg-transparent text-center">
                    <CardContent className="pt-6">
                      <div className={`mx-auto rounded-full p-4 w-16 h-16 flex items-center justify-center bg-background shadow-md mb-4 ${stat.color}`}>
                        <stat.icon className="h-8 w-8" />
                      </div>
                      <div className="text-4xl font-bold tracking-tight mb-2">{stat.value}</div>
                      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        {stat.label}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Sports */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-4">Featured Sports</h2>
                <p className="text-muted-foreground max-w-xl">
                  Registration closes soon for these popular events. Secure your spot now!
                </p>
              </div>
              <Link href="/sports">
                <Button variant="ghost" className="group">
                  View All Sports 
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>

            <FeaturedSportsLoader />
          </div>
        </section>


        {/* CTA Section */}
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
           <div className="container relative mx-auto px-4 text-center">
             <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Compete?</h2>
             <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto">
               Don't miss out on the biggest sports festival of the year. 
               Register now and start your journey to glory.
             </p>
             <Link href="/signup">
               <Button size="lg" variant="secondary" className="text-lg h-14 px-8 rounded-full shadow-lg">
                 Create Your Account
               </Button>
             </Link>
           </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
