'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Loader2, ShieldCheck, CreditCard, Lock } from 'lucide-react'
import { toast } from 'sonner'

export default function PaymentPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [registration, setRegistration] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const res = await api.get<{ registration: any }>(`/registrations/${id}`)
        setRegistration(res.registration)
         // Redirect if already paid
        if (res.registration.status === 'confirmed') {
            toast.success('Registration already paid!')
            router.push(`/dashboard/registrations/${id}`)
        }
      } catch (error) {
        console.error(error)
        router.push('/dashboard/registrations')
      } finally {
        setLoading(false)
      }
    }
    fetchRegistration()
  }, [id, router])

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    setProcessing(true)
    
    const res = await loadRazorpay()
    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?')
      setProcessing(false)
      return
    }

    try {
      // 1. Create Order
      const order = await api.post<any>('/payments/create-order', { registration_id: id })

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "Hanumat Fest",
        description: `Registration for ${registration.sport.name}`,
        order_id: order.order_id,
        prefill: order.prefill,
        theme: {
            color: "#3399cc"
        },
        handler: async function (response: any) {
             // 2. Verify Payment
             try {
                 await api.post('/payments/verify', {
                     razorpay_order_id: response.razorpay_order_id,
                     razorpay_payment_id: response.razorpay_payment_id,
                     razorpay_signature: response.razorpay_signature
                 })
                 toast.success('Payment successful!')
                 router.push(`/dashboard/registrations/${id}`)
             } catch (verifError) {
                 console.error(verifError)
                 toast.error('Payment verification failed. Please contact support.')
             }
        }
      }

      // @ts-ignore
      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
      
      paymentObject.on('payment.failed', function (response: any){
          toast.error(response.error.description)
          setProcessing(false)
      })

    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Details fetch failed')
      setProcessing(false)
    }
  }

  if (loading) {
     return <div className="max-w-md mx-auto py-12"><Skeleton className="h-64" /></div>
  }

  if (!registration) return null

  // Calculate generic discount logic if any (just mockup for now or use real data)
  const discount = 0
  const total = registration.amount_to_pay || registration.sport.fees

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
       <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Complete Payment</h1>
          <p className="text-muted-foreground">Secure payment via Razorpay</p>
       </div>

       <Card className="border-2 border-primary/10 shadow-lg">
          <CardHeader className="bg-muted/20 pb-4">
             <CardTitle className="flex justify-between items-center text-base">
                <span>Order Summary</span>
                <span className="font-mono text-sm">{registration.registration_number}</span>
             </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Sport</span>
                <span className="font-medium">{registration.sport.name}</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Registration Fee</span>
                <span>₹{registration.sport.fees}</span>
             </div>
             {discount > 0 && (
                <div className="flex justify-between items-center text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                </div>
             )}
             <Separator />
             <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount</span>
                <span>₹{total}</span>
             </div>
          </CardContent>
          <CardFooter className="pt-2 pb-6 flex flex-col gap-4">
              <Button size="lg" className="w-full text-lg h-12" onClick={handlePayment} disabled={processing}>
                 {processing ? (
                    <>Processing...</>
                 ) : (
                    <>Pay ₹{total} Now</>
                 )}
              </Button>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                 <ShieldCheck className="h-3 w-3" />
                 <span>256-bit SSL Secured Payment</span>
              </div>
          </CardFooter>
       </Card>

       <div className="text-center">
          <Button variant="link" className="text-muted-foreground" onClick={() => router.back()}>
             Cancel and go back
          </Button>
       </div>
    </div>
  )
}
