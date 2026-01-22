'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, MapPin, Users, QrCode, CreditCard, 
  Download, Edit, XCircle 
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function RegistrationDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const [registration, setRegistration] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const res = await api.get<{ registration: any }>(`/registrations/${id}`)
        setRegistration(res.registration)
      } catch (error) {
        console.error(error)
        toast.error('Failed to load registration')
        router.push('/dashboard/registrations')
      } finally {
        setLoading(false)
      }
    }
    fetchRegistration()
  }, [id, router])

  const handleCancel = async () => {
     setCancelling(true)
     try {
        await api.delete(`/registrations/${id}`)
        toast.success('Registration cancelled')
        router.push('/dashboard/registrations')
     } catch (error: any) {
        toast.error(error.message || 'Failed to cancel')
     } finally {
        setCancelling(false)
     }
  }

  if (loading) {
     return <div className="space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Card><Skeleton className="h-64" /></Card>
     </div>
  }

  if (!registration) return null

  const isPending = registration.status === 'pending' || registration.status === 'payment_pending'
  const isPaid = registration.status === 'confirmed'

  return (
    <div className="space-y-8">
       {/* Header */}
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">{registration.sport.name}</h1>
                <Badge className={
                   registration.status === 'confirmed' ? 'bg-green-500' : 
                   registration.status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'
                }>{registration.status.replace('_', ' ')}</Badge>
             </div>
             <p className="text-muted-foreground flex items-center gap-2">
                <span className="font-mono">{registration.registration_number}</span>
             </p>
          </div>
          <div className="flex gap-3">
             {isPending && (
                <Link href={`/dashboard/registrations/${id}/pay`}>
                   <Button className="bg-green-600 hover:bg-green-700">
                      <CreditCard className="mr-2 h-4 w-4" /> Pay Now
                   </Button>
                </Link>
             )}
             {isPaid && (
                 <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Receipt
                 </Button>
             )}
          </div>
       </div>

       <div className="grid md:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
             <Card>
                <CardHeader>
                   <CardTitle>Event Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                         <Calendar className="h-5 w-5 text-primary" />
                         <div>
                            <p className="text-sm text-muted-foreground">Date & Time</p>
                            <p className="font-medium">
                               {registration.sport.schedule_start ? format(new Date(registration.sport.schedule_start), 'PPP p') : 'TBA'}
                            </p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                         <MapPin className="h-5 w-5 text-primary" />
                         <div>
                            <p className="text-sm text-muted-foreground">Venue</p>
                            <p className="font-medium">{registration.sport.venue || 'TBA'}</p>
                         </div>
                      </div>
                   </div>
                </CardContent>
             </Card>

             {/* Team Details */}
             {registration.is_team && (
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                       <CardTitle>Team: {registration.team_name}</CardTitle>
                       {isPending && (
                          <Link href={`/dashboard/registrations/${id}/edit-team`}>
                             <Button variant="ghost" size="sm"><Edit className="mr-2 h-4 w-4" /> Edit Team</Button>
                          </Link>
                       )}
                    </CardHeader>
                    <CardContent>
                       <div className="space-y-2">
                          <div className="grid grid-cols-3 text-sm font-medium text-muted-foreground mb-2">
                             <span>Name</span>
                             <span>Role</span>
                             <span>Contact</span>
                          </div>
                          <Separator className="mb-2" />
                          {registration.team_members?.map((member: any, i: number) => (
                             <div key={i} className="grid grid-cols-3 text-sm py-2">
                                <span>{member.name}</span>
                                <span>{member.is_captain ? <Badge variant="outline">Captain</Badge> : 'Member'}</span>
                                <span className="text-muted-foreground">{member.phone || '-'}</span>
                             </div>
                          ))}
                       </div>
                    </CardContent>
                 </Card>
             )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
             {/* QR Code Placeholder */}
             <Card>
                <CardHeader>
                   <CardTitle className="text-center">Entry Pass</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pb-6">
                   <div className="bg-white p-4 rounded-lg border shadow-sm mb-4">
                      <QrCode className="h-32 w-32 text-black" />
                   </div>
                   <p className="text-xs text-center text-muted-foreground">
                      Show this QR code at the event entrance.<br/>
                      <span className="text-red-500 font-medium">{!isPaid ? 'Valid only after payment.' : 'Active'}</span>
                   </p>
                </CardContent>
             </Card>

             {/* Actions */}
             <Card>
                <CardHeader>
                   <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                   {isPending ? (
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="destructive" className="w-full">
                                <XCircle className="mr-2 h-4 w-4" /> Cancel Registration
                             </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                             <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                   This action cannot be undone. This will permanently cancel your registration for {registration.sport.name}.
                                </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700">Yes, Cancel Registration</AlertDialogAction>
                             </AlertDialogFooter>
                          </AlertDialogContent>
                       </AlertDialog>
                   ) : (
                      <div className="text-center text-sm text-muted-foreground">
                         No actions available.
                      </div>
                   )}
                </CardContent>
             </Card>
          </div>
       </div>
    </div>
  )
}
