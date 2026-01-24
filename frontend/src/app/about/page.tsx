'use client'

import { motion } from 'framer-motion'
import { Navbar, Footer } from '@/components/layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  Flame, 
  Target, 
  Medal, 
  Users, 
  Calendar,
  MapPin,
  ArrowRight,
  Quote
} from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#ffe5cd]">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 bg-[#0e0e0e] overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#b20e38] rounded-full blur-[150px]" />
          </div>
          
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <span className="text-[#b20e38] font-medium text-sm tracking-wide mb-4 block">
                ABOUT HANUMANT
              </span>
              <h1 className="font-heading text-5xl md:text-7xl text-white mb-6 leading-[0.95]">
                WHERE STRENGTH<br />
                MEETS SPIRIT
              </h1>
              <p className="text-white/60 text-xl leading-relaxed">
                Hanumant is more than a sports fest—it's a celebration of the values that 
                make athletes extraordinary: discipline, fearlessness, and the unity that 
                comes from healthy competition.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-24 bg-white">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-heading text-5xl text-[#0e0e0e] mb-8">
                  THE STORY<br />BEHIND THE NAME
                </h2>
                <div className="space-y-6 text-[#0e0e0e]/70 text-lg leading-relaxed">
                  <p>
                    The name <span className="text-[#b20e38] font-semibold">Hanumant</span> draws 
                    inspiration from Lord Hanuman—the embodiment of strength, devotion, and 
                    unwavering courage. In modern times, these qualities translate perfectly 
                    into the world of sports.
                  </p>
                  <p>
                    Every athlete who steps onto the field carries within them the spirit of 
                    determination. They train with discipline, compete without fear, and unite 
                    with their teams in pursuit of excellence.
                  </p>
                  <p>
                    At Rishihood University, we launched Hanumant to create a platform where 
                    this spirit could flourish. What began as a small inter-college tournament 
                    has grown into a regional celebration of athletic prowess.
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-[#ffe5cd] rounded-2xl p-8 md:p-12">
                  <Quote className="w-12 h-12 text-[#b20e38] mb-6" />
                  <blockquote className="font-heading text-3xl md:text-4xl text-[#0e0e0e] leading-tight mb-8">
                    "SPORTS DO NOT BUILD CHARACTER. THEY REVEAL IT."
                  </blockquote>
                  <p className="text-[#0e0e0e]/60 font-medium">
                    — Heywood Broun
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-24 bg-[#ffe5cd]">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-[#b20e38] font-medium text-sm tracking-wide mb-4 block">
                WHAT WE STAND FOR
              </span>
              <h2 className="font-heading text-5xl md:text-6xl text-[#0e0e0e]">
                CORE VALUES
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { 
                  icon: Flame, 
                  title: 'Strength', 
                  desc: 'Physical and mental fortitude that pushes boundaries and breaks barriers.' 
                },
                { 
                  icon: Target, 
                  title: 'Discipline', 
                  desc: 'The daily commitment to practice, improve, and master your craft.' 
                },
                { 
                  icon: Medal, 
                  title: 'Fearlessness', 
                  desc: 'The courage to compete at your best, regardless of the odds.' 
                },
                { 
                  icon: Users, 
                  title: 'Unity', 
                  desc: 'The bond between teammates and the respect between competitors.' 
                },
              ].map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-none shadow-lg card-hover bg-white h-full">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-[#b20e38]/10 rounded-2xl flex items-center justify-center text-[#b20e38] mx-auto mb-6">
                        <value.icon className="w-8 h-8" />
                      </div>
                      <h3 className="font-heading text-3xl text-[#0e0e0e] mb-4">{value.title}</h3>
                      <p className="text-[#0e0e0e]/60">{value.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="py-24 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-16"
              >
                <span className="text-[#b20e38] font-medium text-sm tracking-wide mb-4 block">
                  OUR VISION
                </span>
                <h2 className="font-heading text-5xl md:text-6xl text-[#0e0e0e] mb-8">
                  BUILDING A SPORTS CULTURE
                </h2>
                <p className="text-[#0e0e0e]/60 text-xl leading-relaxed">
                  We envision Hanumant as more than an annual event. It's a movement to 
                  revive the culture of competitive sports in Indian universities—where 
                  athletes are celebrated, sportsmanship is valued, and every student 
                  has the opportunity to discover their athletic potential.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid md:grid-cols-3 gap-8"
              >
                <div className="text-center">
                  <div className="font-heading text-6xl text-[#b20e38] mb-2">2026</div>
                  <p className="text-[#0e0e0e]/60 font-medium">2nd Edition</p>
                </div>
                <div className="text-center">
                  <div className="font-heading text-6xl text-[#b20e38] mb-2">8</div>
                  <p className="text-[#0e0e0e]/60 font-medium">Sports Events</p>
                </div>
                <div className="text-center">
                  <div className="font-heading text-6xl text-[#b20e38] mb-2">₹1.5L+</div>
                  <p className="text-[#0e0e0e]/60 font-medium">Prize Pool</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Event Details */}
        <section className="py-24 bg-[#0e0e0e]">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-[#b20e38] font-medium text-sm tracking-wide mb-4 block">
                MARK YOUR CALENDAR
              </span>
              <h2 className="font-heading text-5xl md:text-6xl text-white">
                EVENT DETAILS
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="border-none bg-white/5 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-[#b20e38] rounded-xl flex items-center justify-center">
                        <Calendar className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-heading text-2xl text-white">DATE & TIME</h3>
                        <p className="text-white/60">When to join us</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-white/80">
                      <p className="text-xl font-semibold text-[#b20e38]">7-8 February 2026</p>
                      <p>Saturday & Sunday</p>
                      <p>8:00 AM onwards</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="border-none bg-white/5 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-[#b20e38] rounded-xl flex items-center justify-center">
                        <MapPin className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-heading text-2xl text-white">VENUE</h3>
                        <p className="text-white/60">Where to find us</p>
                      </div>
                    </div>
                    <div className="space-y-3 text-white/80">
                      <p className="text-xl font-semibold text-[#b20e38]">Rishihood University</p>
                      <p>Delhi-NCR Campus</p>
                      <p>Sonipat, Haryana</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-[#ffe5cd]">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="font-heading text-5xl text-[#0e0e0e] mb-6">
                BE PART OF THE LEGACY
              </h2>
              <p className="text-[#0e0e0e]/60 text-lg mb-10">
                Whether you're a seasoned athlete or discovering your passion for sports, 
                Hanumant welcomes you. Register now and write your chapter in our story.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button 
                    size="lg" 
                    className="bg-[#b20e38] hover:bg-[#8a0b2b] text-white font-semibold text-lg h-14 px-10"
                  >
                    Register Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/sports">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-[#0e0e0e]/20 bg-white hover:bg-white/80 text-[#0e0e0e] font-semibold text-lg h-14 px-10"
                  >
                    View Sports
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
