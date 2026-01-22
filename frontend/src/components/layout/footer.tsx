import Link from 'next/link'
import { Facebook, Twitter, Instagram, Mail, MapPin, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Hanumat Fest</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The ultimate university sports festival celebrating athleticism, teamwork, and competitive spirit.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sports" className="text-muted-foreground hover:text-primary">Find Sports</Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">Contact Support</Link>
              </li>
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-primary">Participant Login</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Sports Categories</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/sports?category=outdoor" className="text-muted-foreground hover:text-primary">Outdoor Games</Link>
              </li>
              <li>
                <Link href="/sports?category=indoor" className="text-muted-foreground hover:text-primary">Indoor Games</Link>
              </li>
              <li>
                <Link href="/sports?category=esports" className="text-muted-foreground hover:text-primary">Esports</Link>
              </li>
              <li>
                <Link href="/sports?category=athletics" className="text-muted-foreground hover:text-primary">Athletics</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@hanumatfest.com</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-1" />
                <span>University Sports Complex,<br />New Delhi, India</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Hanumat Fest. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
