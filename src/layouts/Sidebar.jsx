import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'
import { useTranslation } from 'react-i18next'

const navItems = [
  { tKey: 'menu_dashboard',     href: '/',             icon: 'dashboard' },
  { tKey: 'menu_users',         href: '/users',        icon: 'group',           role: 'super_admin' },
  { tKey: 'menu_classes',       href: '/classes',      icon: 'class',           role: 'admin' },
  { tKey: 'menu_students',      href: '/students',     icon: 'school',          role: 'admin' },
  { tKey: 'menu_reports',       href: '/reports',      icon: 'assessment' },
  { tKey: 'menu_class_reports', href: '/class-reports',icon: 'folder_open' },
  { tKey: 'menu_history',       href: '/history',      icon: 'history' },
  { tKey: 'menu_signatories',   href: '/signatories',  icon: 'history_edu',     role: 'admin' },
]

export default function Sidebar({ className, onClose, isCollapsed, onToggleCollapse }) {
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { t } = useTranslation()

  const filteredNav = navItems.filter(item => {
    if (!item.role) return true
    if (!user) return false
    if (user.role === 'super_admin') return true
    if (user.role === 'admin' && item.role !== 'super_admin') return true
    return false
  })

  return (
    <nav className={cn(
      "h-screen fixed left-0 top-0 flex flex-col bg-surface border-r border-outline-variant z-40 transition-all duration-300",
      isCollapsed ? "w-[72px]" : "w-64",
      className
    )}>
      
      {/* Brand Header */}
      <div 
        onClick={onToggleCollapse}
        className={cn(
          "h-[72px] min-h-[72px] max-h-[72px] flex items-center shrink-0 border-b border-outline-variant/50 overflow-hidden box-border cursor-pointer hover:bg-surface-variant/50 transition-colors",
          isCollapsed ? "justify-center px-0" : "gap-3 px-6"
        )}
        title="Toggle Sidebar"
      >
        <div className="w-8 h-8 rounded flex items-center justify-center shrink-0">
          <img src="/logo-rapot.png" alt="BMU Logo" className="w-full h-full object-contain" />
        </div>
        {!isCollapsed && (
          <div className="min-w-0 animate-fade-in">
            <h1 className="font-title-lg text-[15px] text-on-surface tracking-tight leading-none whitespace-nowrap">
              E-RAPOT BMU
            </h1>
            <p className="font-label-md text-[10px] text-on-surface-variant mt-1 uppercase tracking-wider whitespace-nowrap">
              Language Center
            </p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 flex flex-col mt-4 px-3 gap-0.5 overflow-y-auto overflow-x-hidden">
        {filteredNav.map(item => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.tKey}
              to={item.href}
              onClick={onClose}
              title={isCollapsed ? t(item.tKey) : undefined}
              className={cn(
                "flex items-center transition-all whitespace-nowrap",
                isCollapsed ? "justify-center w-11 h-11 mx-auto rounded-full" : "py-2.5 px-3 gap-3 rounded-md",
                isActive 
                  ? "text-primary bg-primary-container font-medium"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant"
              )}
            >
              <span 
                className="material-symbols-outlined shrink-0 text-[20px]" 
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className="font-label-md text-sm animate-fade-in">{t(item.tKey)}</span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Logout button at bottom */}
      <div className="p-4 border-t border-outline-variant/50 mt-auto">
        <button
          onClick={logout}
          title={isCollapsed ? t('logout') : undefined}
          className={cn(
            "text-on-surface-variant hover:text-error hover:bg-error-container transition-colors flex items-center",
            isCollapsed ? "justify-center w-11 h-11 mx-auto rounded-full" : "w-full py-2.5 px-3 gap-3 rounded-md"
          )}
        >
          <span className="material-symbols-outlined shrink-0 text-[20px]">logout</span>
          {!isCollapsed && (
            <span className="font-label-md text-sm whitespace-nowrap animate-fade-in">{t('logout')}</span>
          )}
        </button>
      </div>

    </nav>
  )
}
