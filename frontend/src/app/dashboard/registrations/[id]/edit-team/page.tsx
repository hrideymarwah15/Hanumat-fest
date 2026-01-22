'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { TeamMemberForm } from '@/components/registrations/team-member-form'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import { Registration, Sport } from '@/types'

const teamSchema = z.object({
  team_name: z.string().min(2, 'Team name is required'),
  team_members: z.array(z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    is_captain: z.boolean()
  }))
})

export default function EditTeamPage() {
  const { id } = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sport, setSport] = useState<Sport | null>(null)

  const form = useForm<z.infer<typeof teamSchema>>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      team_name: '',
      team_members: []
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "team_members"
  })

  useEffect(() => {
    const fetchRegistration = async () => {
      try {
        const res = await api.get<{ registration: Registration }>(`/registrations/${id}`)
        if (!res.registration.is_team_event) {
            toast.error('Not a team event')
            router.push(`/dashboard/registrations/${id}`)
            return
        }
        if (res.registration.status === 'confirmed') {
            toast.error('Cannot edit confirmed registration')
            router.push(`/dashboard/registrations/${id}`)
            return
        }

        setSport(res.registration.sport || null)
        form.reset({
            team_name: res.registration.team_name || '',
            team_members: res.registration.team_members || []
        })
      } catch (error) {
        console.error(error)
        router.push('/dashboard/registrations')
      } finally {
        setLoading(false)
      }
    }
    fetchRegistration()
  }, [id, router, form])

  const onSubmit = async (values: z.infer<typeof teamSchema>) => {
      setSaving(true)
      try {
          await api.patch(`/registrations/${id}/team`, values)
          toast.success('Team details updated')
          router.push(`/dashboard/registrations/${id}`)
      } catch (error: any) {
          toast.error(error.message || 'Failed to update')
      } finally {
          setSaving(false)
      }
  }

  if (loading) return <div className="p-12 center"><Loader2 className="animate-spin mx-auto" /></div>

  return (
    <div className="max-w-2xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-2">Edit Team Details</h1>
        <p className="text-muted-foreground mb-6">Update members for {form.getValues('team_name')}</p>

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card>
                    <CardHeader>
                        <CardTitle>Team Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <FormField
                            control={form.control}
                            name="team_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team Name</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <TeamMemberForm 
                                    key={field.id}
                                    form={form}
                                    index={index}
                                    remove={remove}
                                    isCaptain={index === 0}
                                    canRemove={index !== 0 && fields.length > (sport?.team_size_min || 1)}
                                />
                            ))}
                        </div>

                        {fields.length < (sport?.team_size_max || 99) && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => append({ name: '', email: '', phone: '', is_captain: false })}
                                className="w-full"
                            >
                                Add Member
                            </Button>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end gap-4">
                        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </Form>
    </div>
  )
}
