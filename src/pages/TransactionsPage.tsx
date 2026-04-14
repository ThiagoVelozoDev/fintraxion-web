import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ALL_TYPES,
  TYPE_META,
  getCategoriesByType,
  getCategoryById,
} from '../data/categories'
import type { EntryType } from '../data/categories'
import type { RecurringTemplate } from './FixedCostsPage'
import { useLanguage } from '../i18n/useLanguage'

type FinancialEntry = {
  id: string
  title: string
  type: EntryType
  category_id: string
  amount: number
  date: string
}

const STORAGE_KEY      = 'fintraxion_financial_entries'
const RECURRING_KEY    = 'fintraxion_recurring_templates'

function loadEntries(): FinancialEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as FinancialEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

function loadRecurring(): RecurringTemplate[] {
  const raw = localStorage.getItem(RECURRING_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as RecurringTemplate[]
    return Array.isArray(parsed) ? parsed : []
  } catch { return [] }
}

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
)

const IconRepeat = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
)

function todayStr(): string {
  return new Date().toISOString().split('T')[0]
}

function currentMonthLabel(): string {
  return new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' })
}

export function TransactionsPage() {
  const { t, language } = useLanguage()
  const [entries, setEntries] = useState<FinancialEntry[]>(() => loadEntries())
  const [recurring]           = useState<RecurringTemplate[]>(() => loadRecurring())

  const [title,       setTitle]       = useState('')
  const [type,        setType]        = useState<EntryType>('variable_cost')
  const [categoryId,  setCategoryId]  = useState('')
  const [amount,      setAmount]      = useState('')
  const [date,        setDate]        = useState(todayStr)

  const categoriesForType = getCategoriesByType(type)

  function handleTypeChange(next: EntryType) {
    setType(next)
    setCategoryId('')
  }

  function saveEntries(next: FinancialEntry[]) {
    setEntries(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!title || !categoryId || !amount || !date) return
    saveEntries([
      { id: crypto.randomUUID(), title: title.trim(), type, category_id: categoryId, amount: Number(amount), date },
      ...entries,
    ])
    setTitle('')
    setType('variable_cost')
    setCategoryId('')
    setAmount('')
    setDate(todayStr())
  }

  function handleDelete(id: string) {
    saveEntries(entries.filter((e) => e.id !== id))
  }

  const fmt = useMemo(
    () => new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : 'en-US', { style: 'currency', currency: language === 'pt' ? 'BRL' : 'USD' }),
    [language],
  )

  const activeRecurring = recurring.filter((r) => r.active)

  // ── Saldo dos fixos ──────────────────────────────────────────
  const recurringIn  = useMemo(
    () => activeRecurring.filter((r) =>  TYPE_META[r.type].positive).reduce((s, r) => s + r.amount, 0),
    [activeRecurring],
  )
  const recurringOut = useMemo(
    () => activeRecurring.filter((r) => !TYPE_META[r.type].positive).reduce((s, r) => s + r.amount, 0),
    [activeRecurring],
  )
  const recurringBalance = recurringIn - recurringOut

  // ── Saldo dos avulsos ────────────────────────────────────────
  const entriesIn  = useMemo(
    () => entries.filter((e) =>  TYPE_META[e.type].positive).reduce((s, e) => s + e.amount, 0),
    [entries],
  )
  const entriesOut = useMemo(
    () => entries.filter((e) => !TYPE_META[e.type].positive).reduce((s, e) => s + e.amount, 0),
    [entries],
  )
  const entriesBalance = entriesIn - entriesOut

  // ── Total do mês ─────────────────────────────────────────────
  const totalBalance = recurringBalance + entriesBalance

  function balanceClass(v: number) {
    return v > 0 ? 'balance-cell-value amount-positive'
         : v < 0 ? 'balance-cell-value amount-negative'
         : 'balance-cell-value balance-cell-value-zero'
  }

  function fmtSigned(v: number) {
    return (v > 0 ? '+' : '') + fmt.format(v)
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>{t('Transactions', 'Lançamentos')}</h2>
        <p>{t('Monthly view of all financial movements.', 'Visão mensal de todas as movimentações financeiras.')}</p>
      </div>

      {/* ── Balance summary ── */}
      <div className="card balance-bar">
        {/* Saldo Fixos */}
        <div className="balance-cell">
          <span className="balance-cell-label">
            {t('Recurring Balance', 'Saldo dos Fixos')}
          </span>
          <span className={balanceClass(recurringBalance)}>
            {fmtSigned(recurringBalance)}
          </span>
          <span className="balance-cell-sub">
            <span className="balance-in">↑ {fmt.format(recurringIn)}</span>
            {' · '}
            <span className="balance-out">↓ {fmt.format(recurringOut)}</span>
          </span>
        </div>

        <div className="balance-sep" aria-hidden>+</div>

        {/* Saldo Avulsos */}
        <div className="balance-cell">
          <span className="balance-cell-label">
            {t('One-time Balance', 'Saldo dos Avulsos')}
          </span>
          <span className={balanceClass(entriesBalance)}>
            {fmtSigned(entriesBalance)}
          </span>
          <span className="balance-cell-sub">
            <span className="balance-in">↑ {fmt.format(entriesIn)}</span>
            {' · '}
            <span className="balance-out">↓ {fmt.format(entriesOut)}</span>
          </span>
        </div>

        <div className="balance-sep" aria-hidden>=</div>

        {/* Saldo Total */}
        <div className="balance-cell balance-cell-total">
          <span className="balance-cell-label">
            {t('Month Balance', 'Saldo do Mês')}
          </span>
          <span className={balanceClass(totalBalance)}>
            {fmtSigned(totalBalance)}
          </span>
          <span className="balance-cell-sub">
            {totalBalance >= 0
              ? t('Positive cash flow', 'Fluxo positivo')
              : t('Negative cash flow', 'Fluxo negativo')}
          </span>
        </div>
      </div>

      {/* ── Recurring section ── */}
      <div className="card recurring-section">
        <div className="card-header" style={{ marginBottom: activeRecurring.length > 0 ? '0' : undefined }}>
          <div>
            <p className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: 'var(--cyan)' }}><IconRepeat /></span>
              {t(`Recurring — ${currentMonthLabel()}`, `Fixos — ${currentMonthLabel()}`)}
            </p>
            <p className="card-subtitle">
              {t('Auto-populated from your recurring entries.', 'Preenchido automaticamente pelos seus lançamentos fixos.')}
            </p>
          </div>
          <Link className="btn btn-ghost btn-sm" to="/fixed-costs">
            {t('Manage →', 'Gerenciar →')}
          </Link>
        </div>

        {activeRecurring.length === 0 ? (
          <div className="recurring-empty">
            {t(
              'No active recurring entries. Go to Recurring to set them up.',
              'Nenhum lançamento fixo ativo. Vá em Lançamentos Fixos para configurar.',
            )}
          </div>
        ) : (
          <div className="table-card" style={{ marginTop: '0.75rem', borderRadius: 'var(--radius-m)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
            <table>
              <thead>
                <tr>
                  <th>{t('Description', 'Descrição')}</th>
                  <th>{t('Type', 'Tipo')}</th>
                  <th>{t('Category', 'Categoria')}</th>
                  <th>{t('Day', 'Dia')}</th>
                  <th style={{ textAlign: 'right' }}>{t('Amount', 'Valor')}</th>
                </tr>
              </thead>
              <tbody>
                {activeRecurring.map((r) => {
                  const meta     = TYPE_META[r.type]
                  const category = getCategoryById(r.category_id)
                  const catName  = category
                    ? language === 'pt' ? category.name_pt : category.name_en
                    : r.category_id
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 500 }}>
                        <span style={{ marginRight: '0.4rem', opacity: 0.5, fontSize: '0.75rem' }}>↺</span>
                        {r.title}
                      </td>
                      <td><span className={`badge ${meta.badge}`}>{language === 'pt' ? meta.pt : meta.en}</span></td>
                      <td style={{ color: 'var(--text-2)', fontSize: '0.83rem' }}>{catName}</td>
                      <td style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>{t(`Day ${r.day}`, `Dia ${r.day}`)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={meta.positive ? 'amount-positive' : 'amount-negative'}>
                          {meta.positive ? '+' : '-'}{fmt.format(r.amount)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── One-time entry form ── */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <p className="card-title">{t('Add one-time entry', 'Adicionar lançamento avulso')}</p>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label" htmlFor="tx-title">{t('Description', 'Descrição')}</label>
            <input
              id="tx-title"
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('e.g. Pharmacy, Parking…', 'ex: Farmácia, Estacionamento…')}
              required
              type="text"
              value={title}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="tx-type">{t('Type', 'Tipo')}</label>
            <select id="tx-type" onChange={(e) => handleTypeChange(e.target.value as EntryType)} required value={type}>
              {ALL_TYPES.map((tp) => (
                <option key={tp} value={tp}>{language === 'pt' ? TYPE_META[tp].pt : TYPE_META[tp].en}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="tx-cat">{t('Category', 'Categoria')}</label>
            <select
              id="tx-cat"
              onChange={(e) => setCategoryId(e.target.value)}
              required
              value={categoryId}
            >
              <option value="">{t('Select…', 'Selecionar…')}</option>
              {categoriesForType.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {language === 'pt' ? cat.name_pt : cat.name_en}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="tx-amount">{t('Amount', 'Valor')}</label>
            <input
              id="tx-amount"
              min="0"
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              step="0.01"
              type="number"
              value={amount}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="tx-date">{t('Date', 'Data')}</label>
            <input id="tx-date" onChange={(e) => setDate(e.target.value)} required type="date" value={date} />
          </div>

          <div className="field" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" type="submit">
              <IconPlus />
              {t('Save', 'Salvar')}
            </button>
          </div>
        </form>
      </div>

      {/* ── One-time entries table ── */}
      <div className="card table-card">
        <div style={{ padding: '1rem 1.25rem 0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
          <p className="card-title">{t('One-time entries', 'Lançamentos avulsos')}</p>
          <p className="card-subtitle">{t('Non-recurring transactions', 'Transações não recorrentes')}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>{t('Date', 'Data')}</th>
              <th>{t('Description', 'Descrição')}</th>
              <th>{t('Type', 'Tipo')}</th>
              <th>{t('Category', 'Categoria')}</th>
              <th style={{ textAlign: 'right' }}>{t('Amount', 'Valor')}</th>
              <th style={{ width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td className="table-empty" colSpan={6}>
                  {t('No one-time entries yet. Use the form above.', 'Nenhum lançamento avulso. Use o formulário acima.')}
                </td>
              </tr>
            ) : (
              entries.map((item) => {
                const meta     = TYPE_META[item.type]
                const category = getCategoryById(item.category_id)
                const catName  = category
                  ? language === 'pt' ? category.name_pt : category.name_en
                  : item.category_id ?? '—'
                return (
                  <tr key={item.id}>
                    <td style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>{item.date}</td>
                    <td style={{ fontWeight: 500 }}>{item.title}</td>
                    <td><span className={`badge ${meta.badge}`}>{language === 'pt' ? meta.pt : meta.en}</span></td>
                    <td style={{ color: 'var(--text-2)', fontSize: '0.83rem' }}>{catName}</td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={meta.positive ? 'amount-positive' : 'amount-negative'}>
                        {meta.positive ? '+' : '-'}{fmt.format(item.amount)}
                      </span>
                    </td>
                    <td>
                      <button className="btn-icon" onClick={() => handleDelete(item.id)} title={t('Delete', 'Excluir')} type="button">
                        <IconTrash />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
