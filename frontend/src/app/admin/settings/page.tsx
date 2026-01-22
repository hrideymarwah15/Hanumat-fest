'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
      registrations_enabled: true,
      maintenance_mode: false,
      contact_email: '',
      contact_phone: ''
  })

  useEffect(() => {
     const fetchSettings = async () => {
         try {
             // In a real app we would have a specific endpoint, reusing fetching logic or assume defaults
             // For now we simulate a fetch or use a real endpoint if we had one defined in backend
             // Let's assume GET /admin/settings exists as per spec
             const res = await api.get<any>('/admin/settings')
             if (res) setSettings(res)
         } catch (e) {
             console.error('Failed to load settings', e)
         }
     }
     fetchSettings()
  }, [])

  const handleSave = async () => {
      setLoading(true)
      try {
          await api.post('/admin/settings', settings)
          toast.success('Settings saved successfully')
      } catch (error) {
          toast.error('Failed to save settings')
      } finally {
          setLoading(false)
      }
  }

  return (
    <div className="space-y-6">
       <div>
         <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
         <p className="text-muted-foreground">Configure global application settings.</p>
       </div>

       <div className="grid gap-6 md:grid-cols-2">
           <Card>
               <CardHeader>
                   <CardTitle>General Controls</CardTitle>
                   <CardDescription>Manage event visibility and access.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-6">
                   <div className="flex items-center justify-between space-x-2">
                       <div className="space-y-0.5">
                           <Label>Registration Open</Label>
                           <p className="text-sm text-muted-foreground">Enable or disable new user registrations.</p>
                       </div>
                       <Switch 
                           checked={settings.registrations_enabled} 
                           onCheckedChange={(c) => setSettings(p => ({...p, registrations_enabled: c}))} 
                       />
                   </div>
                   <div className="flex items-center justify-between space-x-2">
                       <div className="space-y-0.5">
                           <Label>Maintenance Mode</Label>
                           <p className="text-sm text-muted-foreground">Show maintenance page to all users.</p>
                       </div>
                       <Switch 
                           checked={settings.maintenance_mode} 
                           onCheckedChange={(c) => setSettings(p => ({...p, maintenance_mode: c}))} 
                       />
                   </div>
               </CardContent>
           </Card>

           <Card>
               <CardHeader>
                   <CardTitle>Contact Information</CardTitle>
                   <CardDescription>Update support details visible on Contact page.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                   <div className="space-y-2">
                       <Label>Support Email</Label>
                       <Input 
                           value={settings.contact_email} 
                           onChange={(e) => setSettings(p => ({...p, contact_email: e.target.value}))} 
                       />
                   </div>
                   <div className="space-y-2">
                       <Label>Support Phone</Label>
                       <Input 
                           value={settings.contact_phone} 
                           onChange={(e) => setSettings(p => ({...p, contact_phone: e.target.value}))} 
                       />
                   </div>
                   <Button onClick={handleSave} disabled={loading} className="w-full">
                       {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                       Save Changes
                   </Button>
               </CardContent>
           </Card>
       </div>
    </div>
  )
}
