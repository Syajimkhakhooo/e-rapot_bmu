import { useState, useEffect } from 'react'
import { supabase } from '@/config/supabase'

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*, users(name)')
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) {
        setNotifications(data)
      }
    }
    
    fetchNotifications()

    // Retrieve unread count from localStorage or calculate it
    const lastRead = localStorage.getItem('last_notification_read')
    // We'll rely on the real-time subscription to increment unread count for simplicity,
    // or calculate based on lastRead timestamp if we wanted perfectly accurate numbers on reload.
  }, [])

  // Subscribe to real-time changes
  useEffect(() => {
    const channel = supabase
      .channel('activity-log-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_logs',
        },
        async (payload) => {
          // Fetch user name for the new log
          let userName = 'System'
          if (payload.new.user_id) {
            const { data } = await supabase
              .from('users')
              .select('name')
              .eq('id', payload.new.user_id)
              .single()
            if (data?.name) userName = data.name
          }

          const newNotification = {
            ...payload.new,
            users: { name: userName }
          }

          setNotifications(prev => [newNotification, ...prev].slice(0, 10))
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const markAllAsRead = () => {
    setUnreadCount(0)
    localStorage.setItem('last_notification_read', new Date().toISOString())
  }

  return {
    notifications,
    unreadCount,
    markAllAsRead
  }
}
