import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useTranslation } from 'react-i18next'

export default function Signatories() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '', type: 'director' })

  const { data: signatories, isLoading } = useQuery({
    queryKey: ['signatories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('signatories').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  const createSignatoryMutation = useMutation({
    mutationFn: async (sig) => {
      const { error } = await supabase.from('signatories').insert([sig])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['signatories'])
      setIsCreateOpen(false)
      setFormData({ name: '', type: 'director' })
      toast.success(t('sig_success_add'))
    },
    onError: (e) => toast.error(e.message),
  })

  const deleteSignatoryMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('signatories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['signatories'])
      toast.success(t('sig_success_delete'))
    },
    onError: (e) => toast.error(e.message),
  })

  const getRoleLabel = (type) => {
    if (type === 'director') return t('sig_director')
    if (type === 'teacher') return t('sig_teacher')
    return type
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="font-headline-lg text-2xl text-on-surface">
            {t('sig_title')} <span className="text-on-surface-variant font-normal">/ 署名者</span>
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">{t('sig_desc')}</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <button className="bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md text-sm px-4 py-2 rounded-md flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">add</span>
              {t('sig_add')}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-sm w-[95vw] sm:w-full rounded-lg bg-surface border-outline-variant shadow-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-title-lg text-on-surface">{t('sig_add')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); createSignatoryMutation.mutate(formData) }} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label className="font-label-md text-sm text-on-surface">{t('sig_name')}</Label>
                <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-9 rounded-md border-outline-variant font-body-md text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-label-md text-sm text-on-surface">{t('sig_role')}</Label>
                <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                  <SelectTrigger className="h-9 rounded-md border-outline-variant font-body-md text-sm text-on-surface">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="director">{t('sig_director')}</SelectItem>
                    <SelectItem value="teacher">{t('sig_teacher')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="bg-surface-variant text-on-surface-variant hover:bg-outline-variant transition-colors font-label-md text-sm h-9 px-4 rounded-md">
                  {t('cancel')}
                </button>
                <button type="submit" className="bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md h-9 px-4 rounded-md text-sm flex items-center justify-center" disabled={createSignatoryMutation.isPending}>
                  {createSignatoryMutation.isPending ? t('loading') : t('save')}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [1, 2].map(i => <div key={i} className="h-24 rounded-lg shimmer" />)
        ) : signatories?.length === 0 ? (
          <div className="col-span-full bg-surface border border-outline-variant rounded-lg py-12 text-center text-on-surface-variant font-body-md text-sm">
            {t('sig_no_data')}
          </div>
        ) : (
          signatories?.map((s) => (
            <div key={s.id} className="bg-surface border border-outline-variant rounded-lg p-5 hover:shadow-sm transition-all group">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded border border-outline-variant/50 bg-surface-variant flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>edit_document</span>
                  </div>
                  <div>
                    <h3 className="font-body-md text-sm font-medium text-on-surface">{s.name}</h3>
                    <p className="font-label-md text-[10px] text-on-surface-variant uppercase mt-0.5">
                      {getRoleLabel(s.type)}
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
                    <DropdownMenuItem className="text-error focus:text-error gap-2 font-body-md text-sm cursor-pointer py-2" onClick={() => deleteSignatoryMutation.mutate(s.id)}>
                      <span className="material-symbols-outlined text-[16px]">delete</span> {t('delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
