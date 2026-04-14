import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../../i18n/useLanguage'

const AUTH_KEY = 'fintraxion_auth'

const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

export function Header() {
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()

  function handleLogout() {
    localStorage.removeItem(AUTH_KEY)
    navigate('/login')
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">
          {t('Financial Command Center', 'Central de Comando Financeiro')}
        </h1>
        <p className="topbar-subtitle">
          {t('Operate your finances like a business.', 'Gerencie suas finanças como uma empresa.')}
        </p>
      </div>

      <div className="topbar-actions">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
          type="button"
          title={t('Switch to Portuguese', 'Mudar para Inglês')}
        >
          {language === 'en' ? '🇧🇷 PT' : '🇺🇸 EN'}
        </button>

        <button
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
          type="button"
          title={t('Logout', 'Sair')}
        >
          <IconLogout />
          {t('Logout', 'Sair')}
        </button>

        <div className="topbar-avatar" title="User">U</div>
      </div>
    </header>
  )
}
