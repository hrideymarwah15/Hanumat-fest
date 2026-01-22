'use client'

import { SportForm } from '@/components/admin/sport-form'

export default function NewSportPage() {
  return (
    <div className="space-y-6">
       <div>
         <h1 className="text-3xl font-bold tracking-tight">Create New Sport</h1>
         <p className="text-muted-foreground">Add a new event to the festival.</p>
       </div>
       <SportForm />
    </div>
  )
}
