import { Navbar } from '@/components/layout'
import { AdminSidebar } from '@/components/layout/admin-sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-8 bg-muted/10">
           {children}
        </main>
      </div>
    </div>
  )
}
