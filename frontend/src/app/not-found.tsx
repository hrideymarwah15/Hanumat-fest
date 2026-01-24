'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Navbar, Footer } from '@/components/layout'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#ffe5cd]">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            {/* 404 Number */}
            <div className="relative mb-8">
              <h1 className="font-heading text-[12rem] md:text-[16rem] text-[#0e0e0e]/5 leading-none select-none">
                404
              </h1>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-heading text-6xl md:text-8xl text-[#b20e38]">OOPS!</span>
              </div>
            </div>
            
            {/* Message */}
            <h2 className="font-heading text-3xl md:text-4xl text-[#0e0e0e] mb-4">
              PAGE NOT FOUND
            </h2>
            <p className="text-[#0e0e0e]/60 text-lg mb-10 max-w-md mx-auto">
              Looks like you've wandered off the playing field. The page you're looking for doesn't exist or has been moved.
            </p>
            
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button 
                  size="lg" 
                  className="bg-[#b20e38] hover:bg-[#8a0b2b] text-white font-semibold h-14 px-8"
                >
                  <Home className="mr-2 h-5 w-5" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/sports">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-[#0e0e0e]/20 bg-white hover:bg-white/80 text-[#0e0e0e] font-semibold h-14 px-8"
                >
                  <Search className="mr-2 h-5 w-5" />
                  Browse Sports
                </Button>
              </Link>
            </div>
            
            {/* Quick Links */}
            <div className="mt-16 pt-8 border-t border-[#0e0e0e]/10">
              <p className="text-sm text-[#0e0e0e]/40 mb-4">Or try these popular pages:</p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <Link href="/about" className="text-[#0e0e0e]/60 hover:text-[#b20e38] transition-colors">
                  About Hanumant
                </Link>
                <span className="text-[#0e0e0e]/20">•</span>
                <Link href="/sports" className="text-[#0e0e0e]/60 hover:text-[#b20e38] transition-colors">
                  Sports Events
                </Link>
                <span className="text-[#0e0e0e]/20">•</span>
                <Link href="/team" className="text-[#0e0e0e]/60 hover:text-[#b20e38] transition-colors">
                  Meet the Team
                </Link>
                <span className="text-[#0e0e0e]/20">•</span>
                <Link href="/contact" className="text-[#0e0e0e]/60 hover:text-[#b20e38] transition-colors">
                  Contact Us
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
