import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { createUserProfile, updateUserProfile, deleteUserProfile } from '@/config/supabase-admin'
import { useTranslation } from 'react-i18next'

export default function Users() {
  const queryClient = useQueryClient()
  const { t, i18n } = useTranslation()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  
  const [editingUser, setEditingUser] = useState(null)
  const [deletingUser, setDeletingUser] = useState(null)
  
  const [search, setSearch] = useState('')
  const [formData, setFormData] = useState({
    email: '', password: '', name: '', role: 'admin'
  })

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false })
      if (error) throw error
      return data
    }
  })

  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      await createUserProfile(userData.email, userData.password, userData.name, userData.role)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      setIsCreateOpen(false)
      setFormData({ email: '', password: '', name: '', role: 'admin' })
      toast.success(t('users_success_add') || 'Berhasil ditambahkan')
    },
    onError: (e) => toast.error(e.message),
  })

  const updateUserMutation = useMutation({
    mutationFn: async (userData) => {
      await updateUserProfile(userData.id, userData.email, userData.password, userData.name, userData.role)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      setIsEditOpen(false)
      toast.success(t('users_success_edit') || 'Berhasil diubah')
    },
    onError: (e) => toast.error(e.message),
  })

  const deleteUserMutation = useMutation({
    mutationFn: async (id) => {
      await deleteUserProfile(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      setIsDeleteOpen(false)
      toast.success(t('users_success_delete') || 'Berhasil dihapus')
    },
    onError: (e) => toast.error(e.message),
  })

  const filtered = users?.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const dateLocaleStr = i18n.language === 'ja' ? 'ja-JP' : 'id-ID'

  const openEdit = (u) => {
    setEditingUser({ ...u })
    setIsEditOpen(true)
  }

  const openDelete = (u) => {
    setDeletingUser(u)
    setIsDeleteOpen(true)
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in w-full">

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="font-headline-lg text-2xl text-on-surface">
            {t('users_title')} <span className="text-on-surface-variant font-normal">/ ユーザー管理</span>
          </h1>
          <p className="font-body-md text-sm text-on-surface-variant mt-1">{t('users_desc')}</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <button className="bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md text-sm px-4 py-2 rounded-md flex items-center gap-2 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">add</span>
              {t('users_add')}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md w-[95vw] sm:w-full rounded-lg bg-surface border-outline-variant shadow-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-title-lg text-on-surface">{t('users_add')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); createUserMutation.mutate(formData) }} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label className="font-label-md text-sm text-on-surface">{t('users_name')}</Label>
                <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="h-9 rounded-md border-outline-variant font-body-md text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-label-md text-sm text-on-surface">{t('users_email')}</Label>
                <Input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="h-9 rounded-md border-outline-variant font-body-md text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-label-md text-sm text-on-surface">{t('password')}</Label>
                <Input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="h-9 rounded-md border-outline-variant font-body-md text-sm" minLength={6} />
              </div>
              <div className="space-y-1.5">
                <Label className="font-label-md text-sm text-on-surface">{t('users_role')}</Label>
                <Select value={formData.role} onValueChange={v => setFormData({ ...formData, role: v })}>
                  <SelectTrigger className="h-9 rounded-md border-outline-variant font-body-md text-sm text-on-surface">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin / Teacher</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsCreateOpen(false)} className="bg-surface-variant text-on-surface-variant hover:bg-outline-variant transition-colors font-label-md text-sm h-9 px-4 rounded-md">
                  {t('cancel')}
                </button>
                <button type="submit" className="bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md h-9 rounded-md text-sm px-4" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? t('loading') : t('save')}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-full rounded-lg bg-surface border-outline-variant shadow-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-title-lg text-on-surface">{t('edit')}</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={e => { e.preventDefault(); updateUserMutation.mutate(editingUser) }} className="space-y-4 pt-4">
              <div className="space-y-1.5">
                <Label className="font-label-md text-sm text-on-surface">{t('users_name')}</Label>
                <Input required value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} className="h-9 rounded-md border-outline-variant font-body-md text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-label-md text-sm text-on-surface">{t('users_email')}</Label>
                <Input required type="email" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} className="h-9 rounded-md border-outline-variant font-body-md text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-label-md text-sm text-on-surface">{t('password')} <span className="text-on-surface-variant text-xs font-normal">(Kosongkan jika tidak ingin mengubah)</span></Label>
                <Input type="password" value={editingUser.password || ''} onChange={e => setEditingUser({ ...editingUser, password: e.target.value })} className="h-9 rounded-md border-outline-variant font-body-md text-sm" minLength={6} placeholder="••••••••" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-label-md text-sm text-on-surface">{t('users_role')}</Label>
                <Select value={editingUser.role} onValueChange={v => setEditingUser({ ...editingUser, role: v })}>
                  <SelectTrigger className="h-9 rounded-md border-outline-variant font-body-md text-sm text-on-surface">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin / Teacher</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsEditOpen(false)} className="bg-surface-variant text-on-surface-variant hover:bg-outline-variant transition-colors font-label-md text-sm h-9 px-4 rounded-md">
                  {t('cancel')}
                </button>
                <button type="submit" className="bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md h-9 rounded-md text-sm px-4" disabled={updateUserMutation.isPending}>
                  {updateUserMutation.isPending ? t('loading') : t('save')}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm w-[95vw] sm:w-full rounded-lg bg-surface border-outline-variant shadow-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-title-lg text-on-surface">{t('delete')}</DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <p className="font-body-md text-sm text-on-surface-variant">
              Anda yakin ingin menghapus <strong>{deletingUser?.name}</strong>?
            </p>
            <div className="pt-6 flex justify-end gap-2">
              <button onClick={() => setIsDeleteOpen(false)} className="bg-surface-variant text-on-surface-variant hover:bg-outline-variant transition-colors font-label-md text-sm h-9 px-4 rounded-md">
                {t('cancel')}
              </button>
              <button 
                onClick={() => deleteUserMutation.mutate(deletingUser.id)} 
                className="bg-error text-on-error hover:bg-error/90 transition-colors font-label-md text-sm h-9 px-4 rounded-md flex items-center justify-center"
                disabled={deleteUserMutation.isPending}
              >
                {t('delete')}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Data Table Card ── */}
      <div className="bg-surface border border-outline-variant rounded-lg overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-3 border-b border-outline-variant bg-surface-bright flex justify-between items-center gap-4">
          <div className="relative w-full max-w-sm">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px] pointer-events-none">search</span>
            <input
              type="text"
              placeholder={t('users_search')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-md pl-9 pr-3 py-1.5 font-body-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-surface-bright border-b border-outline-variant">
                <th className="px-5 py-3 font-label-md text-xs text-on-surface-variant uppercase tracking-wider w-2/5">{t('menu_users')}</th>
                <th className="px-5 py-3 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">{t('users_role')}</th>
                <th className="px-5 py-3 font-label-md text-xs text-on-surface-variant uppercase tracking-wider">{t('users_joined_date')}</th>
                <th className="px-5 py-3 font-label-md text-xs text-on-surface-variant uppercase tracking-wider text-right">{t('action')}</th>
              </tr>
            </thead>
            <tbody className="bg-surface divide-y divide-outline-variant/50">
              {isLoading ? (
                 <tr><td colSpan={4} className="px-5 py-8 text-center text-on-surface-variant font-body-md text-sm">{t('loading')}</td></tr>
              ) : filtered?.length === 0 ? (
                 <tr><td colSpan={4} className="px-5 py-8 text-center text-on-surface-variant font-body-md text-sm">{t('no_data')}</td></tr>
              ) : (
                filtered?.map(u => (
                  <tr key={u.id} className="hover:bg-surface-variant/30 transition-colors group cursor-default">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded border border-outline-variant/50 bg-surface-variant flex items-center justify-center text-on-surface-variant font-label-md text-xs shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-body-md text-sm font-medium text-on-surface">{u.name}</span>
                          <span className="font-body-md text-xs text-on-surface-variant mt-0.5">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded font-label-md text-[10px] uppercase ${u.role === 'super_admin' ? 'bg-red-500/10 text-red-700 border border-red-500/20' : 'bg-surface-variant text-on-surface-variant border border-outline-variant'}`}>
                        {u.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-body-md text-on-surface-variant text-sm">
                      {new Date(u.created_at).toLocaleDateString(dateLocaleStr, { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-on-surface-variant hover:text-on-surface transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded hover:bg-surface-variant">
                            <span className="material-symbols-outlined text-[18px]">more_vert</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-surface border-outline-variant shadow-md min-w-[140px] rounded-md">
                          <DropdownMenuItem onClick={() => openEdit(u)} className="font-body-md text-sm py-2 cursor-pointer gap-2">
                            <span className="material-symbols-outlined text-[16px]">edit</span> {t('edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDelete(u)} className="font-body-md text-sm py-2 cursor-pointer text-error gap-2">
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
      </div>
    </div>
  )
}
