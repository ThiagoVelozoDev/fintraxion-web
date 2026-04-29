import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  collection,
  addDoc,
  updateDoc,
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
  CATEGORIES,
  TYPE_META,
  getCategoriesByType,
  getCategoryById,
} from '../data/categories'
import type { EntryType } from '../data/categories'
import { useLanguage } from '../i18n/useLanguage'

export type RecurringTemplate = {
  id: string
  title: string
  type: EntryType
  category_id: string
  amount: number
  day: number
  active: boolean
}

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const IconEdit = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
)

const IconRepeat = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
)

function emptyForm() {
  return { title: '', type: 'fixed_cost' as EntryType, category_id: '', amount: '', day: '1' }
}

export function FixedCostsPage() {
  const { user } = useAuth()
  const uid = user!.uid
  const { t, language } = useLanguage()

  const [templates,  setTemplates]  = useState<RecurringTemplate[]>([])
  const [form,       setForm]       = useState(emptyForm())
  const [editingId,  setEditingId]  = useState<string | null>(null)
  const [filterType, setFilterType] = useState<EntryType | 'all'>('all')

  const categoriesForType = getCategoriesByType(form.type)

  useEffect(() => {
    const q = query(
      collection(db, 'users', uid, 'recurring_templates'),
      orderBy('createdAt', 'asc'),
    )
    return onSnapshot(q, (snap) => {
      setTemplates(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as RecurringTemplate))
    })
  }, [uid])

  function handleTypeChange(type: EntryType) {
    setForm((f) => ({ ...f, type, category_id: '' }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!form.title || !form.category_id || !form.amount) return

    const base = {
      title:       form.title.trim(),
      type:        form.type,
      category_id: form.category_id,
      amount:      Number(form.amount),
      day:         Number(form.day),
    }

    if (editingId) {
      await updateDoc(doc(db, 'users', uid, 'recurring_templates', editingId), base)
      setEditingId(null)
    } else {
      await addDoc(collection(db, 'users', uid, 'recurring_templates'), {
        ...base,
        active:    true,
        createdAt: serverTimestamp(),
      })
    }
    setForm(emptyForm())
  }

  function handleEdit(tpl: RecurringTemplate) {
    setEditingId(tpl.id)
    setForm({
      title:       tpl.title,
      type:        tpl.type,
      category_id: tpl.category_id,
      amount:      String(tpl.amount),
      day:         String(tpl.day),
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleCancel() {
    setEditingId(null)
    setForm(emptyForm())
  }

  async function handleDelete(id: string) {
    await deleteDoc(doc(db, 'users', uid, 'recurring_templates', id))
    if (editingId === id) handleCancel()
  }

  async function handleToggle(id: string) {
    const tpl = templates.find((t) => t.id === id)
    if (!tpl) return
    await updateDoc(doc(db, 'users', uid, 'recurring_templates', id), { active: !tpl.active })
  }

  const filtered = filterType === 'all' ? templates : templates.filter((t) => t.type === filterType)

  const fmt = new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
    style:    'currency',
    currency: language === 'pt' ? 'BRL' : 'USD',
  })

  const CATEGORIES_ALL = CATEGORIES

  return (
    <div className="page-content">
      <div className="page-header">
        <h2>{t('Recurring Entries', 'Lançamentos Fixos')}</h2>
        <p>
          {t(
            'Register recurring costs and revenues once — they are always visible in Transactions.',
            'Cadastre custos e receitas recorrentes uma vez — eles sempre aparecem em Lançamentos.',
          )}
        </p>
      </div>

      {/* Form */}
      <div className="card">
        <div className="card-header" style={{ marginBottom: '1rem' }}>
          <div>
            <p className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: 'var(--cyan)' }}><IconRepeat /></span>
              {editingId
                ? t('Edit recurring entry', 'Editar lançamento fixo')
                : t('New recurring entry', 'Novo lançamento fixo')}
            </p>
          </div>
          {editingId && (
            <button className="btn btn-ghost btn-sm" onClick={handleCancel} type="button">
              {t('Cancel', 'Cancelar')}
            </button>
          )}
        </div>

        <form className="form-grid" onSubmit={(e) => { void handleSubmit(e) }}>
          {/* Description */}
          <div className="field">
            <label className="field-label" htmlFor="rc-title">{t('Description', 'Descrição')}</label>
            <input
              id="rc-title"
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder={t('e.g. Salary, Rent…', 'ex: Salário, Aluguel…')}
              required
              type="text"
              value={form.title}
            />
          </div>

          {/* Type */}
          <div className="field">
            <label className="field-label" htmlFor="rc-type">{t('Type', 'Tipo')}</label>
            <select
              id="rc-type"
              onChange={(e) => handleTypeChange(e.target.value as EntryType)}
              required
              value={form.type}
            >
              {ALL_TYPES.map((type) => (
                <option key={type} value={type}>
                  {language === 'pt' ? TYPE_META[type].pt : TYPE_META[type].en}
                </option>
              ))}
            </select>
          </div>

          {/* Category — filtered by type */}
          <div className="field">
            <label className="field-label" htmlFor="rc-cat">{t('Category', 'Categoria')}</label>
            <select
              id="rc-cat"
              onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
              required
              value={form.category_id}
            >
              <option value="">{t('Select…', 'Selecionar…')}</option>
              {categoriesForType.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {language === 'pt' ? cat.name_pt : cat.name_en}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div className="field">
            <label className="field-label" htmlFor="rc-amount">{t('Amount', 'Valor')}</label>
            <input
              id="rc-amount"
              min="0"
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="0.00"
              required
              step="0.01"
              type="number"
              value={form.amount}
            />
          </div>

          {/* Day of month */}
          <div className="field">
            <label className="field-label" htmlFor="rc-day">
              {t('Day of month', 'Dia do mês')}
            </label>
            <input
              id="rc-day"
              max="31"
              min="1"
              onChange={(e) => setForm((f) => ({ ...f, day: e.target.value }))}
              required
              type="number"
              value={form.day}
            />
          </div>

          <div className="field" style={{ justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" type="submit">
              <IconPlus />
              {editingId ? t('Update', 'Atualizar') : t('Save', 'Salvar')}
            </button>
          </div>
        </form>
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${filterType === 'all' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setFilterType('all')}
          type="button"
        >
          {t('All', 'Todos')} ({templates.length})
        </button>
        {ALL_TYPES.map((type) => {
          const count = templates.filter((t) => t.type === type).length
          if (count === 0) return null
          return (
            <button
              key={type}
              className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilterType(type)}
              type="button"
            >
              {language === 'pt' ? TYPE_META[type].pt : TYPE_META[type].en} ({count})
            </button>
          )
        })}
      </div>

      {/* Templates table */}
      <div className="card table-card">
        <table>
          <thead>
            <tr>
              <th style={{ width: 52 }}>{t('Active', 'Ativo')}</th>
              <th>{t('Description', 'Descrição')}</th>
              <th>{t('Type', 'Tipo')}</th>
              <th>{t('Category', 'Categoria')}</th>
              <th>{t('Day', 'Dia')}</th>
              <th style={{ textAlign: 'right' }}>{t('Amount', 'Valor')}</th>
              <th style={{ width: 72 }} />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td className="table-empty" colSpan={7}>
                  {t(
                    'No recurring entries yet. Add the first one above.',
                    'Nenhum lançamento fixo ainda. Adicione o primeiro acima.',
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((tpl) => {
                const typeMeta = TYPE_META[tpl.type]
                const category = getCategoryById(tpl.category_id)
                    ?? CATEGORIES_ALL.find((c) => c.id === tpl.category_id)
                const catName = category
                  ? language === 'pt' ? category.name_pt : category.name_en
                  : tpl.category_id
                return (
                  <tr key={tpl.id} style={{ opacity: tpl.active ? 1 : 0.45 }}>
                    <td>
                      <label className="toggle" title={tpl.active ? t('Deactivate', 'Desativar') : t('Activate', 'Ativar')}>
                        <input
                          checked={tpl.active}
                          onChange={() => { void handleToggle(tpl.id) }}
                          type="checkbox"
                        />
                        <span className="toggle-slider" />
                      </label>
                    </td>
                    <td style={{ fontWeight: 500 }}>{tpl.title}</td>
                    <td>
                      <span className={`badge ${typeMeta.badge}`}>
                        {language === 'pt' ? typeMeta.pt : typeMeta.en}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-2)', fontSize: '0.83rem' }}>{catName}</td>
                    <td style={{ color: 'var(--text-2)', fontSize: '0.83rem' }}>
                      {t(`Day ${tpl.day}`, `Dia ${tpl.day}`)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={typeMeta.positive ? 'amount-positive' : 'amount-negative'}>
                        {typeMeta.positive ? '+' : '-'}{fmt.format(tpl.amount)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn-icon"
                          onClick={() => handleEdit(tpl)}
                          style={{ color: editingId === tpl.id ? 'var(--accent)' : undefined }}
                          title={t('Edit', 'Editar')}
                          type="button"
                        >
                          <IconEdit />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => { void handleDelete(tpl.id) }}
                          title={t('Delete', 'Excluir')}
                          type="button"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="recurring-summary">
          <span className="recurring-summary-label">
            {t('Monthly total (active)', 'Total mensal (ativos)')}
          </span>
          <span className="recurring-summary-value">
            {fmt.format(
              filtered
                .filter((t) => t.active)
                .reduce((acc, t) => {
                  return acc + (TYPE_META[t.type].positive ? t.amount : -t.amount)
                }, 0),
            )}
          </span>
        </div>
      )}
    </div>
  )
}
