// ═══════════════════════════════════════════════════════════════
//  utils.ts — single unified calculation + helper module
// ═══════════════════════════════════════════════════════════════
import { PremiumCalculation, CarrierQuote, Medication } from '../dashboard/types'
import { MEDICATIONS, HEALTH_CONDITIONS } from '../data/insurance-data'
import {
  TERM_PRODUCTS, FEX_PRODUCTS, SIUL_PRODUCTS,
  AGE_FACTORS, TERM_FACTORS, FEX_AGE_FACTORS, SIUL_AGE_FACTORS,
  coverageBandFactor,
  type TermProduct, type FexProduct, type SiulProduct,
} from '../data/insurance-products'

// ─────────────────────────────────────────────────────────────────────────────
//  SHARED HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDateForCalendar(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function getDaysInMonth(date: Date) {
  const y = date.getFullYear(), m = date.getMonth()
  return { daysInMonth: new Date(y, m + 1, 0).getDate(), startingDayOfWeek: new Date(y, m, 1).getDay() }
}

export function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0]
}

// Interpolate age factor from a lookup table (handles every integer age)
function interpAge(age: number, table: Record<number, number>): number {
  if (table[age] !== undefined) return table[age]
  const ages = Object.keys(table).map(Number).sort((a, b) => a - b)
  for (let i = 0; i < ages.length - 1; i++) {
    if (age >= ages[i] && age <= ages[i + 1]) {
      const r = (age - ages[i]) / (ages[i + 1] - ages[i])
      return table[ages[i]] + r * (table[ages[i + 1]] - table[ages[i]])
    }
  }
  const last = ages[ages.length - 1]
  return table[last] * Math.pow(1.08, age - last) // extrapolate past max
}

// ─────────────────────────────────────────────────────────────────────────────
//  HEALTH CLASS DERIVATION
// ─────────────────────────────────────────────────────────────────────────────

export function determineHealthClass(
  medications: string[],
): 'preferred-plus' | 'preferred' | 'standard-plus' | 'standard' | 'substandard' {
  if (medications.length === 0) return 'preferred-plus'
  const medData = medications
    .map(n => MEDICATIONS.find(m => m.name === n))
    .filter(Boolean) as Medication[]
  if (medData.some(m => m.impact === 'substandard')) return 'substandard'
  if (medData.some(m => m.impact === 'standard'))    return 'standard'
  if (medData.some(m => m.impact === 'standard-plus') || medications.length > 3) return 'standard-plus'
  if (medications.length <= 2) return 'preferred'
  return 'standard-plus'
}

// Maps legacy 5-class names → product HealthClassName strings
function legacyToHC(lc: string): string {
  const m: Record<string, string> = {
    'preferred-plus': 'Preferred Plus',
    'preferred':      'Preferred',
    'standard-plus':  'Standard Plus',
    'standard':       'Standard',
    'substandard':    'Table 2',
  }
  return m[lc] ?? 'Standard'
}

// ─────────────────────────────────────────────────────────────────────────────
//  QUOTE TYPES (consumed by InsuranceToolkit)
// ─────────────────────────────────────────────────────────────────────────────

export type InsuranceTypeKey = 'term' | 'fex' | 'siul'

export interface TermQuote {
  product: TermProduct
  monthly: number
  annual: number
  adMonthly?: number
  adAnnual?: number
}

export interface FexQuote {
  product: FexProduct
  monthly: number
  annual: number
}

export interface SiulQuote {
  product: SiulProduct
  monthlyTarget: number
}

export interface QuoteParams {
  age:         number
  sex:         'male' | 'female'
  smoker:      boolean
  coverage:    number
  term?:       number
  healthClass: string   // "Preferred Plus" | "Preferred" | "Standard Plus" | "Standard" | "Table 2" | ...
}

// ─────────────────────────────────────────────────────────────────────────────
//  TERM LIFE QUOTES
// ─────────────────────────────────────────────────────────────────────────────

export function calcTermQuotes(params: QuoteParams): TermQuote[] {
  const { age, sex, smoker, coverage, term = 20, healthClass } = params
  const ageFactor  = interpAge(age, AGE_FACTORS)
  const termFactor = TERM_FACTORS[term] ?? 1.0
  const cbFactor   = coverageBandFactor(coverage)
  const results: TermQuote[] = []

  for (const product of TERM_PRODUCTS) {
    if (age < product.minAge || age > product.maxAge)                     continue
    if (coverage < product.minCoverage || coverage > product.maxCoverage) continue
    if (!product.availableTerms.includes(term))                           continue
    const eligible = product.healthClasses.includes('All') || product.healthClasses.includes(healthClass)
    if (!eligible) continue

    const sexSmokerMult =
      !smoker && sex === 'male'   ? 1.00 :
      !smoker && sex === 'female' ? product.femaleMult :
       smoker && sex === 'male'   ? product.smokerMult :
                                    product.femaleSmokerMult

    const monthly = Math.round(product.anchorRatePerK * (coverage / 1000) * ageFactor * termFactor * cbFactor * sexSmokerMult * 100) / 100
    const annual  = Math.round(monthly * product.annualFactor * 100) / 100

    let adMonthly: number | undefined
    let adAnnual: number | undefined
    if (product.hasAD && product.adAnchorRatePerK > 0) {
      adMonthly = Math.round(product.adAnchorRatePerK * (coverage / 1000) * ageFactor * termFactor * cbFactor * sexSmokerMult * 100) / 100
      adAnnual  = Math.round(adMonthly * product.adAnnualFactor * 100) / 100
    }

    results.push({ product, monthly, annual, adMonthly, adAnnual })
  }

  return results.sort((a, b) => a.monthly - b.monthly)
}

// ─────────────────────────────────────────────────────────────────────────────
//  FINAL EXPENSE QUOTES
// ─────────────────────────────────────────────────────────────────────────────

export function calcFexQuotes(params: QuoteParams): FexQuote[] {
  const { age, sex, smoker, coverage } = params
  const ageFactor = interpAge(age, FEX_AGE_FACTORS)
  const results: FexQuote[] = []

  for (const product of FEX_PRODUCTS) {
    if (age < product.minAge || age > product.maxAge)                     continue
    if (coverage < product.minCoverage || coverage > product.maxCoverage) continue

    const sexMult   = sex === 'male' ? product.maleMult : 1.0
    const smokeMult = smoker ? product.smokerMult : 1.0
    const monthly   = Math.round(product.anchorRateF * (coverage / 1000) * ageFactor * sexMult * smokeMult * 100) / 100
    const annual    = Math.round(monthly * 11.0 * 100) / 100

    results.push({ product, monthly, annual })
  }

  return results.sort((a, b) => a.monthly - b.monthly)
}

// ─────────────────────────────────────────────────────────────────────────────
//  SIUL / IUL QUOTES
// ─────────────────────────────────────────────────────────────────────────────

export function calcSiulQuotes(params: QuoteParams): SiulQuote[] {
  const { age, sex, smoker, coverage } = params
  const ageFactor = interpAge(age, SIUL_AGE_FACTORS)
  const results: SiulQuote[] = []

  for (const product of SIUL_PRODUCTS) {
    if (age < product.minAge || age > product.maxAge)                           continue
    if (coverage < product.minDeathBenefit || coverage > product.maxDeathBenefit) continue

    const sexMult       = sex === 'female' ? product.femaleMult : 1.0
    const smokeMult     = smoker ? product.smokerMult : 1.0
    const monthlyTarget = Math.round(product.anchorPremPerK * (coverage / 1000) * ageFactor * sexMult * smokeMult * 100) / 100
    results.push({ product, monthlyTarget })
  }

  return results.sort((a, b) => a.monthlyTarget - b.monthlyTarget)
}

// ─────────────────────────────────────────────────────────────────────────────
//  LEGACY API — used by existing CRM / lead list components
// ─────────────────────────────────────────────────────────────────────────────

export function calculateCarrierQuotes(calc: PremiumCalculation): CarrierQuote[] {
  const hc      = legacyToHC(calc.healthClass)
  const smoker  = calc.smoker ?? false
  const results = calcTermQuotes({
    age: calc.age, sex: 'male', smoker, coverage: calc.coverage, term: calc.term, healthClass: hc,
  })

  return results.map((q, idx) => ({
    carrier:     q.product.carrier,
    monthly:     q.monthly,
    annual:      q.annual,
    recommended: idx === 0,
    reason:      idx === 0 ? 'Best rate for this profile' : '',
    productName: q.product.productName,
  }))
}

// Kept for any legacy callers
export function calculatePremium(calc: PremiumCalculation): number {
  const quotes = calculateCarrierQuotes(calc)
  return quotes[0]?.monthly ?? 0
}
