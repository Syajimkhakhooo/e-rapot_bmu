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
              
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm text-center leading-relaxed">
                <p className="font-semibold text-slate-800 mb-5 uppercase text-sm">
                  {i18n.language === 'ja' 
                    ? "この成績表はBMU成績システムによって公式に発行された原本です：" 
                    : "Rapot ini adalah ASLI dan RESMI dicetak oleh Sistem E-Rapot BMU pada:"}
                </p>
                
                <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-2 text-left max-w-[260px] mx-auto mb-8 font-medium text-sm">
                  <span className="text-slate-500">{i18n.language === 'ja' ? '日付' : 'TANGGAL'}</span> 
                  <span>: {new Date(report.created_at).toLocaleDateString(dateLocaleStr, { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  
                  <span className="text-slate-500">{i18n.language === 'ja' ? '曜日' : 'HARI'}</span>    
                  <span>: {new Date(report.created_at).toLocaleDateString(dateLocaleStr, { weekday: 'long' })}</span>
                  
                  <span className="text-slate-500">{i18n.language === 'ja' ? '時間' : 'JAM'}</span>     
                  <span>: {new Date(report.created_at).toLocaleTimeString(dateLocaleStr, { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                <p className="text-slate-600 mb-2 text-sm">
                  {i18n.language === 'ja' ? '授与対象者：' : 'DIBERIKAN KEPADA ATAS NAMA:'}
                </p>
                <p className="text-xl font-bold text-primary uppercase border-b-2 border-primary/20 inline-block px-4 pb-1">
                  {report.students?.full_name}
                </p>
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
