'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get<any>('/admin/stats')
        setStats(res)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
       <h1 className="text-3xl font-bold">Dashboard</h1>
       
       <div className="grid gap-4 md:grid-cols-4">
          <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Revenue</CardTitle></CardHeader>
             <CardContent>
                 {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">₹{stats?.total_revenue || 0}</div>}
             </CardContent>
          </Card>
          <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Registrations</CardTitle></CardHeader>
             <CardContent>
                 {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats?.total_registrations || 0}</div>}
             </CardContent>
          </Card>
          <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Active Sports</CardTitle></CardHeader>
             <CardContent>
                 {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats?.active_sports || 0}</div>}
             </CardContent>
          </Card>
          <Card>
             <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Colleges</CardTitle></CardHeader>
             <CardContent>
                 {loading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{stats?.colleges_count || 0}</div>}
             </CardContent>
          </Card>
       </div>

       {/* Charts & Lists placeholder */}
       <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1 min-h-[300px]">
             <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
             <CardContent>
                <p className="text-muted-foreground flex items-center justify-center h-[200px]">
                   Analytics charts will appear here once enough data is collected.
                </p>
             </CardContent>
          </Card>
       </div>
    </div>
  )
}
