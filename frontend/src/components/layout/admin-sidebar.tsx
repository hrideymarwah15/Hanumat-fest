'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  BarChart, 
  Settings, 
  Users, 
  Trophy, 
  FileText, 
  LayoutDashboard,
  LogOut
} from 'lucide-react'
import { useAuth } from '@/providers/auth-provider'

export function AdminSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuth()

  const links = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/sports', label: 'Sports', icon: Trophy },
    { href: '/admin/registrations', label: 'Registrations', icon: FileText },
    { href: '/admin/colleges', label: 'Colleges', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="pb-12 w-64 border-r min-h-[calc(100vh-4rem)] bg-muted/20 hidden md:block">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Admin Panel
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
        <div className="px-3 py-2 border-t mt-auto">
           <Button variant="ghost" className="w-full justify-start text-red-500" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
           </Button>
        </div>
      </div>
    </div>
  )
}
