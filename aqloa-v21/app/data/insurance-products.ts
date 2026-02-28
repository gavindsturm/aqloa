// ═══════════════════════════════════════════════════════════════
//  COMPREHENSIVE INSURANCE PRODUCT DATABASE
//  All rates anchored to: Male · Age 35 · Non-Smoker · $100K · 20yr
//  annualFactor: monthly × this = annual premium (from real modal factors)
// ═══════════════════════════════════════════════════════════════

// ─── Age multipliers (relative to age 35 = 1.00) ─────────────────────────────
export const AGE_FACTORS: Record<number, number> = {
  18:0.30, 19:0.32, 20:0.35, 21:0.37, 22:0.39, 23:0.42, 24:0.45,
  25:0.48, 26:0.52, 27:0.56, 28:0.60, 29:0.64,
  30:0.68, 31:0.74, 32:0.80, 33:0.87, 34:0.93,
  35:1.00, 36:1.08, 37:1.17, 38:1.27, 39:1.39,
  40:1.52, 41:1.66, 42:1.82, 43:1.99, 44:2.13,
  45:2.28, 46:2.50, 47:2.74, 48:3.00, 49:3.20,
  50:3.42, 51:3.74, 52:4.08, 53:4.44, 54:4.80,
  55:5.18, 56:5.73, 57:6.32, 58:6.98, 59:7.45,
  60:7.95, 61:8.79, 62:9.72, 63:10.74, 64:11.57,
  65:12.40, 66:13.76, 67:15.24, 68:16.90, 69:18.36,
  70:19.80, 71:22.10, 72:24.64, 73:27.48, 74:30.62,
  75:32.00, 76:35.20, 77:38.72, 78:42.59, 79:46.85,
  80:51.54,
}

// ─── Term length multipliers (relative to 20yr = 1.00) ───────────────────────
export const TERM_FACTORS: Record<number, number> = {
  10: 0.65,
  15: 0.82,
  20: 1.00,
  25: 1.19,
  30: 1.37,
}

// ─── Coverage band multipliers (relative to $100K = 1.00) ────────────────────
export function coverageBandFactor(coverage: number): number {
  if (coverage <= 100000)  return 1.00
  if (coverage <= 249999)  return 0.97
  if (coverage <= 499999)  return 0.94
  if (coverage <= 749999)  return 0.91
  if (coverage <= 999999)  return 0.89
  return 0.86
}

// ═══════════════════════════════════════════════════════════════
//  TERM LIFE PRODUCTS
//  Exactly matching the quoting tool output
// ═══════════════════════════════════════════════════════════════
export interface TermProduct {
  id:            string
  productName:   string
  carrier:       string
  // per $1K/month at anchor (35M · NS · $100K · 20yr · anchor health class)
  anchorRatePerK: number
  // annual = monthly × annualFactor
  annualFactor:  number
  // health classes this product is available for ('' = all classes / non-med)
  healthClasses: string[]
  availableTerms: number[]
  minAge:         number
  maxAge:         number
  minCoverage:    number
  maxCoverage:    number
  // male smoker multiplier
  smokerMult:     number
  // female non-smoker multiplier (applied to male NS rate)
  femaleMult:     number
  // female smoker multiplier
  femaleSmokerMult: number
  // Return of Premium available?
  hasROP:         boolean
  ropPremiumMult: number   // additional multiplier when ROP selected
  // Accidental Death rider
  hasAD:          boolean
  adAnchorRatePerK: number
  adAnnualFactor: number
  // E-App available
  hasEapp:        boolean
  // Rider names shown on quote card
  features:       string[]
  // Special note shown on quote card (• bullet)
  note?:          string
  // Payment Protector monthly income (pre-calculated for anchor params)
  paymentProtectorIncome?: number
  // Is this a continuation/conversion product
  isContinuation?: boolean
  // Vitality program
  hasVitality?:   boolean
}

export const TERM_PRODUCTS: TermProduct[] = [
  // ── Banner Life / William Penn ──
  {
    id: 'elite-20',
    productName: '20-Year Elite',
    carrier: 'Banner Life',
    anchorRatePerK: 0.1373,
    annualFactor: 11.36,
    healthClasses: ['Preferred Plus'],
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 20, maxAge: 75, minCoverage: 100000, maxCoverage: 10000000,
    smokerMult: 2.80, femaleMult: 0.77, femaleSmokerMult: 2.20,
    hasROP: false, ropPremiumMult: 1,
    hasAD: false, adAnchorRatePerK: 0, adAnnualFactor: 0,
    hasEapp: false,
    features: [],
  },
  // ── Prudential / Preferred ──
  {
    id: 'preferred-20',
    productName: '20-Year Preferred',
    carrier: 'Prudential',
    anchorRatePerK: 0.3045,
    annualFactor: 11.36,
    healthClasses: ['Preferred Plus', 'Preferred'],
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 18, maxAge: 75, minCoverage: 100000, maxCoverage: 10000000,
    smokerMult: 2.60, femaleMult: 0.79, femaleSmokerMult: 2.10,
    hasROP: false, ropPremiumMult: 1,
    hasAD: false, adAnchorRatePerK: 0, adAnnualFactor: 0,
    hasEapp: false,
    features: [],
  },
  // ── North American Company – Payment Protector ──
  {
    id: 'payment-protector-20',
    productName: 'Payment Protector 20-Year',
    carrier: 'North American Company',
    anchorRatePerK: 0.3543,
    annualFactor: 10.52,
    healthClasses: ['Preferred Plus', 'Preferred', 'Standard Plus', 'Standard'],
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 18, maxAge: 70, minCoverage: 50000, maxCoverage: 5000000,
    smokerMult: 2.55, femaleMult: 0.80, femaleSmokerMult: 2.05,
    hasROP: false, ropPremiumMult: 1,
    hasAD: false, adAnchorRatePerK: 0, adAnnualFactor: 0,
    hasEapp: true,
    features: [],
    note: 'Calculated monthly income is $579.96',
    paymentProtectorIncome: 579.96,
  },
  // ── Standard 20-Year (multi-carrier average) ──
  {
    id: 'standard-20',
    productName: '20-Year Standard',
    carrier: 'Protective Life',
    anchorRatePerK: 0.3758,
    annualFactor: 11.36,
    healthClasses: ['Standard Plus', 'Standard'],
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 18, maxAge: 70, minCoverage: 100000, maxCoverage: 10000000,
    smokerMult: 2.55, femaleMult: 0.80, femaleSmokerMult: 2.05,
    hasROP: false, ropPremiumMult: 1,
    hasAD: false, adAnchorRatePerK: 0, adAnnualFactor: 0,
    hasEapp: false,
    features: [],
  },
  // ── North American Company – Survivor Protector ──
  {
    id: 'survivor-protector-standard-20',
    productName: 'Survivor Protector Standard 20-Year',
    carrier: 'North American Company',
    anchorRatePerK: 0.4240,
    annualFactor: 10.64,
    healthClasses: ['Standard Plus', 'Standard'],
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 18, maxAge: 70, minCoverage: 50000, maxCoverage: 5000000,
    smokerMult: 2.55, femaleMult: 0.80, femaleSmokerMult: 2.05,
    hasROP: false, ropPremiumMult: 1,
    hasAD: false, adAnchorRatePerK: 0, adAnnualFactor: 0,
    hasEapp: true,
    features: [],
    note: 'Calculated monthly income is $575.49',
    paymentProtectorIncome: 575.49,
  },
  // ── North American Company – Payment Protector Continuation ──
  {
    id: 'pp-continuation-20',
    productName: 'Payment Protector Continuation 20-Year',
    carrier: 'North American Company',
    anchorRatePerK: 0.4361,
    annualFactor: 10.53,
    healthClasses: ['Preferred Plus', 'Preferred', 'Standard Plus', 'Standard'],
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 18, maxAge: 70, minCoverage: 50000, maxCoverage: 5000000,
    smokerMult: 2.55, femaleMult: 0.80, femaleSmokerMult: 2.05,
    hasROP: false, ropPremiumMult: 1,
    hasAD: false, adAnchorRatePerK: 0, adAnnualFactor: 0,
    hasEapp: true,
    features: [],
    note: 'Calculated monthly income is $579.96',
    paymentProtectorIncome: 579.96,
    isContinuation: true,
  },
  // ── SBLI – Your Term Non-Med ──
  {
    id: 'your-term-nonmed-20',
    productName: 'Your Term 20-Year Non-Med',
    carrier: 'SBLI',
    anchorRatePerK: 0.4428,
    annualFactor: 11.43,
    healthClasses: ['All'], // no medical exam
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 18, maxAge: 65, minCoverage: 100000, maxCoverage: 500000,
    smokerMult: 2.40, femaleMult: 0.82, femaleSmokerMult: 2.00,
    hasROP: false, ropPremiumMult: 1,
    hasAD: true, adAnchorRatePerK: 0.0691, adAnnualFactor: 11.43,
    hasEapp: false,
    features: ['Family Health Benefit', 'Terminal Illness', 'Critical Illness', 'Chronic Illness'],
    note: "Rates calculated by nearest age. Please confirm the age you entered is the prospect's nearest age.",
  },
  // ── Transamerica – Strong Foundation ──
  {
    id: 'strong-foundation-20',
    productName: 'Strong Foundation 20-Year',
    carrier: 'Transamerica',
    anchorRatePerK: 0.4611,
    annualFactor: 11.43,
    healthClasses: ['Preferred Plus', 'Preferred', 'Standard Plus', 'Standard'],
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 18, maxAge: 70, minCoverage: 25000, maxCoverage: 2000000,
    smokerMult: 2.55, femaleMult: 0.79, femaleSmokerMult: 2.05,
    hasROP: false, ropPremiumMult: 1,
    hasAD: true, adAnchorRatePerK: 0.0691, adAnnualFactor: 11.43,
    hasEapp: false,
    features: ['Terminal Illness', 'Critical Illness', 'Chronic Illness'],
    note: "Rates calculated by nearest age. Please confirm the age you entered is the prospect's nearest age.",
  },
  // ── HealthMarkets – HMS Term 100 ──
  {
    id: 'hms-term-100-20',
    productName: 'HMS 20-Year Term 100',
    carrier: 'HealthMarkets',
    anchorRatePerK: 0.4665,
    annualFactor: 10.53,
    healthClasses: ['Preferred Plus', 'Preferred', 'Standard Plus', 'Standard'],
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 18, maxAge: 75, minCoverage: 25000, maxCoverage: 5000000,
    smokerMult: 2.60, femaleMult: 0.80, femaleSmokerMult: 2.10,
    hasROP: false, ropPremiumMult: 1,
    hasAD: false, adAnchorRatePerK: 0, adAnnualFactor: 0,
    hasEapp: true,
    features: ['Terminal Illness', 'Critical Illness', 'Chronic Illness'],
  },
  // ── Sagicor – Term Life Express ──
  {
    id: 'term-life-express-20',
    productName: 'Term Life Express 20-Year',
    carrier: 'Sagicor Life',
    anchorRatePerK: 0.4788,
    annualFactor: 11.24,
    healthClasses: ['Preferred Plus', 'Preferred', 'Standard Plus', 'Standard'],
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 18, maxAge: 65, minCoverage: 50000, maxCoverage: 400000,
    smokerMult: 2.55, femaleMult: 0.80, femaleSmokerMult: 2.05,
    hasROP: false, ropPremiumMult: 1,
    hasAD: true, adAnchorRatePerK: 0.0890, adAnnualFactor: 11.24,
    hasEapp: true,
    features: ['Terminal Illness', 'Critical Illness', 'Chronic Illness'],
  },
  // ── HealthMarkets – HMS Term 125 ──
  {
    id: 'hms-term-125-20',
    productName: 'HMS 20-Year Term 125',
    carrier: 'HealthMarkets',
    anchorRatePerK: 0.5225,
    annualFactor: 10.53,
    healthClasses: ['Preferred Plus', 'Preferred', 'Standard Plus', 'Standard', 'Table 2', 'Table 4'],
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 18, maxAge: 75, minCoverage: 25000, maxCoverage: 5000000,
    smokerMult: 2.60, femaleMult: 0.80, femaleSmokerMult: 2.10,
    hasROP: false, ropPremiumMult: 1,
    hasAD: false, adAnchorRatePerK: 0, adAnnualFactor: 0,
    hasEapp: true,
    features: ['Terminal Illness', 'Critical Illness', 'Chronic Illness'],
  },
  // ── John Hancock – Simple Term with Vitality Standard ──
  {
    id: 'jh-vitality-standard-20',
    productName: 'Simple Term with Vitality (2023) Standard 20-Year',
    carrier: 'John Hancock',
    anchorRatePerK: 0.5316,
    annualFactor: 12.00, // JH charges full 12 months annually
    healthClasses: ['Standard Plus', 'Standard'],
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 18, maxAge: 60, minCoverage: 250000, maxCoverage: 65000000,
    smokerMult: 2.50, femaleMult: 0.79, femaleSmokerMult: 2.00,
    hasROP: false, ropPremiumMult: 1,
    hasAD: false, adAnchorRatePerK: 0, adAnnualFactor: 0,
    hasEapp: true,
    features: ['Vitality Program', 'Terminal Illness'],
    hasVitality: true,
  },
  // ── Transamerica – Term Made Simple Standard ──
  {
    id: 'term-made-simple-standard-20',
    productName: 'Term Made Simple Standard 20-Year',
    carrier: 'Transamerica',
    anchorRatePerK: 0.5508,
    annualFactor: 11.11,
    healthClasses: ['Standard Plus', 'Standard'],
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 18, maxAge: 65, minCoverage: 25000, maxCoverage: 2000000,
    smokerMult: 2.55, femaleMult: 0.79, femaleSmokerMult: 2.05,
    hasROP: false, ropPremiumMult: 1,
    hasAD: true, adAnchorRatePerK: 0.0864, adAnnualFactor: 11.11,
    hasEapp: true,
    features: ['Terminal Illness', 'Accelerated Benefit - Confined Care', 'Chronic Illness'],
  },
  // ── Protective – Continuation 10 ──
  {
    id: 'continuation-10-20',
    productName: 'Continuation 10 20-Year',
    carrier: 'Protective Life',
    anchorRatePerK: 0.5729,
    annualFactor: 10.52,
    healthClasses: ['Preferred Plus', 'Preferred', 'Standard Plus', 'Standard', 'Table 2', 'Table 4'],
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 18, maxAge: 70, minCoverage: 25000, maxCoverage: 10000000,
    smokerMult: 2.60, femaleMult: 0.80, femaleSmokerMult: 2.10,
    hasROP: false, ropPremiumMult: 1,
    hasAD: false, adAnchorRatePerK: 0, adAnnualFactor: 0,
    hasEapp: true,
    features: [],
    isContinuation: true,
  },
  // ── Pacific Life – Easy Term ──
  {
    id: 'easy-term-20',
    productName: 'Easy Term 20-Year',
    carrier: 'Pacific Life',
    anchorRatePerK: 0.5941,
    annualFactor: 10.64,
    healthClasses: ['Preferred Plus', 'Preferred', 'Standard Plus', 'Standard'],
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 18, maxAge: 65, minCoverage: 25000, maxCoverage: 5000000,
    smokerMult: 2.55, femaleMult: 0.80, femaleSmokerMult: 2.05,
    hasROP: false, ropPremiumMult: 1,
    hasAD: true, adAnchorRatePerK: 0.0902, adAnnualFactor: 10.64,
    hasEapp: false,
    features: ['Terminal Illness', 'Accelerated Benefit - Confined Care', 'Chronic Illness'],
    note: "Rates calculated by nearest age. Please confirm the age you entered is the prospect's nearest age.",
  },
  // ── Assurity – 20-Year Express 1 ──
  {
    id: 'express-1-20',
    productName: '20-Year Express 1',
    carrier: 'Assurity',
    anchorRatePerK: 0.6090,
    annualFactor: 11.36,
    healthClasses: ['Preferred Plus', 'Preferred', 'Standard Plus', 'Standard'],
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 18, maxAge: 65, minCoverage: 25000, maxCoverage: 500000,
    smokerMult: 2.50, femaleMult: 0.81, femaleSmokerMult: 2.05,
    hasROP: false, ropPremiumMult: 1,
    hasAD: false, adAnchorRatePerK: 0, adAnnualFactor: 0,
    hasEapp: false,
    features: [],
  },
  // ── Protective – Continuation 25 ──
  {
    id: 'continuation-25-20',
    productName: 'Continuation 25 20-Year',
    carrier: 'Protective Life',
    anchorRatePerK: 0.7372,
    annualFactor: 10.53,
    healthClasses: ['Preferred Plus', 'Preferred', 'Standard Plus', 'Standard', 'Table 2', 'Table 4'],
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 18, maxAge: 70, minCoverage: 25000, maxCoverage: 10000000,
    smokerMult: 2.60, femaleMult: 0.80, femaleSmokerMult: 2.10,
    hasROP: false, ropPremiumMult: 1,
    hasAD: false, adAnchorRatePerK: 0, adAnnualFactor: 0,
    hasEapp: true,
    features: [],
    isContinuation: true,
  },
  // ── Mutual of Omaha – Simple Term ──
  {
    id: 'simple-term-20',
    productName: 'Simple Term 20-Year',
    carrier: 'Mutual of Omaha',
    anchorRatePerK: 0.7743,
    annualFactor: 11.50,
    healthClasses: ['All'], // simplified issue
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 18, maxAge: 70, minCoverage: 25000, maxCoverage: 300000,
    smokerMult: 2.40, femaleMult: 0.82, femaleSmokerMult: 2.00,
    hasROP: false, ropPremiumMult: 1,
    hasAD: true, adAnchorRatePerK: 0.1305, adAnnualFactor: 11.50,
    hasEapp: true,
    features: ['Terminal Illness'],
  },
  // ── John Hancock – Simple Term with Vitality Select ──
  {
    id: 'jh-vitality-select-20',
    productName: 'Simple Term with Vitality (2023) Select 20-Year',
    carrier: 'John Hancock',
    anchorRatePerK: 0.9139,
    annualFactor: 12.00,
    healthClasses: ['Select'], // substandard / rated
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 18, maxAge: 60, minCoverage: 250000, maxCoverage: 65000000,
    smokerMult: 2.50, femaleMult: 0.79, femaleSmokerMult: 2.00,
    hasROP: false, ropPremiumMult: 1,
    hasAD: false, adAnchorRatePerK: 0, adAnnualFactor: 0,
    hasEapp: true,
    features: [],
    hasVitality: true,
  },
  // ── Foresters – Home Certainty Standard ──
  {
    id: 'home-certainty-standard-20',
    productName: 'Home Certainty Standard 20-Year',
    carrier: 'Foresters Financial',
    anchorRatePerK: 0.4682,
    annualFactor: 11.36,
    healthClasses: ['Standard Plus', 'Standard'],
    availableTerms: [10, 15, 20, 25, 30],
    minAge: 18, maxAge: 65, minCoverage: 50000, maxCoverage: 750000,
    smokerMult: 2.55, femaleMult: 0.80, femaleSmokerMult: 2.05,
    hasROP: false, ropPremiumMult: 1,
    hasAD: true, adAnchorRatePerK: 0.0845, adAnnualFactor: 11.36,
    hasEapp: true,
    features: [],
  },
]

// ═══════════════════════════════════════════════════════════════
//  FINAL EXPENSE PRODUCTS
//  Anchor: Female · Age 65 · Non-Smoker · per $1,000
//  (Level benefit, standard class)
// ═══════════════════════════════════════════════════════════════
export interface FexProduct {
  id:           string
  productName:  string
  carrier:      string
  benefitType:  'Level' | 'Graded' | 'Modified'
  // $/K/month anchored at F65 NS standard
  anchorRateF:  number
  // Male rates are higher; this multiplier applied to anchor
  maleMult:     number
  // Smoker multiplier
  smokerMult:   number
  minAge:       number
  maxAge:       number
  minCoverage:  number
  maxCoverage:  number
  features:     string[]
  hasEapp:      boolean
  gradedNote?:  string
}

// Age factors for FEX (relative to age 65 = 1.00)
export const FEX_AGE_FACTORS: Record<number, number> = {
  45:0.38, 46:0.41, 47:0.44, 48:0.48, 49:0.52,
  50:0.56, 51:0.61, 52:0.66, 53:0.71, 54:0.77,
  55:0.83, 56:0.89, 57:0.94, 58:0.97, 59:0.99,
  60:1.02, 61:1.06, 62:1.12, 63:1.18, 64:1.25,
  65:1.00, 66:1.09, 67:1.19, 68:1.30, 69:1.42,
  70:1.55, 71:1.69, 72:1.85, 73:2.02, 74:2.20,
  75:2.40, 76:2.62, 77:2.86, 78:3.12, 79:3.40,
  80:3.71, 81:4.05, 82:4.41, 83:4.80, 84:5.23, 85:5.70,
}

export const FEX_PRODUCTS: FexProduct[] = [
  {
    id: 'moo-living-promise-level',
    productName: 'Living Promise Level',
    carrier: 'Mutual of Omaha',
    benefitType: 'Level',
    anchorRateF: 4.25,
    maleMult: 1.45, smokerMult: 1.35,
    minAge: 45, maxAge: 85, minCoverage: 2000, maxCoverage: 40000,
    features: ['Terminal Illness Benefit', 'Accidental Death Benefit'],
    hasEapp: true,
  },
  {
    id: 'moo-living-promise-graded',
    productName: 'Living Promise Graded',
    carrier: 'Mutual of Omaha',
    benefitType: 'Graded',
    anchorRateF: 3.60,
    maleMult: 1.45, smokerMult: 1.30,
    minAge: 45, maxAge: 80, minCoverage: 2000, maxCoverage: 25000,
    features: ['Terminal Illness Benefit'],
    hasEapp: true,
    gradedNote: 'Graded death benefit — 110% of premiums paid in years 1–2, full benefit year 3+',
  },
  {
    id: 'transamerica-immediate-solution-level',
    productName: 'Immediate Solution Level',
    carrier: 'Transamerica',
    benefitType: 'Level',
    anchorRateF: 3.95,
    maleMult: 1.48, smokerMult: 1.40,
    minAge: 45, maxAge: 85, minCoverage: 1000, maxCoverage: 50000,
    features: ['Terminal Illness', 'Chronic Illness'],
    hasEapp: true,
  },
  {
    id: 'transamerica-immediate-solution-graded',
    productName: 'Immediate Solution Graded',
    carrier: 'Transamerica',
    benefitType: 'Graded',
    anchorRateF: 3.35,
    maleMult: 1.48, smokerMult: 1.35,
    minAge: 45, maxAge: 85, minCoverage: 1000, maxCoverage: 50000,
    features: ['Terminal Illness'],
    hasEapp: true,
    gradedNote: 'Graded: 30% year 1 · 70% year 2 · 100% year 3+',
  },
  {
    id: 'foresters-planright-level',
    productName: 'PlanRight Level',
    carrier: 'Foresters Financial',
    benefitType: 'Level',
    anchorRateF: 4.10,
    maleMult: 1.50, smokerMult: 1.38,
    minAge: 50, maxAge: 85, minCoverage: 2000, maxCoverage: 35000,
    features: ['Common Carrier AD&D', 'Orphan Benefit', 'Emergency Fund'],
    hasEapp: false,
  },
  {
    id: 'foresters-planright-graded',
    productName: 'PlanRight Graded',
    carrier: 'Foresters Financial',
    benefitType: 'Graded',
    anchorRateF: 3.50,
    maleMult: 1.50, smokerMult: 1.35,
    minAge: 50, maxAge: 80, minCoverage: 2000, maxCoverage: 25000,
    features: ['Emergency Fund'],
    hasEapp: false,
    gradedNote: 'Graded benefit for the first 2 policy years',
  },
  {
    id: 'americo-eagle-level',
    productName: 'Eagle Series Level Benefit',
    carrier: 'Americo Financial',
    benefitType: 'Level',
    anchorRateF: 4.35,
    maleMult: 1.42, smokerMult: 1.35,
    minAge: 50, maxAge: 85, minCoverage: 2000, maxCoverage: 30000,
    features: ['Terminal Illness', 'Nursing Home Benefit'],
    hasEapp: false,
  },
  {
    id: 'aetna-final-expense-level',
    productName: 'Final Expense Level',
    carrier: 'Aetna / CVS Health',
    benefitType: 'Level',
    anchorRateF: 4.20,
    maleMult: 1.47, smokerMult: 1.38,
    minAge: 45, maxAge: 89, minCoverage: 2000, maxCoverage: 50000,
    features: ['Terminal Illness Accelerated Benefit'],
    hasEapp: true,
  },
  {
    id: 'kskj-life-fe-level',
    productName: 'Senior Final Expense Level',
    carrier: 'KSKJ Life',
    benefitType: 'Level',
    anchorRateF: 3.80,
    maleMult: 1.44, smokerMult: 1.30,
    minAge: 50, maxAge: 80, minCoverage: 5000, maxCoverage: 25000,
    features: ['Accidental Death Benefit'],
    hasEapp: false,
  },
  {
    id: 'american-amicable-level',
    productName: 'Senior Life Express Level',
    carrier: 'American Amicable',
    benefitType: 'Level',
    anchorRateF: 4.50,
    maleMult: 1.46, smokerMult: 1.40,
    minAge: 50, maxAge: 85, minCoverage: 2500, maxCoverage: 35000,
    features: ['Terminal Illness', 'Critical Illness'],
    hasEapp: false,
  },
  {
    id: 'prosperity-senior-fe-level',
    productName: 'Senior Final Expense Level',
    carrier: 'Prosperity Life Group',
    benefitType: 'Level',
    anchorRateF: 4.00,
    maleMult: 1.48, smokerMult: 1.35,
    minAge: 45, maxAge: 85, minCoverage: 2000, maxCoverage: 35000,
    features: ['Terminal Illness'],
    hasEapp: false,
  },
  {
    id: 'global-atlantic-fe-level',
    productName: 'Final Expense Level',
    carrier: 'Global Atlantic',
    benefitType: 'Level',
    anchorRateF: 4.15,
    maleMult: 1.45, smokerMult: 1.37,
    minAge: 45, maxAge: 85, minCoverage: 2000, maxCoverage: 40000,
    features: ['Terminal Illness Accelerated Benefit'],
    hasEapp: true,
  },
  {
    id: 'national-life-fe-level',
    productName: 'Simple Whole Life Level',
    carrier: 'National Life Group',
    benefitType: 'Level',
    anchorRateF: 4.80,
    maleMult: 1.43, smokerMult: 1.38,
    minAge: 50, maxAge: 80, minCoverage: 5000, maxCoverage: 50000,
    features: ['Chronic Illness Accelerated Benefit', 'Terminal Illness'],
    hasEapp: true,
  },
]

// ═══════════════════════════════════════════════════════════════
//  SIUL / IUL PRODUCTS (Simplified / Indexed Universal Life)
// ═══════════════════════════════════════════════════════════════
export interface SiulStrategy {
  name:              string
  indexType:         string
  floor:             number
  cap:               number | null
  participationRate: number
}

export interface SiulProduct {
  id:               string
  productName:      string
  carrier:          string
  type:             'SIUL' | 'IUL' | 'UL'
  // Target monthly premium per $1K death benefit — anchor: 45M NS Standard $250K
  anchorPremPerK:   number
  maleMult:         number
  femaleMult:       number
  smokerMult:       number
  strategies:       SiulStrategy[]
  minAge:           number
  maxAge:           number
  minDeathBenefit:  number
  maxDeathBenefit:  number
  features:         string[]
  hasEapp:          boolean
  note?:            string
}

// Age factors for SIUL (relative to age 45 = 1.00)
export const SIUL_AGE_FACTORS: Record<number, number> = {
  18:0.28, 20:0.32, 25:0.42, 30:0.56, 35:0.72,
  40:0.88, 45:1.00, 50:1.30, 55:1.72, 60:2.35,
  65:3.20, 70:4.50, 75:6.10, 80:8.50,
}

export const SIUL_PRODUCTS: SiulProduct[] = [
  {
    id: 'pacific-life-siul',
    productName: 'Pacific Discovery SIUL',
    carrier: 'Pacific Life',
    type: 'SIUL',
    anchorPremPerK: 1.85,
    maleMult: 1.00, femaleMult: 0.80, smokerMult: 2.20,
    strategies: [
      { name: 'S&P 500 Annual Point-to-Point', indexType: 'S&P 500', floor: 0, cap: 10.5, participationRate: 100 },
      { name: 'S&P 500 Performance Trigger', indexType: 'S&P 500', floor: 0, cap: null, participationRate: 100 },
      { name: 'Fixed Account', indexType: 'Fixed', floor: 3.0, cap: null, participationRate: 100 },
    ],
    minAge: 18, maxAge: 75, minDeathBenefit: 100000, maxDeathBenefit: 10000000,
    features: ['Chronic Illness Accelerated Benefit', 'Terminal Illness', 'Overloan Protection'],
    hasEapp: true,
  },
  {
    id: 'north-american-iuleader',
    productName: 'IULeader Series',
    carrier: 'North American Company',
    type: 'IUL',
    anchorPremPerK: 1.95,
    maleMult: 1.00, femaleMult: 0.79, smokerMult: 2.25,
    strategies: [
      { name: 'S&P 500 1-Year Point-to-Point', indexType: 'S&P 500', floor: 0, cap: 11.0, participationRate: 100 },
      { name: 'Multi-Index Strategy', indexType: 'Blended', floor: 0, cap: null, participationRate: 130 },
      { name: 'Fixed Account', indexType: 'Fixed', floor: 2.75, cap: null, participationRate: 100 },
    ],
    minAge: 18, maxAge: 80, minDeathBenefit: 100000, maxDeathBenefit: 50000000,
    features: ['Accelerated Benefit Rider', 'Terminal Illness', 'Critical Illness', 'Chronic Illness'],
    hasEapp: true,
  },
  {
    id: 'protective-indexed-choice-ul',
    productName: 'Indexed Choice UL',
    carrier: 'Protective Life',
    type: 'IUL',
    anchorPremPerK: 2.10,
    maleMult: 1.00, femaleMult: 0.80, smokerMult: 2.15,
    strategies: [
      { name: 'S&P 500 Index Account', indexType: 'S&P 500', floor: 0, cap: 10.0, participationRate: 100 },
      { name: 'Fixed Account', indexType: 'Fixed', floor: 2.50, cap: null, participationRate: 100 },
    ],
    minAge: 18, maxAge: 75, minDeathBenefit: 50000, maxDeathBenefit: 5000000,
    features: ['Terminal Illness', 'Chronic Illness Rider'],
    hasEapp: true,
  },
  {
    id: 'transamerica-siul',
    productName: 'TransNavigator IUL',
    carrier: 'Transamerica',
    type: 'IUL',
    anchorPremPerK: 2.25,
    maleMult: 1.00, femaleMult: 0.80, smokerMult: 2.20,
    strategies: [
      { name: 'S&P 500 Capped Strategy', indexType: 'S&P 500', floor: 0, cap: 9.5, participationRate: 100 },
      { name: 'Multi-Index Capped Strategy', indexType: 'Blended', floor: 0, cap: 11.0, participationRate: 100 },
      { name: 'Fixed Account', indexType: 'Fixed', floor: 2.50, cap: null, participationRate: 100 },
    ],
    minAge: 18, maxAge: 75, minDeathBenefit: 50000, maxDeathBenefit: 5000000,
    features: ['Chronic Illness Accelerated Benefit', 'Terminal Illness'],
    hasEapp: true,
  },
  {
    id: 'nationwide-iula',
    productName: 'IUL Accumulator II',
    carrier: 'Nationwide',
    type: 'IUL',
    anchorPremPerK: 2.40,
    maleMult: 1.00, femaleMult: 0.79, smokerMult: 2.25,
    strategies: [
      { name: 'S&P 500 Index Annual', indexType: 'S&P 500', floor: 0, cap: 12.0, participationRate: 100 },
      { name: 'High Participation Strategy', indexType: 'S&P 500', floor: 0, cap: null, participationRate: 125 },
      { name: 'Fixed Account', indexType: 'Fixed', floor: 3.0, cap: null, participationRate: 100 },
    ],
    minAge: 18, maxAge: 75, minDeathBenefit: 100000, maxDeathBenefit: 10000000,
    features: ['Chronic Illness Rider', 'Terminal Illness', 'Return of Premium Rider'],
    hasEapp: true,
  },
  {
    id: 'foresters-advantage-ul',
    productName: 'Advantage Plus SIUL',
    carrier: 'Foresters Financial',
    type: 'SIUL',
    anchorPremPerK: 2.20,
    maleMult: 1.00, femaleMult: 0.80, smokerMult: 2.10,
    strategies: [
      { name: 'S&P 500 Annual Strategy', indexType: 'S&P 500', floor: 0, cap: 10.0, participationRate: 100 },
      { name: 'Fixed Account', indexType: 'Fixed', floor: 2.50, cap: null, participationRate: 100 },
    ],
    minAge: 18, maxAge: 70, minDeathBenefit: 50000, maxDeathBenefit: 2500000,
    features: ['Chronic Illness Rider', 'Terminal Illness'],
    hasEapp: false,
    note: 'No medical exam up to $500,000',
  },
  {
    id: 'symetra-siul',
    productName: 'SIUL Accumulator',
    carrier: 'Symetra Life',
    type: 'SIUL',
    anchorPremPerK: 2.15,
    maleMult: 1.00, femaleMult: 0.80, smokerMult: 2.20,
    strategies: [
      { name: 'S&P 500 Annual Cap', indexType: 'S&P 500', floor: 0, cap: 11.5, participationRate: 100 },
      { name: 'Fixed Account', indexType: 'Fixed', floor: 2.75, cap: null, participationRate: 100 },
    ],
    minAge: 18, maxAge: 75, minDeathBenefit: 50000, maxDeathBenefit: 5000000,
    features: ['Accelerated Underwriting up to $3M', 'Terminal Illness', 'Chronic Illness'],
    hasEapp: true,
  },
  {
    id: 'securian-premier-provider-ul',
    productName: 'Premier Provider UL',
    carrier: 'Securian / Minnesota Life',
    type: 'UL',
    anchorPremPerK: 2.55,
    maleMult: 1.00, femaleMult: 0.79, smokerMult: 2.15,
    strategies: [
      { name: 'Fixed UL Account', indexType: 'Fixed', floor: 3.0, cap: null, participationRate: 100 },
    ],
    minAge: 18, maxAge: 85, minDeathBenefit: 50000, maxDeathBenefit: 10000000,
    features: ['Terminal Illness', 'Chronic Illness Rider', 'Guaranteed Death Benefit'],
    hasEapp: true,
    note: 'Guaranteed interest rate with flexible premiums',
  },
]


