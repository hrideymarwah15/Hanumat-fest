'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { format } from 'date-fns'

export default function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRegs = async () => {
      try {
        const res = await api.get<{ registrations: any[] }>('/registrations/me')
        setRegistrations(res.registrations || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchRegs()
  }, [])

  if (loading) {
     return <div className="space-y-4">
        {[1,2,3].map(i => <Skeleton key={i} className="h-32 w-full" />)}
     </div>
  }

  return (
    <div className="space-y-6">
       <div>
         <h2 className="text-3xl font-bold tracking-tight">My Registrations</h2>
         <p className="text-muted-foreground">Manage your event registrations.</p>
       </div>

       {registrations.length === 0 ? (
          <Card>
             <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-lg text-muted-foreground mb-4">You haven't registered for any sports yet.</p>
                <Link href="/sports">
                   <Button>Browse Sports</Button>
                </Link>
             </CardContent>
          </Card>
       ) : (
          <div className="grid gap-4">
             {registrations.map((reg) => (
                <Card key={reg.id} className="flex flex-col md:flex-row items-start md:items-center p-6 gap-4">
                   <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                         <h3 className="font-semibold text-lg">{reg.sport?.name}</h3>
                         <Badge variant={
                           reg.status === 'confirmed' ? 'default' :
                           reg.status === 'pending' || reg.status === 'payment_pending' ? 'secondary' :
                           'destructive'
                         }>{reg.status.replace('_', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Reg #: {reg.registration_number}</p>
                      <p className="text-sm text-muted-foreground">Date: {format(new Date(reg.registered_at), 'PPP')}</p>
                   </div>
                   <div className="flex items-center gap-2">
                      <Link href={`/dashboard/registrations/${reg.id}`}>
                         <Button variant="outline">Details</Button>
                      </Link>
                      {['pending', 'payment_pending'].includes(reg.status) && (
                         <Link href={`/dashboard/registrations/${reg.id}/pay`}>
                            <Button>Pay Now</Button>
                         </Link>
                      )}
                   </div>
                </Card>
             ))}
          </div>
       )}
    </div>
  )
}
