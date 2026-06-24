import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { id as idLocale, ja as jaLocale } from 'date-fns/locale'

export default function Reports() {
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation()
  const [search, setSearch] = useState('')
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingReport, setDeletingReport] = useState(null)

  const { data: reports, isLoading } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id, period_start, period_end, created_at,
          students (full_name, student_id, classes(name))
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  const deleteReportMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('reports').update({ deleted_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reports'])
      queryClient.invalidateQueries(['dashboard-stats'])
      toast.success(t('reports_success_delete'))
    },
    onError: (e) => toast.error(e.message),
  })

  const openDelete = (r) => {
    setDeletingReport(r)
    setIsDeleteOpen(true)
  }

  const filtered = (reports || []).filter(r => 
    r.students?.full_name?.toLowerCase()?.includes(search.toLowerCase()) || 
    r.students?.student_id?.toLowerCase()?.includes(search.toLowerCase())
  )

  const dateLocaleStr = i18n.language === 'ja' ? 'ja-JP' : 'id-ID'

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="font-headline-lg text-2xl text-on-surface">
            {t('reports_title')} <span className="text-on-surface-variant font-normal">/ レポート</span>
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">{t('reports_desc')}</p>
        </div>
        <Link 
          to="/reports/create" 
          className="bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md text-sm px-4 py-2 rounded-md flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          {t('reports_create')}
        </Link>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm w-[95vw] sm:w-full rounded-lg bg-surface border-outline-variant shadow-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-title-lg text-on-surface">{t('reports_delete_confirm')}</DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <p className="font-body-md text-sm text-on-surface-variant">
              {t('reports_delete_msg')} <strong>{deletingReport?.students?.full_name}</strong>
            </p>
            <div className="pt-6 flex justify-end gap-2">
              <button onClick={() => setIsDeleteOpen(false)} className="bg-surface-variant text-on-surface-variant hover:bg-outline-variant transition-colors font-label-md text-sm h-9 px-4 rounded-md">
                {t('cancel')}
              </button>
              <button 
                onClick={() => { 
                  deleteReportMutation.mutate(deletingReport.id); 
                  setIsDeleteOpen(false); 
                }} 
                className="bg-error text-on-error hover:bg-error/90 transition-colors font-label-md text-sm h-9 px-4 rounded-md flex items-center justify-center"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden flex flex-col">
        <div className="p-3 border-b border-outline-variant bg-surface-bright flex justify-between items-center gap-4">
          <div className="relative w-full max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">search</span>
            <input
              type="text"
              placeholder={t('students_search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-md pl-9 pr-3 py-1.5 font-body-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
            />
          </div>
          <button className="border border-outline-variant hover:bg-surface-variant text-on-surface-variant transition-colors font-label-md text-xs px-3 py-1.5 rounded-md flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            {t('students_filter')}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-bright border-b border-outline-variant">
                <th className="px-5 py-3 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">{t('reports_student')}</th>
                <th className="px-5 py-3 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">{t('students_class')}</th>
                <th className="px-5 py-3 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">{t('reports_period')}</th>
                <th className="px-5 py-3 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">{t('classes_created')}</th>
                <th className="px-5 py-3 font-label-md text-xs text-on-surface-variant uppercase tracking-wider text-right">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-outline-variant/50">
              {isLoading ? (
                 <tr><td colSpan={5} className="px-5 py-8 text-center text-on-surface-variant font-body-md text-sm">{t('loading')}</td></tr>
              ) : filtered?.length === 0 ? (
                 <tr><td colSpan={5} className="px-5 py-8 text-center text-on-surface-variant font-body-md text-sm">{t('no_data')}</td></tr>
              ) : (
                filtered?.map(r => (
                  <tr key={r.id} className="hover:bg-surface-variant/30 transition-colors group cursor-default">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded border border-outline-variant/50 bg-surface-variant flex items-center justify-center text-on-surface-variant font-label-md text-xs shrink-0">
                          {r.students?.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-body-md text-sm font-medium text-on-surface">{r.students?.full_name}</span>
                          <span className="font-body-md text-xs text-on-surface-variant mt-0.5">{r.students?.student_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-body-md text-sm text-on-surface-variant">{r.students?.classes?.name}</td>
                    <td className="px-5 py-3">
                      <span className="font-body-md text-sm text-on-surface">
                        {r.period_start ? new Date(r.period_start).toLocaleDateString(dateLocaleStr, { month: 'short', year: 'numeric' }) : '-'} 
                        {' - '} 
                        {r.period_end ? new Date(r.period_end).toLocaleDateString(dateLocaleStr, { month: 'short', year: 'numeric' }) : '-'}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-body-md text-sm text-on-surface-variant">
                      {new Date(r.created_at).toLocaleDateString(dateLocaleStr, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-on-surface-variant hover:text-on-surface transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-surface-variant">
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-surface border-outline-variant shadow-md min-w-[140px] rounded-md">
                          <DropdownMenuItem asChild>
                            <Link to={`/reports/${r.id}/edit`} className="font-body-md text-sm py-2 cursor-pointer gap-2 w-full flex items-center">
                              <span className="material-symbols-outlined text-[16px]">edit</span> {t('reports_edit')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/reports/${r.id}/print`} className="font-body-md text-sm py-2 cursor-pointer gap-2 w-full flex items-center">
                              <span className="material-symbols-outlined text-[16px]">print</span> {t('print')}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDelete(r)} className="font-body-md text-sm py-2 cursor-pointer text-error gap-2">
                            <span className="material-symbols-outlined text-[16px]">delete</span> {t('delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-3 border-t border-outline-variant bg-surface-bright flex items-center justify-between">
          <span className="font-body-md text-xs text-on-surface-variant">Showing {filtered?.length || 0} entries</span>
        </div>
      </div>
    </div>
  )
}
