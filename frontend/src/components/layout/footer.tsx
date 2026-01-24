import Link from 'next/link'
import { Instagram, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-[#0e0e0e] text-white">
      <div className="container py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#b20e38] rounded-lg flex items-center justify-center">
                <span className="text-white font-heading text-xl">H</span>
              </div>
              <span className="text-2xl font-heading tracking-wider">HANUMANT</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Rishihood University Sports Fest 2026. Celebrating strength, discipline, and unity through competitive sports.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#b20e38] transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#b20e38] transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#b20e38] transition-colors">
                <Youtube className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg tracking-wide mb-6">QUICK LINKS</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-white/60 hover:text-[#b20e38] transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/about" className="text-white/60 hover:text-[#b20e38] transition-colors">About Hanumant</Link>
              </li>
              <li>
                <Link href="/sports" className="text-white/60 hover:text-[#b20e38] transition-colors">Sports Events</Link>
              </li>
              <li>
                <Link href="/team" className="text-white/60 hover:text-[#b20e38] transition-colors">Meet the Team</Link>
              </li>
              <li>
                <Link href="/contact" className="text-white/60 hover:text-[#b20e38] transition-colors">Contact Us</Link>
              </li>
            </ul>
          </div>

          {/* Sports */}
          <div>
            <h4 className="font-heading text-lg tracking-wide mb-6">SPORTS</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/sports/cricket" className="text-white/60 hover:text-[#b20e38] transition-colors">Cricket</Link>
              </li>
              <li>
                <Link href="/sports/football" className="text-white/60 hover:text-[#b20e38] transition-colors">Football</Link>
              </li>
              <li>
                <Link href="/sports/basketball" className="text-white/60 hover:text-[#b20e38] transition-colors">Basketball</Link>
              </li>
              <li>
                <Link href="/sports/volleyball" className="text-white/60 hover:text-[#b20e38] transition-colors">Volleyball</Link>
              </li>
              <li>
                <Link href="/sports/badminton" className="text-white/60 hover:text-[#b20e38] transition-colors">Badminton</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg tracking-wide mb-6">CONTACT</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3 text-white/60">
                <MapPin className="h-5 w-5 text-[#b20e38] shrink-0 mt-0.5" />
                <span>Rishihood University<br />Sonipat, Haryana, India</span>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <Mail className="h-5 w-5 text-[#b20e38] shrink-0" />
                <span>sports@rishihood.edu.in</span>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <Phone className="h-5 w-5 text-[#b20e38] shrink-0" />
                <span>+91 98765 43210</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
          <p>© 2026 Hanumant Fest | Rishihood University. All rights reserved.</p>
          <p className="font-heading tracking-wide text-[#b20e38]">7-8 FEBRUARY 2026</p>
        </div>
      </div>
    </footer>
  )
}
