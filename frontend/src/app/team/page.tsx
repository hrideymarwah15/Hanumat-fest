'use client'

import { motion } from 'framer-motion'
import { Navbar, Footer } from '@/components/layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Instagram, Linkedin, Mail, ArrowRight } from 'lucide-react'

// Team members data
const teamMembers = [
  {
    name: 'Dr. Sahil Aggarwal',
    role: 'Chief Patron',
    department: 'Vice Chancellor',
    image: null,
  },
  {
    name: 'Prof. Rajesh Kumar',
    role: 'Patron',
    department: 'Registrar',
    image: null,
  },
  {
    name: 'Mr. Vikram Singh',
    role: 'Convenor',
    department: 'Sports Director',
    image: null,
  },
  {
    name: 'Ms. Priya Sharma',
    role: 'Co-Convenor',
    department: 'Faculty Coordinator',
    image: null,
  },
  {
    name: 'Arjun Mehta',
    role: 'Student Coordinator',
    department: 'B.Tech CSE, 4th Year',
    image: null,
  },
  {
    name: 'Sneha Reddy',
    role: 'Student Coordinator',
    department: 'BBA, 3rd Year',
    image: null,
  },
  {
    name: 'Rahul Verma',
    role: 'Technical Lead',
    department: 'B.Tech CSE, 3rd Year',
    image: null,
  },
  {
    name: 'Ananya Gupta',
    role: 'Marketing Head',
    department: 'MBA, 2nd Year',
    image: null,
  },
  {
    name: 'Karan Patel',
    role: 'Operations Manager',
    department: 'BBA, 3rd Year',
    image: null,
  },
  {
    name: 'Neha Singh',
    role: 'Creative Head',
    department: 'B.Des, 2nd Year',
    image: null,
  },
  {
    name: 'Rohan Joshi',
    role: 'Sponsorship Lead',
    department: 'MBA, 1st Year',
    image: null,
  },
  {
    name: 'Ishita Agarwal',
    role: 'Hospitality Head',
    department: 'BHM, 3rd Year',
    image: null,
  },
]

// Core committee
const coreCommittee = teamMembers.slice(0, 4)
const studentCommittee = teamMembers.slice(4)

export default function TeamPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#ffe5cd]">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 bg-[#0e0e0e] overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#b20e38] rounded-full blur-[150px]" />
          </div>
          
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-3xl mx-auto"
            >
              <span className="text-[#b20e38] font-medium text-sm tracking-wide mb-4 block">
                THE PEOPLE BEHIND HANUMANT
              </span>
              <h1 className="font-heading text-5xl md:text-7xl text-white mb-6">
                MEET THE TEAM
              </h1>
              <p className="text-white/60 text-lg">
                A dedicated group of faculty members and students working together to make Hanumant 2026 an unforgettable experience.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Core Committee */}
        <section className="py-20 bg-white">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-[#b20e38] font-medium text-sm tracking-wide mb-4 block">
                LEADERSHIP
              </span>
              <h2 className="font-heading text-5xl text-[#0e0e0e]">
                CORE COMMITTEE
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {coreCommittee.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-none shadow-md card-hover bg-[#ffe5cd]/30 h-full">
                    <CardContent className="p-6 text-center">
                      {/* Avatar Placeholder */}
                      <div className="w-24 h-24 bg-gradient-to-br from-[#b20e38] to-[#8a0b2b] rounded-full mx-auto mb-6 flex items-center justify-center text-white font-heading text-3xl">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <h3 className="font-heading text-2xl text-[#0e0e0e] mb-1">{member.name}</h3>
                      <p className="text-[#b20e38] font-semibold text-sm mb-2">{member.role}</p>
                      <p className="text-[#0e0e0e]/60 text-sm">{member.department}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Student Committee */}
        <section className="py-20 bg-[#ffe5cd]">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="text-[#b20e38] font-medium text-sm tracking-wide mb-4 block">
                THE DRIVING FORCE
              </span>
              <h2 className="font-heading text-5xl text-[#0e0e0e]">
                STUDENT COMMITTEE
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {studentCommittee.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-none shadow-md card-hover bg-white h-full group">
                    <CardContent className="p-6 text-center">
                      {/* Avatar Placeholder */}
                      <div className="w-20 h-20 bg-[#0e0e0e] rounded-full mx-auto mb-4 flex items-center justify-center text-white font-heading text-2xl group-hover:bg-[#b20e38] transition-colors">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <h3 className="font-heading text-xl text-[#0e0e0e] mb-1">{member.name}</h3>
                      <p className="text-[#b20e38] font-semibold text-sm mb-1">{member.role}</p>
                      <p className="text-[#0e0e0e]/50 text-xs">{member.department}</p>
                      
                      {/* Social Links */}
                      <div className="flex justify-center gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-8 h-8 bg-[#0e0e0e]/5 rounded-full flex items-center justify-center text-[#0e0e0e]/40 hover:bg-[#b20e38] hover:text-white transition-colors">
                          <Instagram className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 bg-[#0e0e0e]/5 rounded-full flex items-center justify-center text-[#0e0e0e]/40 hover:bg-[#b20e38] hover:text-white transition-colors">
                          <Linkedin className="w-4 h-4" />
                        </button>
                        <button className="w-8 h-8 bg-[#0e0e0e]/5 rounded-full flex items-center justify-center text-[#0e0e0e]/40 hover:bg-[#b20e38] hover:text-white transition-colors">
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Join Us CTA */}
        <section className="py-20 bg-[#0e0e0e]">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto"
            >
              <h2 className="font-heading text-4xl md:text-5xl text-white mb-6">
                WANT TO JOIN<br />
                <span className="text-[#b20e38]">THE TEAM?</span>
              </h2>
              <p className="text-white/60 text-lg mb-10">
                We're always looking for passionate volunteers to help make Hanumant a success. 
                If you're a Rishihood student interested in contributing, reach out to us!
              </p>
              <Link href="/contact">
                <Button 
                  size="lg" 
                  className="bg-[#b20e38] hover:bg-[#8a0b2b] text-white font-semibold text-lg h-14 px-10"
                >
                  Get in Touch
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
