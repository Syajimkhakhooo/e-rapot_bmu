import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { useTranslation } from 'react-i18next'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

export default function History() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [search, setSearch] = useState('')
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingReport, setDeletingReport] = useState(null)

  const { data: reports, isLoading } = useQuery({
    queryKey: ['deleted-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id, period_start, period_end, created_at, deleted_at,
          students (full_name, student_id, classes(name))
        `)
        .not('deleted_at', 'is', null)
        .order('deleted_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  const restoreReportMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('reports').update({ deleted_at: null }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['deleted-reports'])
      queryClient.invalidateQueries(['reports'])
      queryClient.invalidateQueries(['dashboard-stats'])
      toast.success("Rapot berhasil direstore")
    },
    onError: (e) => toast.error(e.message),
  })

  const permanentDeleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('reports').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['deleted-reports'])
      toast.success("Rapot berhasil dihapus permanen")
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

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="font-headline-lg text-2xl text-on-surface">
            Riwayat Rapot Terhapus <span className="text-on-surface-variant font-normal">/ 削除履歴</span>
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">Daftar rapot yang telah dihapus dan berada di tempat sampah.</p>
        </div>
      </div>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm w-[95vw] sm:w-full rounded-lg bg-surface border-outline-variant shadow-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-title-lg text-on-surface">Hapus Permanen Rapot</DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <p className="font-body-md text-sm text-on-surface-variant">
              Apakah Anda yakin ingin menghapus rapot <strong>{deletingReport?.students?.full_name}</strong> secara permanen? Data tidak dapat dikembalikan lagi.
            </p>
            <div className="pt-6 flex justify-end gap-2">
              <button onClick={() => setIsDeleteOpen(false)} className="bg-surface-variant text-on-surface-variant hover:bg-outline-variant transition-colors font-label-md text-sm h-9 px-4 rounded-md">
                Batal
              </button>
              <button 
                onClick={() => { 
                  permanentDeleteMutation.mutate(deletingReport.id); 
                  setIsDeleteOpen(false); 
                }} 
                className="bg-error text-on-error hover:bg-error/90 transition-colors font-label-md text-sm h-9 px-4 rounded-md flex items-center justify-center"
              >
                Hapus Permanen
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
              placeholder="Cari nama atau ID siswa..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-md pl-9 pr-3 py-1.5 font-body-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-bright border-b border-outline-variant">
                <th className="px-5 py-3 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Siswa</th>
                <th className="px-5 py-3 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Kelas</th>
                <th className="px-5 py-3 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Waktu Dihapus</th>
                <th className="px-5 py-3 font-label-md text-xs text-on-surface-variant uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-outline-variant/50">
              {isLoading ? (
                 <tr><td colSpan={4} className="px-5 py-8 text-center text-on-surface-variant font-body-md text-sm">Loading...</td></tr>
              ) : filtered?.length === 0 ? (
                 <tr><td colSpan={4} className="px-5 py-8 text-center text-on-surface-variant font-body-md text-sm">Tidak ada data di tempat sampah</td></tr>
              ) : (
                filtered?.map(r => (
                  <tr key={r.id} className="hover:bg-surface-variant/30 transition-colors group cursor-default">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded border border-outline-variant/50 bg-surface-variant flex items-center justify-center text-on-surface-variant font-label-md text-xs shrink-0">
                          {r.students?.full_name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-body-md text-sm font-medium text-on-surface">{r.students?.full_name || 'Tidak diketahui'}</span>
                          <span className="font-body-md text-xs text-on-surface-variant mt-0.5">{r.students?.student_id || '-'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-body-md text-sm text-on-surface-variant">{r.students?.classes?.name || '-'}</td>
                    <td className="px-5 py-3 font-body-md text-sm text-on-surface-variant">
                      {new Date(r.deleted_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-on-surface-variant hover:text-on-surface transition-colors p-1 rounded hover:bg-surface-variant">
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-surface border-outline-variant shadow-md min-w-[150px] rounded-md">
                          <DropdownMenuItem onClick={() => restoreReportMutation.mutate(r.id)} className="font-body-md text-sm py-2 cursor-pointer gap-2 w-full flex items-center text-emerald-600 focus:text-emerald-700">
                            <span className="material-symbols-outlined text-[16px]">restore</span> Restore Rapot
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDelete(r)} className="font-body-md text-sm py-2 cursor-pointer text-error gap-2 focus:text-error">
                            <span className="material-symbols-outlined text-[16px]">delete_forever</span> Hapus Permanen
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
