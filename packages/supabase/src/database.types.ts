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
      accounts: {
        Row: {
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          name: string
          picture_url: string | null
          public_data: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          picture_url?: string | null
          public_data?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          picture_url?: string | null
          public_data?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          bio: string | null
          website: string | null
          location: string | null
          job_title: string | null
          social_links: Json | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          bio?: string | null
          website?: string | null
          location?: string | null
          job_title?: string | null
          social_links?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          bio?: string | null
          website?: string | null
          location?: string | null
          job_title?: string | null
          social_links?: Json | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      posts: {
        Row: {
          id: string
          title: string
          body: string
          created_at: string
          updated_at: string | null
          published: boolean
          user_id: string
          profile_id: string | null
        }
        Insert: {
          id?: string
          title: string
          body: string
          created_at?: string
          updated_at?: string | null
          published?: boolean
          user_id: string
          profile_id?: string | null
        }
        Update: {
          id?: string
          title?: string
          body?: string
          created_at?: string
          updated_at?: string | null
          published?: boolean
          user_id?: string
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
