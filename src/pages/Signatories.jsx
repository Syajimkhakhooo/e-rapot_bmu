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
  const [formData, setFormData] = useState({ name: '', position: '', type: 'headmaster' })

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
      setFormData({ name: '', position: '', type: 'headmaster' })
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
    if (type === 'headmaster') return t('sig_director')
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
                <Label className="font-label-md text-sm text-on-surface">{t('sig_position')}</Label>
                <Input required value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className="h-9 rounded-md border-outline-variant font-body-md text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-label-md text-sm text-on-surface">{t('sig_role')}</Label>
                <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                  <SelectTrigger className="h-9 rounded-md border-outline-variant font-body-md text-sm text-on-surface">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="headmaster">{t('sig_director')}</SelectItem>
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
            <div key={s.id} className="bg-surface border border-outline-variant rounded-lg p-6 hover:shadow-sm transition-all group relative flex flex-col items-center justify-center text-center">
              <div className="absolute top-2 right-2">
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
              
              <div className="w-full flex flex-col items-center mt-2">
                <div className="w-full max-w-[180px] h-20 border-b-2 border-dashed border-outline-variant flex items-center justify-center text-outline mb-4 relative">
                  <span className="material-symbols-outlined text-4xl opacity-20 absolute rotate-[-10deg]">draw</span>
                  <span className="font-body-md text-xs text-on-surface-variant opacity-50 absolute bottom-1">Tanda Tangan Digital</span>
                </div>
                <div className="space-y-1 text-left w-full max-w-[220px]">
                  <p className="font-body-md text-sm text-on-surface flex justify-between">
                    <span className="font-medium text-on-surface-variant w-16">Nama</span> 
                    <span className="mr-2">:</span> 
                    <span className="flex-1 font-semibold">{s.name}</span>
                  </p>
                  <p className="font-body-md text-sm text-on-surface flex justify-between">
                    <span className="font-medium text-on-surface-variant w-16">Jabatan</span> 
                    <span className="mr-2">:</span> 
                    <span className="flex-1">{s.position}</span>
                  </p>
                  <p className="font-body-md text-sm text-on-surface font-bold text-center mt-3 pt-2 border-t border-outline-variant/30">
                    LPK SO BAHTERA MITRA UNGGULAN
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
