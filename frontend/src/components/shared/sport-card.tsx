import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Trophy, ArrowRight } from 'lucide-react'

// Sport icons mapping
const sportIcons: Record<string, string> = {
  cricket: '🏏',
  football: '⚽',
  basketball: '🏀',
  volleyball: '🏐',
  badminton: '🏸',
  'table-tennis': '🏓',
  'lawn-tennis': '🎾',
  chess: '♟️',
}

// Prize data
const prizeData: Record<string, { first: string; second: string }> = {
  cricket: { first: '₹20,000', second: '₹10,000' },
  football: { first: '₹20,000', second: '₹10,000' },
  basketball: { first: '₹12,000', second: '₹6,000' },
  volleyball: { first: '₹10,000', second: '₹5,000' },
  badminton: { first: '₹2,500', second: '₹1,500' },
  'table-tennis': { first: '₹5,000', second: '₹2,500' },
  'lawn-tennis': { first: '₹5,000', second: '₹2,500' },
  chess: { first: '₹3,000', second: '₹1,500' },
}

interface SportCardProps {
  sport: any // TODO: specific type
}

export function SportCard({ sport }: SportCardProps) {
  const slug = sport.slug || sport.name?.toLowerCase().replace(/\s+/g, '-')
  const icon = sportIcons[slug] || '🏆'
  const prizes = prizeData[slug] || { first: 'TBA', second: 'TBA' }
  
  return (
    <Link href={`/sports/${slug}`}>
      <Card className="border-none shadow-md card-hover bg-white group cursor-pointer h-full">
        <CardContent className="p-6">
          {/* Icon & Status */}
          <div className="flex items-start justify-between mb-4">
            <div className="text-5xl">{icon}</div>
            {sport.is_registration_open !== false && (
              <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">
                Open
              </span>
            )}
          </div>
          
          {/* Title */}
          <h3 className="font-heading text-2xl text-[#0e0e0e] mb-2 group-hover:text-[#b20e38] transition-colors">
            {sport.name}
          </h3>
          
          {/* Type */}
          <div className="flex items-center gap-2 text-sm text-[#0e0e0e]/50 mb-4">
            <Users className="w-4 h-4" />
            <span>
              {sport.is_team_event 
                ? `Team (${sport.team_size_min || 5}-${sport.team_size_max || 15} players)` 
                : 'Individual'}
            </span>
          </div>
          
          {/* Fees */}
          {sport.fees && (
            <div className="text-sm text-[#0e0e0e]/60 mb-4">
              Entry Fee: <span className="font-semibold text-[#0e0e0e]">₹{sport.fees}</span>
            </div>
          )}
          
          {/* Prize Money */}
          <div className="border-t border-black/5 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-[#b20e38]" />
              <span className="text-xs font-medium text-[#0e0e0e]/60 uppercase tracking-wide">Prize Money</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#0e0e0e]/50">1st Prize</span>
              <span className="font-semibold text-[#b20e38]">{prizes.first}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-[#0e0e0e]/50">2nd Prize</span>
              <span className="font-semibold text-[#0e0e0e]">{prizes.second}</span>
            </div>
          </div>
          
          {/* CTA */}
          <div className="mt-6">
            <Button 
              className="w-full bg-[#b20e38] hover:bg-[#8a0b2b] text-white font-semibold group-hover:pr-4 transition-all"
            >
              Register Now
              <ArrowRight className="ml-2 h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
