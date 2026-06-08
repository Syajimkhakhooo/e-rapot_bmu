import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function ClassReports() {
  const { t } = useTranslation()

  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes_with_reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          id, name,
          students (
            id,
            reports (id)
          )
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="font-headline-lg text-2xl text-on-surface">
            {t('creports_title')} <span className="text-on-surface-variant font-normal">/ クラスレポート</span>
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">{t('creports_desc')}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 rounded-lg shimmer" />)
        ) : classes?.length === 0 ? (
          <div className="col-span-full bg-surface border border-outline-variant rounded-lg py-12 text-center text-on-surface-variant font-body-md text-sm">
            {t('creports_no_class')}
          </div>
        ) : (
          classes?.map((c) => {
            const studentCount = c.students?.length || 0
            const totalReports = c.students?.reduce((acc, curr) => acc + (curr.reports?.length || 0), 0) || 0

            return (
              <Link to={`/class-reports/${c.id}`} key={c.id} className="group bg-surface border border-outline-variant rounded-lg p-5 hover:shadow-sm hover:border-outline transition-all flex flex-col justify-between h-32">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded border border-outline-variant/50 bg-surface-variant flex items-center justify-center text-on-surface-variant shrink-0">
                      <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>folder_open</span>
                    </div>
                    <h3 className="font-title-lg text-lg text-on-surface leading-tight">{c.name}</h3>
                  </div>
                  <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors text-[20px]">
                    arrow_outward
                  </span>
                </div>
                
                <div className="flex items-center justify-between border-t border-outline-variant/50 pt-3 mt-4">
                  <div className="flex flex-col">
                    <span className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">{t('menu_students')}</span>
                    <span className="font-body-md font-medium text-on-surface">{studentCount}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">{t('dash_reports_generated')}</span>
                    <span className="font-body-md font-medium text-primary">{totalReports}</span>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
