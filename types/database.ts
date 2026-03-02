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
                    full_name: string | null
                    age: number | null
                    gender: string | null
                    categories: string[] | null
                    bio_raw: string | null
                    bio_summary: string | null
                    avatar_url: string | null
                    is_onboarded: boolean
                    created_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    age?: number | null
                    gender?: string | null
                    categories?: string[] | null
                    bio_raw?: string | null
                    bio_summary?: string | null
                    avatar_url?: string | null
                    is_onboarded?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    age?: number | null
                    gender?: string | null
                    categories?: string[] | null
                    bio_raw?: string | null
                    bio_summary?: string | null
                    avatar_url?: string | null
                    is_onboarded?: boolean
                    created_at?: string
                }
            }
            ideas: {
                Row: {
                    id: string
                    owner_id: string
                    title: string
                    description: string
                    needed_skills: string[] | null
                    is_active: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    owner_id: string
                    title: string
                    description: string
                    needed_skills?: string[] | null
                    is_active?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string
                    title?: string
                    description?: string
                    needed_skills?: string[] | null
                    is_active?: boolean
                    created_at?: string
                }
            }
            applications: {
                Row: {
                    id: string
                    idea_id: string
                    applicant_id: string
                    message: string
                    status: 'pending' | 'accepted' | 'rejected'
                    created_at: string
                }
                Insert: {
                    id?: string
                    idea_id: string
                    applicant_id: string
                    message: string
                    status?: 'pending' | 'accepted' | 'rejected'
                    created_at?: string
                }
                Update: {
                    id?: string
                    idea_id?: string
                    applicant_id?: string
                    message?: string
                    status?: 'pending' | 'accepted' | 'rejected'
                    created_at?: string
                }
            }
            messages: {
                Row: {
                    id: string
                    idea_id: string
                    sender_id: string
                    content: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    idea_id: string
                    sender_id: string
                    content: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    idea_id?: string
                    sender_id?: string
                    content?: string
                    created_at?: string
                }
            }
        }
    }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Idea = Database['public']['Tables']['ideas']['Row']
export type Application = Database['public']['Tables']['applications']['Row']
export type Message = Database['public']['Tables']['messages']['Row']

export type IdeaWithOwner = Idea & {
    profiles: Profile
}

export type ApplicationWithDetails = Application & {
    profiles: Profile
    ideas: Idea
}

export type MessageWithSender = Message & {
    profiles: Profile
}
