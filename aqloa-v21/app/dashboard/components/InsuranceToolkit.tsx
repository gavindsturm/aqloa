'use client'
import { useState, useMemo } from 'react'
import {
  X, Search, Calculator, Check, Shield, ChevronDown,
  ChevronUp, Plus, AlertCircle, Star, Zap, Heart,
  RefreshCw, FileText, ArrowUpDown
} from 'lucide-react'
import { Lead, PremiumCalculation } from '../types'
import { MEDICATIONS, HEALTH_CONDITIONS, HEALTH_CLASS_DEFINITIONS } from '../../data/insurance-data'
import { determineHealthClass, formatCurrency } from '../../lib/utils'
import {
  calcTermQuotes, calcFexQuotes, calcSiulQuotes,
  type InsuranceTypeKey, type TermQuote, type FexQuote, type SiulQuote,
} from '../../lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
interface Props {
  lead: Lead
  onClose: () => void
  onUpdate: (lead: Lead) => void
}

const US_STATES = ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']

const COVERAGE_OPTIONS_TERM = [
  50000,100000,150000,200000,250000,300000,400000,500000,
  600000,750000,1000000,1250000,1500000,2000000
]
const COVERAGE_OPTIONS_FEX = [
  2000,3000,4000,5000,6000,7000,8000,9000,10000,
  12000,15000,18000,20000,25000,30000,35000,40000,50000
]
const COVERAGE_OPTIONS_SIUL = [
  50000,75000,100000,150000,200000,250000,300000,400000,500000,
  750000,1000000,1500000,2000000,3000000
]

const TERM_OPTIONS = [10, 15, 20, 25, 30]

const HC_LABELS: Record<string, string> = {
  'Preferred Plus': 'Preferred Plus',
  'Preferred': 'Preferred',
  'Standard Plus': 'Standard Plus',
  'Standard': 'Standard',
  'Table 2': 'Table 2 (Rated)',
  'Table 4': 'Table 4 (Rated)',
  'Select': 'Select (Substandard)',
}

const HC_COLORS: Record<string, string> = {
  'Preferred Plus': 'bg-[var(--accent-dim)] text-[var(--accent-light)] border-[var(--accent-glow)]',
  'Preferred':      'bg-[var(--accent-dim)] text-[var(--accent-light)] border-[var(--accent-dim)]',
  'Standard Plus':  'bg-[var(--border)] text-[var(--text-secondary)] border-[var(--border-light)]',
  'Standard':       'bg-[var(--border)] text-[var(--text-secondary)] border-[var(--border-light)]',
  'Table 2':        'bg-[rgba(239,68,68,0.10)] text-[#f87171] border-[rgba(239,68,68,0.25)]',
  'Table 4':        'bg-[rgba(239,68,68,0.14)] text-[#fca5a5] border-[rgba(239,68,68,0.30)]',
  'Select':         'bg-[rgba(239,68,68,0.14)] text-[#fca5a5] border-[rgba(239,68,68,0.30)]',
}

const IMPACT_BADGE: Record<string, string> = {
  'preferred-plus': 'bg-[var(--accent-dim)] text-[var(--accent-light)] border border-[var(--accent-glow)]',
  'preferred':      'bg-[var(--border)] text-[var(--text-secondary)] border border-[var(--border-light)]',
  'standard-plus':  'bg-[var(--border)] text-[var(--text-muted)] border border-[var(--border-light)]',
  'standard':       'bg-[var(--border)] text-[var(--text-muted)] border border-[var(--border)]',
  'substandard':    'bg-[rgba(239,68,68,0.10)] text-[#f87171] border border-[rgba(239,68,68,0.25)]',
}

const MED_CATEGORIES = Array.from(new Set(MEDICATIONS.map(m => m.category))).sort()

function fmtK(n: number): string {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 2)}M`
  if (n >= 1000)    return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 0)}K`
  return `$${n}`
}

// ─────────────────────────────────────────────────────────────────────────────
export default function InsuranceToolkit({ lead, onClose, onUpdate }: Props) {
  const [insType, setInsType] = useState<InsuranceTypeKey>('term')

  // ── Client Inputs ──
  const [sex,      setSex]      = useState<'male'|'female'>(lead.quoteSex ?? 'male')
  const [state,    setState]    = useState(lead.quoteState ?? 'MN')
  const [ageInput, setAgeInput] = useState<number>(lead.age ?? 35)
  const [smoker,   setSmoker]   = useState<boolean>(lead.smoker ?? false)
  const [height,   setHeight]   = useState({ ft: '', in: '' })
  const [weight,   setWeight]   = useState('')

  // ── Insurance-type specific ──
  const [coverage, setCoverage] = useState<number>(lead.quoteCoverage ?? 500000)
  const [fexCoverage, setFexCoverage] = useState<number>(10000)
  const [siulCoverage, setSiulCoverage] = useState<number>(250000)
  const [term, setTerm] = useState<number>(lead.quoteTerm ?? 20)

  // ── Medications / Conditions ──
  const [medSearch,    setMedSearch]    = useState('')
  const [medCategory,  setMedCategory]  = useState('all')
  const [selectedMeds,  setSelectedMeds]  = useState<string[]>(lead.medications ?? [])
  const [selectedConds, setSelectedConds] = useState<string[]>(lead.healthConditions ?? [])
  const [showMedPanel, setShowMedPanel] = useState(false)

  // ── Quote state ──
  const [savedId, setSavedId] = useState<string | null>(null)

  // Derived health class
  const derivedHealthClass = useMemo(() => {
    const fromMeds = determineHealthClass(selectedMeds)
    const order = ['preferred-plus','preferred','standard-plus','standard','substandard']
    const fromConds = selectedConds
      .map(n => HEALTH_CONDITIONS.find(c => c.name === n)?.impact)
      .filter(Boolean) as string[]
    const worst = [...fromConds, fromMeds].reduce((a, b) =>
      order.indexOf(b) > order.indexOf(a) ? b : a, 'preferred-plus')

    // Map internal health class to product health class
    const map: Record<string, string> = {
      'preferred-plus': 'Preferred Plus',
      'preferred': 'Preferred',
      'standard-plus': 'Standard Plus',
      'standard': 'Standard',
      'substandard': 'Table 2',
    }
    return map[worst] ?? 'Standard'
  }, [selectedMeds, selectedConds])

  const filteredMeds = useMemo(() => MEDICATIONS.filter(m => {
    const s = medSearch.toLowerCase()
    return (!s || m.name.toLowerCase().includes(s) || m.category.toLowerCase().includes(s))
        && (medCategory === 'all' || m.category === medCategory)
  }), [medSearch, medCategory])

  const toggleMed = (name: string) =>
    setSelectedMeds(p => p.includes(name) ? p.filter(m => m !== name) : [...p, name])
  const toggleCond = (name: string) =>
    setSelectedConds(p => p.includes(name) ? p.filter(c => c !== name) : [...p, name])

  // Quote calculations
  const termQuotes = useMemo(() => calcTermQuotes({
    age: ageInput, sex, smoker, coverage, term, healthClass: derivedHealthClass
  }), [ageInput, sex, smoker, coverage, term, derivedHealthClass])

  const fexQuotes = useMemo(() => calcFexQuotes({
    age: ageInput, sex, smoker, coverage: fexCoverage, healthClass: derivedHealthClass
  }), [ageInput, sex, smoker, fexCoverage, derivedHealthClass])

  const siulQuotes = useMemo(() => calcSiulQuotes({
    age: ageInput, sex, smoker, coverage: siulCoverage, healthClass: derivedHealthClass
  }), [ageInput, sex, smoker, siulCoverage, derivedHealthClass])

  // ── Save to lead ──
  const handleSaveTermQuote = (q: TermQuote) => {
    const allQuotes = termQuotes.map(tq => ({
      carrier: tq.product.carrier,
      monthly: tq.monthly,
      annual: tq.annual,
      recommended: tq.product.id === q.product.id,
      productName: tq.product.productName,
    }))
    onUpdate({
      ...lead,
      age: ageInput, smoker,
      medications: selectedMeds,
      healthConditions: selectedConds,
      selectedCarrier: q.product.carrier,
      monthlyPremium: q.monthly,
      annualPremium: q.annual,
      carrierQuotes: allQuotes,
      quoteCoverage: coverage,
      quoteTerm: term,
      quoteHealthClass: derivedHealthClass,
      quoteSavedAt: new Date().toLocaleString(),
      quoteProductName: q.product.productName,
      quoteType: 'term',
      quoteSex: sex,
      quoteState: state,
    })
    setSavedId(q.product.id)
    setTimeout(() => { setSavedId(null); onClose() }, 1000)
  }

  const handleSaveFexQuote = (q: FexQuote) => {
    onUpdate({
      ...lead,
      age: ageInput, smoker,
      medications: selectedMeds,
      healthConditions: selectedConds,
      selectedCarrier: q.product.carrier,
      monthlyPremium: q.monthly,
      annualPremium: q.annual,
      carrierQuotes: fexQuotes.map(fq => ({
        carrier: fq.product.carrier,
        monthly: fq.monthly,
        annual: fq.annual,
        recommended: fq.product.id === q.product.id,
        productName: fq.product.productName,
      })),
      quoteCoverage: fexCoverage,
      quoteTerm: 0,
      quoteHealthClass: derivedHealthClass,
      quoteSavedAt: new Date().toLocaleString(),
      quoteProductName: q.product.productName,
      quoteType: 'fex',
      quoteSex: sex,
      quoteState: state,
    })
    setSavedId(q.product.id)
    setTimeout(() => { setSavedId(null); onClose() }, 1000)
  }

  const handleSaveSiulQuote = (q: SiulQuote) => {
    onUpdate({
      ...lead,
      age: ageInput, smoker,
      medications: selectedMeds,
      healthConditions: selectedConds,
      selectedCarrier: q.product.carrier,
      monthlyPremium: q.monthlyTarget,
      annualPremium: q.monthlyTarget * 12,
      carrierQuotes: siulQuotes.map(sq => ({
        carrier: sq.product.carrier,
        monthly: sq.monthlyTarget,
        annual: sq.monthlyTarget * 12,
        recommended: sq.product.id === q.product.id,
        productName: sq.product.productName,
      })),
      quoteCoverage: siulCoverage,
      quoteTerm: 0,
      quoteHealthClass: derivedHealthClass,
      quoteSavedAt: new Date().toLocaleString(),
      quoteProductName: q.product.productName,
      quoteType: 'iul',
      quoteSex: sex,
      quoteState: state,
    })
    setSavedId(q.product.id)
    setTimeout(() => { setSavedId(null); onClose() }, 1000)
  }

  // ─────────────────────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────────────────────
  const coverageOptions = insType === 'fex' ? COVERAGE_OPTIONS_FEX : insType === 'siul' ? COVERAGE_OPTIONS_SIUL : COVERAGE_OPTIONS_TERM
  const activeCoverage = insType === 'fex' ? fexCoverage : insType === 'siul' ? siulCoverage : coverage
  const setActiveCoverage = insType === 'fex' ? setFexCoverage : insType === 'siul' ? setSiulCoverage : setCoverage

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4 modal-backdrop-enter">
      <div className="modal-enter bg-[var(--bg-base)] rounded-none w-full max-w-6xl max-h-[96vh] flex flex-col shadow-none overflow-hidden">

        {/* ═══ TOP BAR ═══════════════════════════════════════════════ */}
        <div className="flex items-center justify-between px-5 py-3 bg-[var(--accent)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--bg-elevated)] rounded-none flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[var(--bg-deep)] font-bold text-base">Insurance Quoting Tool</span>
              <span className="text-[var(--text-dim)] text-xs ml-3">{lead.name}</span>
            </div>
          </div>
          {/* Insurance type tabs */}
          <div className="flex items-center gap-1 bg-[var(--accent)] p-1 rounded-none">
            {([['term','Term Life'],['fex','Final Expense'],['siul','SIUL / IUL']] as const).map(([key, label]) => (
              <button key={key} onClick={() => setInsType(key)}
                className={`px-4 py-1.5 rounded-none text-xs font-bold transition-colors ${
                  insType === key ? 'bg-[var(--bg-base)] text-[var(--text-primary)]' : 'text-[var(--accent-fg)] opacity-70 hover:opacity-100'
                }`}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="p-2 text-[var(--text-dim)] hover:text-[var(--bg-deep)] hover:bg-[var(--bg-elevated)] rounded-none transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ═══ LEFT PANEL — Client Info ══════════════════════════════ */}
          <div className="w-72 flex-shrink-0 border-r border-[var(--border)] bg-[var(--bg-deep)] flex flex-col overflow-y-auto">
            <div className="p-4 space-y-4">

              {/* Insurance Type Header */}
              <div>
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-3">
                  {insType === 'term' ? 'Term Life Quote' : insType === 'fex' ? 'Final Expense Quote' : 'SIUL / IUL Quote'}
                </p>

                {/* Coverage amount */}
                <div className="mb-3">
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Coverage Amount</label>
                  <select value={activeCoverage} onChange={e => setActiveCoverage(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-[var(--border-light)] rounded-none text-sm bg-[var(--bg-base)] focus:outline-none focus:ring-2 focus:ring-[rgba(207,69,0,0.3)]">
                    {coverageOptions.map(v => <option key={v} value={v}>{fmtK(v)}</option>)}
                  </select>
                </div>

                {/* Term selector (term only) */}
                {insType === 'term' && (
                  <div className="mb-3">
                    <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Term Length</label>
                    <div className="grid grid-cols-5 gap-1">
                      {TERM_OPTIONS.map(t => (
                        <button key={t} onClick={() => setTerm(t)}
                          className={`py-1.5 text-xs font-bold rounded-none border transition-all ${
                            term === t ? 'bg-[var(--accent)] text-[var(--bg-deep)] border-neutral-900' : 'bg-[var(--bg-base)] text-[var(--text-muted)] border-[var(--border-light)] hover:border-neutral-500'
                          }`}>
                          {t}yr
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* About the Client */}
              <div>
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">About the Client</p>

                {/* Sex */}
                <div className="mb-2">
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Sex</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['male','female'] as const).map(s => (
                      <button key={s} onClick={() => setSex(s)}
                        className={`py-1.5 text-xs font-semibold rounded-none border-2 capitalize transition-all ${
                          sex === s ? 'border-neutral-900 bg-[var(--accent)] text-white' : 'border-[var(--border-light)] bg-[var(--bg-base)] text-[var(--text-muted)] hover:border-neutral-500'
                        }`}>
                        {s === 'male' ? '♂ Male' : '♀ Female'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* State */}
                <div className="mb-2">
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">State</label>
                  <select value={state} onChange={e => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border-light)] rounded-none text-sm bg-[var(--bg-base)] focus:outline-none focus:ring-2 focus:ring-[rgba(207,69,0,0.3)]">
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Age */}
                <div className="mb-2">
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Age</label>
                  <input type="number" min={18} max={85} value={ageInput}
                    onChange={e => setAgeInput(Math.max(18, Math.min(85, parseInt(e.target.value) || 35)))}
                    className="w-full px-3 py-2 border border-[var(--border-light)] rounded-none text-sm bg-[var(--bg-base)] focus:outline-none focus:ring-2 focus:ring-[rgba(207,69,0,0.3)]" />
                  <p className="text-xs text-[var(--text-muted)] mt-1">Use exact DOB for accurate underwriting results.</p>
                </div>

                {/* Height / Weight */}
                <div className="mb-2">
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Height / Weight <span className="font-normal text-[var(--text-dim)]">(optional)</span></label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="ft" value={height.ft} onChange={e => setHeight(p => ({...p, ft: e.target.value}))}
                      className="w-14 px-2 py-2 border border-[var(--border-light)] rounded-none text-sm text-center bg-[var(--bg-base)] focus:outline-none" />
                    <input type="number" placeholder="in" value={height.in} onChange={e => setHeight(p => ({...p, in: e.target.value}))}
                      className="w-14 px-2 py-2 border border-[var(--border-light)] rounded-none text-sm text-center bg-[var(--bg-base)] focus:outline-none" />
                    <input type="number" placeholder="lbs" value={weight} onChange={e => setWeight(e.target.value)}
                      className="flex-1 px-2 py-2 border border-[var(--border-light)] rounded-none text-sm text-center bg-[var(--bg-base)] focus:outline-none" />
                  </div>
                </div>

                {/* Nicotine Use */}
                <div className="mb-2">
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Nicotine Use</label>
                  <div className="space-y-1">
                    {[['none','Non-Tobacco User'], ['smoker','Cigarettes + Other Nicotine']] .map(([val, label]) => (
                      <label key={val} className={`flex items-center gap-2 px-3 py-2 rounded-none border-2 cursor-pointer transition-all ${
                        (val === 'none' ? !smoker : smoker) ? 'border-neutral-900 bg-[var(--bg-deep)]' : 'border-[var(--border)] bg-[var(--bg-base)] hover:border-[var(--border-light)]'
                      }`}>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          (val === 'none' ? !smoker : smoker) ? 'border-neutral-900 bg-[var(--accent)]' : 'border-neutral-400'
                        }`}>
                          {(val === 'none' ? !smoker : smoker) && <div className="w-1.5 h-1.5 bg-[var(--bg-base)] rounded-full" />}
                        </div>
                        <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Drug and Health Information */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">Drug &amp; Health Info</p>
                  <button onClick={() => setShowMedPanel(p => !p)}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] font-semibold flex items-center gap-1">
                    {showMedPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showMedPanel ? 'Close' : 'Edit'}
                  </button>
                </div>

                {/* Derived health class */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[var(--text-muted)]">Health Class:</span>
                  <span className={`text-xs px-2 py-0.5 rounded-none font-bold border ${HC_COLORS[derivedHealthClass] ?? 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border)]'}`}>
                    {derivedHealthClass}
                  </span>
                </div>

                {/* Selected meds pills */}
                {selectedMeds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedMeds.map(m => (
                      <button key={m} onClick={() => toggleMed(m)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-xs rounded-none hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors">
                        {m.split(' ')[0]}<X className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                )}
                {selectedConds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedConds.map(c => (
                      <button key={c} onClick={() => toggleCond(c)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-[var(--bg-elevated)] text-[var(--text-secondary)] text-xs rounded-none hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors">
                        {c.split(' ').slice(0,3).join(' ')}<X className="w-2.5 h-2.5" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══ CENTER - Med/Condition Panel (slide-in) ══════════════ */}
          {showMedPanel && (
            <div className="w-72 flex-shrink-0 border-r border-[var(--border)] bg-[var(--bg-base)] flex flex-col overflow-y-auto">
              <div className="p-4 space-y-4">

                {/* Search medications */}
                <div>
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Enter Medication</p>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-dim)]" />
                    <input type="text" placeholder="Search medications..."
                      value={medSearch} onChange={e => setMedSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-[var(--border-light)] rounded-none text-xs focus:outline-none focus:ring-2 focus:ring-[rgba(207,69,0,0.3)]" />
                  </div>
                  <select value={medCategory} onChange={e => setMedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border-light)] rounded-none text-xs bg-[var(--bg-base)] focus:outline-none mb-2">
                    <option value="all">All Categories</option>
                    {MED_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <div className="border border-[var(--border)] rounded-none overflow-hidden max-h-52 overflow-y-auto">
                    {filteredMeds.map(med => {
                      const sel = selectedMeds.includes(med.name)
                      return (
                        <div key={med.name} onClick={() => toggleMed(med.name)}
                          className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[var(--bg-deep)] border-b border-[var(--border)] last:border-0 ${sel ? 'bg-[var(--bg-deep)]' : ''}`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 flex items-center justify-center border flex-shrink-0 ${sel ? 'bg-[var(--accent)] border-neutral-900' : 'border-neutral-400'}`}>
                              {sel && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-[var(--text-primary)]">{med.name}</p>
                              <p className="text-xs text-[var(--text-dim)]">{med.category}</p>
                            </div>
                          </div>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ml-2 ${IMPACT_BADGE[med.impact]}`}>
                            {med.impact === 'preferred-plus' ? 'PP+' : med.impact === 'preferred' ? 'P' : med.impact === 'standard-plus' ? 'SP' : med.impact === 'standard' ? 'S' : 'Sub'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Health Conditions */}
                <div>
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Enter Health Condition</p>
                  <div className="border border-[var(--border)] rounded-none overflow-hidden max-h-64 overflow-y-auto">
                    {HEALTH_CONDITIONS.map(cond => {
                      const sel = selectedConds.includes(cond.name)
                      return (
                        <div key={cond.name} onClick={() => toggleCond(cond.name)}
                          className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[var(--bg-deep)] border-b border-[var(--border)] last:border-0 ${sel ? 'bg-[var(--bg-deep)]' : ''}`}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 flex items-center justify-center border flex-shrink-0 ${sel ? 'bg-[var(--accent)] border-neutral-900' : 'border-neutral-400'}`}>
                              {sel && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <p className="text-xs font-medium text-[var(--text-primary)]">{cond.name}</p>
                          </div>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ml-2 ${IMPACT_BADGE[cond.impact]}`}>
                            {cond.impact === 'preferred' ? 'P' : cond.impact === 'standard-plus' ? 'SP' : cond.impact === 'standard' ? 'S' : 'Sub'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ RIGHT PANEL — Quote Results ════════════════════════════ */}
          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            {/* Results header */}
            <div className="px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-base)] flex-shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calculator className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {insType === 'term' ? `${term}-Year Term · ${fmtK(coverage)}` :
                   insType === 'fex'  ? `Final Expense · ${fmtK(fexCoverage)}` :
                   `SIUL/IUL · ${fmtK(siulCoverage)}`}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-none font-bold border ${HC_COLORS[derivedHealthClass] ?? 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border)]'}`}>
                  {derivedHealthClass}
                </span>
                <span className="text-xs text-[var(--text-muted)]">{sex === 'male' ? '♂' : '♀'} · Age {ageInput} · {state} · {smoker ? 'Smoker' : 'Non-Smoker'}</span>
              </div>
              <div className="text-xs text-[var(--text-dim)] font-medium">
                {insType === 'term' ? `${termQuotes.length} results` :
                 insType === 'fex'  ? `${fexQuotes.length} results` :
                 `${siulQuotes.length} results`}
              </div>
            </div>

            {/* Results scroll area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">

              {/* ── TERM QUOTES ── */}
              {insType === 'term' && (
                <>
                  {termQuotes.length === 0 && (
                    <div className="flex items-center gap-3 p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-none">
                      <AlertCircle className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
                      <p className="text-sm text-[var(--text-muted)]">No products available for these parameters. Try adjusting age, coverage, or term length.</p>
                    </div>
                  )}
                  {termQuotes.map((q, idx) => (
                    <TermQuoteCard
                      key={q.product.id}
                      quote={q}
                      rank={idx + 1}
                      isSaved={savedId === q.product.id}
                      onSave={() => handleSaveTermQuote(q)}
                    />
                  ))}
                </>
              )}

              {/* ── FEX QUOTES ── */}
              {insType === 'fex' && (
                <>
                  {fexQuotes.length === 0 && (
                    <div className="flex items-center gap-3 p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-none">
                      <AlertCircle className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
                      <p className="text-sm text-[var(--text-muted)]">No products available. Final expense products are typically for ages 45–85.</p>
                    </div>
                  )}
                  {fexQuotes.map((q, idx) => (
                    <FexQuoteCard
                      key={q.product.id}
                      quote={q}
                      rank={idx + 1}
                      isSaved={savedId === q.product.id}
                      onSave={() => handleSaveFexQuote(q)}
                    />
                  ))}
                </>
              )}

              {/* ── SIUL QUOTES ── */}
              {insType === 'siul' && (
                <>
                  {siulQuotes.length === 0 && (
                    <div className="flex items-center gap-3 p-4 bg-[var(--bg-surface)] border border-[var(--border)] rounded-none">
                      <AlertCircle className="w-5 h-5 text-[var(--text-muted)] flex-shrink-0" />
                      <p className="text-sm text-[var(--text-muted)]">No SIUL products available for these parameters.</p>
                    </div>
                  )}
                  {siulQuotes.map((q, idx) => (
                    <SiulQuoteCard
                      key={q.product.id}
                      quote={q}
                      rank={idx + 1}
                      isSaved={savedId === q.product.id}
                      onSave={() => handleSaveSiulQuote(q)}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  TERM QUOTE CARD — matches the document format exactly
// ═══════════════════════════════════════════════════════════════
function TermQuoteCard({ quote, rank, isSaved, onSave }: {
  quote: TermQuote; rank: number; isSaved: boolean; onSave: () => void
}) {
  const { product, monthly, annual, adMonthly, adAnnual } = quote
  return (
    <div className={`bg-[var(--bg-base)] rounded-none border-2 ${rank === 1 ? 'border-[rgba(207,69,0,0.4)]' : 'border-[var(--border)]'} overflow-hidden transition-all hover:shadow-none`}>
      {/* Product type header */}
      <div className={`px-4 py-2 flex items-center justify-between ${rank === 1 ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-deep)]'} border-b border-[var(--border)]`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center ${rank === 1 ? 'bg-[var(--bg-surface)]0 text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}>
            {rank}
          </span>
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Coverage Type</span>
        </div>
        <div className="flex items-center gap-2">
          {rank === 1 && <span className="flex items-center gap-1 text-xs font-bold text-[var(--accent)] bg-[var(--accent-dim)] px-2 py-0.5"><Star className="w-3 h-3" />Best Rate</span>}
          {product.hasVitality && <span className="text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-elevated)] px-2 py-0.5">Vitality</span>}
          {product.healthClasses.includes('All') && <span className="text-xs font-bold text-[var(--text-secondary)] bg-[var(--bg-elevated)] px-2 py-0.5">No Exam</span>}
        </div>
      </div>

      <div className="px-4 py-3">
        {/* Carrier + product */}
        <div className="mb-3">
          <p className="font-black text-[var(--text-primary)] text-base leading-tight">{product.productName}</p>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">{product.carrier}</p>
        </div>

        {/* Pricing grid — exactly like the document */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-3">
          <div>
            <span className="text-xs text-[var(--text-muted)] font-medium">Monthly</span>
            <p className="text-2xl font-black text-[var(--text-primary)]">{formatCurrency(monthly)}</p>
          </div>
          <div>
            <span className="text-xs text-[var(--text-muted)] font-medium">Annual</span>
            <p className="text-2xl font-black text-[var(--text-primary)]">{formatCurrency(annual)}</p>
          </div>
        </div>

        {/* AD&D addon line */}
        {adMonthly && adAnnual && (
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-3 pt-2 border-t border-[var(--border)]">
            <div>
              <span className="text-xs text-[var(--text-dim)]">+ Accidental Death (Monthly)</span>
              <p className="text-base font-bold text-[var(--text-muted)]">{formatCurrency(adMonthly)}</p>
            </div>
            <div>
              <span className="text-xs text-[var(--text-dim)]">+ Accidental Death (Annual)</span>
              <p className="text-base font-bold text-[var(--text-muted)]">{formatCurrency(adAnnual)}</p>
            </div>
          </div>
        )}

        {/* Special notes */}
        {product.note && (
          <div className="mb-2">
            <p className="text-xs text-[var(--text-muted)] flex items-start gap-1">
              <span className="text-[var(--text-dim)] mt-0.5">•</span>
              {product.note}
            </p>
            {product.paymentProtectorIncome && (
              <p className="text-xs text-[var(--accent)] font-semibold flex items-center gap-1 mt-0.5">
                <span>•</span>Calculated monthly income is {formatCurrency(product.paymentProtectorIncome)}
              </p>
            )}
          </div>
        )}

        {/* Rider chips */}
        {product.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.features.map(f => (
              <span key={f} className="text-xs px-2 py-0.5 bg-[var(--bg-surface)] text-[var(--text-muted)] rounded-none font-medium">{f}</span>
            ))}
          </div>
        )}

        {/* Action buttons — exactly like the document */}
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
          <button
            onClick={onSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold transition-all ${
              isSaved ? 'bg-[var(--accent)] text-[var(--bg-deep)]' : 'bg-[var(--accent)] text-[var(--bg-deep)] hover:bg-[var(--bg-elevated)]'
            }`}
          >
            {isSaved ? <><Check className="w-3.5 h-3.5" />Saved!</> : <><Plus className="w-3.5 h-3.5" />Push to CRM</>}
          </button>
          {product.hasEapp && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-elevated)] text-[var(--text-secondary)] rounded-none text-xs font-bold hover:bg-[var(--bg-overlay)] transition-colors">
              <FileText className="w-3.5 h-3.5" />E-App
            </button>
          )}
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border-light)] text-[var(--text-muted)] rounded-none text-xs font-semibold hover:bg-[var(--bg-deep)] transition-colors">
            <ArrowUpDown className="w-3.5 h-3.5" />Compare
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  FINAL EXPENSE QUOTE CARD
// ═══════════════════════════════════════════════════════════════
function FexQuoteCard({ quote, rank, isSaved, onSave }: {
  quote: FexQuote; rank: number; isSaved: boolean; onSave: () => void
}) {
  const { product, monthly, annual } = quote
  const benefitColors = {
    Level: 'bg-[var(--accent-dim)] text-[var(--accent-light)]',
    Graded: 'bg-[var(--border)] text-[var(--text-secondary)]',
    Modified: 'bg-[var(--border)] text-[var(--text-secondary)]',
  }
  return (
    <div className={`bg-[var(--bg-base)] rounded-none border-2 ${rank === 1 ? 'border-[rgba(207,69,0,0.4)]' : 'border-[var(--border)]'} overflow-hidden hover:shadow-none transition-all`}>
      <div className={`px-4 py-2 flex items-center justify-between ${rank === 1 ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-deep)]'} border-b border-[var(--border)]`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center ${rank === 1 ? 'bg-[var(--bg-surface)]0 text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}>{rank}</span>
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Coverage Type</span>
        </div>
        <div className="flex items-center gap-2">
          {rank === 1 && <span className="flex items-center gap-1 text-xs font-bold text-[var(--accent)] bg-[var(--accent-dim)] px-2 py-0.5"><Star className="w-3 h-3" />Best Rate</span>}
          <span className={`text-xs font-bold px-2 py-0.5 ${benefitColors[product.benefitType]}`}>{product.benefitType} Benefit</span>
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="mb-3">
          <p className="font-black text-[var(--text-primary)] text-base leading-tight">{product.productName}</p>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">{product.carrier}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 mb-3">
          <div>
            <span className="text-xs text-[var(--text-muted)]">Monthly</span>
            <p className="text-2xl font-black text-[var(--text-primary)]">{formatCurrency(monthly)}</p>
          </div>
          <div>
            <span className="text-xs text-[var(--text-muted)]">Annual</span>
            <p className="text-2xl font-black text-[var(--text-primary)]">{formatCurrency(annual)}</p>
          </div>
        </div>
        {product.gradedNote && (
          <p className="text-xs text-[var(--text-muted)] flex items-start gap-1 mb-2">
            <span className="mt-0.5">•</span>{product.gradedNote}
          </p>
        )}
        {product.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.features.map(f => (
              <span key={f} className="text-xs px-2 py-0.5 bg-[var(--bg-surface)] text-[var(--text-muted)] rounded-none font-medium">{f}</span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
          <button onClick={onSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold transition-all ${
              isSaved ? 'bg-[var(--accent)] text-[var(--bg-deep)]' : 'bg-[var(--accent)] text-[var(--bg-deep)] hover:bg-[var(--bg-elevated)]'
            }`}>
            {isSaved ? <><Check className="w-3.5 h-3.5" />Saved!</> : <><Plus className="w-3.5 h-3.5" />Push to CRM</>}
          </button>
          {product.hasEapp && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-elevated)] text-[var(--text-secondary)] rounded-none text-xs font-bold hover:bg-[var(--bg-overlay)]">
              <FileText className="w-3.5 h-3.5" />E-App
            </button>
          )}
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border-light)] text-[var(--text-muted)] rounded-none text-xs font-semibold hover:bg-[var(--bg-deep)]">
            <ArrowUpDown className="w-3.5 h-3.5" />Compare
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  SIUL QUOTE CARD
// ═══════════════════════════════════════════════════════════════
function SiulQuoteCard({ quote, rank, isSaved, onSave }: {
  quote: SiulQuote; rank: number; isSaved: boolean; onSave: () => void
}) {
  const { product, monthlyTarget } = quote
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={`bg-[var(--bg-base)] rounded-none border-2 ${rank === 1 ? 'border-[rgba(207,69,0,0.4)]' : 'border-[var(--border)]'} overflow-hidden hover:shadow-none transition-all`}>
      <div className={`px-4 py-2 flex items-center justify-between ${rank === 1 ? 'bg-[var(--bg-surface)]' : 'bg-[var(--bg-deep)]'} border-b border-[var(--border)]`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center ${rank === 1 ? 'bg-[var(--bg-surface)]0 text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]'}`}>{rank}</span>
          <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wide">Coverage Type</span>
        </div>
        <div className="flex items-center gap-2">
          {rank === 1 && <span className="flex items-center gap-1 text-xs font-bold text-[var(--accent)] bg-[var(--accent-dim)] px-2 py-0.5"><Star className="w-3 h-3" />Best Rate</span>}
          <span className="text-xs font-bold px-2 py-0.5 bg-[var(--bg-elevated)] text-[var(--text-secondary)]">{product.type}</span>
        </div>
      </div>
      <div className="px-4 py-3">
        <div className="mb-3">
          <p className="font-black text-[var(--text-primary)] text-base">{product.productName}</p>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">{product.carrier}</p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 mb-3">
          <div>
            <span className="text-xs text-[var(--text-muted)]">Target Monthly Premium</span>
            <p className="text-2xl font-black text-[var(--text-primary)]">{formatCurrency(monthlyTarget)}</p>
          </div>
          <div>
            <span className="text-xs text-[var(--text-muted)]">Annual Equivalent</span>
            <p className="text-2xl font-black text-[var(--text-primary)]">{formatCurrency(monthlyTarget * 12)}</p>
          </div>
        </div>

        {/* Indexing strategies */}
        {product.strategies.length > 0 && (
          <div className="mb-3">
            <button onClick={() => setExpanded(p => !p)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-2">
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {product.strategies.length} Indexing {product.strategies.length === 1 ? 'Strategy' : 'Strategies'}
            </button>
            {expanded && (
              <div className="space-y-1.5">
                {product.strategies.map(s => (
                  <div key={s.name} className="flex items-center justify-between bg-[var(--bg-deep)] rounded-none px-3 py-2 border border-[var(--border)]">
                    <div>
                      <p className="text-xs font-semibold text-[var(--text-primary)]">{s.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">Floor: {s.floor}% · {s.cap ? `Cap: ${s.cap}%` : `PR: ${s.participationRate}%`}</p>
                    </div>
                    <Zap className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {product.note && (
          <p className="text-xs text-[var(--text-muted)] flex items-start gap-1 mb-2">
            <span className="mt-0.5">•</span>{product.note}
          </p>
        )}
        {product.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {product.features.map(f => (
              <span key={f} className="text-xs px-2 py-0.5 bg-[var(--bg-surface)] text-[var(--text-muted)] rounded-none font-medium">{f}</span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--border)]">
          <button onClick={onSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-xs font-bold transition-all ${
              isSaved ? 'bg-[var(--accent)] text-[var(--bg-deep)]' : 'bg-[var(--accent)] text-[var(--bg-deep)] hover:bg-[var(--bg-elevated)]'
            }`}>
            {isSaved ? <><Check className="w-3.5 h-3.5" />Saved!</> : <><Plus className="w-3.5 h-3.5" />Push to CRM</>}
          </button>
          {product.hasEapp && (
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-elevated)] text-[var(--text-secondary)] rounded-none text-xs font-bold hover:bg-[var(--bg-overlay)]">
              <FileText className="w-3.5 h-3.5" />E-App
            </button>
          )}
          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-[var(--border-light)] text-[var(--text-muted)] rounded-none text-xs font-semibold hover:bg-[var(--bg-deep)]">
            <ArrowUpDown className="w-3.5 h-3.5" />Compare
          </button>
        </div>
      </div>
    </div>
  )
}
