'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

// Export the Sport interface for use in other components
export interface Sport {
  id: string;
  name: string;
  slug?: string;
  sport_code?: string;
  category?: 'indoor' | 'outdoor' | 'esports' | 'athletics';
  description?: string | null;
  rules?: string | null;
  image_url?: string | null;
  icon?: string;
  is_team_sport?: boolean;
  is_team_event?: boolean;
  team_size_min?: number;
  team_size_max?: number;
  max_team_size?: number;
  fees?: number;
  registration_fee?: number;
  early_bird_fees?: number | null;
  early_bird_deadline?: string | null;
  schedule_start?: string | null;
  schedule_end?: string | null;
  venue?: string | null;
  registration_start?: string;
  registration_deadline?: string;
  is_registration_open?: boolean;
  max_participants?: number | null;
  current_participants?: number;
  waitlist_enabled?: boolean;
}

// Sport color mappings
export const sportColorMap: { [key: string]: string } = {
  'Cricket': '#22c55e',
  'Football': '#3b82f6',
  'Basketball': '#f97316',
  'Volleyball': '#eab308',
  'Badminton': '#06b6d4',
  'E-Sports': '#8b5cf6',
  'Table Tennis': '#ec4899',
  'Chess': '#a855f7',
  'Athletics': '#ef4444',
  'Swimming': '#14b8a6',
  'Kabaddi': '#f97316',
  'Kho Kho': '#84cc16',
};

export interface SportsContextType {
  sports: Sport[];
  loading: boolean;
  error: string | null;
  sportColors: { [key: string]: string };
  fetchSports: (params?: FetchSportsParams) => Promise<void>;
  getSport: (slugOrId: string) => Sport | null;
  refreshSports: () => Promise<void>;
}

interface FetchSportsParams {
  category?: string;
  is_open?: boolean;
  search?: string;
  sort?: string;
}

const SportsContext = createContext<SportsContextType | undefined>(undefined);

export function SportsProvider({ children }: { children: ReactNode }) {
  const [sports, setSports] = useState<Sport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSports = useCallback(async (params?: FetchSportsParams) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('sports')
        .select('*');

      if (params?.category) {
        query = query.eq('category', params.category);
      }

      if (params?.is_open) {
        query = query.eq('is_registration_open', true);
      }

      if (params?.search) {
        query = query.ilike('name', `%${params.search}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setSports(data as Sport[]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to fetch sports';
      setError(errorMsg);
      console.error('Error fetching sports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Synchronous getSport that searches existing sports array
  const getSport = useCallback((slugOrId: string): Sport | null => {
    const found = sports.find(s => 
      s.id === slugOrId || 
      s.slug === slugOrId || 
      s.name.toLowerCase() === slugOrId.toLowerCase()
    );
    return found || null;
  }, [sports]);

  const refreshSports = useCallback(async () => {
    await fetchSports();
  }, [fetchSports]);

  return (
    <SportsContext.Provider
      value={{
        sports,
        loading,
        error,
        sportColors: sportColorMap,
        fetchSports,
        getSport,
        refreshSports,
      }}
    >
      {children}
    </SportsContext.Provider>
  );
}

export function useSports() {
  const context = useContext(SportsContext);
  if (context === undefined) {
    throw new Error('useSports must be used within a SportsProvider');
  }
  return context;
}

// Sport color and gradient mappings
export const sportColors: Record<string, { color: string; gradient: string; bgClass: string }> = {
  cricket: { color: '#22c55e', gradient: 'var(--gradient-cricket)', bgClass: 'cricket' },
  football: { color: '#3b82f6', gradient: 'var(--gradient-football)', bgClass: 'football' },
  basketball: { color: '#f97316', gradient: 'var(--gradient-basketball)', bgClass: 'basketball' },
  volleyball: { color: '#eab308', gradient: 'var(--gradient-volleyball)', bgClass: 'volleyball' },
  badminton: { color: '#06b6d4', gradient: 'var(--gradient-badminton)', bgClass: 'badminton' },
  'table tennis': { color: '#06b6d4', gradient: 'var(--gradient-badminton)', bgClass: 'badminton' },
  chess: { color: '#6b7280', gradient: 'var(--gradient-chess)', bgClass: 'chess' },
  valorant: { color: '#8b5cf6', gradient: 'var(--gradient-esports)', bgClass: 'esports' },
  esports: { color: '#8b5cf6', gradient: 'var(--gradient-esports)', bgClass: 'esports' },
  athletics: { color: '#ef4444', gradient: 'var(--gradient-athletics)', bgClass: 'athletics' },
  '100m sprint': { color: '#ef4444', gradient: 'var(--gradient-athletics)', bgClass: 'athletics' },
  'long jump': { color: '#ef4444', gradient: 'var(--gradient-athletics)', bgClass: 'athletics' },
};

export function getSportStyle(sportName: string) {
  const key = sportName.toLowerCase();
  return sportColors[key] || { color: '#b20e38', gradient: 'var(--gradient-athletics)', bgClass: 'athletics' };
}
