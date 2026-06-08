import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Fetch total students
      const { count: totalStudents, error: err1 } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)

      // Fetch active classes
      const { count: activeClasses, error: err2 } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)

      // Fetch total reports
      const { count: totalReports, error: err3 } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .is('deleted_at', null)

      // Fetch total users
      const { count: totalUsers, error: err4 } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      if (err1 || err2 || err3 || err4) {
        throw new Error('Failed to fetch dashboard stats')
      }

      // Fetch recent activities
      const { data: recentActivities, error: err5 } = await supabase
        .from('activity_logs')
        .select('*, users(name)')
        .order('created_at', { ascending: false })
        .limit(5)

      return {
        totalStudents: totalStudents || 0,
        activeClasses: activeClasses || 0,
        totalReports: totalReports || 0,
        totalUsers: totalUsers || 0,
        recentActivities: recentActivities || []
      }
    }
  })
}
