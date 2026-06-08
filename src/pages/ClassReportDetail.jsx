import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { Printer, Edit, ChevronLeft, MoreVertical, ArchiveRestore, FileText, Calendar } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

const behaviorStyle = (b) => {
  if (b === 'A') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (b === 'B') return 'bg-blue-50 text-blue-700 border-blue-200'
  if (b === 'C') return 'bg-amber-50 text-amber-700 border-amber-200'
  if (b === 'D') return 'bg-red-50 text-red-700 border-red-200'
  return 'bg-slate-50 text-slate-600 border-slate-200'
}

export default function ClassReportDetail() {
  const { classId } = useParams()
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { data: classInfo } = useQuery({
    queryKey: ['class', classId],
    queryFn: async () => {
      const { data, error } = await supabase.from('classes').select('*').eq('id', classId).single()
      if (error) throw error
      return data
    }
  })

  const { data: reports, isLoading } = useQuery({
    queryKey: ['class-reports', classId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*, students!inner(full_name, japanese_name, class_id)')
        .eq('students.class_id', classId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    }
  })

  const dateLocaleStr = i18n.language === 'ja' ? 'ja-JP' : 'id-ID'

  const softDeleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('reports').update({ deleted_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['class-reports', classId])
      toast.success(t('reports_success_delete'))
    },
    onError: (e) => toast.error(e.message),
  })

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/class-reports"
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 hover:text-primary hover:border-primary/30 transition-all shadow-sm"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-800">
              {t('creports_detail_title')}
            </h2>
            <span className="text-xl font-extrabold text-primary">{classInfo?.name}</span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{t('creports_detail_desc')}</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-white border border-slate-200/80 rounded-xl px-4 py-2.5 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">{t('dash_reports_generated')}</p>
            <p className="text-lg font-extrabold text-primary leading-none">{reports?.length ?? '—'}</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[580px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {[t('reports_student'), t('reports_period'), t('reports_behavior'), t('status'), ''].map((h, i) => (
                  <th key={i} className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                [1,2,3].map(i => <tr key={i}>{[1,2,3,4,5].map(j => <td key={j} className="px-5 py-4"><div className="h-4 rounded shimmer w-24"/></td>)}</tr>)
              ) : reports?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16">
                    <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">{t('no_data')}</p>
                  </td>
                </tr>
              ) : (
                reports?.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-sm text-slate-800">{r.students?.full_name}</p>
                      <p className="text-xs text-slate-400">{r.students?.japanese_name}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(r.period_start).toLocaleDateString(dateLocaleStr, { day: '2-digit', month: 'short' })} –{' '}
                        {new Date(r.period_end).toLocaleDateString(dateLocaleStr, { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${behaviorStyle(r.behavior)}`}>
                        {r.behavior}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {t('creports_generated')}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/reports/${r.id}/print`}><Printer className="w-4 h-4 mr-2" /> {t('reports_view_print')}</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/reports/${r.id}/edit`}><Edit className="w-4 h-4 mr-2" /> {t('reports_edit')}</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-orange-600" onClick={() => softDeleteMutation.mutate(r.id)}>
                            <ArchiveRestore className="w-4 h-4 mr-2" /> {t('reports_archive')}
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
      </div>
    </div>
  )
}
