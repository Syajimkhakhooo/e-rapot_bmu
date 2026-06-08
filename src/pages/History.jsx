import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale, ja as jaLocale } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'

export default function History() {
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')

  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          id, action, created_at,
          users (name)
        `)
        .order('created_at', { ascending: false })
        .limit(100)
      if (error) throw error
      return data
    }
  })

  const filtered = activities?.filter(a => 
    a.action?.toLowerCase().includes(search.toLowerCase()) || 
    a.users?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const dateLocaleStr = i18n.language === 'ja' ? jaLocale : idLocale

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="font-headline-lg text-2xl text-on-surface">
            {t('history_activity_title')} <span className="text-on-surface-variant font-normal">/ 履歴</span>
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">{t('history_activity_desc')}</p>
        </div>
      </div>

      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden flex flex-col">
        <div className="p-3 border-b border-outline-variant bg-surface-bright flex justify-between items-center gap-4">
          <div className="relative w-full max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">search</span>
            <input
              type="text"
              placeholder={t('history_search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-md pl-9 pr-3 py-1.5 font-body-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>

        <div className="divide-y divide-outline-variant/50">
          {isLoading ? (
             [1, 2, 3, 4].map(i => (
               <div key={i} className="px-5 py-4 flex gap-4 items-start">
                 <div className="w-8 h-8 rounded shrink-0 shimmer" />
                 <div className="flex-1 space-y-2">
                   <div className="h-4 w-48 rounded shimmer" />
                   <div className="h-3 w-24 rounded shimmer" />
                 </div>
               </div>
             ))
          ) : filtered?.length === 0 ? (
             <div className="py-12 text-center text-on-surface-variant font-body-md text-sm">{t('no_data')}</div>
          ) : (
            filtered?.map(a => (
              <div key={a.id} className="px-5 py-3 hover:bg-surface-variant/30 transition-colors flex gap-4 items-start cursor-default">
                <div className="w-8 h-8 rounded border border-outline-variant/50 bg-surface-variant flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">history</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body-md text-sm text-on-surface">{a.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-body-md text-xs text-on-surface-variant font-medium">{a.users?.name || 'System'}</span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant" />
                    <span className="font-body-md text-xs text-on-surface-variant">
                      {formatDistanceToNow(new Date(a.created_at), { addSuffix: true, locale: dateLocaleStr })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="p-3 border-t border-outline-variant bg-surface-bright flex items-center justify-between">
          <span className="font-body-md text-xs text-on-surface-variant">Showing {filtered?.length || 0} entries</span>
        </div>
      </div>
    </div>
  )
}
