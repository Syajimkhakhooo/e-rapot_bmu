import { create } from 'zustand'
import { supabase } from '@/config/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  session: null,
  isLoading: true,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  
  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      set({ session })
      if (session?.user) {
        // Fetch extended user info (role, name) from public.users table
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        set({ user: { ...session.user, ...profile } })
      } else {
        set({ user: null })
      }
    } catch (error) {
      console.error('Error getting session:', error)
      set({ user: null, session: null })
    } finally {
      set({ isLoading: false })
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      set({ session })
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
          
        set({ user: { ...session.user, ...profile } })
      } else {
        set({ user: null })
      }
    })
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null })
  }
}))
