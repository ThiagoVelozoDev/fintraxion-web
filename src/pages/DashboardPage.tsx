import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { TYPE_META } from '../data/categories'
import type { EntryType } from '../data/categories'
import type { RecurringTemplate } from './FixedCostsPage'
import { StatCard } from '../components/ui/StatCard'
import { useLanguage } from '../i18n/useLanguage'

type FinancialEntry = {
  id: string
  title: string
  type: EntryType
  category_id: string
  amount: number
  date: string
}

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
        <div className={`progress-fill ${fill}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  )
}

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

function sumByType(arr: FinancialEntry[], type: EntryType): number {
  return arr.filter((e) => e.type === type).reduce((s, e) => s + e.amount, 0)
}

function pct(part: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((part / total) * 100)
}

function currentMonthValue(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(ym: string, lang: string): string {
  const [y, m] = ym.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { month: 'long', year: 'numeric' })
}

export function DashboardPage() {
  const { user } = useAuth()
  const uid = user!.uid
  const { t, language } = useLanguage()

  const [entries,       setEntries]       = useState<FinancialEntry[]>([])
  const [recurring,     setRecurring]     = useState<RecurringTemplate[]>([])
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue)

  useEffect(() => {
    const q = query(collection(db, 'users', uid, 'transactions'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) => {
      setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FinancialEntry))
    })
  }, [uid])

  useEffect(() => {
    return onSnapshot(collection(db, 'users', uid, 'recurring_templates'), (snap) => {
      setRecurring(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RecurringTemplate))
    })
  }, [uid])

  const fmt = useMemo(
    () => new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : 'en-US', { style: 'currency', currency: language === 'pt' ? 'BRL' : 'USD', maximumFractionDigits: 0 }),
    [language],
  )

  // ── Data slices ──────────────────────────────────────────────
  const activeRecurring = useMemo(() => recurring.filter((r) => r.active), [recurring])
  const monthEntries    = useMemo(() => entries.filter((e) => e.date.startsWith(selectedMonth)), [entries, selectedMonth])

  // ── Monthly totals (recurring + one-time this month) ─────────
  const totalRevenue    = useMemo(() =>
    activeRecurring.filter((r) => r.type === 'revenue').reduce((s, r) => s + r.amount, 0) +
    sumByType(monthEntries, 'revenue'), [activeRecurring, monthEntries])

  const totalFixedCost  = useMemo(() =>
    activeRecurring.filter((r) => r.type === 'fixed_cost').reduce((s, r) => s + r.amount, 0) +
    sumByType(monthEntries, 'fixed_cost'), [activeRecurring, monthEntries])

  const totalVariable   = useMemo(() => sumByType(monthEntries, 'variable_cost'), [monthEntries])
  const totalExpense    = useMemo(() => sumByType(monthEntries, 'expense'),        [monthEntries])

  const totalInvestment = useMemo(() =>
    activeRecurring.filter((r) => r.type === 'investment').reduce((s, r) => s + r.amount, 0) +
    sumByType(monthEntries, 'investment'), [activeRecurring, monthEntries])

  const totalDebt       = useMemo(() =>
    activeRecurring.filter((r) => r.type === 'debt').reduce((s, r) => s + r.amount, 0) +
    sumByType(monthEntries, 'debt'), [activeRecurring, monthEntries])

  const totalCosts      = totalFixedCost + totalVariable + totalExpense

  // ── KPIs ─────────────────────────────────────────────────────
  const netProfit   = totalRevenue - totalCosts - totalDebt
  const savingsRate = pct(totalInvestment, totalRevenue)
  const debtRatio   = pct(totalDebt, totalRevenue)

  // Net Worth = cumulative balance from all one-time entries ever recorded
  const netWorth = useMemo(
    () => entries.reduce((s, e) => s + (TYPE_META[e.type].positive ? e.amount : -e.amount), 0),
    [entries],
  )

  // ── Health Score (0–100) ──────────────────────────────────────
  const score = useMemo(() => {
    const hasData = totalRevenue > 0 || entries.length > 0
    if (!hasData) return 0
    let s = 20 // base: has data
    if      (savingsRate >= 20) s += 30
    else if (savingsRate >= 10) s += 20
    else if (savingsRate >  0)  s += 10
    if      (debtRatio <= 20)   s += 30
    else if (debtRatio <= 35)   s += 20
    else if (debtRatio <  50)   s += 10
    if      (netProfit > 0)     s += 20
    else if (netProfit >= 0)    s += 10
    return Math.min(s, 100)
  }, [totalRevenue, entries.length, savingsRate, debtRatio, netProfit])

  const scoreLabel = score === 0
    ? t('No data yet', 'Sem dados ainda')
    : score < 40 ? t('Needs Attention', 'Atenção Necessária')
    : score < 65 ? t('Fair', 'Regular')
    : score < 85 ? t('Good Standing', 'Situação Boa')
    : t('Excellent', 'Excelente')

  const scoreDesc = score === 0
    ? t('Add recurring entries and transactions to see your score.', 'Adicione lançamentos fixos e transações para ver sua pontuação.')
    : score < 40
      ? t('Expenses are high relative to revenue. Review your costs.', 'Despesas altas em relação à receita. Revise seus custos.')
      : score < 65
        ? t('Some areas need improvement. Focus on savings and debt reduction.', 'Algumas áreas precisam de atenção. Foque em poupança e redução de dívidas.')
        : score < 85
          ? t('Debt ratio within target. Consider increasing investments.', 'Índice de dívida dentro da meta. Considere aumentar investimentos.')
          : t('Outstanding financial health. Keep up the discipline.', 'Saúde financeira excelente. Continue a disciplina.')

  const scoreDash = (score / 100) * SCORE_CIRCUMFERENCE

  // ── Recent entries (last 5) ───────────────────────────────────
  const recentEntries = entries.slice(0, 5)

  const hasAnyData = entries.length > 0 || recurring.length > 0

  // ── Stats array ───────────────────────────────────────────────
  const profitTrend = netProfit > 0 ? `+${fmt.format(netProfit)}` : netProfit < 0 ? `-${fmt.format(Math.abs(netProfit))}` : undefined

  const stats = [
    {
      label:   t('Monthly Net Profit', 'Lucro Líquido Mensal'),
      value:   fmt.format(netProfit),
      trend:   profitTrend,
      icon:    <IconProfit />,
      variant: (netProfit >= 0 ? 'accent' : 'red') as 'accent' | 'red',
    },
    {
      label:   t('Savings Rate', 'Taxa de Poupança'),
      value:   `${savingsRate}%`,
      trend:   savingsRate > 0 ? `+${savingsRate}%` : undefined,
      icon:    <IconSavings />,
      variant: 'green' as const,
    },
    {
      label:   t('Debt Ratio', 'Índice de Endividamento'),
      value:   `${debtRatio}%`,
      trend:   debtRatio > 0 ? `-${debtRatio}%` : undefined,
      icon:    <IconDebt />,
      variant: 'amber' as const,
    },
    {
      label:   t('Net Worth', 'Patrimônio Acumulado'),
      value:   fmt.format(netWorth),
      trend:   netWorth > 0 ? `+${fmt.format(netWorth)}` : undefined,
      icon:    <IconNetWorth />,
      variant: 'cyan' as const,
    },
  ]

  // ── Budget allocation bars ────────────────────────────────────
  const budgetItems: ProgressItem[] = [
    { label: t('Fixed Costs',  'Custos Fixos'),   value: `${pct(totalFixedCost,  totalRevenue)}%`, pct: pct(totalFixedCost,  totalRevenue), fill: 'progress-fill-amber'  },
    { label: t('Variable',     'Variável'),        value: `${pct(totalVariable,   totalRevenue)}%`, pct: pct(totalVariable,   totalRevenue), fill: 'progress-fill-red'    },
    { label: t('Investments',  'Investimentos'),   value: `${pct(totalInvestment, totalRevenue)}%`, pct: pct(totalInvestment, totalRevenue), fill: 'progress-fill-accent' },
    { label: t('Debt',         'Dívidas'),         value: `${pct(totalDebt,       totalRevenue)}%`, pct: pct(totalDebt,       totalRevenue), fill: 'progress-fill-green'  },
  ]

  return (
    <div className="page-content">
      <div className="page-header page-header-row">
        <div>
          <h2>{t('Executive Dashboard', 'Painel Executivo')}</h2>
          <p>{t('Core indicators to guide your strategic decisions.', 'Indicadores centrais para orientar suas decisões estratégicas.')}</p>
        </div>
        <div className="month-picker">
          <label className="month-picker-label">{t('Period', 'Período')}</label>
          <input
            className="month-picker-input"
            onChange={(e) => setSelectedMonth(e.target.value)}
            type="month"
            value={selectedMonth}
          />
        </div>
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
              <p className="card-subtitle">{monthLabel(selectedMonth, language)}</p>
            </div>
          </div>
          {!hasAnyData ? (
            <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', padding: '0.5rem 0' }}>
              {t('No data yet. Add entries to see budget allocation.', 'Sem dados. Adicione lançamentos para ver a alocação.')}
            </p>
          ) : (
            <div className="progress-list">
              {budgetItems.map((item) => (
                <ProgressBar key={item.label} {...item} />
              ))}
            </div>
          )}
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
                <span className="health-score-num">{score}</span>
                <span className="health-score-unit">/100</span>
              </div>
            </div>
            <div className="health-score-info">
              <p className="health-score-title">{scoreLabel}</p>
              <p className="health-score-desc">{scoreDesc}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { label: t('Savings target (≥ 20%)', 'Meta de poupança (≥ 20%)'), pct: Math.min(savingsRate, 100), fill: 'progress-fill-green'  },
              { label: t('Debt limit (≤ 30%)',     'Limite de dívida (≤ 30%)'), pct: Math.min(debtRatio,   100), fill: 'progress-fill-amber'  },
            ].map((item) => (
              <ProgressBar key={item.label} {...item} value={`${item.pct}%`} />
            ))}
          </div>
        </div>
      </div>

      {/* Recent entries */}
      <div className="card" style={{ padding: 0 }}>
        <div className="card-header" style={{ padding: '1rem 1.25rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <p className="card-title">{t('Recent Entries', 'Lançamentos Recentes')}</p>
            <p className="card-subtitle">{t('Latest financial movements', 'Últimas movimentações financeiras')}</p>
          </div>
          <Link to="/transactions" style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
            {t('View all →', 'Ver todos →')}
          </Link>
        </div>
        <div className="tx-mini-list" style={{ padding: '0 1.25rem' }}>
          {recentEntries.length === 0 ? (
            <div style={{ padding: '1.25rem 0', color: 'var(--text-3)', fontSize: '0.85rem', textAlign: 'center' }}>
              {t('No transactions yet. Start by adding entries.', 'Nenhuma transação ainda. Comece adicionando lançamentos.')}
            </div>
          ) : (
            recentEntries.map((entry) => {
              const meta = TYPE_META[entry.type]
              const fmtAmount = new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : 'en-US', { style: 'currency', currency: language === 'pt' ? 'BRL' : 'USD' })
              return (
                <div className="tx-mini-item" key={entry.id}>
                  <div className="tx-mini-icon" style={{ background: meta.positive ? 'var(--green-dim, rgba(34,197,94,.1))' : 'var(--red-dim, rgba(248,113,113,.1))' }}>
                    {meta.positive ? '↑' : '↓'}
                  </div>
                  <div className="tx-mini-info">
                    <div className="tx-mini-title">{entry.title}</div>
                    <div className="tx-mini-date">{language === 'pt' ? meta.pt : meta.en} · {entry.date}</div>
                  </div>
                  <span className={`tx-mini-amount ${meta.positive ? 'amount-positive' : 'amount-negative'}`}>
                    {meta.positive ? '+' : '-'}{fmtAmount.format(entry.amount)}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
