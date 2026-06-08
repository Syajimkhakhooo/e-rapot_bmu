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
  const { t } = useTranslation()

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

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Left side: Branding area */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 bg-primary relative overflow-hidden text-on-primary">
        <div className="relative z-10">
          <div className="w-10 h-10 bg-white/10 rounded-md flex items-center justify-center mb-6 border border-white/20">
            <span className="material-symbols-outlined text-white text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>language</span>
          </div>
          <h1 className="font-headline-lg text-4xl font-semibold tracking-tight mb-4 max-w-md leading-tight text-white">
            Digital Report Card System
          </h1>
          <p className="font-body-md text-sm text-white/80 max-w-md leading-relaxed">
            Streamlined student performance tracking and report generation for LPK So Bahtera Mitra Unggulan.
          </p>
        </div>
        
        {/* Abstract Background pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute right-0 top-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl" />
        </div>

        <div className="relative z-10 font-body-md text-xs text-white/60">
          © {new Date().getFullYear()} LPK So Bahtera Mitra Unggulan
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          
          <div className="text-center lg:text-left">
            <div className="w-10 h-10 bg-surface-variant border border-outline-variant rounded-md flex items-center justify-center mb-6 mx-auto lg:mx-0 lg:hidden text-primary">
              <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>language</span>
            </div>
            <h2 className="font-headline-lg text-2xl text-on-surface font-semibold tracking-tight">
              {t('login_welcome')}
            </h2>
            <p className="font-body-md text-sm text-on-surface-variant mt-2">
              {t('login_subtitle')}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {errorMsg && (
              <div className="bg-error-container border border-error/20 text-error font-body-md text-sm p-3 rounded-md flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">error</span>
                <span>{errorMsg}</span>
              </div>
            )}
            
            <div className="space-y-1.5">
              <Label className="font-label-md text-sm text-on-surface">Email</Label>
              <Input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="h-10 rounded-md border-outline-variant focus-visible:ring-primary focus-visible:border-primary font-body-md text-sm bg-surface-bright"
                placeholder="Enter your email"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label className="font-label-md text-sm text-on-surface">Password</Label>
              <Input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="h-10 rounded-md border-outline-variant focus-visible:ring-primary focus-visible:border-primary font-body-md text-sm bg-surface-bright"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              className="w-full h-10 bg-primary text-on-primary hover:bg-primary/90 transition-colors font-label-md text-sm rounded-md mt-4 flex items-center justify-center disabled:opacity-70 shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin mr-2 text-[18px]">progress_activity</span>
              ) : null}
              {loading ? t('login_signing_in') : t('login_signin')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
