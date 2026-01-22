'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const sportSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  slug: z.string().min(2, { message: 'Slug must be at least 2 characters' }).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes'),
  category: z.string().min(1, { message: 'Category is required' }),
  description: z.string().optional(),
  rules: z.string().optional(),
  venue: z.string().optional(),
  schedule_start: z.string().optional(),
  fees: z.coerce.number().min(0),
  is_team_event: z.boolean().default(false),
  team_size_min: z.coerce.number().min(1).default(1),
  team_size_max: z.coerce.number().min(1).default(1),
  max_registrations: z.coerce.number().min(0).default(0),
  is_registration_open: z.boolean().default(true),
})

interface SportFormProps {
  initialData?: any
  isEdit?: boolean
}

type SportFormData = z.infer<typeof sportSchema>

export function SportForm({ initialData, isEdit = false }: SportFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SportFormData>({
    resolver: zodResolver(sportSchema) as any,
    defaultValues: {
      name: (initialData?.name as string) || '',
      slug: (initialData?.slug as string) || '',
      category: (initialData?.category as string) || 'outdoor',
      description: (initialData?.description as string) || '',
      rules: (initialData?.rules as string) || '',
      venue: (initialData?.venue as string) || '',
      schedule_start: (initialData?.schedule_start as string) || '',
      fees: Number(initialData?.fees ?? 0),
      is_team_event: Boolean(initialData?.is_team_event ?? false),
      team_size_min: Number(initialData?.team_size_min ?? 1),
      team_size_max: Number(initialData?.team_size_max ?? 1),
      max_registrations: Number(initialData?.max_registrations ?? 0),
      is_registration_open: initialData?.is_registration_open !== undefined ? Boolean(initialData.is_registration_open) : true,
    },
  })

  async function onSubmit(values: z.infer<typeof sportSchema>) {
    setIsLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/admin/sports/${initialData.id}`, values)
        toast.success('Sport updated successfully!')
      } else {
        await api.post('/admin/sports', values)
        toast.success('Sport created successfully!')
      }
      router.push('/admin/sports')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save sport.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
         <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-1">
               <CardContent className="pt-6 space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sport Name</FormLabel>
                        <FormControl><Input placeholder="Cricket" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug (URL Friendly)</FormLabel>
                        <FormControl><Input placeholder="cricket" {...field} /></FormControl>
                        <FormDescription>Unique identifier for URL.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl><Input placeholder="outdoor" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="fees"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registration Fee (₹)</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl><Textarea placeholder="Short description..." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
               </CardContent>
            </Card>

            <Card className="md:col-span-1">
               <CardContent className="pt-6 space-y-4">
                   <div className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name="is_team_event"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 w-full">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Team Event</FormLabel>
                              <FormDescription>Is this a team sport?</FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                   </div>
                   {form.watch('is_team_event') && (
                       <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="team_size_min"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Min Team Size</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="team_size_max"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Max Team Size</FormLabel>
                                <FormControl><Input type="number" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                       </div>
                   )}
                   <FormField
                      control={form.control}
                      name="rules"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rules</FormLabel>
                          <FormControl><Textarea className="h-32" placeholder="Rules..." {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                   />
                   <FormField
                      control={form.control}
                      name="is_registration_open"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Registration Open</FormLabel>
                            <FormDescription>Accept new registrations</FormDescription>
                          </div>
                          <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                      )}
                   />
               </CardContent>
            </Card>
         </div>

         <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               {isEdit ? 'Update Sport' : 'Create Sport'}
            </Button>
         </div>
      </form>
    </Form>
  )
}
