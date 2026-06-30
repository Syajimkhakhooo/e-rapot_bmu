import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { useAuthStore } from '@/store/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { format, parseISO } from "date-fns"

export default function EditReport() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    student_id: '',
    period_start: '',
    period_end: '',
    study_time: '',
    learning_material: '',
    score_kosakata: 0,
    score_hiragana: 0,
    score_katakana: 0,
    score_ujian: 0,
    attendance_sakit: 0,
    attendance_ijin: 0,
    attendance_alfa: 0,
    behavior: 'A',
    teacher_notes: '',
    additional_notes: '',
    physical_push_up: '',
    physical_sit_up: '',
    physical_lari: '',
    guardian_name: '',
    teacher_name: '',
    headmaster_name: ''
  })

  const [selectedClass, setSelectedClass] = useState('')

  // Fetch Report
  const { data: report, isLoading: isReportLoading } = useQuery({
    queryKey: ['report', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('reports').select('*').eq('id', id).single()
      if (error) throw error
      return data
    }
  })

  // Populate formData when report is fetched
  useEffect(() => {
    if (report) {
      setFormData({
        student_id: report.student_id,
        period_start: report.period_start || '',
        period_end: report.period_end || '',
        study_time: report.study_time || '',
        learning_material: report.learning_material || '',
        score_kosakata: report.score_kosakata || 0,
        score_hiragana: report.score_hiragana || 0,
        score_katakana: report.score_katakana || 0,
        score_ujian: report.score_ujian || 0,
        attendance_sakit: report.attendance_sakit || 0,
        attendance_ijin: report.attendance_ijin || 0,
        attendance_alfa: report.attendance_alfa || 0,
        behavior: report.behavior || 'A',
        teacher_notes: report.teacher_notes || '',
        additional_notes: report.additional_notes || '',
        physical_push_up: report.physical_push_up || '',
        physical_sit_up: report.physical_sit_up || '',
        physical_lari: report.physical_lari || '',
        guardian_name: report.guardian_name || '',
        teacher_name: report.teacher_name || '',
        headmaster_name: report.headmaster_name || ''
      })
    }
  }, [report])

  const { data: students, isLoading: isStudentsLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data } = await supabase.from('students').select('*, classes(name, is_pemula)').is('deleted_at', null)
      return data || []
    }
  })

  const selectedStudent = students?.find(s => String(s.id) === String(formData.student_id))
  
  // Pre-fill selectedClass based on student synchronously
  const effectiveSelectedClass = selectedClass || (selectedStudent ? (selectedStudent.classes?.name || 'all') : '')

  const { data: signatories } = useQuery({
    queryKey: ['signatories'],
    queryFn: async () => {
      const { data } = await supabase.from('signatories').select('*').eq('status', 'active')
      return data || []
    }
  })

  const updateReportMutation = useMutation({
    mutationFn: async (reportData) => {
      const { data, error } = await supabase
        .from('reports')
        .update(reportData)
        .eq('id', id)
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['reports'])
      queryClient.invalidateQueries(['report', id])
      toast.success('Report updated successfully')
      navigate(-1) // go back
    },
    onError: (error) => {
      if (error.message.includes('duplicate key value')) {
        toast.error('A report for this student and period already exists!')
      } else {
        toast.error(error.message)
      }
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    updateReportMutation.mutate(formData)
  }

  const isPemula = selectedStudent?.classes?.is_pemula

  const getColor = (score, isUjian = false) => {
    if (!isUjian && isPemula && (score === 0 || score === '' || isNaN(score))) return ''
    return score < 85 ? 'border-red-500 bg-red-50 focus-visible:ring-red-500' : ''
  }

  const getBehaviorColor = (b) => {
    if (b === 'C') return 'text-orange-500'
    if (b === 'D') return 'text-red-500'
    return ''
  }

  if (isReportLoading || isStudentsLoading) return <div className="p-8 text-center">Loading report data...</div>

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-12">
      <div>
        <h2 className="text-xl font-extrabold text-slate-800">{t('reports_edit')}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{t('reports_desc')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-transparent">
            <h3 className="font-bold text-slate-800 text-sm">{t('form_student_period')}</h3>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 col-span-1">
              <Label>Pilih Kelas</Label>
              <Select value={effectiveSelectedClass} onValueChange={v => { setSelectedClass(v); setFormData({...formData, student_id: ''}); }}>
                <SelectTrigger><SelectValue placeholder="Pilih kelas..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {Array.from(new Set((students || []).map(s => s.classes?.name).filter(Boolean))).map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-1">
              <Label>{t('reports_student')}</Label>
              <Select required value={formData.student_id ? String(formData.student_id) : ''} onValueChange={v => setFormData({...formData, student_id: v})} disabled={!effectiveSelectedClass}>
                <SelectTrigger><SelectValue placeholder="Select student..." /></SelectTrigger>
                <SelectContent>
                  {(students || []).filter(s => effectiveSelectedClass === 'all' || s.classes?.name === effectiveSelectedClass).map(s => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.full_name} ({s.student_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('form_period_start')}</Label>
              <Input
                type="date"
                required
                value={formData.period_start}
                onChange={e => setFormData({...formData, period_start: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('form_period_end')}</Label>
              <Input
                type="date"
                required
                value={formData.period_end}
                onChange={e => setFormData({...formData, period_end: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('form_study_time')} (Contoh: 08.00 - 12.00)</Label>
              <Input type="text" required value={formData.study_time} placeholder="08.00 - 12.00" onChange={e => setFormData({...formData, study_time: e.target.value})} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label>{t('form_material')}</Label>
              <Input required placeholder="e.g. Minna no Nihongo Bab 1-5" value={formData.learning_material} onChange={e => setFormData({...formData, learning_material: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-secondary/5 to-transparent">
            <h3 className="font-bold text-slate-800 text-sm">{t('form_scores')}</h3>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Kosakata</Label>
              <Input className={getColor(formData.score_kosakata, false)} type="number" min="0" max="100" required={!isPemula} value={formData.score_kosakata} onChange={e => setFormData({...formData, score_kosakata: e.target.value === '' ? '' : parseInt(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label>Hiragana</Label>
              <Input className={getColor(formData.score_hiragana, false)} type="number" min="0" max="100" required={!isPemula} value={formData.score_hiragana} onChange={e => setFormData({...formData, score_hiragana: e.target.value === '' ? '' : parseInt(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label>Katakana</Label>
              <Input className={getColor(formData.score_katakana, false)} type="number" min="0" max="100" required={!isPemula} value={formData.score_katakana} onChange={e => setFormData({...formData, score_katakana: e.target.value === '' ? '' : parseInt(e.target.value)})} />
            </div>
            <div className="space-y-2">
              <Label>Hasil Ujian</Label>
              <Input className={getColor(formData.score_ujian, true)} type="number" min="0" max="100" required value={formData.score_ujian} onChange={e => setFormData({...formData, score_ujian: e.target.value === '' ? '' : parseInt(e.target.value)})} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-transparent">
              <h3 className="font-bold text-slate-800 text-sm">{t('form_attendance')}</h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>{t('form_sick')}</Label>
                <Input type="number" min="0" required value={formData.attendance_sakit} onChange={e => setFormData({...formData, attendance_sakit: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>{t('form_permission')}</Label>
                <Input type="number" min="0" required value={formData.attendance_ijin} onChange={e => setFormData({...formData, attendance_ijin: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label>{t('form_absent')}</Label>
                <Input type="number" min="0" required value={formData.attendance_alfa} onChange={e => setFormData({...formData, attendance_alfa: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2 col-span-3">
                <Label className={getBehaviorColor(formData.behavior)}>{t('reports_behavior')}</Label>
                <Select value={formData.behavior} onValueChange={v => setFormData({...formData, behavior: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">A - Amat Baik</SelectItem>
                    <SelectItem value="B">B - Baik</SelectItem>
                    <SelectItem value="C">C - Cukup</SelectItem>
                    <SelectItem value="D">D - Kurang</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-secondary/5 to-transparent">
              <h3 className="font-bold text-slate-800 text-sm">{t('form_physical')}</h3>
            </div>
            <div className="p-6 grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label>Push Up</Label>
                <Input placeholder="e.g. 50x / Menit" value={formData.physical_push_up} onChange={e => setFormData({...formData, physical_push_up: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Sit Up</Label>
                <Input placeholder="e.g. 45x / Menit" value={formData.physical_sit_up} onChange={e => setFormData({...formData, physical_sit_up: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Lari</Label>
                <Input placeholder="e.g. 15 Menit / 2 KM" value={formData.physical_lari} onChange={e => setFormData({...formData, physical_lari: e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-transparent">
            <h3 className="font-bold text-slate-800 text-sm">{t('form_notes')}</h3>
          </div>
          <div className="p-6 grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label>Teacher Notes (Catatan Guru)</Label>
              <Textarea rows={3} value={formData.teacher_notes} onChange={e => setFormData({...formData, teacher_notes: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Additional Notes (Catatan ノート)</Label>
              <Textarea rows={3} value={formData.additional_notes} onChange={e => setFormData({...formData, additional_notes: e.target.value})} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-secondary/5 to-transparent">
            <h3 className="font-bold text-slate-800 text-sm">{t('form_signatures')}</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t('form_guardian')}</Label>
              <Input placeholder="Wali Siswa" required value={formData.guardian_name} onChange={e => setFormData({...formData, guardian_name: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>{t('form_teacher')}</Label>
              <Select required value={formData.teacher_name} onValueChange={v => setFormData({...formData, teacher_name: v})}>
                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>
                  {signatories?.filter(s => s.type === 'teacher').map(s => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t('form_headmaster')}</Label>
              <Select required value={formData.headmaster_name} onValueChange={v => setFormData({...formData, headmaster_name: v})}>
                <SelectTrigger><SelectValue placeholder="Select headmaster" /></SelectTrigger>
                <SelectContent>
                  {signatories?.filter(s => s.type === 'headmaster').map(s => (
                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <button type="submit" disabled={updateReportMutation.isPending}
          className="w-full h-12 rounded-2xl font-bold text-white text-sm bg-gradient-to-r from-primary to-secondary shadow-primary-glow hover:opacity-90 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60">
          {updateReportMutation.isPending ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>{t('loading')}</>
          ) : t('form_update_report')}
        </button>
      </form>
    </div>
  )
}
