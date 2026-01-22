'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Loader2, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner'

import { Sport } from '@/types'

export default function AdminSportsPage() {
  const [sports, setSports] = useState<Sport[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSports = async () => {
    try {
      const res = await api.get<{ sports: Sport[] }>('/sports')
      setSports(res.sports || [])
    } catch (error) {
       console.error(error)
    } finally {
       setLoading(false)
    }
  }

  useEffect(() => {
    fetchSports()
  }, [])

  const handleDelete = async (id: string) => {
     if (!confirm('Are you sure you want to delete this sport?')) return
     try {
         await api.delete(`/admin/sports/${id}`)
         toast.success('Sport deleted')
         fetchSports()
     } catch (error: any) {
         toast.error(error.message || 'Failed to delete')
     }
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
             <h1 className="text-3xl font-bold tracking-tight">Sports Management</h1>
             <p className="text-muted-foreground">Manage events, fees, and rules.</p>
          </div>
          <Link href="/admin/sports/new">
             <Button><Plus className="mr-2 h-4 w-4" /> Add New Sport</Button>
          </Link>
       </div>

       <Card>
          <CardContent className="p-0">
             {loading ? (
                 <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>
             ) : (
                <Table>
                   <TableHeader>
                      <TableRow>
                         <TableHead>Sport Name</TableHead>
                         <TableHead>Category</TableHead>
                         <TableHead>Type</TableHead>
                         <TableHead>Fees</TableHead>
                         <TableHead>Status</TableHead>
                         <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {sports.map((sport) => (
                         <TableRow key={sport.id}>
                            <TableCell className="font-medium">{sport.name}</TableCell>
                            <TableCell>
                               <Badge variant="outline">{sport.category}</Badge>
                            </TableCell>
                            <TableCell>{sport.is_team_event ? `Team (${sport.team_size_min}-${sport.team_size_max})` : 'Individual'}</TableCell>
                            <TableCell>₹{sport.fees}</TableCell>
                            <TableCell>
                               {sport.is_registration_open ? (
                                  <Badge className="bg-green-500">Open</Badge>
                               ) : (
                                  <Badge variant="secondary">Closed</Badge>
                               )}
                            </TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                     <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreHorizontal className="h-4 w-4" />
                                     </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                     <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                     <Link href={`/admin/sports/${sport.id}`}>
                                        <DropdownMenuItem><Pencil className="mr-2 h-4 w-4" /> Edit Details</DropdownMenuItem>
                                     </Link>
                                     <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(sport.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                     </DropdownMenuItem>
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
