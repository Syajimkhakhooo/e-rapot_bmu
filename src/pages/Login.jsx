import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from 'react-i18next'
import { supabase } from '@/config/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  if (user) {
    return <Navigate to="/" replace />
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      navigate('/')
    } catch (error) {
      setErrorMsg(error.message || 'Login gagal. Periksa kembali kredensial Anda.')
    } finally {
      setLoading(false)
    }
  }

  const switchLang = () => {
    const nextLang = i18n.language === 'id' ? 'ja' : 'id'
    i18n.changeLanguage(nextLang)
  }

  return (
    <div className="flex min-h-screen bg-surface-bright relative items-center justify-center overflow-hidden">
      
      {/* Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Language Switcher */}
      <button 
        onClick={switchLang}
        className="absolute top-6 right-6 flex items-center justify-center gap-2 bg-white border border-outline-variant rounded-full px-4 py-2 shadow-sm hover:bg-surface-variant transition-colors text-on-surface font-label-md text-sm z-50"
      >
        <span className="material-symbols-outlined text-[18px]">language</span>
        {i18n.language === 'id' ? 'ID' : 'JA'}
      </button>

      <div className="w-full max-w-[440px] px-6 py-12 relative z-10 animate-fade-in">
        
        {/* White Card */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 backdrop-blur-sm">
          
          <div className="flex flex-col items-center text-center mb-8">
            {/* Logo */}
            <div className="w-20 h-20 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-5 p-3 border border-slate-100">
              <img src="/logo-rapot.png" alt="LPK BMU Logo" className="w-full h-full object-contain" />
            </div>
            
            <h1 className="font-headline-lg text-2xl font-bold tracking-tight text-slate-800 mb-2">
              Digital Report Card
            </h1>
            <p className="font-body-md text-sm text-slate-500">
              {t('login_subtitle') || 'Sistem informasi rapot LPK So Bahtera Mitra Unggulan.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {errorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-600 font-body-md text-sm p-3 rounded-xl flex items-start gap-2 animate-fade-in">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                <span>{errorMsg}</span>
              </div>
            )}
            
            <div className="space-y-2">
              <Label className="font-label-md text-sm text-slate-700 font-semibold">{t('users_email') || 'Email'}</Label>
              <Input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="h-12 rounded-xl border-slate-200 focus-visible:ring-primary focus-visible:border-primary font-body-md text-sm bg-slate-50/50 hover:bg-slate-50 transition-colors"
                placeholder="nama@email.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="font-label-md text-sm text-slate-700 font-semibold">{t('password') || 'Password'}</Label>
              <Input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="h-12 rounded-xl border-slate-200 focus-visible:ring-primary focus-visible:border-primary font-body-md text-sm bg-slate-50/50 hover:bg-slate-50 transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full h-12 bg-slate-800 text-white hover:bg-slate-700 transition-all font-label-md font-bold text-sm rounded-xl flex items-center justify-center disabled:opacity-70 shadow-sm shadow-slate-800/10 hover:shadow-md hover:-translate-y-0.5 duration-200"
                disabled={loading}
              >
                {loading ? (
                  <span className="material-symbols-outlined animate-spin mr-2 text-[18px]">progress_activity</span>
                ) : null}
                {loading ? t('loading') || 'Masuk...' : t('login_signin') || 'Masuk Sistem'}
              </button>
            </div>
          </form>

        </div>
        
        {/* Footer info */}
        <div className="text-center mt-8">
          <p className="font-body-md text-xs text-slate-400">
            &copy; {new Date().getFullYear()} LPK So Bahtera Mitra Unggulan
          </p>
        </div>
        
      </div>
    </div>
  )
}
