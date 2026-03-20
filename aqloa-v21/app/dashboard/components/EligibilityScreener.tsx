'use client'
import { useState, useRef, useEffect } from 'react'
import { Shield, CheckCircle, XCircle, AlertCircle, ExternalLink, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { Lead } from '../types'

// ─── TYPES ───────────────────────────────────────────────────────────────────

type InsuranceType = 'fex' | 'iul' | 'term'
type HealthClass = 'excellent' | 'good' | 'fair' | 'poor'
type NicotineUse = 'none' | 'cigarettes' | 'cigar_occasional' | 'chew' | 'vape' | 'patch_gum'

interface ScreenerInputs {
  insuranceType: InsuranceType
  state: string
  age: string
  heightFt: string
  heightIn: string
  weightLbs: string
  nicotine: NicotineUse
  healthClass: HealthClass
  gender: 'male' | 'female'
  conditions: string[]
}

interface EligibilityResult {
  carrier: string
  eligible: boolean
  reasons: string[]
  warnings: string[]
  eappUrl: string
  productName: string
  notes: string
}

interface EligibilityScreenerProps {
  lead: Lead
  onSave: (results: EligibilityResult[], inputs: ScreenerInputs) => void
}

// ─── BUILD CHART DATA (per carrier underwriting guidelines) ──────────────────
// Sources: publicly available agent underwriting guides for each carrier

const BUILD_CHARTS: Record<string, Record<string, { minLbs: number; maxLbs: number }[]>> = {
  'mutual_of_omaha': {
    // Preferred Plus / Preferred / Standard bands by height (inches)
    '58': [{ minLbs: 91, maxLbs: 142 }, { minLbs: 91, maxLbs: 155 }, { minLbs: 91, maxLbs: 172 }],
    '60': [{ minLbs: 97, maxLbs: 153 }, { minLbs: 97, maxLbs: 168 }, { minLbs: 97, maxLbs: 186 }],
    '62': [{ minLbs: 104, maxLbs: 164 }, { minLbs: 104, maxLbs: 180 }, { minLbs: 104, maxLbs: 199 }],
    '64': [{ minLbs: 110, maxLbs: 174 }, { minLbs: 110, maxLbs: 191 }, { minLbs: 110, maxLbs: 213 }],
    '66': [{ minLbs: 117, maxLbs: 185 }, { minLbs: 117, maxLbs: 204 }, { minLbs: 117, maxLbs: 226 }],
    '68': [{ minLbs: 125, maxLbs: 197 }, { minLbs: 125, maxLbs: 217 }, { minLbs: 125, maxLbs: 241 }],
    '70': [{ minLbs: 132, maxLbs: 209 }, { minLbs: 132, maxLbs: 230 }, { minLbs: 132, maxLbs: 255 }],
    '72': [{ minLbs: 140, maxLbs: 221 }, { minLbs: 140, maxLbs: 243 }, { minLbs: 140, maxLbs: 270 }],
    '74': [{ minLbs: 148, maxLbs: 234 }, { minLbs: 148, maxLbs: 257 }, { minLbs: 148, maxLbs: 285 }],
    '76': [{ minLbs: 156, maxLbs: 247 }, { minLbs: 156, maxLbs: 272 }, { minLbs: 156, maxLbs: 301 }],
  },
  'american_amicable': {
    '58': [{ minLbs: 85, maxLbs: 160 }, { minLbs: 85, maxLbs: 178 }, { minLbs: 85, maxLbs: 199 }],
    '60': [{ minLbs: 90, maxLbs: 172 }, { minLbs: 90, maxLbs: 191 }, { minLbs: 90, maxLbs: 214 }],
    '62': [{ minLbs: 95, maxLbs: 184 }, { minLbs: 95, maxLbs: 204 }, { minLbs: 95, maxLbs: 229 }],
    '64': [{ minLbs: 105, maxLbs: 196 }, { minLbs: 105, maxLbs: 218 }, { minLbs: 105, maxLbs: 244 }],
    '66': [{ minLbs: 110, maxLbs: 209 }, { minLbs: 110, maxLbs: 232 }, { minLbs: 110, maxLbs: 260 }],
    '68': [{ minLbs: 118, maxLbs: 222 }, { minLbs: 118, maxLbs: 247 }, { minLbs: 118, maxLbs: 276 }],
    '70': [{ minLbs: 125, maxLbs: 235 }, { minLbs: 125, maxLbs: 261 }, { minLbs: 125, maxLbs: 293 }],
    '72': [{ minLbs: 133, maxLbs: 250 }, { minLbs: 133, maxLbs: 277 }, { minLbs: 133, maxLbs: 310 }],
    '74': [{ minLbs: 140, maxLbs: 264 }, { minLbs: 140, maxLbs: 293 }, { minLbs: 140, maxLbs: 328 }],
    '76': [{ minLbs: 148, maxLbs: 279 }, { minLbs: 148, maxLbs: 310 }, { minLbs: 148, maxLbs: 347 }],
  },
  'transamerica': {
    '58': [{ minLbs: 88, maxLbs: 148 }, { minLbs: 88, maxLbs: 163 }, { minLbs: 88, maxLbs: 185 }],
    '60': [{ minLbs: 95, maxLbs: 159 }, { minLbs: 95, maxLbs: 176 }, { minLbs: 95, maxLbs: 198 }],
    '62': [{ minLbs: 101, maxLbs: 171 }, { minLbs: 101, maxLbs: 189 }, { minLbs: 101, maxLbs: 212 }],
    '64': [{ minLbs: 108, maxLbs: 182 }, { minLbs: 108, maxLbs: 201 }, { minLbs: 108, maxLbs: 226 }],
    '66': [{ minLbs: 115, maxLbs: 194 }, { minLbs: 115, maxLbs: 215 }, { minLbs: 115, maxLbs: 241 }],
    '68': [{ minLbs: 122, maxLbs: 207 }, { minLbs: 122, maxLbs: 229 }, { minLbs: 122, maxLbs: 256 }],
    '70': [{ minLbs: 130, maxLbs: 220 }, { minLbs: 130, maxLbs: 243 }, { minLbs: 130, maxLbs: 272 }],
    '72': [{ minLbs: 138, maxLbs: 233 }, { minLbs: 138, maxLbs: 258 }, { minLbs: 138, maxLbs: 289 }],
    '74': [{ minLbs: 146, maxLbs: 247 }, { minLbs: 146, maxLbs: 273 }, { minLbs: 146, maxLbs: 306 }],
    '76': [{ minLbs: 154, maxLbs: 261 }, { minLbs: 154, maxLbs: 289 }, { minLbs: 154, maxLbs: 323 }],
  },
}

// Knockout conditions per carrier per product type
const KNOCKOUT_CONDITIONS: Record<string, Record<InsuranceType, string[]>> = {
  mutual_of_omaha: {
    fex: ['active_cancer', 'aids_hiv', 'als', 'alzheimers', 'currently_hospitalized', 'dialysis', 'organ_transplant', 'oxygen_dependent', 'terminal_illness'],
    iul: ['active_cancer', 'aids_hiv', 'als', 'alzheimers', 'currently_hospitalized', 'dialysis', 'organ_transplant', 'oxygen_dependent', 'terminal_illness', 'recent_heart_attack', 'recent_stroke'],
    term: ['active_cancer', 'aids_hiv', 'als', 'alzheimers', 'currently_hospitalized', 'dialysis', 'organ_transplant', 'oxygen_dependent', 'terminal_illness', 'recent_heart_attack', 'recent_stroke'],
  },
  american_amicable: {
    fex: ['active_cancer', 'aids_hiv', 'als', 'alzheimers', 'currently_hospitalized', 'dialysis', 'organ_transplant', 'oxygen_dependent', 'terminal_illness'],
    iul: ['active_cancer', 'aids_hiv', 'als', 'alzheimers', 'currently_hospitalized', 'dialysis', 'organ_transplant', 'oxygen_dependent', 'terminal_illness', 'recent_heart_attack'],
    term: ['active_cancer', 'aids_hiv', 'als', 'alzheimers', 'currently_hospitalized', 'dialysis', 'organ_transplant', 'oxygen_dependent', 'terminal_illness', 'recent_heart_attack', 'recent_stroke'],
  },
  transamerica: {
    fex: ['active_cancer', 'aids_hiv', 'als', 'alzheimers', 'currently_hospitalized', 'dialysis', 'organ_transplant', 'oxygen_dependent', 'terminal_illness', 'recent_heart_attack'],
    iul: ['active_cancer', 'aids_hiv', 'als', 'alzheimers', 'currently_hospitalized', 'dialysis', 'organ_transplant', 'oxygen_dependent', 'terminal_illness', 'recent_heart_attack', 'recent_stroke'],
    term: ['active_cancer', 'aids_hiv', 'als', 'alzheimers', 'currently_hospitalized', 'dialysis', 'organ_transplant', 'oxygen_dependent', 'terminal_illness', 'recent_heart_attack', 'recent_stroke'],
  },
}

// Age limits per carrier per product
const AGE_LIMITS: Record<string, Record<InsuranceType, { min: number; max: number }>> = {
  mutual_of_omaha: { fex: { min: 45, max: 85 }, iul: { min: 18, max: 80 }, term: { min: 18, max: 75 } },
  american_amicable: { fex: { min: 40, max: 80 }, iul: { min: 18, max: 75 }, term: { min: 18, max: 70 } },
  transamerica: { fex: { min: 45, max: 80 }, iul: { min: 18, max: 80 }, term: { min: 18, max: 75 } },
}

// ── COMPREHENSIVE CONDITION LIST (all conditions causing red flags for MOO, AmAm, Transamerica) ──
const CONDITION_LABELS: Record<string, string> = {
  // ─ Automatic Knockouts (all carriers) ─
  active_cancer:            'Active Cancer (any type, under treatment)',
  aids_hiv:                 'AIDS / HIV (diagnosed)',
  als:                      "ALS / Lou Gehrig's Disease",
  alzheimers:               "Alzheimer's Disease / Dementia",
  currently_hospitalized:   'Currently Confined to Hospital / Nursing Facility',
  dialysis:                 'Currently on Dialysis',
  organ_transplant:         'Organ Transplant (heart, liver, lung, kidney)',
  oxygen_dependent:         'Oxygen Dependent (24-hour use)',
  terminal_illness:         'Terminal Illness (life expectancy < 12 months)',
  // ─ High-Risk Cardiac ─
  recent_heart_attack:      'Heart Attack (within last 12 months)',
  heart_attack_2yr:         'Heart Attack (within last 2 years)',
  congestive_heart_failure: 'Congestive Heart Failure (CHF)',
  heart_disease:            'Coronary Artery Disease / Heart Disease',
  cardiomyopathy:           'Cardiomyopathy',
  cardiac_stent_recent:     'Cardiac Stent / Angioplasty (within 1 year)',
  pacemaker_defibrillator:  'Pacemaker or Implanted Defibrillator',
  // ─ Neurological / Cognitive ─
  recent_stroke:            'Stroke or TIA (within last 12 months)',
  stroke_2yr:               'Stroke or TIA (within last 2 years)',
  parkinsons:               "Parkinson's Disease",
  multiple_sclerosis:       'Multiple Sclerosis (MS)',
  epilepsy_uncontrolled:    'Epilepsy / Seizure Disorder (uncontrolled)',
  // ─ Respiratory ─
  copd:                     'COPD / Emphysema',
  pulmonary_fibrosis:       'Pulmonary Fibrosis',
  respiratory_failure:      'Respiratory Failure (hospitalized in last 2 years)',
  // ─ Diabetes & Endocrine ─
  diabetes_type1:           'Diabetes Type 1 (insulin dependent)',
  diabetes_type2:           'Diabetes Type 2 (diagnosed)',
  diabetes_complications:   'Diabetes with Complications (neuropathy, retinopathy)',
  // ─ Renal / Liver ─
  kidney_disease:           'Chronic Kidney Disease (Stage 3+)',
  kidney_failure:           'Kidney Failure (not on dialysis)',
  cirrhosis:                'Cirrhosis of the Liver',
  hepatitis_c_active:       'Hepatitis C (active, untreated)',
  // ─ Cancer History ─
  cancer_remission_2yr:     'Cancer in Remission (within 2 years)',
  cancer_remission_5yr:     'Cancer in Remission (2–5 years)',
  skin_cancer_basal:        'Skin Cancer — Basal Cell (treated)',
  // ─ Mental Health ─
  schizophrenia:            'Schizophrenia or Psychosis',
  bipolar:                  'Bipolar Disorder',
  depression_hospitalized:  'Depression (hospitalized in last 2 years)',
  // ─ Substance Use ─
  alcohol_abuse:            'Alcohol Abuse / Dependency (last 5 years)',
  drug_abuse:               'Drug Abuse / Dependency (last 5 years)',
  // ─ Musculoskeletal / Other ─
  lupus:                    'Lupus (Systemic Lupus Erythematosus)',
  sickle_cell:              'Sickle Cell Disease',
  hiv_positive:             'HIV Positive (asymptomatic)',
  hep_b_active:             'Hepatitis B (active)',
  crohns_colitis:           "Crohn's Disease / Ulcerative Colitis",
  aneurysm:                 'Aortic Aneurysm (diagnosed)',
  peripheral_arterial:      'Peripheral Arterial Disease',
  blood_clot_recent:        'Blood Clot / DVT / PE (within 2 years)',
  stroke_history:           'Stroke History (more than 2 years ago)',
  // ─ Lifestyle / Other ─
  tobacco_daily:            'Daily Tobacco Use (cigarettes)',
  tobacco_occasional:       'Occasional Tobacco / Cigar',
  overweight_severe:        'Severely Overweight (outside build chart)',
  recent_surgery:           'Major Surgery (within last 6 months)',
  hospitalized_2yr:         'Hospitalized 2+ times in last 2 years',
}

const CARRIER_EAPPS: Record<string, Record<InsuranceType, string>> = {
  mutual_of_omaha: {
    fex: 'https://www.mutualofomaha.com/life-insurance/final-expense',
    iul: 'https://www.mutualofomaha.com/life-insurance',
    term: 'https://www.mutualofomaha.com/life-insurance/term-life-insurance',
  },
  american_amicable: {
    fex: 'https://www.americanamicable.com/final-expense',
    iul: 'https://www.americanamicable.com/indexed-universal-life',
    term: 'https://www.americanamicable.com/term-life',
  },
  transamerica: {
    fex: 'https://www.transamerica.com/individual/products/life-insurance/final-expense/',
    iul: 'https://www.transamerica.com/individual/products/life-insurance/indexed-universal-life/',
    term: 'https://www.transamerica.com/individual/products/life-insurance/term-life-insurance/',
  },
}

const CARRIER_PRODUCT_NAMES: Record<string, Record<InsuranceType, string>> = {
  mutual_of_omaha: { fex: 'Mutual of Omaha Living Promise', iul: 'Mutual of Omaha IUL Protector', term: 'Mutual of Omaha Term Life Answers' },
  american_amicable: { fex: 'American Amicable Senior Choice', iul: 'American Amicable Index Universal Life', term: 'American Amicable Term Life' },
  transamerica: { fex: 'Transamerica Final Expense', iul: 'Transamerica Financial Foundation IUL', term: 'Transamerica Trendsetter Super' },
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY'
]

// States where carriers are NOT available (based on public filings)
const CARRIER_STATE_EXCLUSIONS: Record<string, string[]> = {
  mutual_of_omaha: ['NY'],
  american_amicable: ['NY', 'MT'],
  transamerica: ['NY'],
}

// ─── ELIGIBILITY ENGINE ───────────────────────────────────────────────────────

function checkBuild(carrierKey: string, heightIn: number, weightLbs: number, healthClass: HealthClass): { pass: boolean; warning: string } {
  const chart = BUILD_CHARTS[carrierKey]
  const closestHeight = Object.keys(chart).map(Number).reduce((a, b) => Math.abs(b - heightIn) < Math.abs(a - heightIn) ? b : a)
  const bands = chart[String(closestHeight)]
  const bandIdx = healthClass === 'excellent' ? 0 : healthClass === 'good' ? 1 : 2
  const band = bands[bandIdx]
  if (weightLbs < band.minLbs) return { pass: false, warning: `Weight ${weightLbs}lbs is below minimum ${band.minLbs}lbs for ${healthClass} health class` }
  if (weightLbs > band.maxLbs) return { pass: false, warning: `Weight ${weightLbs}lbs exceeds maximum ${band.maxLbs}lbs for ${healthClass} health class` }
  return { pass: true, warning: '' }
}

function runEligibility(inputs: ScreenerInputs): EligibilityResult[] {
  const carriers = ['mutual_of_omaha', 'american_amicable', 'transamerica']
  const age = parseInt(inputs.age)
  const heightIn = parseInt(inputs.heightFt) * 12 + parseInt(inputs.heightIn)
  const weight = parseInt(inputs.weightLbs)
  const isSmoker = inputs.nicotine !== 'none'
  const type = inputs.insuranceType

  return carriers.map(carrier => {
    const reasons: string[] = []
    const warnings: string[] = []
    let eligible = true

    // State check
    const excludedStates = CARRIER_STATE_EXCLUSIONS[carrier] || []
    if (excludedStates.includes(inputs.state)) {
      eligible = false
      reasons.push(`Not available in ${inputs.state}`)
    }

    // Age check
    const ageLimits = AGE_LIMITS[carrier][type]
    if (age < ageLimits.min) {
      eligible = false
      reasons.push(`Minimum age is ${ageLimits.min} for this product (applicant is ${age})`)
    } else if (age > ageLimits.max) {
      eligible = false
      reasons.push(`Maximum age is ${ageLimits.max} for this product (applicant is ${age})`)
    } else {
      reasons.push(`Age ${age} is within accepted range (${ageLimits.min}–${ageLimits.max})`)
    }

    // Build chart check
    if (!isNaN(heightIn) && !isNaN(weight) && weight > 0) {
      const buildCheck = checkBuild(carrier, heightIn, weight, inputs.healthClass)
      if (!buildCheck.pass) {
        eligible = false
        reasons.push(buildCheck.warning)
      } else {
        reasons.push(`Height/weight within accepted build chart`)
      }
    }

    // Knockout conditions
    const knockouts = KNOCKOUT_CONDITIONS[carrier][type]
    inputs.conditions.forEach(cond => {
      if (knockouts.includes(cond)) {
        eligible = false
        reasons.push(`${CONDITION_LABELS[cond]} is a knockout condition for this carrier/product`)
      } else if (CONDITION_LABELS[cond]) {
        warnings.push(`${CONDITION_LABELS[cond]} may affect health class rating — review underwriting guidelines`)
      }
    })

    // Nicotine handling per carrier
    if (isSmoker) {
      if (carrier === 'mutual_of_omaha') {
        if (inputs.nicotine === 'cigarettes') warnings.push('Tobacco user — will be rated as smoker, higher premium applies')
        else if (inputs.nicotine === 'cigar_occasional') warnings.push('Occasional cigar use — may qualify as non-tobacco if fewer than 12/year')
        else warnings.push('Nicotine use — tobacco rating will apply')
      } else if (carrier === 'american_amicable') {
        warnings.push('Nicotine use noted — tobacco rates apply, some products have a tobacco distinct rate class')
      } else if (carrier === 'transamerica') {
        if (inputs.nicotine === 'cigarettes') warnings.push('Cigarette smoker — tobacco rates apply, must disclose on application')
        else warnings.push('Non-cigarette nicotine use — may qualify for non-tobacco rates depending on product and frequency')
      }
    }

    // IUL-specific age/health notes
    if (type === 'iul') {
      if (age > 60) warnings.push('Age 60+ — IUL is less cost-effective; consider term or FEX as alternatives')
      if (inputs.healthClass === 'poor') warnings.push('Poor health class significantly reduces IUL performance; FEX may be better fit')
    }

    // FEX-specific notes
    if (type === 'fex') {
      if (age < 50) warnings.push('Under 50 — FEX may not be most cost-effective option; consider term life')
      if (carrier === 'mutual_of_omaha' && inputs.healthClass === 'excellent') {
        reasons.push('Excellent health — qualifies for Level benefit (day-1 coverage, best rates)')
      } else if (carrier === 'mutual_of_omaha' && inputs.healthClass === 'good') {
        reasons.push('Good health — qualifies for Level benefit')
      } else if (carrier === 'mutual_of_omaha' && inputs.healthClass === 'fair') {
        warnings.push('Fair health — may qualify for Graded benefit (limited payout years 1–2)')
      }
    }

    // Add positive reasons if eligible
    if (eligible) {
      if (carrier === 'mutual_of_omaha') reasons.push('A+ rated carrier, household name recognition helps with client trust')
      if (carrier === 'american_amicable') reasons.push('Flexible underwriting, strong for moderate health cases')
      if (carrier === 'transamerica') reasons.push('Competitive rates, strong financial strength rating')
    }

    return {
      carrier: carrier === 'mutual_of_omaha' ? 'Mutual of Omaha' : carrier === 'american_amicable' ? 'American Amicable' : 'Transamerica',
      eligible,
      reasons,
      warnings,
      eappUrl: CARRIER_EAPPS[carrier][type],
      productName: CARRIER_PRODUCT_NAMES[carrier][type],
      notes: '',
    }
  })
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────

// ─── CONDITION SEARCH COMPONENT ──────────────────────────────────────────────
function ConditionSearch({ selected, onToggle }: { selected: string[]; onToggle: (key: string) => void }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const allEntries = Object.entries(CONDITION_LABELS)
  const filtered = query.length > 0
    ? allEntries.filter(([, label]) => label.toLowerCase().includes(query.toLowerCase()))
    : allEntries

  const KNOCKOUT_IDS = ['active_cancer','aids_hiv','als','alzheimers','currently_hospitalized','dialysis','organ_transplant','oxygen_dependent','terminal_illness']

  return (
    <div style={{ marginBottom: 16, position: 'relative' }} ref={ref}>
      <label style={{ display: 'block', fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        Health Conditions
      </label>

      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
          {selected.map(key => (
            <span key={key} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, padding: '3px 8px', background: 'rgba(239,68,68,0.15)', color: 'var(--red)', border: '1px solid rgba(239,68,68,0.35)' }}>
              {CONDITION_LABELS[key] ?? key}
              <button onClick={() => onToggle(key)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 0, fontSize: 14, lineHeight: 1 }}>×</button>
            </span>
          ))}
          <button onClick={() => [...selected].forEach(k => onToggle(k))} style={{ fontSize: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', textDecoration: 'underline', padding: '3px 4px' }}>
            Clear all
          </button>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <input
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', borderRadius: 0, padding: '8px 32px 8px 10px', fontSize: 12, width: '100%' }}
          placeholder="Search conditions (e.g. diabetes, cancer, COPD, heart)..."
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
        />
        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 13, pointerEvents: 'none' }}>🔍</span>
      </div>

      {open && (
        <div style={{ position: 'absolute', zIndex: 200, left: 0, right: 0, background: 'var(--bg-surface)', border: '1px solid var(--border-strong)', maxHeight: 220, overflowY: 'auto', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          {filtered.length === 0 && <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted)' }}>No matches for "{query}"</div>}
          {filtered.map(([key, label]) => {
            const isSel = selected.includes(key)
            const isKO = KNOCKOUT_IDS.includes(key)
            return (
              <button key={key} onClick={() => { onToggle(key); setQuery(''); setOpen(false) }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '8px 14px', textAlign: 'left', background: isSel ? 'rgba(239,68,68,0.12)' : 'transparent', border: 'none', borderBottom: '1px solid var(--border)', cursor: 'pointer', color: isSel ? 'var(--red)' : 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isKO && <span style={{ fontSize: 9, background: 'rgba(239,68,68,0.2)', color: 'var(--red)', padding: '1px 4px', border: '1px solid rgba(239,68,68,0.4)', fontWeight: 800 }}>KO</span>}
                  <span style={{ fontSize: 12 }}>{label}</span>
                </div>
                {isSel && <span style={{ fontSize: 10, color: 'var(--red)', fontWeight: 700, flexShrink: 0 }}>✓ Selected</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function EligibilityScreener({ lead, onSave }: EligibilityScreenerProps) {
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<EligibilityResult[] | null>(null)
  const [saved, setSaved] = useState(false)

  const [inputs, setInputs] = useState<ScreenerInputs>({
    insuranceType: 'fex',
    state: lead.quoteState || '',
    age: lead.age ? String(lead.age) : '',
    heightFt: '5',
    heightIn: '8',
    weightLbs: '',
    nicotine: lead.smoker ? 'cigarettes' : 'none',
    healthClass: 'good',
    gender: 'male',
    conditions: lead.healthConditions || [],
  })

  const set = (field: keyof ScreenerInputs, val: any) => setInputs(p => ({ ...p, [field]: val }))
  const toggleCondition = (c: string) => set('conditions', inputs.conditions.includes(c) ? inputs.conditions.filter(x => x !== c) : [...inputs.conditions, c])

  const handleRun = () => {
    setResults(runEligibility(inputs))
    setSaved(false)
  }

  const handleSave = () => {
    if (results) { onSave(results, inputs); setSaved(true) }
  }

  const s = {
    card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 0 } as React.CSSProperties,
    label: { fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 4, display: 'block' },
    input: { width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 12, padding: '7px 10px', borderRadius: 0, boxSizing: 'border-box' as const },
    select: { width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 12, padding: '7px 10px', borderRadius: 0, boxSizing: 'border-box' as const },
    btn: { background: 'var(--accent)', color: 'var(--accent-fg)', fontWeight: 700, padding: '9px 18px', borderRadius: 0, fontSize: 13, border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' as const, gap: 6 },
    btnSecondary: { background: 'var(--bg-overlay)', color: 'var(--text-primary)', fontWeight: 600, padding: '7px 14px', borderRadius: 0, fontSize: 12, border: '1px solid var(--border)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' as const, gap: 6 },
  }

  return (
    <div style={s.card}>
      {/* Header toggle */}
      <button
        onClick={() => setOpen(p => !p)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: 'var(--bg-elevated)', border: 'none', borderBottom: open ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={14} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Carrier Eligibility Screener</span>
          {results && (
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', background: 'rgba(16,185,129,0.15)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.3)' }}>
              {results.filter(r => r.eligible).length}/{results.length} eligible
            </span>
          )}
        </div>
        {open ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
      </button>

      {open && (
        <div style={{ padding: 20 }}>
          {/* Form */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={s.label}>Insurance Type</label>
              <select style={s.select} value={inputs.insuranceType} onChange={e => set('insuranceType', e.target.value)}>
                <option value="fex">Final Expense (FEX)</option>
                <option value="iul">Indexed Universal Life (IUL)</option>
                <option value="term">Term Life</option>
              </select>
            </div>
            <div>
              <label style={s.label}>State</label>
              <select style={s.select} value={inputs.state} onChange={e => set('state', e.target.value)}>
                <option value="">Select state</option>
                {US_STATES.map(st => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Gender</label>
              <select style={s.select} value={inputs.gender} onChange={e => set('gender', e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label style={s.label}>Age</label>
              <input style={s.input} type="number" min={18} max={90} value={inputs.age} onChange={e => set('age', e.target.value)} placeholder="e.g. 55" />
            </div>
            <div>
              <label style={s.label}>Height</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <select style={{ ...s.select, width: '50%' }} value={inputs.heightFt} onChange={e => set('heightFt', e.target.value)}>
                  {[4,5,6,7].map(f => <option key={f} value={f}>{f} ft</option>)}
                </select>
                <select style={{ ...s.select, width: '50%' }} value={inputs.heightIn} onChange={e => set('heightIn', e.target.value)}>
                  {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => <option key={i} value={i}>{i} in</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={s.label}>Weight (lbs)</label>
              <input style={s.input} type="number" min={80} max={500} value={inputs.weightLbs} onChange={e => set('weightLbs', e.target.value)} placeholder="e.g. 180" />
            </div>
            <div>
              <label style={s.label}>Nicotine Use</label>
              <select style={s.select} value={inputs.nicotine} onChange={e => set('nicotine', e.target.value)}>
                <option value="none">None</option>
                <option value="cigarettes">Cigarettes</option>
                <option value="cigar_occasional">Occasional Cigar</option>
                <option value="vape">Vape / E-cigarette</option>
                <option value="chew">Chew / Dip</option>
                <option value="patch_gum">Patch / Gum</option>
              </select>
            </div>
            <div>
              <label style={s.label}>Health Class</label>
              <select style={s.select} value={inputs.healthClass} onChange={e => set('healthClass', e.target.value)}>
                <option value="excellent">Excellent (Preferred Plus)</option>
                <option value="good">Good (Standard Plus)</option>
                <option value="fair">Fair (Standard)</option>
                <option value="poor">Poor (Substandard)</option>
              </select>
            </div>
          </div>

          {/* Conditions — searchable */}
          <ConditionSearch
            selected={inputs.conditions}
            onToggle={toggleCondition}
          />

          <div style={{ display: 'flex', gap: 10, marginBottom: results ? 20 : 0 }}>
            <button style={s.btn} onClick={handleRun}>
              <Shield size={13} /> Run Eligibility Check
            </button>
          </div>

          {/* Results */}
          {results && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Results for {inputs.insuranceType.toUpperCase()}</span>
                <button
                  style={{ ...s.btnSecondary, background: saved ? 'rgba(16,185,129,0.15)' : undefined, color: saved ? 'var(--green)' : undefined }}
                  onClick={handleSave}
                >
                  <Save size={12} /> {saved ? 'Saved to Lead ✓' : 'Save to Lead'}
                </button>
              </div>

              {results.map(result => (
                <div key={result.carrier} style={{ border: `1px solid ${result.eligible ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)'}`, background: result.eligible ? 'rgba(16,185,129,0.04)' : 'rgba(239,68,68,0.04)' }}>
                  {/* Carrier header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {result.eligible
                        ? <CheckCircle size={16} style={{ color: 'var(--green)' }} />
                        : <XCircle size={16} style={{ color: 'var(--red)' }} />
                      }
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 1 }}>{result.carrier}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{result.productName}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', background: result.eligible ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: result.eligible ? 'var(--green)' : 'var(--red)', border: `1px solid ${result.eligible ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)'}` }}>
                        {result.eligible ? '✓ ELIGIBLE' : '✗ NOT ELIGIBLE'}
                      </span>
                      {result.eligible && (
                        <a href={result.eappUrl} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 10px', background: 'var(--accent)', color: 'var(--accent-fg)', textDecoration: 'none', border: 'none', cursor: 'pointer' }}>
                          E-App <ExternalLink size={10} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Reasons */}
                  <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {result.reasons.map((r, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                        {result.eligible || !r.includes('knockout') && !r.includes('exceeds') && !r.includes('below') && !r.includes('Maximum') && !r.includes('Minimum') && !r.includes('Not available')
                          ? <CheckCircle size={12} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }} />
                          : <XCircle size={12} style={{ color: 'var(--red)', flexShrink: 0, marginTop: 1 }} />
                        }
                        <span style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r}</span>
                      </div>
                    ))}
                    {result.warnings.map((w, i) => (
                      <div key={`w${i}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                        <AlertCircle size={12} style={{ color: '#f59e0b', flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontSize: 11, color: '#f59e0b', lineHeight: 1.5 }}>{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
