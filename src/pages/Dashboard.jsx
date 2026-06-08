import { useDashboardStats } from '@/hooks/useDashboardStats'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale, ja as jaLocale } from 'date-fns/locale'
import { useAuthStore } from '@/store/useAuthStore'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

const statCards = [
  {
    tKey: 'dash_total_students',
    valueKey: 'totalStudents',
    icon: 'school',
    link: '/students',
  },
  {
    tKey: 'dash_active_classes',
    valueKey: 'activeClasses',
    icon: 'class',
    link: '/classes',
  },
  {
    tKey: 'dash_reports_generated',
    valueKey: 'totalReports',
    icon: 'assessment',
    link: '/reports',
  },
  {
    tKey: 'menu_users',
    valueKey: 'totalUsers',
    icon: 'group',
    link: '/users',
  },
]

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats()
  const { user } = useAuthStore()
  const { t, i18n } = useTranslation()

  const firstName = user?.name?.split(' ')[0] || 'Admin'
  const dateLocale = i18n.language === 'ja' ? jaLocale : idLocale

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="font-headline-lg text-2xl text-on-surface">
            {t('dash_title')}
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">
            {t('dash_welcome', { name: firstName })} {t('dash_subtitle')}
          </p>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map(card => {
          const value = stats?.[card.valueKey]
          return (
            <Link 
              to={card.link} 
              key={card.tKey} 
              className="bg-surface border border-outline-variant rounded-lg p-5 hover:border-outline hover:shadow-sm transition-all group flex flex-col justify-between h-32"
            >
              <div className="flex items-start justify-between">
                <div className="w-8 h-8 rounded-md flex items-center justify-center bg-surface-variant text-on-surface">
                  <span className="material-symbols-outlined text-[18px]">{card.icon}</span>
                </div>
                <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors text-[18px]">
                  arrow_outward
                </span>
              </div>

              <div>
                {isLoading ? (
                  <div className="h-7 w-12 shimmer rounded mt-2" />
                ) : (
                  <p className="font-title-lg text-2xl text-on-surface leading-none mb-1">
                    {value ?? '—'}
                  </p>
                )}
                <p className="font-body-md text-xs text-on-surface-variant">
                  {t(card.tKey)}
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* ── Recent Activity ── */}
      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 md:px-5 border-b border-outline-variant bg-surface-bright flex items-center justify-between">
          <h3 className="font-title-lg text-sm text-on-surface">{t('dash_recent_activity')}</h3>
          <Link
            to="/reports"
            className="text-on-surface-variant hover:text-primary font-body-md text-xs flex items-center gap-1 transition-colors"
          >
            {t('dash_view_all')}
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {/* List */}
        <div className="divide-y divide-outline-variant">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="w-8 h-8 rounded-full shimmer shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 shimmer rounded" />
                  <div className="h-3 w-24 shimmer rounded" />
                </div>
              </div>
            ))
          ) : stats?.recentActivities?.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center">
              <span className="material-symbols-outlined text-[32px] text-outline-variant mb-3">
                history
              </span>
              <p className="font-body-md text-sm text-on-surface-variant">{t('dash_no_activity')}</p>
            </div>
          ) : (
            stats?.recentActivities?.map((activity, i) => (
              <div
                key={activity.id}
                className="flex items-center gap-4 px-5 py-3 hover:bg-surface-variant/50 transition-colors cursor-default"
              >
                {/* Avatar Initial */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-label-md text-xs bg-primary-container text-primary">
                  {activity.users?.name?.charAt(0).toUpperCase() || 'U'}
                </div>

                <div className="flex-1 min-w-0 flex items-center justify-between">
                  <div>
                    <p className="font-body-md text-sm font-medium text-on-surface truncate">{activity.action}</p>
                    <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                      {activity.users?.name || 'System User'}
                    </p>
                  </div>
                  <span className="font-body-md text-xs text-on-surface-variant whitespace-nowrap pl-2">
                    {formatDistanceToNow(new Date(activity.created_at), {
                      addSuffix: true,
                      locale: dateLocale,
                    })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
