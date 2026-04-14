/* ==============================================
   ENTRY TYPES + CATEGORIES
   Single source of truth for types and their
   associated categories across the whole app.
   ============================================== */

export type EntryType =
  | 'revenue'
  | 'fixed_cost'
  | 'variable_cost'
  | 'expense'
  | 'investment'
  | 'debt'

export type Category = {
  id: string
  name_en: string
  name_pt: string
  type: EntryType
}

export type TypeMeta = {
  en: string
  pt: string
  badge: string
  positive: boolean
}

/* ---------- Type display metadata ---------- */
export const TYPE_META: Record<EntryType, TypeMeta> = {
  revenue:       { en: 'Revenue',       pt: 'Receita',         badge: 'badge-revenue',    positive: true  },
  fixed_cost:    { en: 'Fixed Cost',    pt: 'Custo Fixo',      badge: 'badge-fixed',      positive: false },
  variable_cost: { en: 'Variable Cost', pt: 'Custo Variável',  badge: 'badge-variable',   positive: false },
  expense:       { en: 'Expense',       pt: 'Despesa',         badge: 'badge-expense',    positive: false },
  investment:    { en: 'Investment',    pt: 'Investimento',    badge: 'badge-investment', positive: false },
  debt:          { en: 'Debt',          pt: 'Dívida',          badge: 'badge-debt',       positive: false },
}

export const ALL_TYPES = Object.keys(TYPE_META) as EntryType[]

/* ---------- Category definitions ---------- */
export const CATEGORIES: Category[] = [
  // ── Revenue ──────────────────────────────
  { id: 'rev_salary',     name_en: 'Salary',              name_pt: 'Salário',               type: 'revenue' },
  { id: 'rev_prolabore',  name_en: 'Pro-labore',          name_pt: 'Pró-labore',            type: 'revenue' },
  { id: 'rev_freelance',  name_en: 'Freelance',           name_pt: 'Freelance',             type: 'revenue' },
  { id: 'rev_rental',     name_en: 'Rental Income',       name_pt: 'Aluguel Recebido',      type: 'revenue' },
  { id: 'rev_dividends',  name_en: 'Dividends',           name_pt: 'Dividendos',            type: 'revenue' },
  { id: 'rev_commission', name_en: 'Commission',          name_pt: 'Comissão',              type: 'revenue' },
  { id: 'rev_bonus',      name_en: 'Bonus',               name_pt: 'Bônus',                 type: 'revenue' },
  { id: 'rev_other',      name_en: 'Other Revenue',       name_pt: 'Outra Receita',         type: 'revenue' },

  // ── Fixed Cost ───────────────────────────
  { id: 'fix_rent',       name_en: 'Rent',                name_pt: 'Aluguel',               type: 'fixed_cost' },
  { id: 'fix_mortgage',   name_en: 'Mortgage',            name_pt: 'Financiamento Imóvel',  type: 'fixed_cost' },
  { id: 'fix_condo',      name_en: 'Condo Fee',           name_pt: 'Condomínio',            type: 'fixed_cost' },
  { id: 'fix_internet',   name_en: 'Internet',            name_pt: 'Internet',              type: 'fixed_cost' },
  { id: 'fix_phone',      name_en: 'Phone Plan',          name_pt: 'Plano de Telefone',     type: 'fixed_cost' },
  { id: 'fix_streaming',  name_en: 'Streaming',           name_pt: 'Streaming',             type: 'fixed_cost' },
  { id: 'fix_insurance',  name_en: 'Insurance',           name_pt: 'Seguro',                type: 'fixed_cost' },
  { id: 'fix_gym',        name_en: 'Gym',                 name_pt: 'Academia',              type: 'fixed_cost' },
  { id: 'fix_school',     name_en: 'School / Tuition',    name_pt: 'Escola / Mensalidade',  type: 'fixed_cost' },
  { id: 'fix_car',        name_en: 'Car Installment',     name_pt: 'Parcela Carro',         type: 'fixed_cost' },
  { id: 'fix_health_plan',name_en: 'Health Plan',         name_pt: 'Plano de Saúde',        type: 'fixed_cost' },
  { id: 'fix_other',      name_en: 'Other Fixed',         name_pt: 'Outro Custo Fixo',      type: 'fixed_cost' },

  // ── Variable Cost ────────────────────────
  { id: 'var_groceries',  name_en: 'Groceries',           name_pt: 'Mercado / Supermercado',type: 'variable_cost' },
  { id: 'var_transport',  name_en: 'Transport / Fuel',    name_pt: 'Transporte / Combustível', type: 'variable_cost' },
  { id: 'var_dining',     name_en: 'Dining Out',          name_pt: 'Restaurante / Lanchonete', type: 'variable_cost' },
  { id: 'var_delivery',   name_en: 'Delivery',            name_pt: 'Delivery',              type: 'variable_cost' },
  { id: 'var_entertainment', name_en: 'Entertainment',    name_pt: 'Lazer / Entretenimento',type: 'variable_cost' },
  { id: 'var_health',     name_en: 'Healthcare / Pharmacy', name_pt: 'Saúde / Farmácia',   type: 'variable_cost' },
  { id: 'var_clothing',   name_en: 'Clothing',            name_pt: 'Vestuário',             type: 'variable_cost' },
  { id: 'var_beauty',     name_en: 'Beauty / Personal Care', name_pt: 'Beleza / Higiene',  type: 'variable_cost' },
  { id: 'var_pet',        name_en: 'Pet',                 name_pt: 'Pet',                   type: 'variable_cost' },
  { id: 'var_other',      name_en: 'Other Variable',      name_pt: 'Outro Variável',        type: 'variable_cost' },

  // ── Expense ──────────────────────────────
  { id: 'exp_repair',     name_en: 'Repairs / Maintenance', name_pt: 'Manutenção / Consertos', type: 'expense' },
  { id: 'exp_travel',     name_en: 'Travel',              name_pt: 'Viagem',                type: 'expense' },
  { id: 'exp_gift',       name_en: 'Gifts',               name_pt: 'Presentes',             type: 'expense' },
  { id: 'exp_education',  name_en: 'Education / Courses', name_pt: 'Educação / Cursos',     type: 'expense' },
  { id: 'exp_other',      name_en: 'Other Expense',       name_pt: 'Outra Despesa',         type: 'expense' },

  // ── Investment ───────────────────────────
  { id: 'inv_stocks',     name_en: 'Stocks / ETFs',       name_pt: 'Ações / ETFs',          type: 'investment' },
  { id: 'inv_realestate', name_en: 'Real Estate / FIIs',  name_pt: 'Imóveis / FIIs',        type: 'investment' },
  { id: 'inv_crypto',     name_en: 'Crypto',              name_pt: 'Criptomoedas',          type: 'investment' },
  { id: 'inv_fixed',      name_en: 'Fixed Income / CDB',  name_pt: 'Renda Fixa / CDB',      type: 'investment' },
  { id: 'inv_pension',    name_en: 'Private Pension',     name_pt: 'Previdência Privada',   type: 'investment' },
  { id: 'inv_emergency',  name_en: 'Emergency Fund',      name_pt: 'Reserva de Emergência', type: 'investment' },
  { id: 'inv_other',      name_en: 'Other Investment',    name_pt: 'Outro Investimento',    type: 'investment' },

  // ── Debt ─────────────────────────────────
  { id: 'debt_creditcard',name_en: 'Credit Card',         name_pt: 'Cartão de Crédito',     type: 'debt' },
  { id: 'debt_loan',      name_en: 'Personal Loan',       name_pt: 'Empréstimo Pessoal',    type: 'debt' },
  { id: 'debt_carfinance',name_en: 'Car Financing',       name_pt: 'Financiamento Veículo', type: 'debt' },
  { id: 'debt_student',   name_en: 'Student Loan',        name_pt: 'Empréstimo Estudantil', type: 'debt' },
  { id: 'debt_other',     name_en: 'Other Debt',          name_pt: 'Outra Dívida',          type: 'debt' },
]

/* ---------- Helpers ---------- */
export function getCategoriesByType(type: EntryType): Category[] {
  return CATEGORIES.filter((c) => c.type === type)
}

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id)
}
