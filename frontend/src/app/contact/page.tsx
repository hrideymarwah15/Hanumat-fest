'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Navbar, Footer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Mail, Phone, MapPin, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [contactInfo, setContactInfo] = useState({
    email: 'support@hanumatfest.com',
    phone: '+91 98765 43210',
    address: 'University Sports Complex, New Delhi'
  })

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            // Attempt to fetch public settings or admin settings if accessible
            const res = await api.get<any>('/admin/settings')
            if (res) {
                setContactInfo({
                    email: res.contact_email || 'support@hanumatfest.com',
                    phone: res.contact_phone || '+91 98765 43210',
                    address: 'University Sports Complex, New Delhi'
                })
            }
        } catch (error) {
            console.error('Failed to fetch contact settings', error)
        }
    }
    fetchSettings()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Create form data object
    const formData = new FormData(e.target as HTMLFormElement)
    const data = Object.fromEntries(formData.entries())

    try {
        await api.post('/contact', data)
        toast.success('Message sent successfully! We will get back to you soon.')
        ;(e.target as HTMLFormElement).reset()
    } catch (error) {
        console.error('Contact form failed', error)
        // Fallback or user notification
        toast.error('Failed to send message. Please email us directly at ' + contactInfo.email)
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-muted py-12 md:py-20 text-center">
           <div className="container">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Get in Touch</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Have questions about the Sports Fest? We're here to help.
              </p>
           </div>
        </section>

        <div className="container py-12 grid md:grid-cols-2 gap-12">
           {/* Contact Info & FAQ */}
           <div className="space-y-8">
              <section>
                 <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                 <div className="grid gap-6">
                    <Card>
                       <CardContent className="flex items-center gap-4 p-6">
                          <div className="bg-primary/10 p-3 rounded-full text-primary">
                             <Mail className="h-6 w-6" />
                          </div>
                          <div>
                             <h3 className="font-semibold">Email Us</h3>
                             <p className="text-muted-foreground">{contactInfo.email}</p>
                          </div>
                       </CardContent>
                    </Card>
                    <Card>
                       <CardContent className="flex items-center gap-4 p-6">
                          <div className="bg-primary/10 p-3 rounded-full text-primary">
                             <Phone className="h-6 w-6" />
                          </div>
                          <div>
                             <h3 className="font-semibold">Call Us</h3>
                             <p className="text-muted-foreground">{contactInfo.phone}</p>
                          </div>
                       </CardContent>
                    </Card>
                    <Card>
                       <CardContent className="flex items-center gap-4 p-6">
                          <div className="bg-primary/10 p-3 rounded-full text-primary">
                             <MapPin className="h-6 w-6" />
                          </div>
                          <div>
                             <h3 className="font-semibold">Visit Us</h3>
                             <p className="text-muted-foreground">{contactInfo.address}</p>
                          </div>
                       </CardContent>
                    </Card>
                 </div>
              </section>

              <section>
                 <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
                 <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                       <AccordionTrigger>Who can participate?</AccordionTrigger>
                       <AccordionContent>
                          Registration is open to all university students with a valid ID card.
                       </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                       <AccordionTrigger>Is there an entry fee?</AccordionTrigger>
                       <AccordionContent>
                          Yes, entry fees vary by sport. Check the specific sport details for pricing.
                       </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                       <AccordionTrigger>How do I register a team?</AccordionTrigger>
                       <AccordionContent>
                          The team captain should register and create the team. Members can be added afterwards.
                       </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-4">
                       <AccordionTrigger>What is the refund policy?</AccordionTrigger>
                       <AccordionContent>
                          Registration fees are non-refundable unless the event is cancelled by the organizers.
                       </AccordionContent>
                    </AccordionItem>
                 </Accordion>
              </section>
           </div>

           {/* Contact Form */}
           <div>
              <Card className="h-full">
                 <CardHeader>
                    <CardTitle>Send us a Message</CardTitle>
                    <CardDescription>Fill out the form below and we'll respond within 24 hours.</CardDescription>
                 </CardHeader>
                 <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-sm font-medium">First Name</label>
                             <Input placeholder="John" required />
                          </div>
                          <div className="space-y-2">
                             <label className="text-sm font-medium">Last Name</label>
                             <Input placeholder="Doe" required />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-sm font-medium">Email</label>
                          <Input type="email" placeholder="john@example.com" required />
                       </div>
                       <div className="space-y-2">
                          <label className="text-sm font-medium">Subject</label>
                          <Input placeholder="Registration Inquiry" required />
                       </div>
                       <div className="space-y-2">
                          <label className="text-sm font-medium">Message</label>
                          <Textarea placeholder="How can we help you?" className="min-h-[150px]" required />
                       </div>
                       <Button type="submit" className="w-full" disabled={loading}>
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Send Message
                       </Button>
                    </form>
                 </CardContent>
              </Card>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
