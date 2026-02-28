export interface Lead {
  id: number; name: string; phone: string; email: string; source: string
  status: 'new' | 'contacted' | 'qualified' | 'closed'; value: string
  assignedTo: string; time: string; notes: string
  age?: number; smoker?: boolean; medications?: string[]; healthConditions?: string[]
  selectedCarrier?: string; monthlyPremium?: number; annualPremium?: number
  carrierQuotes?: CarrierQuote[]
  // Extended quote context
  quoteCoverage?: number; quoteTerm?: number
  quoteHealthClass?: string; quoteSavedAt?: string
  quoteProductName?: string; quoteType?: InsuranceType
  quoteSex?: 'male' | 'female'; quoteState?: string
  quoteNicotine?: NicotineUse
}

export type InsuranceType = 'term' | 'fex' | 'iul' | 'whole-life'
export type NicotineUse = 'none' | 'cigarettes' | 'other'

export interface Appointment {
  id: number; title: string; date: string; time: string; duration: number
  client: string; agent: string; type: string
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled'
  notes?: string; isShared: boolean; createdBy: string
}

export interface TeamMember {
  id: number; name: string; email: string
  role: 'admin' | 'agent' | 'manager'
  status: 'active' | 'pending' | 'inactive'
  leads: number; calls: number; appointments: number
  closed: number; revenue: number; joinedDate: string
  invitedBy?: string  // email of who invited this member
}

export interface PremiumCalculation {
  age: number; smoker: boolean
  healthClass: 'preferred-plus' | 'preferred' | 'standard-plus' | 'standard' | 'substandard'
  coverage: number; term: number; medications: string[]; healthConditions: string[]
  selectedCarrier?: string; monthlyPremium?: number; annualPremium?: number
  carrierQuotes?: CarrierQuote[]
}

export interface CarrierQuote {
  carrier: string; monthly: number; annual: number
  recommended: boolean; reason?: string
  productName?: string; annualRate?: number
}

export interface Carrier {
  name: string; strengths: string[]
  baseRate: number; diabetesFriendly: boolean; ageMax: number
}

export interface Medication {
  name: string; category: string
  impact: 'preferred-plus' | 'preferred' | 'standard-plus' | 'standard' | 'substandard'
  common: boolean
}

export type HealthClassName =
  | 'Elite' | 'Preferred Plus' | 'Preferred' | 'Standard Plus'
  | 'Standard' | 'Table 2' | 'Table 4' | 'Select'

export type CalendarView = 'all' | 'shared' | 'personal'
