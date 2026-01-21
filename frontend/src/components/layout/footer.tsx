import Link from "next/link";
import { Trophy, Mail, Phone, MapPin, Instagram, Twitter, Facebook, Youtube } from "lucide-react";

const footerLinks = {
  quickLinks: [
    { href: "/sports", label: "All Sports" },
    { href: "/about", label: "About Us" },
    { href: "/contact", label: "Contact" },
    { href: "/about#rules", label: "Rules & Regulations" },
  ],
  sports: [
    { href: "/sports?category=outdoor", label: "Outdoor Sports" },
    { href: "/sports?category=indoor", label: "Indoor Sports" },
    { href: "/sports?category=esports", label: "E-Sports" },
    { href: "/sports?category=athletics", label: "Athletics" },
  ],
  legal: [
    { href: "/about#refund", label: "Refund Policy" },
    { href: "/about#privacy", label: "Privacy Policy" },
    { href: "/about#terms", label: "Terms & Conditions" },
  ],
};

const socialLinks = [
  { href: "https://instagram.com", icon: Instagram, label: "Instagram" },
  { href: "https://twitter.com", icon: Twitter, label: "Twitter" },
  { href: "https://facebook.com", icon: Facebook, label: "Facebook" },
  { href: "https://youtube.com", icon: Youtube, label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 cursor-pointer">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary-500 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-white">
                Hanumat<span className="text-primary">Fest</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 max-w-xs">
              The ultimate inter-college sports fest bringing together athletes
              from across the nation for an unforgettable competition.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-800 hover:bg-primary hover:text-white transition-colors cursor-pointer"
                  aria-label={social.label}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sports Categories */}
          <div>
            <h3 className="font-semibold text-white mb-4">Sports</h3>
            <ul className="space-y-2">
              {footerLinks.sports.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-primary transition-colors cursor-pointer"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span>Main Campus, University Road, New Delhi - 110001</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Mail className="h-5 w-5 text-primary" />
                <a
                  href="mailto:support@hanumatfest.com"
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  support@hanumatfest.com
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <Phone className="h-5 w-5 text-primary" />
                <a
                  href="tel:+919876543210"
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  +91 98765 43210
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} HanumatFest. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-400 hover:text-primary transition-colors cursor-pointer"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
