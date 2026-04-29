import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
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

function currentMonthValue(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(ym: string, lang: string): string {
  const [y, m] = ym.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { month: 'long', year: 'numeric' })
}

export function TransactionsPage() {
  const { user } = useAuth()
  const uid = user!.uid
  const { t, language } = useLanguage()

  const [entries,       setEntries]       = useState<FinancialEntry[]>([])
  const [recurring,     setRecurring]     = useState<RecurringTemplate[]>([])
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue)

  const [title,      setTitle]      = useState('')
  const [type,       setType]       = useState<EntryType>('variable_cost')
  const [categoryId, setCategoryId] = useState('')
  const [amount,     setAmount]     = useState('')
  const [date,       setDate]       = useState(todayStr)

  const categoriesForType = getCategoriesByType(type)

  useEffect(() => {
    const q = query(
      collection(db, 'users', uid, 'transactions'),
      orderBy('createdAt', 'desc'),
    )
    return onSnapshot(q, (snap) => {
      setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as FinancialEntry))
    })
  }, [uid])

  useEffect(() => {
    return onSnapshot(collection(db, 'users', uid, 'recurring_templates'), (snap) => {
      setRecurring(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RecurringTemplate))
    })
  }, [uid])

  function handleTypeChange(next: EntryType) {
    setType(next)
    setCategoryId('')
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!title || !categoryId || !amount || !date) return
    await addDoc(collection(db, 'users', uid, 'transactions'), {
      title: title.trim(),
      type,
      category_id: categoryId,
      amount: Number(amount),
      date,
      createdAt: serverTimestamp(),
    })
    setTitle('')
    setType('variable_cost')
    setCategoryId('')
    setAmount('')
    setDate(todayStr())
  }

  async function handleDelete(id: string) {
    await deleteDoc(doc(db, 'users', uid, 'transactions', id))
  }

  const fmt = useMemo(
    () => new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : 'en-US', { style: 'currency', currency: language === 'pt' ? 'BRL' : 'USD' }),
    [language],
  )

  const activeRecurring = recurring.filter((r) => r.active)
  const monthEntries    = useMemo(() => entries.filter((e) => e.date.startsWith(selectedMonth)), [entries, selectedMonth])

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

  // ── Saldo dos avulsos (mês selecionado) ──────────────────────
  const entriesIn  = useMemo(
    () => monthEntries.filter((e) =>  TYPE_META[e.type].positive).reduce((s, e) => s + e.amount, 0),
    [monthEntries],
  )
  const entriesOut = useMemo(
    () => monthEntries.filter((e) => !TYPE_META[e.type].positive).reduce((s, e) => s + e.amount, 0),
    [monthEntries],
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
      <div className="page-header page-header-row">
        <div>
          <h2>{t('Transactions', 'Lançamentos')}</h2>
          <p>{t('Monthly view of all financial movements.', 'Visão mensal de todas as movimentações financeiras.')}</p>
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
              {t(`Recurring — ${monthLabel(selectedMonth, language)}`, `Fixos — ${monthLabel(selectedMonth, language)}`)}
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
        <form className="form-grid" onSubmit={(e) => { void handleSubmit(e) }}>
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
          <p className="card-subtitle">{monthLabel(selectedMonth, language)}</p>
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
            {monthEntries.length === 0 ? (
              <tr>
                <td className="table-empty" colSpan={6}>
                  {t('No entries for this period.', 'Nenhum lançamento neste período.')}
                </td>
              </tr>
            ) : (
              monthEntries.map((item) => {
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
                      <button className="btn-icon" onClick={() => { void handleDelete(item.id) }} title={t('Delete', 'Excluir')} type="button">
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
