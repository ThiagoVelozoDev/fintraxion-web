import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/useLanguage'
import { useAuth } from '../contexts/AuthContext'

const IconBolt = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
)

const IconMail = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
)

const IconLock = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
)

export function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { language, setLanguage, t } = useLanguage()
  const { signIn, signInWithGoogle } = useAuth()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const redirectPath = location.state?.from?.pathname ?? '/dashboard'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email || !password) return
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate(redirectPath, { replace: true })
    } catch {
      setError(t('Invalid email or password.', 'Email ou senha inválidos.'))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      await signInWithGoogle()
      navigate(redirectPath, { replace: true })
    } catch {
      setError(t('Google sign-in failed. Try again.', 'Falha no login com Google. Tente novamente.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* ── Left branding panel ── */}
      <div className="login-branding">
        <div className="login-branding-content">
          <div className="login-brand-logo">
            <div className="login-brand-icon">
              <IconBolt />
            </div>
            <span className="login-brand-name">
              Fin<span>traxion</span>
            </span>
          </div>

          <h2 className="login-tagline">
            {t('Run your finances', 'Gerencie suas finanças')}
            <br />
            <span>{t('like a CFO.', 'como um CFO.')}</span>
          </h2>
          <p className="login-tagline-sub">
            {t(
              'Transform personal finance into a strategic engine — track revenue, control costs, and grow net worth with precision.',
              'Transforme suas finanças pessoais em um motor estratégico — rastreie receitas, controle custos e aumente seu patrimônio com precisão.',
            )}
          </p>

          <div className="login-metrics">
            <div className="login-metric">
              <span className="login-metric-val">6+</span>
              <span className="login-metric-label">{t('Entry Types', 'Tipos de Lançamento')}</span>
            </div>
            <div className="login-metric">
              <span className="login-metric-val">4</span>
              <span className="login-metric-label">{t('Core KPIs', 'KPIs Principais')}</span>
            </div>
            <div className="login-metric">
              <span className="login-metric-val">EN/PT</span>
              <span className="login-metric-label">{t('Languages', 'Idiomas')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="login-form-panel">
        <div className="login-form-wrap">
          <div className="login-form-header">
            <div>
              <h1 className="login-form-title">{t('Welcome back', 'Bem-vindo de volta')}</h1>
              <p className="login-form-sub">
                {t('Sign in to your financial dashboard.', 'Entre no seu painel financeiro.')}
              </p>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
              type="button"
            >
              {language === 'en' ? '🇧🇷 PT' : '🇺🇸 EN'}
            </button>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label" htmlFor="email">
                {t('Email', 'Email')}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }}>
                  <IconMail />
                </span>
                <input
                  id="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  style={{ paddingLeft: '2.5rem' }}
                  type="email"
                  value={email}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="field-label" htmlFor="password">
                {t('Password', 'Senha')}
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }}>
                  <IconLock />
                </span>
                <input
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{ paddingLeft: '2.5rem' }}
                  type="password"
                  value={password}
                  required
                />
              </div>
            </div>

            {error && (
              <p style={{ color: 'var(--red, #f87171)', fontSize: '0.83rem', margin: '0' }}>
                {error}
              </p>
            )}

            <button
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: '0.5rem', width: '100%', padding: '0.8rem', opacity: loading ? 0.7 : 1 }}
              type="submit"
            >
              {loading
                ? t('Signing in…', 'Entrando…')
                : t('Enter Platform', 'Entrar na Plataforma')}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.25rem 0' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-subtle)' }} />
              <span style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>{t('or', 'ou')}</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px solid var(--border-subtle)' }} />
            </div>

            <button
              className="btn btn-ghost"
              disabled={loading}
              onClick={() => { void handleGoogle() }}
              style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              {t('Continue with Google', 'Entrar com Google')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
