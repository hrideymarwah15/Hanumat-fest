'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, CheckCircle, Info, Ticket, CreditCard, XCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  message: string
  type: 'registration' | 'payment' | 'announcement' | 'reminder' | 'cancellation'
  is_read: boolean
  created_at: string
}

const iconMap = {
  registration: Ticket,
  payment: CreditCard,
  announcement: Info,
  reminder: Bell,
  cancellation: XCircle,
}

const colorMap = {
  registration: 'text-blue-500 bg-blue-50',
  payment: 'text-green-500 bg-green-50',
  announcement: 'text-purple-500 bg-purple-50',
  reminder: 'text-orange-500 bg-orange-50',
  cancellation: 'text-red-500 bg-red-50',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = async () => {
    try {
      const res = await api.get<{ notifications: Notification[] }>('/notifications')
      setNotifications(res.notifications || [])
    } catch (error) {
      console.error(error)
    } finally {
       setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await api.post('/notifications/mark-read', { notification_ids: [id] })
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    } catch (error) {
       console.error(error)
    }
  }

  const markAllRead = async () => {
     try {
       await api.post('/notifications/mark-read', {})
       setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
       toast.success('All marked as read')
     } catch (error) {
        toast.error('Failed to mark all as read')
     }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
         <div>
           <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
           <p className="text-muted-foreground">Updates on your registrations and payments.</p>
         </div>
         {notifications.some(n => !n.is_read) && (
            <Button variant="outline" onClick={markAllRead}>Mark all as read</Button>
         )}
      </div>

      <Card className="min-h-[500px]">
         <CardContent className="p-0">
            <ScrollArea className="h-[600px]">
               {loading ? (
                  <div className="p-8 text-center text-muted-foreground">Loading notifications...</div>
               ) : notifications.length === 0 ? (
                  <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                     <Bell className="h-12 w-12 mb-4 opacity-20" />
                     <p>No notifications yet.</p>
                  </div>
               ) : (
                  <div className="divide-y">
                     {notifications.map((notification) => {
                        const Icon = iconMap[notification.type] || Info
                        const colors = colorMap[notification.type] || 'text-gray-500 bg-gray-50'

                        return (
                           <div 
                              key={notification.id} 
                              className={`flex gap-4 p-4 hover:bg-muted/50 transition-colors ${!notification.is_read ? 'bg-muted/20' : ''}`}
                              onClick={() => !notification.is_read && markAsRead(notification.id)}
                           >
                              <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${colors}`}>
                                 <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 space-y-1">
                                 <div className="flex justify-between items-start">
                                    <h4 className={`text-sm font-semibold ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                       {notification.title}
                                    </h4>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                       {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                    </span>
                                 </div>
                                 <p className="text-sm text-muted-foreground leading-relaxed">
                                    {notification.message}
                                 </p>
                                 {!notification.is_read && (
                                     <button onClick={(e) => { e.stopPropagation(); markAsRead(notification.id) }} className="text-xs text-primary hover:underline mt-1">
                                        Mark as read
                                     </button>
                                 )}
                              </div>
                              {!notification.is_read && (
                                 <div className="shrink-0 self-center">
                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                 </div>
                              )}
                           </div>
                        )
                     })}
                  </div>
               )}
            </ScrollArea>
         </CardContent>
      </Card>
    </div>
  )
}
