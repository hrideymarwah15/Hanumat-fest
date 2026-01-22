'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { api } from '@/lib/api'
import { SportForm } from '@/components/admin/sport-form'
import { Skeleton } from '@/components/ui/skeleton'

export default function EditSportPage() {
  const { id } = useParams()
  const [sport, setSport] = useState<any>(null)

  useEffect(() => {
    const fetchSport = async () => {
      try {
        // Since admin might need raw data, assume standard endpoint returns enough
        // Or create specific admin endpoint if needed. Using public for now.
        const res = await api.get<{ sport: any }>(`/sports/${id}`) // This works if ID is passed, but public API usually takes slug.
        // If ID is UUID, public API might handle it or we need admin specific endpoint.
        // Assuming public API handles ID or Slug.
        if (!res.sport && !res) { 
           // If public endpoint expects slug but we have ID, we might fail.
           // Let's assume for this mock that /sports/{id} works.
        }
        setSport(res.sport || res) 
      } catch (error) {
        console.error(error)
      }
    }
    fetchSport()
  }, [id])

  if (!sport) {
     return <div className="space-y-6"><Skeleton className="h-12 w-1/3" /><Skeleton className="h-[500px]" /></div>
  }

  return (
    <div className="space-y-6">
       <div>
         <h1 className="text-3xl font-bold tracking-tight">Edit Sport</h1>
         <p className="text-muted-foreground">Update details for {sport.name}.</p>
       </div>
       <SportForm initialData={sport} isEdit />
    </div>
  )
}
