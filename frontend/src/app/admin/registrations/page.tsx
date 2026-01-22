'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Download, Loader2, CheckCircle, XCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from 'date-fns'
import { toast } from 'sonner'


import { Registration } from '@/types'

// Simple CSV export helper
const downloadCSV = (data: any[], filename: string) => {
    const headers = Object.keys(data[0] || {}).join(',')
    const rows = data.map(row => Object.values(row).map(v => `"${v}"`).join(',')).join('\n')
    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [loading, setLoading] = useState(true)
  const [filterSport, setFilterSport] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const fetchRegistrations = async () => {
    try {
      const res = await api.get<{ registrations: Registration[] }>('/admin/registrations') 
      setRegistrations(res.registrations || [])
    } catch (error) {
       console.error(error)
       toast.error('Failed to load registrations')
    } finally {
       setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistrations()
  }, [])

  const handleStatusUpdate = async (id: string, newStatus: Registration['status']) => {
      try {
          await api.patch(`/admin/registrations/${id}`, { status: newStatus })
          toast.success(`Status updated to ${newStatus}`)
          
          setRegistrations(prev => prev.map(reg => 
              reg.id === id ? { ...reg, status: newStatus } : reg
          ))
      } catch (error: any) {
          toast.error(error.message || 'Failed to update')
      }
  }
  
  const filteredRegs = registrations.filter((reg) => {
      if (filterSport !== 'all' && reg.sport_id !== filterSport) return false
      if (filterStatus !== 'all' && reg.status !== filterStatus) return false
      return true
  })

  // Derive sports list for filter
  const sportsList = Array.from(new Set(registrations.map(r => r.sport?.name))).filter(Boolean)

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h1 className="text-3xl font-bold tracking-tight">Registrations</h1>
             <p className="text-muted-foreground">Manage participant registrations.</p>
          </div>
          <Button variant="outline" onClick={() => downloadCSV(filteredRegs.map(r => ({
             id: r.id, 
             sport: r.sport?.name, 
             name: r.user?.full_name || r.team_name,
             status: r.status,
             amount: r.amount_paid,
             date: r.created_at
          })), 'registrations.csv')}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
       </div>

       <div className="flex gap-4 mb-4">
           <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                 <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">All Status</SelectItem>
                 <SelectItem value="pending">Pending</SelectItem>
                 <SelectItem value="confirmed">Confirmed</SelectItem>
                 <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
           </Select>
           {/* Add Sport Filter if needed */}
       </div>

       <Card>
          <CardContent className="p-0">
             {loading ? (
                 <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
             ) : (
                <Table>
                   <TableHeader>
                      <TableRow>
                         <TableHead>Registration #</TableHead>
                         <TableHead>Sport</TableHead>
                         <TableHead>Participant / Team</TableHead>
                         <TableHead>College</TableHead>
                         <TableHead>Date</TableHead>
                         <TableHead>Status</TableHead>
                         <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {filteredRegs.map((reg) => (
                         <TableRow key={reg.id}>
                            <TableCell className="font-mono text-xs">{reg.registration_number}</TableCell>
                            <TableCell>{reg.sport?.name}</TableCell>
                            <TableCell>
                               <div className="font-medium">{reg.team_name || reg.user?.user_metadata?.name || 'N/A'}</div>
                               {reg.is_team_event && <div className="text-xs text-muted-foreground">Team Event</div>}
                            </TableCell>
                            <TableCell>{reg.user?.user_metadata?.college || '-'}</TableCell>
                            <TableCell>{format(new Date(reg.created_at), 'MMM d')}</TableCell>
                            <TableCell>
                               <Badge variant={
                                   reg.status === 'confirmed' ? 'default' : 
                                   reg.status === 'cancelled' ? 'destructive' : 'secondary'
                               }>
                                  {reg.status}
                               </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                     <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                     </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                     <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                     <DropdownMenuItem onClick={() => handleStatusUpdate(reg.id, 'confirmed')}>
                                        <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Mark Confirmed
                                     </DropdownMenuItem>
                                     <DropdownMenuItem onClick={() => handleStatusUpdate(reg.id, 'cancelled')}>
                                        <XCircle className="mr-2 h-4 w-4 text-red-600" /> Cancel
                                     </DropdownMenuItem>
                                     <DropdownMenuSeparator />
                                     <DropdownMenuItem>View Details</DropdownMenuItem>
                                  </DropdownMenuContent>
                               </DropdownMenu>
                            </TableCell>
                         </TableRow>
                      ))}
                   </TableBody>
                </Table>
             )}
          </CardContent>
       </Card>
    </div>
  )
}
