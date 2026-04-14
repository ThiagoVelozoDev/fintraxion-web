import { useLanguage } from '../i18n/useLanguage'

const IconInfo = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const IconWarn = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

const IconDanger = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

const IconChart = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
  </svg>
)

const IconShield = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

type InsightSeverity = 'info' | 'warn' | 'danger'

type InsightItem = { text: string; severity: InsightSeverity }

function InsightRow({ text, severity }: InsightItem) {
  const dotClass = severity === 'info' ? 'insight-dot-info' : severity === 'warn' ? 'insight-dot-warn' : 'insight-dot-danger'
  const Icon = severity === 'info' ? IconInfo : severity === 'warn' ? IconWarn : IconDanger
  return (
    <div className="insight-item">
      <div className={`insight-dot ${dotClass}`}><Icon /></div>
      <p className="insight-text">{text}</p>
    </div>
  )
}

export function InsightsPage() {
  const { t, language } = useLanguage()

  const insights: InsightItem[] = language === 'pt'
    ? [
        { text: 'Gastos no fim de semana estão 31% acima dos dias úteis.', severity: 'info' },
        { text: 'Custos fixos representam 52% da receita total — limite recomendado é 50%.', severity: 'warn' },
        { text: 'Aporte em investimentos caiu 8% nos últimos 2 meses.', severity: 'warn' },
        { text: 'Taxa de poupança de 28% está acima da meta de 25%. Excelente!', severity: 'info' },
      ]
    : [
        { text: 'Weekend spending is 31% higher than weekdays.', severity: 'info' },
        { text: 'Fixed costs are at 52% of revenue — recommended cap is 50%.', severity: 'warn' },
        { text: 'Investment contribution dropped 8% over the last 2 months.', severity: 'warn' },
        { text: 'Savings rate of 28% is above the 25% target. Excellent!', severity: 'info' },
      ]

  const alerts: InsightItem[] = language === 'pt'
    ? [
        { text: 'Tendência de liquidez em queda por 3 semanas consecutivas.', severity: 'danger' },
        { text: 'Utilização do cartão de crédito atingiu 76% neste ciclo.', severity: 'danger' },
        { text: 'Índice de endividamento se aproximando do limite de alerta (45%).', severity: 'warn' },
      ]
    : [
        { text: 'Liquidity trend is decreasing for 3 consecutive weeks.', severity: 'danger' },
        { text: 'Credit card utilization reached 76% this cycle.', severity: 'danger' },
        { text: 'Debt ratio approaching alert threshold of 45%.', severity: 'warn' },
      ]

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>{t('Smart Insights', 'Insights Inteligentes')}</h2>
        <p>{t('Behavioral patterns and risk alerts from your financial data.', 'Padrões comportamentais e alertas de risco dos seus dados financeiros.')}</p>
      </div>

      <div className="insights-grid">
        {/* Insights */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: '0.75rem' }}>
            <div>
              <p className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: 'var(--cyan)' }}><IconChart /></span>
                {t('Behavioral Insights', 'Insights Comportamentais')}
              </p>
              <p className="card-subtitle">{t('Patterns detected in your spending', 'Padrões detectados nos seus gastos')}</p>
            </div>
          </div>
          <div className="insight-list">
            {insights.map((item, i) => (
              <InsightRow key={i} {...item} />
            ))}
          </div>
        </div>

        {/* Risk alerts */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: '0.75rem' }}>
            <div>
              <p className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: 'var(--red)' }}><IconShield /></span>
                {t('Risk Alerts', 'Alertas de Risco')}
              </p>
              <p className="card-subtitle">{t('Issues requiring your attention', 'Situações que precisam de atenção')}</p>
            </div>
          </div>
          <div className="insight-list">
            {alerts.map((item, i) => (
              <InsightRow key={i} {...item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
