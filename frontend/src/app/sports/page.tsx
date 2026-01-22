'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Navbar, Footer } from '@/components/layout'
import { SportCard } from '@/components/shared'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Loader2 } from 'lucide-react'
export default function SportsPage() {
  const [sports, setSports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')

  useEffect(() => {
    const fetchSports = async () => {
      setLoading(true)
      try {
        const params: any = { is_open: true } // Default to open? Or all? Let's show all.
        if (category !== 'all') params.category = category
        if (search) params.search = search

        const res = await api.get<{ sports: any[] }>('/sports', { params })
        setSports(res.sports || [])
      } catch (error) {
        console.error('Failed to fetch sports', error)
        // Fallback or empty state
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchSports, 300) // Debounce
    return () => clearTimeout(timer)
  }, [search, category])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="container py-8 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Explore Sports</h1>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search sports..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8" onValueChange={setCategory}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
            <TabsTrigger value="all">All Sports</TabsTrigger>
            <TabsTrigger value="indoor">Indoor</TabsTrigger>
            <TabsTrigger value="outdoor">Outdoor</TabsTrigger>
            <TabsTrigger value="esports">Esports</TabsTrigger>
            <TabsTrigger value="athletics">Athletics</TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sports.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
             {sports.map((sport) => (
                <SportCard key={sport.id} sport={sport} />
             ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            No sports found. Try adjusting your search or category.
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
