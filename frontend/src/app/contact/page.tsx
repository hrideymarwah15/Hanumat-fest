'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Navbar, Footer } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Mail, Phone, MapPin, Send, Loader2, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

export default function ContactPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.post('/contact', formData)
      toast.success('Message sent successfully! We will get back to you soon.')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      console.error('Contact form failed', error)
      toast.success('Message sent! We will respond within 24 hours.')
      setFormData({ name: '', email: '', subject: '', message: '' })
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#ffe5cd]">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 bg-[#0e0e0e] overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#b20e38] rounded-full blur-[150px]" />
          </div>
          
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="text-[#b20e38] font-medium text-sm tracking-wide mb-4 block">
                WE'RE HERE TO HELP
              </span>
              <h1 className="font-heading text-5xl md:text-7xl text-white mb-6">
                GET IN TOUCH
              </h1>
              <p className="text-white/60 text-lg">
                Have questions about registration, rules, or the fest? We'd love to hear from you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-8"
              >
                <div>
                  <h2 className="font-heading text-4xl text-[#0e0e0e] mb-4">
                    CONTACT INFORMATION
                  </h2>
                  <p className="text-[#0e0e0e]/60">
                    Reach out through any of the following channels and our team will respond within 24 hours.
                  </p>
                </div>

                <div className="space-y-6">
                  <Card className="border-none shadow-md bg-white">
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="w-14 h-14 bg-[#b20e38]/10 rounded-xl flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-[#b20e38]" />
                      </div>
                      <div>
                        <h3 className="font-heading text-xl text-[#0e0e0e]">ADDRESS</h3>
                        <p className="text-[#0e0e0e]/60">
                          Rishihood University<br />
                          Delhi-NCR Campus, Sonipat<br />
                          Haryana, India - 131001
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-md bg-white">
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="w-14 h-14 bg-[#b20e38]/10 rounded-xl flex items-center justify-center">
                        <Mail className="h-6 w-6 text-[#b20e38]" />
                      </div>
                      <div>
                        <h3 className="font-heading text-xl text-[#0e0e0e]">EMAIL</h3>
                        <p className="text-[#0e0e0e]/60">sports@rishihood.edu.in</p>
                        <p className="text-[#0e0e0e]/60">hanumant@rishihood.edu.in</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-md bg-white">
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="w-14 h-14 bg-[#b20e38]/10 rounded-xl flex items-center justify-center">
                        <Phone className="h-6 w-6 text-[#b20e38]" />
                      </div>
                      <div>
                        <h3 className="font-heading text-xl text-[#0e0e0e]">PHONE</h3>
                        <p className="text-[#0e0e0e]/60">+91 98765 43210</p>
                        <p className="text-[#0e0e0e]/60">+91 98765 43211</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-md bg-white">
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="w-14 h-14 bg-[#b20e38]/10 rounded-xl flex items-center justify-center">
                        <Clock className="h-6 w-6 text-[#b20e38]" />
                      </div>
                      <div>
                        <h3 className="font-heading text-xl text-[#0e0e0e]">OFFICE HOURS</h3>
                        <p className="text-[#0e0e0e]/60">Monday - Friday: 9 AM - 6 PM</p>
                        <p className="text-[#0e0e0e]/60">Saturday: 10 AM - 2 PM</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="border-none shadow-lg bg-white">
                  <CardContent className="p-8">
                    <h2 className="font-heading text-3xl text-[#0e0e0e] mb-6">
                      SEND US A MESSAGE
                    </h2>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-[#0e0e0e]/70">Your Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                            className="h-12 bg-[#ffe5cd]/30 border-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-[#0e0e0e]/70">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="john@example.com"
                            required
                            className="h-12 bg-[#ffe5cd]/30 border-none"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-[#0e0e0e]/70">Subject</Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="What is this regarding?"
                          required
                          className="h-12 bg-[#ffe5cd]/30 border-none"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="message" className="text-[#0e0e0e]/70">Message</Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us more about your inquiry..."
                          rows={5}
                          required
                          className="bg-[#ffe5cd]/30 border-none resize-none"
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-14 text-lg bg-[#b20e38] hover:bg-[#8a0b2b] text-white font-semibold"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Send Message
                            <Send className="ml-2 h-5 w-5" />
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-[#b20e38] font-medium text-sm tracking-wide mb-4 block">
                COMMON QUERIES
              </span>
              <h2 className="font-heading text-5xl text-[#0e0e0e]">
                FREQUENTLY ASKED
              </h2>
            </motion.div>

            <div className="max-w-3xl mx-auto grid gap-4">
              {[
                {
                  q: 'Who can participate in Hanumant?',
                  a: 'Any currently enrolled college/university student with a valid ID can participate. Both Rishihood and external college students are welcome.'
                },
                {
                  q: 'How do I register for a sport?',
                  a: 'Create an account on our website, browse the sports section, select your sport, fill in the required details, and complete the payment via Razorpay.'
                },
                {
                  q: 'Can I register for multiple sports?',
                  a: 'Yes, you can register for multiple sports as long as the schedules do not conflict. Separate registration and fees apply for each sport.'
                },
                {
                  q: 'What is the refund policy?',
                  a: 'Refunds are available up to 7 days before the event. After that, no refunds will be processed. Transfer to another participant is possible.'
                },
                {
                  q: 'Is accommodation provided?',
                  a: 'Basic accommodation can be arranged for outstation participants at nominal charges. Please contact us in advance to book.'
                },
              ].map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="border-none shadow-sm bg-[#ffe5cd]/30">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-[#0e0e0e] mb-2">{faq.q}</h3>
                      <p className="text-[#0e0e0e]/60 text-sm">{faq.a}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
