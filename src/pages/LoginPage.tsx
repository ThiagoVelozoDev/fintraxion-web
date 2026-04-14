import { useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../i18n/useLanguage'

const AUTH_KEY = 'fintraxion_auth'

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
  const navigate = useNavigate()
  const location = useLocation()
  const { language, setLanguage, t } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email || !password) return
    localStorage.setItem(AUTH_KEY, 'true')
    const redirectPath = location.state?.from?.pathname ?? '/dashboard'
    navigate(redirectPath, { replace: true })
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

            <button className="btn btn-primary" style={{ marginTop: '0.5rem', width: '100%', padding: '0.8rem' }} type="submit">
              {t('Enter Platform', 'Entrar na Plataforma')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
