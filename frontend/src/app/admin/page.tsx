'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface AdminStats {
  total_revenue: number
  total_registrations: number
  active_sports: number
  colleges_count: number
}

interface RecentRegistration {
  id: string
  created_at: string
  user: {
     full_name: string
     email: string
  }
  sport: {
     name: string
  }
  status: string
  amount_paid: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentRegistration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
            api.get<AdminStats>('/admin/stats'),
            api.get<{ registrations: RecentRegistration[] }>('/admin/registrations?limit=5')
        ])
        setStats(statsRes)
        setRecentActivity(activityRes.registrations || [])
      } catch (error) {
        console.error('Failed to fetch admin dashboard data', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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

       <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1 min-h-[300px]">
             <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
             <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                ) : recentActivity.length === 0 ? (
                    <p className="text-muted-foreground flex items-center justify-center h-[200px]">
                       No recent activity found.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {recentActivity.map((reg) => (
                            <div key={reg.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-medium text-sm">{reg.user?.full_name || 'Unknown User'}</p>
                                    <p className="text-xs text-muted-foreground">Registered for {reg.sport?.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-sm">₹{reg.amount_paid}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{reg.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
             </CardContent>
          </Card>
       </div>
    </div>
  )
}
