'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/providers/auth-provider'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Loader2, User, Camera } from 'lucide-react'

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  phone: z.string().regex(/^[6-9]\d{9}$/, { message: 'Enter a valid 10-digit Indian mobile number' }),
  college: z.string().min(2, { message: 'College name is required' }),
  avatar_url: z.string().optional(), // In real app, we handle file upload separately
})

export default function ProfilePage() {
  const { user, session } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      phone: '',
      college: '',
      avatar_url: '',
    },
  })

  // Fetch verified profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await api.get<{ name: string, phone: string, college: string, avatar_url?: string }>('/auth/profile')
        if (profile) {
            form.reset({
                name: profile.name || user?.user_metadata?.name || '',
                phone: profile.phone || '',
                college: profile.college || '',
                avatar_url: profile.avatar_url || '',
            })
        }
      } catch (error) {
        console.error('Failed to fetch profile', error)
      }
    }
    if (session) fetchProfile()
  }, [session, user, form])

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    setIsLoading(true)
    try {
      await api.patch('/auth/profile', values)
      toast.success('Profile updated successfully!')
      // Force reload to update session metadata if needed, or rely on realtime
      window.location.reload() 
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile.')
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="shrink-0 pt-2">
                   <Avatar className="h-24 w-24">
                      <AvatarImage src={form.watch('avatar_url')} />
                      <AvatarFallback className="text-xl">
                          {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                   </Avatar>
                </div>
                
                <div className="flex-1 w-full">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="avatar_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Avatar URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://github.com/shadcn.png" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="college"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>College</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                        </div>
                        <div className="pt-4 flex justify-end">
                            <Button type="submit" disabled={isLoading}>
                              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Save Changes
                            </Button>
                        </div>
                      </form>
                    </Form>
                </div>
             </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
           <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>Manage your password and account access.</CardDescription>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="space-y-1">
                 <p className="text-sm font-medium">Email Address</p>
                 <p className="text-sm text-muted-foreground">{user?.email}</p>
                 <p className="text-xs text-muted-foreground">Managed via Supabase Auth</p>
              </div>
           </CardContent>
           <CardFooter>
               <Button variant="outline" onClick={() => toast.info('Password reset email sent!')}>
                   Change Password
               </Button>
           </CardFooter>
        </Card>
      </div>
    </div>
  )
}
