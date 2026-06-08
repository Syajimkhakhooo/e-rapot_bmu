import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/config/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { id as idLocale, ja as jaLocale } from 'date-fns/locale'

export default function VerifyReport() {
  const { token } = useParams()
  const { t, i18n } = useTranslation()

  const { data: report, isLoading, error } = useQuery({
    queryKey: ['verify-report', token],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          students(full_name, student_id, classes(name))
        `)
        .eq('verification_token', token)
        .single()
      
      if (error) throw error
      return data
    },
    retry: false
  })

  const dateLocaleStr = i18n.language === 'ja' ? 'ja-JP' : 'id-ID'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center pb-2">
          <img src="/logo for overlay.png" alt="BMU Logo" className="w-16 h-16 mx-auto mb-4 object-contain" onError={(e) => e.target.style.display='none'} />
          <CardTitle className="text-2xl font-bold">{t('verify_title')}</CardTitle>
          <p className="text-sm text-muted-foreground">E-Rapot Bina Mutu Utama</p>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {isLoading ? (
            <div className="text-center py-8">{t('verify_verifying')}</div>
          ) : error || !report ? (
            <div className="text-center py-8 space-y-4">
              <XCircle className="w-16 h-16 text-red-500 mx-auto" />
              <div>
                <h3 className="font-bold text-xl text-red-600">{t('verify_invalid_title')}</h3>
                <p className="text-slate-600 mt-2 text-sm">{t('verify_invalid_desc')}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                <h3 className="font-bold text-xl text-green-600">{t('verify_valid_title')}</h3>
                <p className="text-sm text-slate-600 bg-green-50 p-2 rounded-md border border-green-100">
                  {t('verify_valid_desc')}
                </p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg border text-sm space-y-3">
                <div className="grid grid-cols-[100px_1fr]">
                  <span className="text-slate-500 font-medium">{t('students_name')}</span>
                  <span className="font-bold text-slate-900">{report.students?.full_name}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr]">
                  <span className="text-slate-500 font-medium">{t('students_id')}</span>
                  <span className="font-medium text-slate-900">{report.students?.student_id}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr]">
                  <span className="text-slate-500 font-medium">{t('students_class')}</span>
                  <span className="font-medium text-slate-900">{report.students?.classes?.name}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr]">
                  <span className="text-slate-500 font-medium">{t('reports_period')}</span>
                  <span className="font-medium text-slate-900">
                    {new Date(report.period_start).toLocaleDateString(dateLocaleStr)} - {new Date(report.period_end).toLocaleDateString(dateLocaleStr)}
                  </span>
                </div>
                <div className="grid grid-cols-[100px_1fr]">
                  <span className="text-slate-500 font-medium">{t('verify_issued_date')}</span>
                  <span className="font-medium text-slate-900">{new Date(report.created_at).toLocaleDateString(dateLocaleStr)}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-4 text-center">
            <Button asChild variant="outline" className="w-full">
              <Link to="/login">{t('verify_go_login')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
