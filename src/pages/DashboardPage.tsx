import { StatCard } from '../components/ui/StatCard'
import { useLanguage } from '../i18n/useLanguage'

const IconProfit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
)

const IconSavings = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" /><path d="M12 6v6l4 2" />
  </svg>
)

const IconDebt = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3h18v18H3z" /><path d="M3 9h18M9 21V9" />
  </svg>
)

const IconNetWorth = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
)

const SCORE_CIRCUMFERENCE = 2 * Math.PI * 30

type ProgressItem = { label: string; value: string; pct: number; fill: string }

function ProgressBar({ label, value, pct, fill }: ProgressItem) {
  return (
    <div className="progress-item">
      <div className="progress-item-header">
        <span className="progress-item-label">{label}</span>
        <span className="progress-item-value">{value}</span>
      </div>
      <div className="progress-track">
        <div className={`progress-fill ${fill}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

type TxMini = { title: string; type: string; amount: string; date: string; positive: boolean; icon: string; bg: string }

export function DashboardPage() {
  const { t } = useLanguage()

  const stats = [
    {
      label: t('Monthly Net Profit', 'Lucro Líquido Mensal'),
      value: '$2,430',
      trend: '+12.4%',
      icon: <IconProfit />,
      variant: 'accent' as const,
    },
    {
      label: t('Savings Rate', 'Taxa de Poupança'),
      value: '28%',
      trend: '+3.2%',
      icon: <IconSavings />,
      variant: 'green' as const,
    },
    {
      label: t('Debt Ratio', 'Índice de Endividamento'),
      value: '34%',
      trend: '-2.1%',
      icon: <IconDebt />,
      variant: 'amber' as const,
    },
    {
      label: t('Net Worth', 'Patrimônio Total'),
      value: '$94,200',
      trend: '+8.7%',
      icon: <IconNetWorth />,
      variant: 'cyan' as const,
    },
  ]

  const budgetItems: ProgressItem[] = [
    { label: t('Fixed Costs', 'Custos Fixos'),     value: '52%', pct: 52, fill: 'progress-fill-amber' },
    { label: t('Investments', 'Investimentos'),    value: '18%', pct: 18, fill: 'progress-fill-accent' },
    { label: t('Savings',     'Poupança'),         value: '28%', pct: 28, fill: 'progress-fill-green' },
    { label: t('Variable',    'Variável'),         value: '12%', pct: 12, fill: 'progress-fill-red' },
  ]

  const recentTx: TxMini[] = [
    { title: t('Salary', 'Salário'),           type: t('Revenue', 'Receita'),      amount: '+$4,200', date: '2025-04-10', positive: true,  icon: '💰', bg: 'var(--green-dim)' },
    { title: t('Rent', 'Aluguel'),             type: t('Fixed Cost', 'Custo Fixo'), amount: '-$950',  date: '2025-04-05', positive: false, icon: '🏠', bg: 'var(--amber-dim)' },
    { title: t('Freelance', 'Freelance'),      type: t('Revenue', 'Receita'),      amount: '+$820',  date: '2025-04-03', positive: true,  icon: '💻', bg: 'var(--green-dim)' },
    { title: t('Groceries', 'Mercado'),        type: t('Variable', 'Variável'),    amount: '-$340',  date: '2025-04-01', positive: false, icon: '🛒', bg: 'var(--red-dim)' },
  ]

  const scoreVal = 74
  const scoreDash = (scoreVal / 100) * SCORE_CIRCUMFERENCE

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>{t('Executive Dashboard', 'Painel Executivo')}</h2>
        <p>{t('Core indicators to guide your strategic decisions.', 'Indicadores centrais para orientar suas decisões estratégicas.')}</p>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Second row */}
      <div className="two-col-grid">
        {/* Budget allocation */}
        <div className="card">
          <div className="card-header">
            <div>
              <p className="card-title">{t('Budget Allocation', 'Alocação de Orçamento')}</p>
              <p className="card-subtitle">{t('Revenue distribution this month', 'Distribuição da receita este mês')}</p>
            </div>
          </div>
          <div className="progress-list">
            {budgetItems.map((item) => (
              <ProgressBar key={item.label} {...item} />
            ))}
          </div>
        </div>

        {/* Financial Health Score */}
        <div className="card">
          <div className="card-header">
            <div>
              <p className="card-title">{t('Financial Health', 'Saúde Financeira')}</p>
              <p className="card-subtitle">{t('Composite score across all metrics', 'Pontuação composta de todas as métricas')}</p>
            </div>
          </div>
          <div className="health-score-wrap" style={{ marginBottom: '1.5rem' }}>
            <div className="health-score-circle">
              <svg className="health-score-svg" width="72" height="72" viewBox="0 0 72 72">
                <defs>
                  <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="var(--accent)" />
                    <stop offset="100%" stopColor="var(--cyan)" />
                  </linearGradient>
                </defs>
                <circle className="health-score-track" cx="36" cy="36" r="30" />
                <circle
                  className="health-score-fill"
                  cx="36" cy="36" r="30"
                  strokeDasharray={`${scoreDash} ${SCORE_CIRCUMFERENCE}`}
                />
              </svg>
              <div className="health-score-label">
                <span className="health-score-num">{scoreVal}</span>
                <span className="health-score-unit">/100</span>
              </div>
            </div>
            <div className="health-score-info">
              <p className="health-score-title">{t('Good Standing', 'Situação Boa')}</p>
              <p className="health-score-desc">
                {t(
                  'Debt ratio within target. Savings above average. Consider increasing investments.',
                  'Índice de dívida dentro da meta. Poupança acima da média. Considere aumentar investimentos.',
                )}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: t('Revenue target', 'Meta de receita'), pct: 88, fill: 'progress-fill-green' },
              { label: t('Debt target', 'Meta de dívida'),    pct: 66, fill: 'progress-fill-amber' },
            ].map((item) => (
              <ProgressBar key={item.label} {...item} value={`${item.pct}%`} />
            ))}
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card" style={{ padding: 0 }}>
        <div className="card-header" style={{ padding: '1rem 1.25rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <p className="card-title">{t('Recent Entries', 'Lançamentos Recentes')}</p>
            <p className="card-subtitle">{t('Latest financial movements', 'Últimas movimentações financeiras')}</p>
          </div>
          <a href="/transactions" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            {t('View all →', 'Ver todos →')}
          </a>
        </div>
        <div className="tx-mini-list" style={{ padding: '0 1.25rem' }}>
          {recentTx.map((tx) => (
            <div className="tx-mini-item" key={tx.title + tx.date}>
              <div className="tx-mini-icon" style={{ background: tx.bg }}>{tx.icon}</div>
              <div className="tx-mini-info">
                <div className="tx-mini-title">{tx.title}</div>
                <div className="tx-mini-date">{tx.type} · {tx.date}</div>
              </div>
              <span className={`tx-mini-amount ${tx.positive ? 'amount-positive' : 'amount-negative'}`}>
                {tx.amount}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
