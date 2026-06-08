import { useAuthStore } from '@/store/useAuthStore'
import { useTranslation } from 'react-i18next'
import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { id as idLocale, ja as jaLocale } from 'date-fns/locale'
import { useNotifications } from '@/hooks/useNotifications'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const routeKeys = {
  '/': 'menu_dashboard',
  '/users': 'menu_users',
  '/classes': 'menu_classes',
  '/students': 'menu_students',
  '/reports': 'menu_reports',
  '/class-reports': 'menu_class_reports',
  '/history': 'menu_history',
  '/signatories': 'menu_signatories',
}

export default function Topbar({ onMenuClick }) {
  const { user } = useAuthStore()
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const { notifications, unreadCount, markAllAsRead } = useNotifications()

  const currentLabel = routeKeys[location.pathname] ? t(routeKeys[location.pathname]) : 'E-RAPOT BMU'
  const switchLang = (lang) => i18n.changeLanguage(lang)
  
  const dateLocale = i18n.language === 'ja' ? jaLocale : idLocale

  return (
    <header className={cn(
      "flex justify-between items-center h-[72px] min-h-[72px] max-h-[72px] px-4 md:px-8 bg-surface/90 backdrop-blur-md sticky top-0 border-b border-outline-variant z-30 transition-all duration-300 box-border"
    )}>
      
      <div className="flex items-center gap-3 md:gap-4">
        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-on-surface-variant hover:text-on-surface transition-colors flex items-center"
          onClick={onMenuClick}
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <div className="flex items-center text-sm font-medium text-on-surface-variant">
          <span className="hidden md:inline-block">E-RAPOT</span>
          <span className="hidden md:inline-block mx-2 text-outline-variant">/</span>
          <span className="text-on-surface font-semibold">{currentLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Notification Bell */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-on-surface-variant hover:text-on-surface w-8 h-8 rounded-full hover:bg-surface-variant transition-colors flex items-center justify-center relative outline-none">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-surface border-outline-variant rounded-md shadow-sm">
            <div className="px-4 py-3 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-label-md text-sm text-on-surface font-semibold">{t('notif_title')}</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-primary text-xs hover:underline focus:outline-none">
                  {t('notif_mark_read')}
                </button>
              )}
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-on-surface-variant font-body-md text-sm">
                  {t('notif_empty')}
                </div>
              ) : (
                notifications.map((notif) => (
                  <DropdownMenuItem key={notif.id} className="p-4 cursor-pointer hover:bg-surface-variant/50 border-b border-outline-variant/50 focus:bg-surface-variant/50 outline-none">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-container text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[16px]">notifications_active</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-label-md text-sm text-on-surface truncate">{notif.action}</p>
                        <p className="font-body-md text-xs text-on-surface-variant line-clamp-1 mt-0.5">{notif.users?.name || 'System User'}</p>
                        <p className="font-body-md text-[10px] text-on-surface-variant mt-1">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: dateLocale })}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </div>
            <div className="p-2 border-t border-outline-variant text-center">
              <button className="text-primary font-label-md text-xs hover:underline w-full py-1 focus:outline-none">{t('notif_view_all')}</button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-on-surface-variant hover:text-on-surface font-label-md text-xs px-2 py-1.5 rounded-md hover:bg-surface-variant transition-colors outline-none flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">translate</span>
              {i18n.language === 'ja' ? 'JP' : 'ID'}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32 bg-surface border-outline-variant rounded-md shadow-sm">
            <DropdownMenuItem onClick={() => switchLang('id')} className="cursor-pointer font-body-md text-sm text-on-surface focus:bg-surface-variant">
              Indonesia (ID)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => switchLang('ja')} className="cursor-pointer font-body-md text-sm text-on-surface focus:bg-surface-variant">
              日本語 (JP)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="w-[1px] h-4 bg-outline-variant mx-1" />

        {/* User Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-7 h-7 rounded-full bg-primary-container border border-outline-variant flex items-center justify-center text-primary font-label-md text-xs hover:ring-2 ring-primary/20 transition-all outline-none">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-surface border-outline-variant rounded-md shadow-sm">
            <div className="px-3 py-2 border-b border-outline-variant">
              <p className="font-label-md text-sm text-on-surface truncate">{user?.name}</p>
              <p className="font-body-md text-xs text-on-surface-variant truncate">{user?.email}</p>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
