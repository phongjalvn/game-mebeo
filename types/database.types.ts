export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      configs: {
        Row: {
          id: number
          created_at: string | null
          time: number | null
          maxGame: number | null
          detectionThreshold: number | null
        }
        Insert: {
          id?: number
          created_at?: string | null
          time?: number | null
          maxGame?: number | null
          detectionThreshold?: number | null
        }
        Update: {
          id?: number
          created_at?: string | null
          time?: number | null
          maxGame?: number | null
          detectionThreshold?: number | null
        }
      }
      playersData: {
        Row: {
          id: number
          created_at: string | null
          userName: string | null
          score: number | null
          imagesData: Json | null
          mode: string
          time: number | null
        }
        Insert: {
          id?: number
          created_at?: string | null
          userName?: string | null
          score?: number | null
          imagesData?: Json | null
          mode: string
          time?: number | null
        }
        Update: {
          id?: number
          created_at?: string | null
          userName?: string | null
          score?: number | null
          imagesData?: Json | null
          mode?: string
          time?: number | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
