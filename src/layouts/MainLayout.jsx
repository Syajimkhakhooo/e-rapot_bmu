import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { cn } from '@/lib/utils'

export default function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex bg-background min-h-screen text-on-surface selection:bg-primary selection:text-on-primary overflow-hidden">
      {/* Desktop Sidebar (Fixed) */}
      <div className="hidden md:block">
        <Sidebar 
          isCollapsed={isDesktopCollapsed} 
          onToggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
        />
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:hidden shadow-2xl",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar className="w-full" onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 flex flex-col min-w-0 relative h-screen overflow-y-auto transition-all duration-300 ease-in-out",
        isDesktopCollapsed ? "md:ml-[72px]" : "md:ml-64"
      )}>
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        
        {/* Canvas */}
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
