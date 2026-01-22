'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface Payment {
  id: string
  amount: number
  currency: string
  status: 'success' | 'failed' | 'refunded'
  receipt_url?: string
  registration: {
     sport: { name: string }
     registration_number: string
  }
  created_at: string
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get<{ payments: Payment[] }>('/payments/me')
        setPayments(res.payments || [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])

  return (
    <div className="space-y-6">
       <div>
         <h2 className="text-3xl font-bold tracking-tight">Payment History</h2>
         <p className="text-muted-foreground">View and download receipts for your transactions.</p>
       </div>

       <Card>
          <CardHeader>
             <CardTitle>Transactions</CardTitle>
             <CardDescription>A list of all your payments.</CardDescription>
          </CardHeader>
          <CardContent>
             {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
             ) : payments.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">No payments found.</div>
             ) : (
                <Table>
                   <TableHeader>
                      <TableRow>
                         <TableHead>Date</TableHead>
                         <TableHead>Event</TableHead>
                         <TableHead>Amount</TableHead>
                         <TableHead>Status</TableHead>
                         <TableHead className="text-right">Receipt</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {payments.map((payment) => (
                         <TableRow key={payment.id}>
                            <TableCell>{format(new Date(payment.created_at), 'MMM d, yyyy')}</TableCell>
                            <TableCell>
                               <div className="font-medium">{payment.registration.sport.name}</div>
                               <div className="text-xs text-muted-foreground">{payment.registration.registration_number}</div>
                            </TableCell>
                            <TableCell>₹{payment.amount}</TableCell>
                            <TableCell>
                               <Badge variant={payment.status === 'success' ? 'default' : 'destructive'}>
                                  {payment.status}
                               </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                               {payment.receipt_url && (
                                  <Button variant="ghost" size="sm" asChild>
                                     <a href={payment.receipt_url} target="_blank" rel="noopener noreferrer">
                                        <Download className="mr-2 h-4 w-4" /> Download
                                     </a>
                                  </Button>
                               )}
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
