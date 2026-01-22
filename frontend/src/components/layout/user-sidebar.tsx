'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, Ticket, User, CreditCard, Bell, LogOut } from 'lucide-react'
import { useAuth } from '@/providers/auth-provider'

export function UserSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const links = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/registrations', label: 'My Registrations', icon: Ticket },
    { href: '/dashboard/payments', label: 'Payment History', icon: CreditCard },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
    { href: '/dashboard/profile', label: 'Profile Settings', icon: User },
  ]

  return (
    <div className="pb-12 w-64 border-r min-h-[calc(100vh-4rem)] hidden md:block">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Dashboard
          </h2>
          <div className="space-y-1">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={pathname === link.href ? 'secondary' : 'ghost'}
                  className={cn("w-full justify-start", pathname === link.href && "bg-secondary")}
                >
                  <link.icon className="mr-2 h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </div>
        </div>
        <div className="px-3 py-2">
           <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-500 hover:bg-red-50" onClick={signOut}>
                 <LogOut className="mr-2 h-4 w-4" />
                 Log out
              </Button>
           </div>
        </div>
      </div>
    </div>
  )
}
