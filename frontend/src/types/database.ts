export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          phone: string
          college: string
          role: 'participant' | 'admin' | 'coordinator'
          avatar_url: string | null
          email_verified: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          phone: string
          college: string
          role?: 'participant' | 'admin' | 'coordinator'
          avatar_url?: string | null
          email_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string
          college?: string
          role?: 'participant' | 'admin' | 'coordinator'
          avatar_url?: string | null
          email_verified?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sports: {
        Row: {
          id: string
          name: string
          slug: string
          sport_code: string
          category: 'indoor' | 'outdoor' | 'esports' | 'athletics'
          description: string | null
          rules: string | null
          image_url: string | null
          is_team_event: boolean
          team_size_min: number
          team_size_max: number
          fees: number
          early_bird_fees: number | null
          early_bird_deadline: string | null
          schedule_start: string | null
          schedule_end: string | null
          venue: string | null
          registration_start: string
          registration_deadline: string
          is_registration_open: boolean
          max_participants: number | null
          current_participants: number
          waitlist_enabled: boolean
          max_waitlist: number
          created_by: string | null
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug?: string
          sport_code: string
          category: 'indoor' | 'outdoor' | 'esports' | 'athletics'
          description?: string | null
          rules?: string | null
          image_url?: string | null
          is_team_event?: boolean
          team_size_min?: number
          team_size_max?: number
          fees: number
          early_bird_fees?: number | null
          early_bird_deadline?: string | null
          schedule_start?: string | null
          schedule_end?: string | null
          venue?: string | null
          registration_start: string
          registration_deadline: string
          is_registration_open?: boolean
          max_participants?: number | null
          current_participants?: number
          waitlist_enabled?: boolean
          max_waitlist?: number
          created_by?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          sport_code?: string
          category?: 'indoor' | 'outdoor' | 'esports' | 'athletics'
          description?: string | null
          rules?: string | null
          image_url?: string | null
          is_team_event?: boolean
          team_size_min?: number
          team_size_max?: number
          fees?: number
          early_bird_fees?: number | null
          early_bird_deadline?: string | null
          schedule_start?: string | null
          schedule_end?: string | null
          venue?: string | null
          registration_start?: string
          registration_deadline?: string
          is_registration_open?: boolean
          max_participants?: number | null
          current_participants?: number
          waitlist_enabled?: boolean
          max_waitlist?: number
          created_by?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      registrations: {
        Row: {
          id: string
          registration_number: string
          participant_id: string
          sport_id: string
          status: 'pending' | 'payment_pending' | 'confirmed' | 'waitlist' | 'cancelled' | 'withdrawn'
          is_team: boolean
          team_name: string | null
          payment_status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          amount_paid: number
          waitlist_position: number | null
          confirmed_at: string | null
          withdrawal_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          registered_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          registration_number?: string
          participant_id: string
          sport_id: string
          status?: 'pending' | 'payment_pending' | 'confirmed' | 'waitlist' | 'cancelled' | 'withdrawn'
          is_team?: boolean
          team_name?: string | null
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          amount_paid?: number
          waitlist_position?: number | null
          confirmed_at?: string | null
          withdrawal_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          registered_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          registration_number?: string
          participant_id?: string
          sport_id?: string
          status?: 'pending' | 'payment_pending' | 'confirmed' | 'waitlist' | 'cancelled' | 'withdrawn'
          is_team?: boolean
          team_name?: string | null
          payment_status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          amount_paid?: number
          waitlist_position?: number | null
          confirmed_at?: string | null
          withdrawal_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          registered_at?: string
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          registration_id: string
          member_order: number
          name: string
          email: string | null
          phone: string | null
          is_captain: boolean
          created_at: string
        }
        Insert: {
          id?: string
          registration_id: string
          member_order: number
          name: string
          email?: string | null
          phone?: string | null
          is_captain?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          registration_id?: string
          member_order?: number
          name?: string
          email?: string | null
          phone?: string | null
          is_captain?: boolean
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          registration_id: string
          user_id: string
          amount: number
          currency: string
          convenience_fee: number
          total_amount: number
          method: 'online' | 'offline' | 'free'
          status: 'pending' | 'processing' | 'success' | 'failed' | 'refunded' | 'partially_refunded'
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          gateway_response: Json | null
          receipt_number: string | null
          receipt_url: string | null
          offline_verified_by: string | null
          offline_verification_note: string | null
          offline_verified_at: string | null
          refund_amount: number | null
          refund_reason: string | null
          refund_id: string | null
          refund_processed_by: string | null
          refund_processed_at: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          registration_id: string
          user_id: string
          amount: number
          currency?: string
          convenience_fee?: number
          total_amount: number
          method: 'online' | 'offline' | 'free'
          status?: 'pending' | 'processing' | 'success' | 'failed' | 'refunded' | 'partially_refunded'
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          gateway_response?: Json | null
          receipt_number?: string | null
          receipt_url?: string | null
          offline_verified_by?: string | null
          offline_verification_note?: string | null
          offline_verified_at?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refund_id?: string | null
          refund_processed_by?: string | null
          refund_processed_at?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          registration_id?: string
          user_id?: string
          amount?: number
          currency?: string
          convenience_fee?: number
          total_amount?: number
          method?: 'online' | 'offline' | 'free'
          status?: 'pending' | 'processing' | 'success' | 'failed' | 'refunded' | 'partially_refunded'
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          gateway_response?: Json | null
          receipt_number?: string | null
          receipt_url?: string | null
          offline_verified_by?: string | null
          offline_verification_note?: string | null
          offline_verified_at?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refund_id?: string | null
          refund_processed_by?: string | null
          refund_processed_at?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          type: 'registration' | 'payment' | 'announcement' | 'reminder' | 'waitlist' | 'cancellation'
          priority: 'low' | 'normal' | 'high' | 'urgent'
          title: string
          message: string
          action_url: string | null
          is_read: boolean
          read_at: string | null
          email_sent: boolean
          email_sent_at: string | null
          related_sport_id: string | null
          related_registration_id: string | null
          metadata: Json | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recipient_id: string
          type: 'registration' | 'payment' | 'announcement' | 'reminder' | 'waitlist' | 'cancellation'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          title: string
          message: string
          action_url?: string | null
          is_read?: boolean
          read_at?: string | null
          email_sent?: boolean
          email_sent_at?: string | null
          related_sport_id?: string | null
          related_registration_id?: string | null
          metadata?: Json | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recipient_id?: string
          type?: 'registration' | 'payment' | 'announcement' | 'reminder' | 'waitlist' | 'cancellation'
          priority?: 'low' | 'normal' | 'high' | 'urgent'
          title?: string
          message?: string
          action_url?: string | null
          is_read?: boolean
          read_at?: string | null
          email_sent?: boolean
          email_sent_at?: string | null
          related_sport_id?: string | null
          related_registration_id?: string | null
          metadata?: Json | null
          expires_at?: string | null
          created_at?: string
        }
      }
      colleges: {
        Row: {
          id: string
          name: string
          short_name: string | null
          city: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          short_name?: string | null
          city?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          short_name?: string | null
          city?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      settings: {
        Row: {
          key: string
          value: Json
          description: string | null
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          key: string
          value: Json
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          key?: string
          value?: Json
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          request_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          request_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          request_id?: string | null
          created_at?: string
        }
      }
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Sport = Database['public']['Tables']['sports']['Row']
export type Registration = Database['public']['Tables']['registrations']['Row']
export type TeamMember = Database['public']['Tables']['team_members']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type College = Database['public']['Tables']['colleges']['Row']
export type Setting = Database['public']['Tables']['settings']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']

// Extended types for API responses
export type SportWithDetails = Sport & {
  applicable_fees: number
  can_register: boolean
  register_reason: string
  waitlist_available: boolean
  spots_remaining: number | null
}

export type RegistrationWithDetails = Registration & {
  sport: Sport
  team_members: TeamMember[]
  payments: Payment[]
  participant?: Profile
}

export type ProfileWithSummary = Profile & {
  registrations_count: number
  unread_notifications: number
}
