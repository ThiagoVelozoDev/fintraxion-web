import { useState } from 'react'
import { useLanguage } from '../i18n/useLanguage'

const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

export function SettingsPage() {
  const { t } = useLanguage()
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>{t('Workspace Settings', 'Configurações do Sistema')}</h2>
        <p>{t('Configure thresholds, preferences, and profile details.', 'Configure limites, preferências e detalhes do perfil.')}</p>
      </div>

      <div className="settings-sections">
        {/* Financial Targets */}
        <div className="card">
          <p className="settings-section-title">{t('Financial Targets', 'Metas Financeiras')}</p>
          <div className="settings-rows">
            <div className="settings-row">
              <div className="settings-row-info">
                <p className="settings-row-label">{t('Monthly savings target', 'Meta mensal de poupança')}</p>
                <p className="settings-row-desc">{t('Minimum % of income to save each month.', 'Porcentagem mínima da renda a poupar por mês.')}</p>
              </div>
              <div className="settings-row-control">
                <input defaultValue="25" min="0" max="100" type="number" />
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-info">
                <p className="settings-row-label">{t('Investment target', 'Meta de investimento')}</p>
                <p className="settings-row-desc">{t('% of income allocated to investments.', '% da renda alocada para investimentos.')}</p>
              </div>
              <div className="settings-row-control">
                <input defaultValue="15" min="0" max="100" type="number" />
              </div>
            </div>
          </div>
        </div>

        {/* Alert Thresholds */}
        <div className="card">
          <p className="settings-section-title">{t('Alert Thresholds', 'Limites de Alerta')}</p>
          <div className="settings-rows">
            <div className="settings-row">
              <div className="settings-row-info">
                <p className="settings-row-label">{t('Debt alert threshold', 'Limite de alerta de dívida')}</p>
                <p className="settings-row-desc">{t('Trigger a risk alert when debt ratio exceeds this %.', 'Disparar alerta de risco quando índice de dívida ultrapassar este %.')}</p>
              </div>
              <div className="settings-row-control">
                <input defaultValue="45" min="0" max="100" type="number" />
              </div>
            </div>

            <div className="settings-row">
              <div className="settings-row-info">
                <p className="settings-row-label">{t('Fixed cost ceiling', 'Teto de custo fixo')}</p>
                <p className="settings-row-desc">{t('Alert when fixed costs exceed % of revenue.', 'Alertar quando custos fixos ultrapassarem % da receita.')}</p>
              </div>
              <div className="settings-row-control">
                <input defaultValue="50" min="0" max="100" type="number" />
              </div>
            </div>
          </div>
        </div>

        {/* Display Preferences */}
        <div className="card">
          <p className="settings-section-title">{t('Display Preferences', 'Preferências de Exibição')}</p>
          <div className="settings-rows">
            <div className="settings-row">
              <div className="settings-row-info">
                <p className="settings-row-label">{t('Preferred currency', 'Moeda preferida')}</p>
                <p className="settings-row-desc">{t('Used for formatting amounts across the platform.', 'Usada para formatar valores em toda a plataforma.')}</p>
              </div>
              <div className="settings-row-control">
                <select defaultValue="USD">
                  <option value="USD">USD ($)</option>
                  <option value="BRL">BRL (R$)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-save-row">
        <button
          className={`btn ${saved ? 'btn-ghost' : 'btn-primary'}`}
          onClick={handleSave}
          style={{ minWidth: 140 }}
          type="button"
        >
          {saved ? (
            <>
              <IconCheck />
              {t('Saved!', 'Salvo!')}
            </>
          ) : (
            t('Save Changes', 'Salvar Alterações')
          )}
        </button>
      </div>
    </div>
  )
}
