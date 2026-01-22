export interface Sport {
  id: string
  name: string
  slug: string
  description?: string
  rules?: string
  category: string
  is_team_event: boolean
  team_size_min?: number
  team_size_max?: number
  fees: number
  is_registration_open: boolean
  registration_deadline?: string
  schedule_start?: string
  venue?: string
  spots_total?: number
  spots_remaining?: number
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  phone?: string
  college?: string
  user_metadata?: {
    name?: string
    college?: string
  }
}

export interface TeamMember {
  name: string
  email?: string
  phone?: string
  is_captain: boolean
}

export interface Registration {
  id: string
  registration_number: string
  user_id: string
  sport_id: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'payment_pending' | 'waitlist'
  is_team_event: boolean
  team_name?: string
  amount_paid: number
  created_at: string
  sport?: Sport
  user?: UserProfile
  team_members?: TeamMember[]
}

export interface AdminStats {
  total_revenue: number
  total_registrations: number
  active_sports: number
  colleges_count: number
}

export interface RecentRegistration {
  id: string
  created_at: string
  user: {
     full_name: string
     email: string
  }
  sport: {
     name: string
  }
  status: string
  amount_paid: number
}
