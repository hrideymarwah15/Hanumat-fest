'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Ticket, CreditCard, Clock, CheckCircle } from 'lucide-react'
import { api } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get<any>('/auth/profile')
        setStats(res)
      } catch (error) {
        console.error('Failed to fetch stats', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) {
     return <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-3 gap-4">
           <Skeleton className="h-24 w-full" />
           <Skeleton className="h-24 w-full" />
           <Skeleton className="h-24 w-full" />
        </div>
     </div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, {user?.user_metadata?.name}!</h2>
        <p className="text-muted-foreground">Here&apos;s an overview of your sports festival activities.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.registrations_count || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* Logic for specific pending count if available, otherwise just placeholder or derived */}
            <div className="text-2xl font-bold text-yellow-600">{stats?.pending_payments_count || 0}</div> 
          </CardContent>
        </Card>
         {/* More stats if available */}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
         <Card className="col-span-4">
            <CardHeader>
               <CardTitle>Recent Registrations</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="text-sm text-muted-foreground text-center py-8">
                  {stats?.registrations_count > 0 ? (
                      <Link href="/dashboard/registrations"><Button variant="link">View All Registrations</Button></Link>
                  ) : (
                      <div>
                        No registrations yet.
                        <div className="mt-4">
                            <Link href="/sports"><Button>Browse Sports</Button></Link>
                        </div>
                      </div>
                  )}
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  )
}
