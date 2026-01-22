'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Navbar, Footer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Calendar, MapPin, Users, Info, DollarSign, Clock } from 'lucide-react'
import { format } from 'date-fns'

import { Sport } from '@/types'

export default function SportDetailsPage() {
  const { slug } = useParams()
  const [sport, setSport] = useState<Sport | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSport = async () => {
      try {
        const res = await api.get<{ sport: Sport }>(`/sports/${slug}`)
        setSport(res.sport)
      } catch (error) {
        console.error('Failed to fetch sport details', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSport()
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container py-8 flex-1">
           <Skeleton className="h-64 w-full rounded-xl mb-8" />
           <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                 <Skeleton className="h-10 w-3/4" />
                 <Skeleton className="h-32 w-full" />
              </div>
              <div><Skeleton className="h-64 w-full" /></div>
           </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!sport) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Sport Not Found</h1>
          <Link href="/sports"><Button>Back to Sports</Button></Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
         {/* Hero Header */}
        <div className="relative bg-muted py-12 md:py-20">
           <div className="container relative z-10">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="text-sm px-3 py-1">{sport.category}</Badge>
                  {sport.is_registration_open && <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">Registration Open</Badge>}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">{sport.name}</h1>
                <div className="flex flex-wrap gap-6 text-muted-foreground">
                   <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      <span>{sport.schedule_start ? format(new Date(sport.schedule_start), 'MMMM d, yyyy') : 'Date TBA'}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      <span>{sport.venue || 'Venue TBA'}</span>
                   </div>
                </div>
              </div>
           </div>
           {/* Background Pattern */}
           <div className="absolute inset-0 bg-grid-black/[0.05] -z-0" />
        </div>

        <div className="container py-12 grid md:grid-cols-3 gap-8">
           {/* Main Content */}
           <div className="md:col-span-2 space-y-8">
              <section>
                 <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <Info className="h-6 w-6 text-primary" /> About
                 </h2>
                 <div className="prose max-w-none text-muted-foreground">
                    <p>{sport.description || 'No description available.'}</p>
                 </div>
              </section>

              <section>
                 <h2 className="text-2xl font-bold mb-4">Rules & Regulations</h2>
                 <div className="prose max-w-none p-6 bg-muted/30 rounded-lg border">
                    <p className="whitespace-pre-line">{sport.rules || 'Standard rules apply.'}</p>
                 </div>
              </section>
           </div>

           {/* Sidebar Info */}
           <div className="space-y-6">
              <Card>
                 <CardHeader>
                    <CardTitle>Registration Details</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b">
                       <span className="text-muted-foreground flex items-center gap-2">
                          <DollarSign className="h-4 w-4" /> Entry Fee
                       </span>
                       <span className="font-bold text-lg">₹{sport.fees}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                       <span className="text-muted-foreground flex items-center gap-2">
                          <Users className="h-4 w-4" /> Format
                       </span>
                       <span>{sport.is_team_event ? `Team (${sport.team_size_min}-${sport.team_size_max})` : 'Individual'}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                       <span className="text-muted-foreground flex items-center gap-2">
                          <Clock className="h-4 w-4" /> Reg. Deadline
                       </span>
                       <span className="text-sm">{sport.registration_deadline ? format(new Date(sport.registration_deadline), 'MMM d') : '-'}</span>
                    </div>

                    <div className="pt-4">
                       <Link href={`/sports/${slug}/register`}>
                         <Button className="w-full h-12 text-lg" disabled={!sport.is_registration_open}>
                           {sport.is_registration_open ? 'Register Now' : 'Registration Closed'}
                         </Button>
                       </Link>
                       <p className="text-xs text-center text-muted-foreground mt-2">
                          {sport.spots_remaining ? `${sport.spots_remaining} spots remaining` : 'Limited spots available'}
                       </p>
                    </div>
                 </CardContent>
              </Card>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
