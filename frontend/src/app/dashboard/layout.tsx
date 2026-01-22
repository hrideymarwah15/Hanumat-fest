import { Navbar } from '@/components/layout'
import { UserSidebar } from '@/components/layout/user-sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <UserSidebar />
        <main className="flex-1 py-6 md:px-8">
           {children}
        </main>
      </div>
    </div>
  )
}
