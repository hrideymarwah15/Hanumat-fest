import { Navbar, Footer } from '@/components/layout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Users, ShieldCheck, HeartHandshake } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-20 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
           <div className="container relative z-10">
              <Badge className="mb-4 bg-background/20 hover:bg-background/20 text-primary-foreground border-none">Est. 2024</Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">About Hanumat Fest</h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                 Celebrating athleticism, teamwork, and the spirit of competition across universities.
              </p>
           </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
           <div className="container text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                 Hanumat Fest serves as a premier platform for university students to showcase their sporting talents. 
                 We believe in the power of sports to build character, foster leadership, and create lasting bonds. 
                 Our goal is to provide a professional, fair, and exhilarating environment for every athlete.
              </p>
           </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-muted/30">
           <div className="container">
              <h2 className="text-3xl font-bold text-center mb-12">Core Values</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {[
                    { title: 'Excellence', icon: Trophy, desc: 'Striving for the highest standards in every game.' },
                    { title: 'Inclusivity', icon: Users, desc: 'Welcoming athletes from all backgrounds.' },
                    { title: 'Fair Play', icon: ShieldCheck, desc: 'Upholding integrity and respect on the field.' },
                    { title: 'Community', icon: HeartHandshake, desc: 'Building strong connections through sport.' }
                 ].map((value, i) => (
                    <Card key={i} className="text-center border-none shadow-md hover:shadow-xl transition-shadow">
                       <CardContent className="pt-8 pb-8">
                          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                             <value.icon className="h-8 w-8" />
                          </div>
                          <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                          <p className="text-muted-foreground">{value.desc}</p>
                       </CardContent>
                    </Card>
                 ))}
              </div>
           </div>
        </section>

        {/* Rules Section */}
        <section className="py-20">
           <div className="container max-w-4xl mx-auto">
               <h2 className="text-3xl font-bold mb-8 text-center">General Rules & Regulations</h2>
               <div className="prose max-w-none">
                  <ul className="space-y-4 text-muted-foreground list-disc pl-6">
                     <li><strong>Eligibility:</strong> Only currently enrolled students with valid ID cards are eligible to participate.</li>
                     <li><strong>Registration:</strong> All participants must register online before the deadline. No on-spot registrations allowed.</li>
                     <li><strong>Code of Conduct:</strong> Unsportsmanlike behavior, aggression, or disrespect towards officials will lead to immediate disqualification.</li>
                     <li><strong>Equipment:</strong> Teams are responsible for their own kits. Match balls will be provided by the organizers.</li>
                     <li><strong>Reporting Time:</strong> Teams must report 30 minutes before their scheduled match time.</li>
                     <li><strong>Disputes:</strong> The decision of the referee/umpire is final. Formal protests must be lodged with the organizing committee within 1 hour of the match.</li>
                  </ul>
               </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
