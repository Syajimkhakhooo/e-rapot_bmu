import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useTranslation } from 'react-i18next'
import { id as idLocale, ja as jaLocale } from 'date-fns/locale'

export default function Classes() {
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', is_pemula: false })

  const { data: classes, isLoading } = useQuery({
    queryKey: ['classes_list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select(`
          id, name, is_pemula, created_at,
          students:students(count)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  const createClassMutation = useMutation({
    mutationFn: async (cls) => {
      const { error } = await supabase.from('classes').insert([cls])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['classes_list'])
      queryClient.invalidateQueries(['dashboard-stats'])
      setIsCreateOpen(false)
      setFormData({ name: '', is_pemula: false })
      toast.success(t('classes_success_add'))
    },
    onError: (e) => toast.error(e.message),
  })

  const deleteClassMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('classes').update({ deleted_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['classes_list'])
      queryClient.invalidateQueries(['dashboard-stats'])
      toast.success(t('classes_success_delete'))
    },
    onError: (e) => toast.error(e.message),
  })

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="font-headline-lg text-2xl text-on-surface">
            {t('classes_title')} <span className="text-on-surface-variant font-normal">/ クラス管理</span>
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">{t('classes_desc')}</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <button className="bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md text-sm px-4 py-2 rounded-md flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">add</span>
              {t('classes_add')}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm w-[95vw] sm:w-full rounded-lg bg-surface border-outline-variant shadow-lg">
            <DialogHeader>
              <DialogTitle className="font-title-lg text-on-surface">{t('classes_add')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); createClassMutation.mutate(formData) }} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label className="font-label-md text-sm text-on-surface">{t('classes_name')}</Label>
                <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-9 rounded-md border-outline-variant focus-visible:ring-primary font-body-md text-sm" placeholder="e.g., Kelas 1A" />
              </div>
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="is_pemula"
                  checked={formData.is_pemula}
                  onChange={e => setFormData({ ...formData, is_pemula: e.target.checked })}
                  className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                />
                <Label htmlFor="is_pemula" className="font-body-md text-sm text-on-surface cursor-pointer">
                  Tandai sebagai Kelas Pemula (Hanya pakai nilai Ujian)
                </Label>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="bg-surface-variant text-on-surface-variant hover:bg-outline-variant transition-colors font-label-md text-sm h-9 px-4 rounded-md">
                  {t('cancel')}
                </button>
                <button type="submit" className="bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md h-9 rounded-md text-sm flex items-center justify-center px-4" disabled={createClassMutation.isPending}>
                  {createClassMutation.isPending ? t('loading') : t('save')}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1, 2, 3].map(i => <div key={i} className="h-28 rounded-lg shimmer" />)
        ) : classes?.length === 0 ? (
          <div className="col-span-full bg-surface border border-outline-variant rounded-lg py-12 text-center text-on-surface-variant font-body-md text-sm">
            {t('no_data')}
          </div>
        ) : (
          classes?.map((c) => (
            <div key={c.id} className="bg-surface border border-outline-variant rounded-lg p-5 hover:shadow-sm transition-all flex flex-col justify-between group">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded border border-outline-variant/50 bg-surface-variant flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>class</span>
                  </div>
                  <div>
                    <h3 className="font-title-lg text-lg text-on-surface leading-tight flex items-center gap-2">
                      {c.name}
                      {c.is_pemula && (
                        <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded">Pemula</span>
                      )}
                    </h3>
                    <p className="font-body-md text-xs text-on-surface-variant mt-0.5">
                      {t('classes_created')} {new Date(c.created_at).toLocaleDateString(i18n.language === 'ja' ? 'ja-JP' : 'id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="text-on-surface-variant hover:text-on-surface hover:bg-surface-variant p-1 rounded transition-colors opacity-0 group-hover:opacity-100">
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-surface border-outline-variant min-w-[140px] rounded-md shadow-md">
                    <DropdownMenuItem className="text-error focus:text-error gap-2 font-body-md text-sm cursor-pointer py-2" onClick={() => deleteClassMutation.mutate(c.id)}>
                      <span className="material-symbols-outlined text-[16px]">delete</span> {t('delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-5 pt-3 border-t border-outline-variant/50 flex justify-between items-center">
                <span className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider">{t('menu_students')}</span>
                <span className="font-label-md text-sm text-on-surface">{c.students[0]?.count || 0}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
