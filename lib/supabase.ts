import { createClient as createSupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client (singleton pattern)
let supabaseClient: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient(supabaseUrl, supabaseAnonKey)
  }
  return supabaseClient
}

// Export the client instance for convenience
export const supabase = createClient()

export type Player = {
  id: number
  name: string
  position: string
  overall_rating: number
  stamina: number
  shooting: number
  passing: number
  pace: number
  team: string
  created_at: string
  updated_at: string
}

export type Match = {
  id: number
  match_date: string
  team_a_name: string
  team_b_name: string
  team_a_score: number
  team_b_score: number
  location: string
  duration_minutes: number
  notes: string
  created_at: string
  updated_at: string
}

export type MatchPlayerRating = {
  id: number
  match_id: number
  player_id: number
  team_name: string
  position_played: string
  rating: number
  goals: number
  assists: number
  minutes_played: number
  created_at: string
}
