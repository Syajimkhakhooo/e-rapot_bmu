import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export default function Students() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({
    student_id: '', full_name: '', japanese_name: '', class_id: '',
  })
  const [photoFile, setPhotoFile] = useState(null)
  const fileInputRef = useRef(null)

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [editFormData, setEditFormData] = useState({
    student_id: '', full_name: '', japanese_name: '', class_id: ''
  })
  const [editPhotoFile, setEditPhotoFile] = useState(null)
  const editFileInputRef = useRef(null)

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingStudent, setDeletingStudent] = useState(null)

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: async () => {
      const { data } = await supabase.from('classes').select('id, name').is('deleted_at', null)
      return data || []
    },
  })

  const { data: students, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*, classes(name)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    },
  })

  const createStudentMutation = useMutation({
    mutationFn: async (student) => {
      let photo_url = null
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('students').upload(fileName, photoFile)
        if (uploadError) throw new Error('Gagal upload foto: ' + uploadError.message)
        const { data: publicUrlData } = supabase.storage.from('students').getPublicUrl(fileName)
        photo_url = publicUrlData.publicUrl
      }
      const { error } = await supabase.from('students').insert([{ ...student, photo_url }])
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['students'])
      queryClient.invalidateQueries(['dashboard-stats'])
      setIsCreateOpen(false)
      setFormData({ student_id: '', full_name: '', japanese_name: '', class_id: '' })
      setPhotoFile(null)
      toast.success(t('students_success_add'))
    },
    onError: (e) => toast.error(e.message),
  })

  const updateStudentMutation = useMutation({
    mutationFn: async (student) => {
      let photo_url = editingStudent.photo_url
      if (editPhotoFile) {
        const fileExt = editPhotoFile.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random()}.${fileExt}`
        const { error: uploadError } = await supabase.storage.from('students').upload(fileName, editPhotoFile)
        if (uploadError) throw new Error('Gagal upload foto: ' + uploadError.message)
        const { data: publicUrlData } = supabase.storage.from('students').getPublicUrl(fileName)
        photo_url = publicUrlData.publicUrl
      }
      const { error } = await supabase.from('students').update({ ...student, photo_url }).eq('id', editingStudent.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['students'])
      queryClient.invalidateQueries(['dashboard-stats'])
      setIsEditOpen(false)
      toast.success(t('students_success_update'))
    },
    onError: (e) => toast.error(e.message),
  })

  const deleteStudentMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('students').update({ deleted_at: new Date().toISOString() }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['students'])
      queryClient.invalidateQueries(['dashboard-stats'])
      toast.success(t('students_success_delete'))
    },
    onError: (e) => toast.error(e.message),
  })

  const openEdit = (s) => {
    setEditingStudent(s)
    setEditFormData({
      student_id: s.student_id || '',
      full_name: s.full_name || '',
      japanese_name: s.japanese_name || '',
      class_id: s.class_id || '',
    })
    setEditPhotoFile(null)
    setIsEditOpen(true)
  }

  const openDelete = (s) => {
    setDeletingStudent(s)
    setIsDeleteOpen(true)
  }

  const filtered = students?.filter(s =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.student_id?.toLowerCase().includes(search.toLowerCase()) ||
    s.classes?.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="font-headline-lg text-2xl text-on-surface">
            {t('students_title')} <span className="text-on-surface-variant font-normal">/ 学生一覧</span>
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">{t('students_desc')}</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <button className="bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md text-sm px-4 py-2 rounded-md flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">add</span>
              {t('students_add')}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto rounded-lg bg-surface border-outline-variant shadow-lg">
            <DialogHeader>
              <DialogTitle className="font-title-lg text-on-surface">{t('students_add')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); createStudentMutation.mutate(formData) }} className="space-y-4 pt-4">
              <div className="flex justify-center mb-4">
                <div
                  className="relative w-24 h-32 rounded-md border-2 border-dashed border-outline-variant
                    bg-surface-variant flex items-center justify-center cursor-pointer overflow-hidden
                    hover:border-primary transition-colors group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoFile ? (
                    <img src={URL.createObjectURL(photoFile)} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-on-surface-variant group-hover:text-primary transition-colors">
                      <span className="material-symbols-outlined">camera_alt</span>
                      <span className="font-label-md text-[10px] text-center leading-tight">{t('students_add_photo')}</span>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && setPhotoFile(e.target.files[0])} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="font-label-md text-sm text-on-surface">{t('students_id')}</Label>
                  <Input required value={formData.student_id} onChange={e => setFormData({ ...formData, student_id: e.target.value })} className="h-9 rounded-md border-outline-variant focus-visible:ring-primary font-body-md text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-label-md text-sm text-on-surface">{t('students_class')}</Label>
                  <Select value={formData.class_id} onValueChange={v => setFormData({ ...formData, class_id: v })}>
                    <SelectTrigger className="h-9 rounded-md border-outline-variant font-body-md text-sm text-on-surface">
                      <SelectValue placeholder={t('students_class')} />
                    </SelectTrigger>
                    <SelectContent>
                      {classes?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="font-label-md text-sm text-on-surface">{t('students_name')}</Label>
                <Input required value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="h-9 rounded-md border-outline-variant focus-visible:ring-primary font-body-md text-sm" />
              </div>

              <div className="space-y-1.5">
                <Label className="font-label-md text-sm text-on-surface">{t('students_jp_name')}</Label>
                <Input required value={formData.japanese_name} onChange={e => setFormData({ ...formData, japanese_name: e.target.value })} className="h-9 rounded-md border-outline-variant focus-visible:ring-primary font-body-md text-sm" />
              </div>

              <div className="pt-2">
                <button type="submit" className="w-full bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md text-sm h-9 rounded-md flex items-center justify-center" disabled={createStudentMutation.isPending}>
                  {createStudentMutation.isPending ? t('loading') : t('save')}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto rounded-lg bg-surface border-outline-variant shadow-lg">
          <DialogHeader>
            <DialogTitle className="font-title-lg text-on-surface">{t('students_edit_student')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); updateStudentMutation.mutate(editFormData) }} className="space-y-4 pt-4">
            <div className="flex justify-center mb-4">
              <div
                className="relative w-24 h-32 rounded-md border-2 border-dashed border-outline-variant
                  bg-surface-variant flex items-center justify-center cursor-pointer overflow-hidden
                  hover:border-primary transition-colors group"
                onClick={() => editFileInputRef.current?.click()}
              >
                {editPhotoFile ? (
                  <img src={URL.createObjectURL(editPhotoFile)} alt="Preview" className="w-full h-full object-cover" />
                ) : editingStudent?.photo_url ? (
                  <img src={editingStudent.photo_url} alt="Current" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-on-surface-variant group-hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">camera_alt</span>
                    <span className="font-label-md text-[10px] text-center leading-tight">{t('students_change_photo')}</span>
                  </div>
                )}
                <input type="file" ref={editFileInputRef} className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && setEditPhotoFile(e.target.files[0])} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="font-label-md text-sm text-on-surface">{t('students_id')}</Label>
                <Input required value={editFormData.student_id} onChange={e => setEditFormData({ ...editFormData, student_id: e.target.value })} className="h-9 rounded-md border-outline-variant focus-visible:ring-primary font-body-md text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-label-md text-sm text-on-surface">{t('students_class')}</Label>
                <Select value={editFormData.class_id} onValueChange={v => setEditFormData({ ...editFormData, class_id: v })}>
                  <SelectTrigger className="h-9 rounded-md border-outline-variant font-body-md text-sm text-on-surface">
                    <SelectValue placeholder={t('students_class')} />
                  </SelectTrigger>
                  <SelectContent>
                    {classes?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="font-label-md text-sm text-on-surface">{t('students_name')}</Label>
              <Input required value={editFormData.full_name} onChange={e => setEditFormData({ ...editFormData, full_name: e.target.value })} className="h-9 rounded-md border-outline-variant focus-visible:ring-primary font-body-md text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label className="font-label-md text-sm text-on-surface">{t('students_jp_name')}</Label>
              <Input required value={editFormData.japanese_name} onChange={e => setEditFormData({ ...editFormData, japanese_name: e.target.value })} className="h-9 rounded-md border-outline-variant focus-visible:ring-primary font-body-md text-sm" />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setIsEditOpen(false)} className="bg-surface-variant text-on-surface-variant hover:bg-outline-variant transition-colors font-label-md text-sm h-9 px-4 rounded-md">{t('cancel')}</button>
              <button type="submit" className="bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md text-sm h-9 px-4 rounded-md flex items-center justify-center" disabled={updateStudentMutation.isPending}>
                {updateStudentMutation.isPending ? t('loading') : t('update')}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm w-[95vw] sm:w-full rounded-lg bg-surface border-outline-variant shadow-lg">
          <DialogHeader>
            <DialogTitle className="font-title-lg text-on-surface">{t('students_delete_confirm')}</DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <p className="font-body-md text-sm text-on-surface-variant">
              {t('students_delete_msg')} <strong>{deletingStudent?.full_name}</strong>
            </p>
            <div className="pt-6 flex justify-end gap-2">
              <button onClick={() => setIsDeleteOpen(false)} className="bg-surface-variant text-on-surface-variant hover:bg-outline-variant transition-colors font-label-md text-sm h-9 px-4 rounded-md">
                {t('cancel')}
              </button>
              <button 
                onClick={() => { 
                  deleteStudentMutation.mutate(deletingStudent.id); 
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

      {/* Data Table Card */}
      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden flex flex-col">
        {/* Toolbar */}
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-surface-bright border-b border-outline-variant">
                <th className="px-5 py-3 font-label-md text-xs text-on-surface-variant uppercase tracking-wider w-1/3">{t('students_name')}</th>
                <th className="px-5 py-3 font-label-md text-xs text-on-surface-variant uppercase tracking-wider w-1/6">{t('students_id')}</th>
                <th className="px-5 py-3 font-label-md text-xs text-on-surface-variant uppercase tracking-wider w-1/6">{t('students_class')}</th>
                <th className="px-5 py-3 font-label-md text-xs text-on-surface-variant uppercase tracking-wider w-1/6">{t('status')}</th>
                <th className="px-5 py-3 font-label-md text-xs text-on-surface-variant uppercase tracking-wider w-1/12 text-right">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-outline-variant/50">
              {isLoading ? (
                 <tr>
                   <td colSpan={5} className="px-5 py-8 text-center text-on-surface-variant font-body-md text-sm">{t('loading')}</td>
                 </tr>
              ) : filtered?.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="px-5 py-8 text-center text-on-surface-variant font-body-md text-sm">{t('no_data')}</td>
                 </tr>
              ) : (
                filtered?.map(s => (
                  <tr key={s.id} className="hover:bg-surface-variant/30 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {s.photo_url ? (
                          <img src={s.photo_url} alt={s.full_name} className="w-8 h-8 rounded object-cover border border-outline-variant" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center text-on-surface-variant font-label-md text-xs shrink-0 border border-outline-variant/50">
                            {s.full_name?.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-body-md text-sm font-medium text-on-surface">{s.full_name}</span>
                          <span className="font-body-md text-xs text-on-surface-variant mt-0.5">{s.japanese_name}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-body-md text-sm text-on-surface-variant">{s.student_id}</td>
                    <td className="px-5 py-3 font-body-md text-sm text-on-surface">{s.classes?.name}</td>
                    <td className="px-5 py-3">
                      {s.status === 'active' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded font-label-md text-[10px] bg-green-500/10 text-green-700 border border-green-500/20 uppercase">
                          {t('active')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded font-label-md text-[10px] bg-surface-variant text-on-surface-variant border border-outline-variant uppercase">
                          {t('inactive')}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-on-surface-variant hover:text-on-surface transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-surface-variant">
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-surface border-outline-variant shadow-md min-w-[140px] rounded-md">
                          <DropdownMenuItem onClick={() => openEdit(s)} className="font-body-md text-sm py-2 cursor-pointer gap-2">
                            <span className="material-symbols-outlined text-[16px]">edit</span> {t('edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDelete(s)} className="font-body-md text-sm py-2 cursor-pointer text-error gap-2">
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

        {/* Pagination Footer */}
        <div className="p-3 border-t border-outline-variant bg-surface-bright flex items-center justify-between">
          <span className="font-body-md text-xs text-on-surface-variant">Showing {filtered?.length || 0} entries</span>
        </div>
      </div>
    </div>
  )
}
