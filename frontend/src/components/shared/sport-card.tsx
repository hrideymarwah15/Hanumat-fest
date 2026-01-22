import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, Trophy } from 'lucide-react'
import { format } from 'date-fns'

interface SportCardProps {
  sport: any // TODO: specific type
}

export function SportCard({ sport }: SportCardProps) {
  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow">
      <div className="h-48 bg-muted relative overflow-hidden rounded-t-lg">
         {/* Placeholder for image */}
         <div className="absolute inset-0 flex items-center justify-center bg-muted-foreground/10 text-muted-foreground">
            <Trophy className="h-12 w-12 opacity-50" />
         </div>
         <div className="absolute top-2 right-2">
           <Badge variant={sport.is_registration_open ? "default" : "secondary"}>
             {sport.is_registration_open ? 'Open' : 'Closed'}
           </Badge>
         </div>
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <Badge variant="outline" className="mb-2">{sport.category}</Badge>
            <CardTitle className="line-clamp-1">{sport.name}</CardTitle>
          </div>
          <div className="text-right">
             <span className="text-lg font-bold">₹{sport.fees}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="grid gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{sport.is_team_event ? `Team (${sport.team_size_min}-${sport.team_size_max})` : 'Individual'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Deadline: {sport.registration_deadline ? format(new Date(sport.registration_deadline), 'MMM d, yyyy') : 'TBA'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/sports/${sport.slug}`} className="w-full">
          <Button className="w-full" disabled={!sport.is_registration_open}>
            {sport.is_registration_open ? 'View Details' : 'Closed'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
