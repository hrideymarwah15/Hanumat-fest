'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/providers/auth-provider'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { TeamMemberForm } from '@/components/registrations/team-member-form'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'

// Schema for registration
const registrationSchema = z.object({
  team_name: z.string().optional(),
  team_members: z.array(z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().regex(/^[0-9]{10}$/, 'Valid 10-digit phone required').optional().or(z.literal('')),
    is_captain: z.boolean().optional()
  })),
  agree_terms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
  agree_refund: z.boolean().refine(val => val === true, 'You must agree to the refund policy')
})

export default function RegistrationPage() {
  const { slug } = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [sport, setSport] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [step, setStep] = useState(1)

  const form = useForm<z.infer<typeof registrationSchema>>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      team_name: '',
      team_members: [],
      agree_terms: false,
      agree_refund: false
    }
  })

  const { fields,append, remove } = useFieldArray({
    control: form.control,
    name: "team_members"
  })

  // Fetch sport details
  useEffect(() => {
    const fetchSport = async () => {
      try {
        // Assuming public endpoint /sports/:slug or /sports?slug=... logic
        // For now using /sports/:id where id is assumed to be resolvable or slug query
        // Implementing logic to find sport by slug from list if direct endpoint lacks slug support
        // But for production grade we assume /sports/:slug works or we fetch all and find
        const res = await api.get<{ sports: any[] }>(`/sports?search=${slug}`) // Assuming simple search/filter
        // Better: GET /sports/:slug directly
        let foundSport = null;
        try {
             // Try fetching by slug directly as ID
             const directRes = await api.get<{ sport: any }>(`/sports/${slug}`)
             foundSport = directRes.sport;
        } catch(e) {
            // fallback
        }
        
        if (!foundSport && res.sports) {
            foundSport = res.sports.find((s: any) => s.slug === slug || s.id === slug)
        }

        setSport(foundSport)
        
        if (foundSport) {
             // Initialize form
             if (foundSport.is_team_event) {
                 // Pre-fill captain as user
                 form.setValue('team_members', [{
                     name: user?.user_metadata?.name || '',
                     email: user?.email || '',
                     phone: user?.user_metadata?.phone || '',
                     is_captain: true
                 }])
                 // Fill remaining min members
                 const needed = (foundSport.team_size_min || 1) - 1
                 for(let i=0; i<needed; i++) {
                     append({ name: '', email: '', phone: '', is_captain: false })
                 }
             } else {
                 // Individual
                 form.setValue('team_members', [{
                     name: user?.user_metadata?.name || '',
                     email: user?.email || '',
                     phone: user?.user_metadata?.phone || '',
                     is_captain: true
                 }])
             }
        }

      } catch (error) {
        console.error(error)
        toast.error('Failed to load sport')
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchSport()
  }, [slug, user, append, form])

  const validateStep1 = async () => {
      const isValid = await form.trigger(['team_name', 'team_members'])
      if (isValid) setStep(2)
  }

  const onSubmit = async (values: z.infer<typeof registrationSchema>) => {
      setSubmitting(true)
      try {
          const payload = {
              sport_id: sport.id,
              is_team: sport.is_team_event,
              team_name: values.team_name,
              team_members: values.team_members.map(m => ({
                  ...m,
                  is_captain: !!m.is_captain
              }))
          }
          
          const res = await api.post<{ registration_id: string }>('/registrations', payload)
          toast.success('Registration created!')
          router.push(`/dashboard/registrations/${res.registration_id}`)
      } catch (error: any) {
          toast.error(error.message || 'Registration failed')
          setSubmitting(false)
      }
  }

  if (loading) return <div className="p-12 text-center"><Loader2 className="animate-spin mx-auto" /></div>
  if (!sport) return <div className="p-12 text-center">Sport not found</div>

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
       <div className="mb-8 text-center">
           <h1 className="text-3xl font-bold">Register for {sport.name}</h1>
           <p className="text-muted-foreground">
               {step === 1 ? 'Enter Details' : 'Review & Confirm'}
           </p>
           
           <div className="flex justify-center mt-4 gap-2">
               <div className={`h-2 w-12 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-muted'}`} />
               <div className={`h-2 w-12 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />
           </div>
       </div>

       <Form {...form}>
           <form onSubmit={form.handleSubmit(onSubmit)}>
               {step === 1 && (
                   <div className="space-y-6">
                       <Card>
                           <CardHeader>
                               <CardTitle>Participant Information</CardTitle>
                               <CardDescription>
                                   {sport.is_team_event 
                                     ? `This is a team event. Min: ${sport.team_size_min}, Max: ${sport.team_size_max}` 
                                     : 'Individual Registration'}
                               </CardDescription>
                           </CardHeader>
                           <CardContent className="space-y-4">
                               {sport.is_team_event && (
                                   <FormField
                                     control={form.control}
                                     name="team_name"
                                     rules={{ required: "Team name is required" }}
                                     render={({ field }) => (
                                       <FormItem>
                                         <FormLabel>Team Name</FormLabel>
                                         <FormControl><Input placeholder="e.g. Thunderbolts" {...field} /></FormControl>
                                         <FormMessage />
                                       </FormItem>
                                     )}
                                   />
                               )}

                               <div className="space-y-4">
                                   {fields.map((field, index) => (
                                       <TeamMemberForm 
                                          key={field.id}
                                          form={form}
                                          index={index}
                                          remove={remove}
                                          isCaptain={index === 0}
                                          canRemove={index !== 0 && fields.length > (sport.team_size_min || 1)}
                                       />
                                   ))}
                               </div>

                               {sport.is_team_event && fields.length < (sport.team_size_max || 1) && (
                                   <Button 
                                     type="button" 
                                     variant="outline" 
                                     onClick={() => append({ name: '', email: '', phone: '', is_captain: false })}
                                     className="w-full"
                                   >
                                       Add Team Member
                                   </Button>
                               )}
                           </CardContent>
                           <CardFooter>
                               <Button type="button" className="w-full" onClick={validateStep1}>
                                   Continue to Review
                               </Button>
                           </CardFooter>
                       </Card>
                   </div>
               )}

               {step === 2 && (
                   <div className="space-y-6">
                       <Card>
                           <CardHeader>
                               <CardTitle>Review Registration</CardTitle>
                           </CardHeader>
                           <CardContent className="space-y-6">
                               <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                                   <div className="flex justify-between">
                                       <span className="text-muted-foreground">Sport</span>
                                       <span className="font-medium">{sport.name}</span>
                                   </div>
                                    <div className="flex justify-between">
                                       <span className="text-muted-foreground">Type</span>
                                       <span className="font-medium">{sport.is_team_event ? 'Team' : 'Individual'}</span>
                                   </div>
                                   {sport.is_team_event && (
                                       <div className="flex justify-between">
                                           <span className="text-muted-foreground">Team Name</span>
                                           <span className="font-medium">{form.getValues('team_name')}</span>
                                       </div>
                                   )}
                                   <div className="flex justify-between">
                                       <span className="text-muted-foreground">Participants</span>
                                       <span className="font-medium">{fields.length}</span>
                                   </div>
                               </div>

                               <div>
                                   <h4 className="font-semibold mb-2">Fees Breakdown</h4>
                                   <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                                       <span>Total to Pay</span>
                                       <span>₹{sport.fees}</span>
                                   </div>
                               </div>

                               <Separator />

                               <div className="space-y-4">
                                   <FormField
                                     control={form.control}
                                     name="agree_terms"
                                     render={({ field }) => (
                                       <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                         <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                         <div className="space-y-1 leading-none">
                                           <FormLabel>I agree to the terms and rules of the event.</FormLabel>
                                         </div>
                                       </FormItem>
                                     )}
                                   />
                                   <FormField
                                     control={form.control}
                                     name="agree_refund"
                                     render={({ field }) => (
                                       <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                         <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                         <div className="space-y-1 leading-none">
                                           <FormLabel>I understand the refund policy.</FormLabel>
                                         </div>
                                       </FormItem>
                                     )}
                                   />
                               </div>
                           </CardContent>
                           <CardFooter className="flex gap-4">
                               <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                                   Back
                               </Button>
                               <Button type="submit" className="flex-1" disabled={submitting || !form.formState.isValid}>
                                   {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                   Confirm & Register
                               </Button>
                           </CardFooter>
                       </Card>
                   </div>
               )}
           </form>
       </Form>
    </div>
  )
}
